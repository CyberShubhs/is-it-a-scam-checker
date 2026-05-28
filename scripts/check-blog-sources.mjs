#!/usr/bin/env node
/**
 * Source-URL validator for `content/blog/*.mdx`.
 *
 * Three modes, controlled by CLI flags:
 *
 *   --changed-only          Only probe files whose paths are piped in on
 *                           stdin (the auto-blog workflow uses this so old
 *                           historical 404s never block new posts).
 *
 *   --full                  Probe every post. Used by the weekly audit
 *                           workflow.
 *
 *   --soft                  Demote 404 / DNS errors to warnings. Used when
 *                           the audit is meant to inspect-not-block.
 *
 *   --network               Force network probes even when CI is unset.
 *
 * Static gates (always run):
 *   - sources must be valid http(s) URLs
 *   - hosts must be well-formed
 *   - no placeholder domains
 *   - no duplicate URLs per post
 *   - URLs must either appear in the source registry OR be on the
 *     reporting allowlist (see src/lib/source-registry.ts)
 *
 * Network gates:
 *   - HEAD request, fall back to GET on 403/405/501
 *   - 200-399                              → pass
 *   - 404, DNS error                       → hard fail
 *   - 403 from bot-blocking publisher list → warning only
 *   - Status results are cached in data/source-health-cache.json so we
 *     don't re-probe known-good URLs hundreds of times in the audit.
 *
 * Exit code 1 on any hard failure.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const BLOG_DIR = path.join(ROOT, 'content', 'blog');
const REGISTRY_PATH = path.join(ROOT, 'data', 'source-registry.json');
const CACHE_PATH = path.join(ROOT, 'data', 'source-health-cache.json');

const NETWORK = process.argv.includes('--network') || process.env.CI === 'true';
const NETWORK_TIMEOUT_MS = 8000;
const NETWORK_CONCURRENCY = 6;
const CHANGED_ONLY = process.argv.includes('--changed-only');
const SOFT = process.argv.includes('--soft');
const FULL = process.argv.includes('--full');

const PLACEHOLDER_HOSTS = [
    'example.com',
    'example.org',
    'example.net',
    'yourdomain.com',
    'placeholder.com',
    'foo.bar',
    'lorem.com',
];

/**
 * Publishers that frequently 403 on HEAD/GET requests from bots — they
 * are live for human readers but block automated probes. We accept 403
 * from these hosts as a warning, not a hard fail.
 *
 * Note: we deliberately do NOT include Reuters/NYT/Forbes etc here, since
 * the new generator is forbidden from citing them in the first place.
 */
const BOT_BLOCKING_PUBLISHERS = [
    'actionfraud.police.uk',
    'fbi.gov',
    'ic3.gov',
    'cisa.gov',
    'krebsonsecurity.com',
    // .gov sites that gate on UA / TLS fingerprint and return 403 to bots
    // but are live for humans. Treat 403 from these as warning, not fail.
    'ssa.gov',
    'consumerfinance.gov',
    'ftc.gov',
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

// ── Registry membership ────────────────────────────────────────────────────

function loadRegistry() {
    if (!fs.existsSync(REGISTRY_PATH)) return null;
    try {
        return JSON.parse(readFile(REGISTRY_PATH));
    } catch {
        return null;
    }
}

const registry = loadRegistry();
const REGISTRY_URLS = new Set(
    (registry?.sources ?? []).map((s) => s.url.replace(/\/$/, '').toLowerCase()),
);
const REPORTING_ALLOWLIST = new Set([
    'reportfraud.ftc.gov',
    'scamwatch.gov.au',
    'actionfraud.police.uk',
    'ic3.gov',
    'cyber.gov.au',
    'antifraudcentre-centreantifraude.ca',
    'getcybersafe.gc.ca',
]);

function isInRegistryOrAllowlist(url) {
    const normalised = url.replace(/\/$/, '').toLowerCase();
    if (REGISTRY_URLS.has(normalised)) return true;
    if ([...REGISTRY_URLS].some((u) => normalised.startsWith(u))) return true;
    const host = hostnameOf(url);
    return REPORTING_ALLOWLIST.has(host);
}

// ── Health cache ───────────────────────────────────────────────────────────
//
// Cache shape:
//   {
//     "url": { "status": 200, "ok": true, "checkedAt": "2026-05-29T…" }
//   }
// TTL: 7 days for ok=true, 1 day for warnings (ok=false but not hard fail).
// Hard failures are NEVER cached — we always re-check.

const CACHE_TTL_OK_MS = 7 * 24 * 60 * 60 * 1000;
const CACHE_TTL_WARN_MS = 1 * 24 * 60 * 60 * 1000;

function loadCache() {
    if (!fs.existsSync(CACHE_PATH)) return {};
    try {
        return JSON.parse(readFile(CACHE_PATH));
    } catch {
        return {};
    }
}

function saveCache(cache) {
    fs.mkdirSync(path.dirname(CACHE_PATH), { recursive: true });
    fs.writeFileSync(CACHE_PATH, `${JSON.stringify(cache, null, 2)}\n`, 'utf-8');
}

function cacheEntryStillFresh(entry) {
    if (!entry || !entry.checkedAt) return false;
    const age = Date.now() - new Date(entry.checkedAt).getTime();
    if (entry.ok) return age < CACHE_TTL_OK_MS;
    if (entry.warning) return age < CACHE_TTL_WARN_MS;
    return false;
}

const cache = loadCache();

// ── File discovery ─────────────────────────────────────────────────────────

if (!fs.existsSync(BLOG_DIR)) {
    console.error(`[blog-sources] expected ${BLOG_DIR} to exist`);
    process.exit(1);
}

let files;
if (CHANGED_ONLY) {
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

const fileSourceMap = new Map();
const registryViolations = [];

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
        // For changed-only mode, every URL must be in the registry. For the
        // full audit we surface registry violations but don't HARD fail on
        // them (some older posts predate the registry).
        if (registry && !isInRegistryOrAllowlist(src)) {
            if (CHANGED_ONLY) {
                hardFailures.push(
                    `${file} → URL not in source registry (data/source-registry.json): ${src}`,
                );
            } else {
                registryViolations.push(`${file} → off-registry URL: ${src}`);
            }
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
    if (registry) {
        console.log(`Registry-membership warnings (non-blocking in full mode): ${registryViolations.length}`);
    }
    if (hardFailures.length === 0) {
        console.log('\n✅ All static source checks passed.');
        process.exit(0);
    }
    console.error(`\n❌ ${hardFailures.length} source issue${hardFailures.length === 1 ? '' : 's'}:\n`);
    for (const f of hardFailures) console.error(`  - ${f}`);
    process.exit(1);
}

// ── Network probes ─────────────────────────────────────────────────────────

const USER_AGENT =
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 ScamCheckerBot/1.0 (+https://scamchecker.app)';

async function probeNetwork(url) {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), NETWORK_TIMEOUT_MS);
    try {
        let res = await fetch(url, {
            method: 'HEAD',
            redirect: 'follow',
            signal: ac.signal,
            headers: { 'User-Agent': USER_AGENT, Accept: '*/*' },
        });
        // Some publishers reject HEAD with 403/405/501 but allow GET.
        if ([403, 405, 501, 999].includes(res.status)) {
            res = await fetch(url, {
                method: 'GET',
                redirect: 'follow',
                signal: ac.signal,
                headers: { 'User-Agent': USER_AGENT, Accept: 'text/html,*/*' },
            });
        }
        return { status: res.status };
    } catch (err) {
        return { error: err instanceof Error ? err.message : String(err) };
    } finally {
        clearTimeout(t);
    }
}

async function probe(url) {
    const cached = cache[url];
    if (cacheEntryStillFresh(cached)) return cached.result;
    const r = await probeNetwork(url);
    return r;
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

console.log(`\nProbing ${tasks.length} source URL${tasks.length === 1 ? '' : 's'} across ${files.length} posts (cache hits skip the network)...`);

const results = await runWithConcurrency(tasks, NETWORK_CONCURRENCY, async ({ file, src }) => {
    const cached = cache[src];
    if (cacheEntryStillFresh(cached)) {
        return { file, src, fromCache: true, ...cached.result };
    }
    const r = await probe(src);
    return { file, src, ...r };
});

const pushHard = (msg) => (SOFT ? warnings : hardFailures).push(msg);

for (const r of results) {
    const cacheKey = r.src;
    let entry = null;
    if (r.status && r.status >= 200 && r.status < 400) {
        entry = {
            ok: true,
            checkedAt: new Date().toISOString(),
            result: { status: r.status },
        };
    } else if (r.status === 404) {
        pushHard(`${r.file} → 404 (page gone): ${r.src}`);
    } else if (r.status === 403) {
        const host = hostnameOf(r.src);
        const isBotBlocking = BOT_BLOCKING_PUBLISHERS.some(
            (p) => host === p || host.endsWith('.' + p),
        );
        if (isBotBlocking) {
            warnings.push(
                `${r.file} → 403 from bot-blocking publisher ${host} (treating as live): ${r.src}`,
            );
            entry = {
                ok: false,
                warning: true,
                checkedAt: new Date().toISOString(),
                result: { status: 403 },
            };
        } else {
            pushHard(`${r.file} → 403 (forbidden): ${r.src}`);
        }
    } else if (r.status === 401) {
        // 401 = paywalled. New generator must never cite these.
        pushHard(`${r.file} → 401 (paywall): ${r.src}`);
    } else if (r.status === 410) {
        pushHard(`${r.file} → 410 (gone): ${r.src}`);
    } else if (r.status) {
        // Other non-2xx/3xx — treat as hard fail.
        if (r.status >= 500) {
            // Temporary 5xx from a trusted registry host is a warning only.
            const host = hostnameOf(r.src);
            const isTrusted =
                isInRegistryOrAllowlist(r.src) ||
                BOT_BLOCKING_PUBLISHERS.some((p) => host === p || host.endsWith('.' + p));
            if (isTrusted) {
                warnings.push(`${r.file} → HTTP ${r.status} (transient) from trusted host: ${r.src}`);
                entry = {
                    ok: false,
                    warning: true,
                    checkedAt: new Date().toISOString(),
                    result: { status: r.status },
                };
            } else {
                pushHard(`${r.file} → HTTP ${r.status}: ${r.src}`);
            }
        } else {
            pushHard(`${r.file} → HTTP ${r.status}: ${r.src}`);
        }
    } else {
        // Network/DNS error.
        const isDns = (r.error || '').match(/getaddrinfo|ENOTFOUND|ENODATA|EAI_AGAIN/i);
        if (isDns) {
            pushHard(`${r.file} → DNS failure (${r.error}): ${r.src}`);
        } else {
            warnings.push(`${r.file} → network error (${r.error}): ${r.src}`);
        }
    }
    if (entry) cache[cacheKey] = entry;
}

// Persist the cache so the next run benefits from this run's good probes.
// Hard failures are intentionally NOT cached — every run re-checks them.
saveCache(cache);

console.log('\n--- Source probe summary ---');
console.log(`Hard failures: ${hardFailures.length}`);
console.log(`Warnings: ${warnings.length}`);
if (registry) {
    console.log(`Registry-membership warnings: ${registryViolations.length}`);
}

if (warnings.length > 0) {
    console.log('\nWarnings:');
    for (const w of warnings) console.log(`  - ${w}`);
}
if (registryViolations.length > 0 && (FULL || SOFT)) {
    console.log('\nRegistry-membership warnings (off-registry URLs in legacy posts):');
    for (const v of registryViolations) console.log(`  - ${v}`);
}

if (hardFailures.length > 0) {
    console.error(`\n❌ ${hardFailures.length} hard source failure${hardFailures.length === 1 ? '' : 's'}:\n`);
    for (const f of hardFailures) console.error(`  - ${f}`);
    process.exit(1);
}

console.log('\n✅ All source checks passed.');
