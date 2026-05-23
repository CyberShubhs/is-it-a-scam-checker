#!/usr/bin/env node
/**
 * Deterministic source-URL validator for `content/blog/*.mdx`.
 *
 * Static gates (always run):
 *   - sources must be valid http(s) URLs
 *   - hosts must be well-formed (no `www.www.`, no extra dots, no whitespace)
 *   - no placeholder domains (example.com, etc.)
 *   - no duplicate source URLs inside one post
 *
 * Network gates (skipped unless --network is passed, or CI=true):
 *   - HEAD request to each URL (followed by GET on 405/403)
 *   - 200-399  = pass
 *   - 404, DNS failure  = hard fail
 *   - 403 from known publishers that block bots  = warning only
 *
 * Exit code 1 on any hard failure. The network probe is best-effort: a
 * transient timeout from a real publisher is reported as a warning rather
 * than a hard fail, so CI doesn't flake on slow upstreams.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const BLOG_DIR = path.join(ROOT, 'content', 'blog');

const NETWORK = process.argv.includes('--network') || process.env.CI === 'true';
const NETWORK_TIMEOUT_MS = 8000;
const NETWORK_CONCURRENCY = 6;
/**
 * When set, only probe files passed in via stdin. The CI workflow pipes
 * `git diff --cached --name-only -- content/blog` into us so each
 * auto-generated post is fully reachable-checked, but legacy 404s in older
 * posts don't block new commits.
 */
const CHANGED_ONLY = process.argv.includes('--changed-only');
/**
 * When set, 404 and DNS errors are reported as warnings only. Useful for
 * inspecting the existing corpus without failing CI.
 */
const SOFT = process.argv.includes('--soft');

const PLACEHOLDER_HOSTS = [
    'example.com',
    'example.org',
    'example.net',
    'yourdomain.com',
    'placeholder.com',
    'foo.bar',
    'lorem.com',
];

/** Publishers that frequently 403 on HEAD/GET requests from bots — warning-only on 403. */
const BOT_BLOCKING_PUBLISHERS = [
    'reuters.com',
    'bloomberg.com',
    'nytimes.com',
    'washingtonpost.com',
    'theguardian.com',
    'forbes.com',
    'wsj.com',
];

const hardFailures = [];
const warnings = [];

function readFile(p) {
    return fs.readFileSync(p, 'utf-8');
}

function parseSources(raw) {
    const m = raw.match(/^---\n([\s\S]*?)\n---/);
    if (!m) return [];
    const fm = m[1];
    const sourcesBlock = fm.match(/^sources:\s*\n((?:\s+-\s+.*\n?)+)/m);
    if (!sourcesBlock) return [];
    return sourcesBlock[1]
        .split('\n')
        .map((line) => line.match(/^\s+-\s+["']?(.+?)["']?\s*$/))
        .filter((m) => m)
        .map((m) => m[1].trim());
}

function isHttpsUrl(u) {
    try {
        const parsed = new URL(u);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
        return false;
    }
}

function hostnameOf(u) {
    try {
        return new URL(u).hostname.toLowerCase();
    } catch {
        return '';
    }
}

function isMalformedHost(u) {
    if (!isHttpsUrl(u)) return true;
    const host = hostnameOf(u);
    if (!host) return true;
    if (host.startsWith('www.www.')) return true;
    if (host.includes('..')) return true;
    if (/\s/.test(host)) return true;
    if (host.startsWith('.') || host.endsWith('.')) return true;
    return false;
}

function isPlaceholderHost(u) {
    const host = hostnameOf(u);
    return PLACEHOLDER_HOSTS.some((p) => host === p || host.endsWith('.' + p));
}

if (!fs.existsSync(BLOG_DIR)) {
    console.error(`[blog-sources] expected ${BLOG_DIR} to exist`);
    process.exit(1);
}

let files;
if (CHANGED_ONLY) {
    // Read newline-delimited file paths from stdin.
    const stdin = fs.readFileSync(0, 'utf-8');
    const paths = stdin
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)
        .map((p) => path.basename(p));
    files = paths.filter((f) => f.endsWith('.mdx') && !f.startsWith('_'));
    if (files.length === 0) {
        console.log('[blog-sources --changed-only] no changed blog files on stdin; nothing to probe.');
        process.exit(0);
    }
} else {
    files = fs
        .readdirSync(BLOG_DIR)
        .filter((f) => f.endsWith('.mdx') && !f.startsWith('_'))
        .sort();
}

const fileSourceMap = new Map(); // file -> sources[]

for (const file of files) {
    const sources = parseSources(readFile(path.join(BLOG_DIR, file)));
    fileSourceMap.set(file, sources);

    const seen = new Set();
    for (const src of sources) {
        if (!isHttpsUrl(src)) {
            hardFailures.push(`${file} → invalid URL (not http/https): ${src}`);
            continue;
        }
        if (isMalformedHost(src)) {
            hardFailures.push(`${file} → malformed host: ${src}`);
            continue;
        }
        if (isPlaceholderHost(src)) {
            hardFailures.push(`${file} → placeholder host: ${src}`);
            continue;
        }
        const norm = src.toLowerCase();
        if (seen.has(norm)) {
            hardFailures.push(`${file} → duplicate source URL: ${src}`);
        }
        seen.add(norm);
    }
}

if (!NETWORK) {
    console.log(`\nStatic source checks complete (${files.length} posts).`);
    console.log('Network probes skipped — pass --network or set CI=true to enable.');
    if (hardFailures.length === 0) {
        console.log('\n✅ All static source checks passed.');
        process.exit(0);
    }
    console.error(`\n❌ ${hardFailures.length} source issue${hardFailures.length === 1 ? '' : 's'}:\n`);
    for (const f of hardFailures) console.error(`  - ${f}`);
    process.exit(1);
}

// -------------------- Network probes --------------------

async function probe(url) {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), NETWORK_TIMEOUT_MS);
    try {
        let res = await fetch(url, {
            method: 'HEAD',
            redirect: 'follow',
            signal: ac.signal,
            headers: { 'User-Agent': 'Mozilla/5.0 ScamCheckerBot/1.0 (+https://scamchecker.app)' },
        });
        // Some publishers reject HEAD with 405/403 but allow GET.
        if ([403, 405, 501].includes(res.status)) {
            res = await fetch(url, {
                method: 'GET',
                redirect: 'follow',
                signal: ac.signal,
                headers: { 'User-Agent': 'Mozilla/5.0 ScamCheckerBot/1.0 (+https://scamchecker.app)' },
            });
        }
        return { status: res.status };
    } catch (err) {
        return { error: err instanceof Error ? err.message : String(err) };
    } finally {
        clearTimeout(t);
    }
}

const tasks = [];
for (const [file, sources] of fileSourceMap.entries()) {
    for (const src of sources) {
        if (!isHttpsUrl(src) || isMalformedHost(src) || isPlaceholderHost(src)) continue;
        tasks.push({ file, src });
    }
}

async function runWithConcurrency(items, n, worker) {
    const out = [];
    let i = 0;
    async function next() {
        while (i < items.length) {
            const idx = i++;
            out[idx] = await worker(items[idx]);
        }
    }
    await Promise.all(Array.from({ length: n }, next));
    return out;
}

console.log(`\nProbing ${tasks.length} source URL${tasks.length === 1 ? '' : 's'} across ${files.length} posts...`);

const results = await runWithConcurrency(tasks, NETWORK_CONCURRENCY, async ({ file, src }) => {
    const r = await probe(src);
    return { file, src, ...r };
});

const pushHard = (msg) => (SOFT ? warnings : hardFailures).push(msg);

for (const r of results) {
    if (r.status && r.status >= 200 && r.status < 400) continue;
    if (r.status === 404) {
        pushHard(`${r.file} → 404 (page gone): ${r.src}`);
        continue;
    }
    if (r.status === 403) {
        const host = hostnameOf(r.src);
        const isBotBlocking = BOT_BLOCKING_PUBLISHERS.some((p) => host === p || host.endsWith('.' + p));
        if (isBotBlocking) {
            warnings.push(`${r.file} → 403 from bot-blocking publisher ${host} (likely live but rate-limiting bots): ${r.src}`);
        } else {
            pushHard(`${r.file} → 403 (forbidden): ${r.src}`);
        }
        continue;
    }
    if (r.status) {
        // Other non-2xx/3xx — treat as hard fail.
        pushHard(`${r.file} → HTTP ${r.status}: ${r.src}`);
        continue;
    }
    // Network/DNS error.
    const isDns = (r.error || '').match(/getaddrinfo|ENOTFOUND|ENODATA|EAI_AGAIN/i);
    if (isDns) {
        pushHard(`${r.file} → DNS failure (${r.error}): ${r.src}`);
    } else {
        warnings.push(`${r.file} → network error (${r.error}): ${r.src}`);
    }
}

console.log('\n--- Source probe summary ---');
console.log(`Hard failures: ${hardFailures.length}`);
console.log(`Warnings: ${warnings.length}`);

if (warnings.length > 0) {
    console.log('\nWarnings:');
    for (const w of warnings) console.log(`  - ${w}`);
}

if (hardFailures.length > 0) {
    console.error(`\n❌ ${hardFailures.length} hard source failure${hardFailures.length === 1 ? '' : 's'}:\n`);
    for (const f of hardFailures) console.error(`  - ${f}`);
    process.exit(1);
}

console.log('\n✅ All source checks passed.');
