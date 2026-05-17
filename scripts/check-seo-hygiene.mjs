#!/usr/bin/env node
/**
 * SEO + privacy hygiene checks.
 *
 *  1. Every URL emitted by src/app/sitemap.ts must resolve to a real route
 *     on disk (no dead sitemap entries, which manifest as "Not found" in
 *     Google Search Console).
 *
 *  2. No two sitemap entries point at the same URL (dedupe guard).
 *
 *  3. No exposed AI / system prompt fragments leak into anything users (or
 *     Google) can see — source under src/, anything in public/, and any
 *     built static output under .next/ if a build has run.
 *
 *  4. Main commercial pages (/, /check, /reports, /guides) each expose a
 *     unique <title> in their metadata block.
 *
 *  5. Critical pages link to the three primary commercial routes (/check,
 *     /reports, /have-i-been-scammed).
 *
 * Exits non-zero on any failure.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const APP = path.join(ROOT, 'src', 'app');
const PUBLIC_DIR = path.join(ROOT, 'public');
const NEXT_DIR = path.join(ROOT, '.next');

const failures = [];

function readFile(p) {
    return fs.readFileSync(p, 'utf-8');
}

function relPath(p) {
    return path.relative(ROOT, p);
}

function* walkFiles(dir, extensions) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) yield* walkFiles(full, extensions);
        else if (entry.isFile() && extensions.some((e) => entry.name.endsWith(e))) {
            yield full;
        }
    }
}

// --------------------------------------------------------------------------
// 1 + 2. Sitemap route existence + dedupe.
//
// We don't run the sitemap function (would need a Next.js build env). Instead
// we parse src/app/sitemap.ts and src/lib/{guides,posts}.ts to enumerate every
// concrete pathname the sitemap will emit, then check each against src/app/.
// --------------------------------------------------------------------------

function appRouteExists(href) {
    const clean = href.split('#')[0].split('?')[0];
    if (clean === '/' || clean === '') {
        return fs.existsSync(path.join(APP, 'page.tsx'));
    }
    const segments = clean.split('/').filter(Boolean);
    const staticPath = path.join(APP, ...segments, 'page.tsx');
    if (fs.existsSync(staticPath)) return true;

    // Walk segment-by-segment to allow [slug] / [category] dynamic dirs.
    function tryDir(currentDir, remaining) {
        if (remaining.length === 0) {
            return fs.existsSync(path.join(currentDir, 'page.tsx'));
        }
        const [head, ...tail] = remaining;
        const direct = path.join(currentDir, head);
        if (fs.existsSync(direct) && fs.statSync(direct).isDirectory()) {
            if (tryDir(direct, tail)) return true;
        }
        if (fs.existsSync(currentDir) && fs.statSync(currentDir).isDirectory()) {
            for (const e of fs.readdirSync(currentDir, { withFileTypes: true })) {
                if (
                    e.isDirectory() &&
                    e.name.startsWith('[') &&
                    e.name.endsWith(']')
                ) {
                    if (tryDir(path.join(currentDir, e.name), tail)) return true;
                }
            }
        }
        return false;
    }

    if (tryDir(APP, segments)) return true;

    const publicPath = path.join(PUBLIC_DIR, ...segments);
    if (fs.existsSync(publicPath)) return true;

    return false;
}

function extractStringLiterals(src) {
    // Grab every "..." and '...' string literal — good enough to enumerate
    // the static route arrays in sitemap.ts.
    const out = [];
    const re = /(['"`])((?:\\.|(?!\1).)*)\1/g;
    let m;
    while ((m = re.exec(src)) !== null) {
        out.push(m[2]);
    }
    return out;
}

// Collect every sitemap URL we can statically derive.
const sitemapPath = path.join(APP, 'sitemap.ts');
const sitemapSrc = readFile(sitemapPath);
const sitemapLiterals = extractStringLiterals(sitemapSrc).filter(
    (s) => s === '' || s.startsWith('/'),
);

// Add dynamic guides + blog routes from their data sources.
const guidesSrc = readFile(path.join(ROOT, 'src', 'lib', 'guides.ts'));
const guideSlugs = [...guidesSrc.matchAll(/^\s*slug:\s*'([^']+)'/gm)].map(
    (m) => m[1],
);
const blogDir = path.join(ROOT, 'content', 'blog');
const blogSlugs = fs.existsSync(blogDir)
    ? fs
          .readdirSync(blogDir)
          .filter((f) => f.endsWith('.mdx') && !f.startsWith('_'))
          .map((f) => f.replace(/\.mdx$/, ''))
    : [];

const sitemapPaths = new Set([
    ...sitemapLiterals,
    ...guideSlugs.map((s) => `/guides/${s}`),
    ...blogSlugs.map((s) => `/blog/${s}`),
]);

const seen = new Set();
for (const route of sitemapPaths) {
    // Skip non-route literals from the parse (e.g. keys, classes).
    if (route !== '' && !route.startsWith('/')) continue;

    if (seen.has(route)) {
        failures.push(`[sitemap-duplicate] ${route} appears twice in sitemap`);
        continue;
    }
    seen.add(route);

    if (!appRouteExists(route)) {
        failures.push(
            `[sitemap-404] ${route} is referenced in sitemap but no matching app route exists — Google will mark it Not found`,
        );
    }
}

// --------------------------------------------------------------------------
// 3. AI / system prompt leakage.
//
// We scan src/, public/, and (if present) the built .next/ output for
// fragments that should only ever exist server-side. Anything that lands in
// the client bundle, page HTML, schema, or static JSON is a leak.
// --------------------------------------------------------------------------

const FORBIDDEN_PROMPT_FRAGMENTS = [
    'inspect this image',
    'classify whether it contains scam',
    'classify whether it contains',
    'return json only',
    'respond in json only',
    'respond with json only',
    'you are a scam classifier',
    'you are an ai trained to detect',
    'scam-motivated content',
    'system prompt:',
    '<|im_start|>',
    '<|im_end|>',
];

const SCAN_DIRS = [
    { dir: path.join(ROOT, 'src'), extensions: ['.ts', '.tsx', '.mdx', '.md', '.json'] },
    { dir: PUBLIC_DIR, extensions: ['.txt', '.html', '.json', '.xml', '.js', '.css'] },
];

if (fs.existsSync(NEXT_DIR)) {
    // Only scan rendered output, not the cache or sourcemaps which are big
    // and never shipped to clients.
    SCAN_DIRS.push({
        dir: path.join(NEXT_DIR, 'server', 'app'),
        extensions: ['.html', '.rsc', '.body'],
    });
    SCAN_DIRS.push({
        dir: path.join(NEXT_DIR, 'static', 'chunks'),
        extensions: ['.js'],
    });
}

for (const { dir, extensions } of SCAN_DIRS) {
    for (const file of walkFiles(dir, extensions)) {
        // Skip our own test files — they intentionally mention the strings.
        if (file.endsWith('.test.ts') || file.endsWith('.test.tsx')) continue;
        if (file.endsWith('check-seo-hygiene.mjs')) continue;
        if (file.includes('/node_modules/')) continue;

        let body;
        try {
            body = fs.readFileSync(file, 'utf-8').toLowerCase();
        } catch {
            continue; // skip binary / unreadable
        }
        for (const fragment of FORBIDDEN_PROMPT_FRAGMENTS) {
            if (body.includes(fragment.toLowerCase())) {
                failures.push(
                    `[prompt-leak] ${relPath(file)} contains forbidden prompt fragment "${fragment}"`,
                );
            }
        }
    }
}

// --------------------------------------------------------------------------
// 4. Unique titles for the four highest-priority pages.
// --------------------------------------------------------------------------

function extractTitleFromPage(file) {
    if (!fs.existsSync(file)) return null;
    const src = readFile(file);
    // Match the `title: '...',` or `title: "..."` inside the metadata object.
    const m = src.match(/title:\s*(['"`])([^'"`]+)\1/);
    return m ? m[2] : null;
}

const titleCheckPages = [
    { route: '/', file: path.join(APP, 'page.tsx') },
    { route: '/check', file: path.join(APP, 'check', 'page.tsx') },
    { route: '/reports', file: path.join(APP, 'reports', 'page.tsx') },
    { route: '/guides', file: path.join(APP, 'guides', 'page.tsx') },
];

const titles = new Map();
for (const { route, file } of titleCheckPages) {
    const title = extractTitleFromPage(file);
    if (!title) {
        failures.push(`[missing-title] ${route} has no <title> in its metadata`);
        continue;
    }
    if (titles.has(title)) {
        failures.push(
            `[duplicate-title] ${route} reuses the same title as ${titles.get(title)}: "${title}"`,
        );
        continue;
    }
    titles.set(title, route);
}

// --------------------------------------------------------------------------
// 5. Critical pages must link to the three primary commercial routes.
// --------------------------------------------------------------------------

// Pages must link to the primary commercial routes — except the route they
// already are (it would be a self-link).
const REQUIRED_LINKS = ['/check', '/reports', '/have-i-been-scammed'];
const CRITICAL_PAGES = [
    { route: '/', file: path.join(APP, 'page.tsx') },
    { route: '/check', file: path.join(APP, 'check', 'page.tsx') },
    { route: '/reports', file: path.join(APP, 'reports', 'page.tsx') },
    { route: '/guides', file: path.join(APP, 'guides', 'page.tsx') },
    { route: '/blog/[slug]', file: path.join(APP, 'blog', '[slug]', 'page.tsx') },
];

for (const { route, file } of CRITICAL_PAGES) {
    if (!fs.existsSync(file)) continue;
    const src = readFile(file);
    for (const link of REQUIRED_LINKS) {
        // Pages aren't expected to self-link.
        if (link === route) continue;
        if (!src.includes(`"${link}"`)) {
            failures.push(
                `[missing-internal-link] ${relPath(file)} does not link to ${link}`,
            );
        }
    }
}

// --------------------------------------------------------------------------
// Summary
// --------------------------------------------------------------------------

console.log(`\nChecked ${sitemapPaths.size} sitemap routes.`);
console.log(`Scanned ${SCAN_DIRS.length} directories for prompt-leak fragments.`);

if (failures.length > 0) {
    console.error(
        `\n❌ ${failures.length} SEO/privacy hygiene issue${failures.length === 1 ? '' : 's'} found:\n`,
    );
    for (const f of failures) console.error(`  - ${f}`);
    process.exit(1);
}

console.log('\n✅ All SEO/privacy hygiene checks passed.');
