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

// Blog categories are added to the sitemap dynamically via BLOG_CATEGORIES
// in src/lib/posts.ts. Extract the slug list so the required-route check
// below sees /blog/<category> entries.
const postsSrc = readFile(path.join(ROOT, 'src', 'lib', 'posts.ts'));
const blogCategorySlugs = [...postsSrc.matchAll(/^\s*slug:\s*'([^']+)'/gm)].map(
    (m) => m[1],
);

const sitemapPaths = new Set([
    ...sitemapLiterals,
    ...guideSlugs.map((s) => `/guides/${s}`),
    ...blogSlugs.map((s) => `/blog/${s}`),
    ...blogCategorySlugs.map((s) => `/blog/${s}`),
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
// 2b. next.config.ts must satisfy four invariants for Search Console hygiene:
//
//   1. Each legacy 404 source path must have an exact-destination permanent
//      redirect (no source = re-introduces 404s; wrong destination = breaks
//      backlinks; non-permanent = wrong status code for SEO).
//   2. `/_next/static/:path*` must carry `X-Robots-Tag: noindex, nofollow`.
//   3. Sitemap output must never contain `/_next/static`.
//   4. Every keyword-targeted route added in this SEO pass must remain in
//      the sitemap.
// --------------------------------------------------------------------------

/**
 * Pulled from:
 *   - the GSC 404 export (the 3 legacy guide URLs)
 *   - SEO/reports/2026-05-22-235309-AEST-gsc-82-url-triage.md (the 27 thin/
 *     duplicate blog posts and the 1 consolidated roundup duplicate)
 *
 * Each entry is enforced below with exact source, exact destination, and
 * permanent: true. If anyone touches next.config.ts and removes or rewires
 * one of these, this test fails — preventing the previous "Crawled - currently
 * not indexed" / 404 problems from quietly returning.
 *
 * Treat this list as the source of truth. If a redirect is removed
 * intentionally, update both this list and the triage report in the same
 * commit so the rationale stays in sync.
 */
const REQUIRED_LEGACY_REDIRECTS = [
    // Legacy 404 guide URLs (from GSC Table.csv).
    { source: '/guides/check-scam-invoices-pdf', destination: '/guides/email-phishing-examples' },
    { source: '/guides/is-this-a-scam-message', destination: '/check' },
    { source: '/guides/ato-scams-australia', destination: '/guides/ato-scam-text-email' },

    // Consolidated Scam Watch roundup duplicate (byte-identical content).
    {
        source: '/blog/2026-02-22-scam-watch-roundup-general-advice-to-sta-691b7f',
        destination: '/blog/2026-02-22-scam-watch-roundup-general-advice',
    },

    // Thin / unsourced / generated blog posts redirected to cluster hubs.
    // See SEO/reports/2026-05-22-235309-AEST-gsc-82-url-triage.md for the
    // per-URL rationale.
    { source: '/blog/2026-04-14-australia-loses-5m-to-new-ato-refund-scam-8b29d8', destination: '/guides/ato-scam-text-email' },
    { source: '/blog/2026-04-14-crypto-app-scam-australians-lose-30m-to-fake-tradi-3b0eb0', destination: '/crypto-scam-checker' },
    { source: '/blog/2026-04-14-job-seeker-scam-alert-1-5m-lost-09b290', destination: '/guides/job-scams' },
    { source: '/blog/2026-04-14-student-loan-scam-alert-3-5m-lost-32637a', destination: '/check' },
    { source: '/blog/2026-04-15-data-breach-hits-300-000-check-your-info-now-1de6c9', destination: '/have-i-been-scammed' },
    { source: '/blog/2026-04-15-tax-season-scam-costs-10m-61797d', destination: '/check' },
    { source: '/blog/2026-04-16-crypto-payment-scam-alert-1-2m-lost-89175f', destination: '/crypto-scam-checker' },
    { source: '/blog/2026-04-16-data-breach-exposes-1-5m-users-0263c6', destination: '/have-i-been-scammed' },
    { source: '/blog/2026-04-17-fbi-warns-of-10m-romance-scam-062bfa', destination: '/check' },
    { source: '/blog/2026-04-18-1-5m-exposed-cyber-breach-alert-f548b1', destination: '/have-i-been-scammed' },
    { source: '/blog/2026-04-19-new-bank-text-scam-hits-10-000-3da7dd', destination: '/guides/bank-impersonation-scams' },
    { source: '/blog/2026-04-20-nigeria-s-n20m-text-scam-hits-8-000-443ce4', destination: '/guides/scam-text-message-examples' },
    {
        source: '/blog/2026-04-21-fbi-warns-of-15m-social-security-scam-980b96',
        destination: '/blog/2026-04-17-ssa-scam-alert-imposters-steal-millions-from-us-se-e809ce',
    },
    { source: '/blog/2026-04-22-tax-season-scam-alert-15m-lost-694527', destination: '/check' },
    { source: '/blog/2026-04-23-2-5m-hit-by-latest-phishing-scam-ee86c5', destination: '/guides/email-phishing-examples' },
    { source: '/blog/2026-04-24-elderly-lose-8m-to-scam-calls-f3e54b', destination: '/scam-phone-number-checker' },
    { source: '/blog/2026-04-27-dating-app-scam-10m-lost-in-6-months-9c58e2', destination: '/check' },
    { source: '/blog/2026-04-27-employment-scam-costs-4m-ed6311', destination: '/guides/job-scams' },
    { source: '/blog/2026-04-29-4-500-uk-seniors-lose-1-2m-to-pension-scam-03b54a', destination: '/check' },
    { source: '/blog/2026-04-29-new-phishing-tactic-steals-6m-37f8b1', destination: '/guides/email-phishing-examples' },
    { source: '/blog/2026-05-05-may-2026-13-000-uk-citizens-lose-8-5m-928998', destination: '/check' },
    { source: '/blog/2026-05-05-nz-3-6m-lost-to-fake-bill-scam-de1bfd', destination: '/check' },
    { source: '/blog/2026-05-07-data-breach-8-million-affected-346733', destination: '/have-i-been-scammed' },
    { source: '/blog/2026-05-11-elderly-lose-10m-to-fake-tech-support-64672d', destination: '/scam-phone-number-checker' },
    { source: '/blog/2026-05-15-2-5m-lost-to-new-invoice-scam-0e7ed7', destination: '/guides/email-phishing-examples' },
    { source: '/blog/2026-05-18-10m-lost-to-fake-job-scams-4c6c3d', destination: '/guides/job-scams' },
];

/**
 * Parse the redirects() return value out of next.config.ts. Cheap because
 * the config is hand-written and stable — we look for `{ source: 'x',
 * destination: 'y', permanent: true|false }` literal objects.
 */
function parseRedirectsFromConfig(src) {
    const out = [];
    const re = /\{\s*source:\s*['"]([^'"]+)['"]\s*,\s*destination:\s*['"]([^'"]+)['"]\s*,\s*permanent:\s*(true|false)\s*,?\s*\}/g;
    let m;
    while ((m = re.exec(src)) !== null) {
        out.push({ source: m[1], destination: m[2], permanent: m[3] === 'true' });
    }
    return out;
}

const nextConfigPath = path.join(ROOT, 'next.config.ts');
if (fs.existsSync(nextConfigPath)) {
    const nextConfigSrc = readFile(nextConfigPath);
    const redirects = parseRedirectsFromConfig(nextConfigSrc);
    const redirectsBySource = new Map(redirects.map((r) => [r.source, r]));

    for (const expected of REQUIRED_LEGACY_REDIRECTS) {
        const actual = redirectsBySource.get(expected.source);
        if (!actual) {
            failures.push(
                `[missing-legacy-redirect] next.config.ts no longer redirects ${expected.source} — Google Search Console will log this as Not found (404)`,
            );
            continue;
        }
        if (actual.destination !== expected.destination) {
            failures.push(
                `[wrong-redirect-destination] ${expected.source} should redirect to ${expected.destination}, got ${actual.destination}`,
            );
        }
        if (actual.permanent !== true) {
            failures.push(
                `[non-permanent-redirect] ${expected.source} redirect must be permanent: true (gives a 308); currently permanent: ${actual.permanent}`,
            );
        }
    }

    // X-Robots-Tag invariant: must apply to /_next/static/:path* with the
    // exact value `noindex, nofollow`.
    const headerBlockRe = /source:\s*['"]\/_next\/static\/:path\*['"][\s\S]*?headers:\s*\[([\s\S]*?)\]/;
    const headerBlock = nextConfigSrc.match(headerBlockRe);
    if (!headerBlock) {
        failures.push(
            `[missing-asset-noindex] next.config.ts must keep the X-Robots-Tag header on /_next/static/:path* so build assets are not indexed`,
        );
    } else {
        const block = headerBlock[1];
        const keyRe = /key:\s*['"]X-Robots-Tag['"]/;
        const valRe = /value:\s*['"]noindex,\s*nofollow['"]/;
        if (!keyRe.test(block) || !valRe.test(block)) {
            failures.push(
                `[wrong-asset-noindex] /_next/static/:path* must set X-Robots-Tag to exactly "noindex, nofollow"`,
            );
        }
    }
} else {
    failures.push('[missing-file] expected next.config.ts to exist');
}

// --------------------------------------------------------------------------
// 2c. Sitemap must include every keyword-targeted SEO route and must not
//     include `/_next/static`.
// --------------------------------------------------------------------------

const REQUIRED_SITEMAP_ROUTES = [
    '/scam-website-checker',
    '/scam-phone-number-checker',
    '/crypto-scam-checker',
    '/scam-checker-australia',
    '/scam-website-checker-uk',
    '/blog/job-scams',
    '/guides/job-scams',
];

for (const route of REQUIRED_SITEMAP_ROUTES) {
    if (!sitemapPaths.has(route)) {
        failures.push(
            `[missing-required-route] ${route} must be emitted by sitemap.ts but was not found`,
        );
    }
}

for (const route of sitemapPaths) {
    if (typeof route === 'string' && route.includes('/_next/static')) {
        failures.push(
            `[sitemap-static-asset] sitemap.ts must never emit /_next/static URLs; found ${route}`,
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

// --------------------------------------------------------------------------
// 6. Blog page template must keep BlogPosting JSON-LD with author, publisher,
//    citation, and the canonical mainEntityOfPage — these are emitted via
//    buildBlogPostingJsonLd in src/lib/posts.ts. If anyone refactors and
//    breaks the wiring, we want to know.
// --------------------------------------------------------------------------

const blogTemplatePath = path.join(APP, 'blog', '[slug]', 'page.tsx');
const postsLibPath = path.join(ROOT, 'src', 'lib', 'posts.ts');

if (fs.existsSync(blogTemplatePath)) {
    const tpl = readFile(blogTemplatePath);
    if (!tpl.includes('buildBlogPostingJsonLd')) {
        failures.push(
            `[blog-jsonld] ${relPath(blogTemplatePath)} must render JSON-LD via buildBlogPostingJsonLd so the BlogPosting shape stays uniform.`,
        );
    }
    if (!tpl.includes('alternates') || !tpl.includes('canonical')) {
        failures.push(
            `[blog-canonical] ${relPath(blogTemplatePath)} must export a canonical URL in generateMetadata.`,
        );
    }
}

if (fs.existsSync(postsLibPath)) {
    const libSrc = readFile(postsLibPath);
    const required = [
        "@type': 'BlogPosting'",
        "'@type': 'BlogPosting'",
        'publisher',
        'mainEntityOfPage',
        'citation',
        'isAccessibleForFree',
    ];
    // Each required token must appear at least once in posts.ts (the JSON-LD
    // builder source).
    const missing = required.filter((token) => !libSrc.includes(token.replace("@type': 'BlogPosting'", '')));
    // We do the check by stripping the surrounding quote-style ambiguity.
    if (!libSrc.includes("'BlogPosting'") && !libSrc.includes('"BlogPosting"')) {
        failures.push(`[blog-jsonld-shape] ${relPath(postsLibPath)} must produce '@type: BlogPosting' JSON-LD.`);
    }
    for (const token of ['publisher', 'mainEntityOfPage', 'citation', 'isAccessibleForFree']) {
        if (!libSrc.includes(token)) {
            failures.push(`[blog-jsonld-shape] ${relPath(postsLibPath)} BlogPosting builder must emit "${token}".`);
        }
    }
    void missing;
}

// --------------------------------------------------------------------------
// 7. public/llms.txt must follow the Answer.AI proposal shape and not
//    masquerade as a robots.txt.
// --------------------------------------------------------------------------

const llmsPath = path.join(PUBLIC_DIR, 'llms.txt');
if (fs.existsSync(llmsPath)) {
    const body = readFile(llmsPath);
    if (!/^# Scam Checker/m.test(body)) {
        failures.push(`[llms-h1] public/llms.txt must start with an "# Scam Checker" H1.`);
    }
    if (!/^>\s+\S/m.test(body)) {
        failures.push(`[llms-blockquote] public/llms.txt must contain a blockquote summary (line starting with "> ").`);
    }
    for (const h2 of [
        '## Primary Tools',
        '## Emergency Help',
        '## Scam Guides',
        '## Scam Reporting',
        '## Blog and Scam Alerts',
        '## About and Trust',
    ]) {
        if (!body.includes(h2)) {
            failures.push(`[llms-section] public/llms.txt missing required H2: ${h2}`);
        }
    }
    for (const requiredLink of [
        '/check',
        '/have-i-been-scammed',
        '/guides',
        '/reports',
        '/global-scam-reporting',
        '/blog',
        '/sitemap.xml',
    ]) {
        if (!body.includes(requiredLink)) {
            failures.push(`[llms-link] public/llms.txt missing required link: ${requiredLink}`);
        }
    }
    if (/^User-agent:/mi.test(body) || /^Allow:\s*\//mi.test(body)) {
        failures.push(`[llms-robots-leak] public/llms.txt must not contain robots.txt directives (User-agent / Allow). Those belong in robots.txt.`);
    }
    if (/example\.com|placeholder|yourdomain/i.test(body)) {
        failures.push(`[llms-placeholder] public/llms.txt contains a placeholder URL.`);
    }
}

// --------------------------------------------------------------------------
// 9. No `keywords:` field in Next.js Metadata exports.
//
// Google has ignored <meta name="keywords"> for years and Bing treats it
// as a spam signal. The site previously emitted a keyword-stuffed array in
// src/app/layout.tsx; we removed that. This check prevents anyone (or any
// AI generator) from reintroducing it via metadata exports anywhere under
// src/app/.
// --------------------------------------------------------------------------

const METADATA_KEYWORDS_PATTERN = /^\s*keywords\s*:\s*\[/m;
for (const file of walkFiles(APP, ['.tsx', '.ts'])) {
    const body = readFile(file);
    if (
        /export\s+(const|async\s+function|function)\s+(metadata|generateMetadata)\b/.test(
            body,
        ) &&
        METADATA_KEYWORDS_PATTERN.test(body)
    ) {
        failures.push(
            `[meta-keywords] ${relPath(file)} declares \`keywords:\` inside a Next.js Metadata export. Remove it — search engines ignore meta keywords and Bing treats them as spam.`,
        );
    }
}

// --------------------------------------------------------------------------
// 10. Author profile page exists and the blog post template references it.
//
// E-E-A-T requires a visible author profile that the BlogPosting JSON-LD
// can point at. Both must stay in lockstep.
// --------------------------------------------------------------------------

const AUTHOR_PAGE = path.join(APP, 'author', 'shubham-singla', 'page.tsx');
if (!fs.existsSync(AUTHOR_PAGE)) {
    failures.push(
        `[author-missing] /author/shubham-singla page is missing. The BlogPosting JSON-LD links to it as the canonical Person profile.`,
    );
} else {
    const authorBody = readFile(AUTHOR_PAGE);
    if (!authorBody.includes('Shubham Singla')) {
        failures.push(
            `[author-bio-missing] ${relPath(AUTHOR_PAGE)} does not visibly contain "Shubham Singla". Visible authorship is a hard E-E-A-T requirement.`,
        );
    }
    // The source file emits JSON.stringify(...) of an object literal that
    // uses single-quoted keys/values. JSON.stringify will produce double
    // quotes in the rendered HTML, but the SOURCE file uses single quotes.
    // Match either form so this check stays robust to the author preferring
    // single-quoted object literals.
    const hasJsonLd = /application\/ld\+json/.test(authorBody);
    const hasPerson =
        /["']@type["']\s*:\s*["']Person["']/.test(authorBody);
    if (!hasJsonLd || !hasPerson) {
        failures.push(
            `[author-jsonld-missing] ${relPath(AUTHOR_PAGE)} must emit Person JSON-LD so search engines can attribute the BlogPosting author to a real person.`,
        );
    }
}

const BLOG_POST_TEMPLATE = path.join(APP, 'blog', '[slug]', 'page.tsx');
if (fs.existsSync(BLOG_POST_TEMPLATE)) {
    const body = readFile(BLOG_POST_TEMPLATE);
    if (!body.includes('/author/shubham-singla')) {
        failures.push(
            `[byline-missing] ${relPath(BLOG_POST_TEMPLATE)} does not link to /author/shubham-singla. Every blog post must show a visible author byline pointing at the canonical author profile.`,
        );
    }
}

// --------------------------------------------------------------------------
// 11. Required policy / compliance pages exist.
//
// Privacy posture only counts when the docs are actually reachable. We
// also check that the canonical URL declared in each page points back at
// the same path (a regression caught a few times when copy-pasting).
// --------------------------------------------------------------------------

const REQUIRED_POLICY_PAGES = [
    { path: '/privacy', file: 'privacy/page.tsx' },
    { path: '/terms', file: 'terms/page.tsx' },
    { path: '/disclaimer', file: 'disclaimer/page.tsx' },
    { path: '/cookies', file: 'cookies/page.tsx' },
    { path: '/security', file: 'security/page.tsx' },
    { path: '/data-removal', file: 'data-removal/page.tsx' },
    { path: '/responsible-disclosure', file: 'responsible-disclosure/page.tsx' },
];

for (const { path: routePath, file } of REQUIRED_POLICY_PAGES) {
    const filepath = path.join(APP, file);
    if (!fs.existsSync(filepath)) {
        failures.push(
            `[policy-page-missing] ${routePath} → expected page at src/app/${file} but it does not exist.`,
        );
        continue;
    }
    const body = readFile(filepath);
    const canonical = `https://scamchecker.app${routePath}`;
    if (!body.includes(canonical)) {
        failures.push(
            `[policy-canonical] src/app/${file} must declare canonical ${canonical}.`,
        );
    }
}

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
