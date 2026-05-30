#!/usr/bin/env node
/**
 * Rendered-HTML SEO check.
 *
 * The static check-seo-hygiene.mjs validates source. This one validates the
 * ACTUAL HTML Next.js emits into .next/server/app after `npm run build` —
 * which is what Ahrefs and Google crawl. It catches the issues that dropped
 * the Ahrefs Site Audit health score:
 *
 *   - Title too long           (> 60 chars)
 *   - Meta description missing / too long (> 160 chars)
 *   - Open Graph tags incomplete (missing image / dimensions / site_name…)
 *   - Twitter card incomplete
 *   - Page has links to a broken internal page (404)
 *   - Page has links to a redirect (links should hit the final URL)
 *   - Broken metadata asset (og:image / favicon / icon that 404s)
 *
 * Run AFTER a build. If no build output exists it prints a notice and exits 0
 * so it is safe to run standalone; the verification flow builds first.
 *
 * Exits non-zero on any failure.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const APP_HTML = path.join(ROOT, '.next', 'server', 'app');
const APP = path.join(ROOT, 'src', 'app');
const PUBLIC_DIR = path.join(ROOT, 'public');

const TITLE_MAX = 60;
const DESC_MAX = 160;

const OG_REQUIRED = [
    'og:title', 'og:description', 'og:url', 'og:type', 'og:site_name',
    'og:image', 'og:image:width', 'og:image:height', 'og:image:alt',
];
const TW_REQUIRED = ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image'];

if (!fs.existsSync(APP_HTML)) {
    console.log('ℹ️  No build output at .next/server/app — run `npm run build` first.');
    console.log('   Skipping rendered-SEO checks (exit 0).');
    process.exit(0);
}

const failures = [];

// ---- redirect sources from next.config.ts ----
const cfg = fs.readFileSync(path.join(ROOT, 'next.config.ts'), 'utf-8');
const redirectSources = new Set([...cfg.matchAll(/source:\s*'([^']+)'/g)].map((m) => m[1]));

// ---- route resolver ----
function appRouteExists(href) {
    const clean = (href.split('#')[0].split('?')[0].replace(/\/$/, '')) || '/';
    if (clean === '/') return fs.existsSync(path.join(APP, 'page.tsx'));
    const segs = clean.split('/').filter(Boolean);
    const tryDir = (dir, rem) => {
        if (rem.length === 0) return fs.existsSync(path.join(dir, 'page.tsx'));
        const [h, ...t] = rem;
        const direct = path.join(dir, h);
        if (fs.existsSync(direct) && fs.statSync(direct).isDirectory() && tryDir(direct, t)) return true;
        if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
            for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
                if (e.isDirectory() && e.name.startsWith('[') && e.name.endsWith(']') && tryDir(path.join(dir, e.name), t)) return true;
            }
        }
        return false;
    };
    if (tryDir(APP, segs)) return true;
    if (fs.existsSync(path.join(PUBLIC_DIR, ...segs))) return true;
    return false;
}

// Files Next.js generates that aren't pages or public/ files.
const SPECIAL_OK = new Set(['/icon.png', '/sitemap.xml', '/robots.txt', '/manifest.webmanifest']);
function assetExists(p) {
    const clean = p.split('?')[0];
    if (SPECIAL_OK.has(clean)) return true;
    if (fs.existsSync(path.join(PUBLIC_DIR, clean.replace(/^\//, '')))) return true;
    return false;
}

function* walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const f = path.join(dir, e.name);
        if (e.isDirectory()) yield* walk(f);
        else if (e.name.endsWith('.html')) yield f;
    }
}
function decode(s) {
    return s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&#39;/g, "'");
}
function getTitle(html) {
    const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    return m ? decode(m[1].trim()) : null;
}
function getMeta(html, name, attr) {
    const re = new RegExp(`<meta[^>]*${attr}=["']${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*content=["']([^"']*)["']`, 'i');
    const re2 = new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*${attr}=["']${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`, 'i');
    const m = html.match(re) || html.match(re2);
    return m ? decode(m[1]) : null;
}

let pages = 0;
for (const file of walk(APP_HTML)) {
    const rel = '/' + path.relative(APP_HTML, file).replace(/\.html$/, '').replace(/^index$/, '');
    if (rel.includes('/_')) continue; // _not-found, _global-error
    pages++;
    const html = fs.readFileSync(file, 'utf-8');

    const title = getTitle(html);
    if (!title) failures.push(`[title-missing] ${rel} has no <title>`);
    else if (title.length > TITLE_MAX) failures.push(`[title-too-long] ${rel} title is ${title.length} chars (max ${TITLE_MAX}): "${title}"`);

    const desc = getMeta(html, 'description', 'name');
    if (!desc) failures.push(`[description-missing] ${rel} has no meta description`);
    else if (desc.length > DESC_MAX) failures.push(`[description-too-long] ${rel} description is ${desc.length} chars (max ${DESC_MAX})`);

    for (const p of OG_REQUIRED) {
        if (getMeta(html, p, 'property') === null) failures.push(`[og-incomplete] ${rel} missing ${p}`);
    }
    for (const t of TW_REQUIRED) {
        if (getMeta(html, t, 'name') === null) failures.push(`[twitter-incomplete] ${rel} missing ${t}`);
    }

    // Internal links + canonical + og:url must resolve and not be redirect sources.
    const urls = new Set();
    for (const m of html.matchAll(/<a[^>]*href="([^"]+)"/g)) urls.add(m[1]);
    const canon = html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/i);
    if (canon) urls.add(canon[1]);
    const ogUrl = getMeta(html, 'og:url', 'property');
    if (ogUrl) urls.add(ogUrl);

    for (let u of urls) {
        u = decode(u);
        if (!u.startsWith('/') && !/^https?:\/\/scamchecker\.app(\/|$)/i.test(u)) continue;
        let internal = u.startsWith('/') ? u : (u.replace(/^https?:\/\/scamchecker\.app/i, '') || '/');
        if (internal.startsWith('/_next/') || internal.startsWith('#')) continue;
        const clean = internal.split('#')[0].split('?')[0];
        if (redirectSources.has(clean)) failures.push(`[links-to-redirect] ${rel} links to ${clean} which is a permanent redirect — link to the final URL`);
        else if (!SPECIAL_OK.has(clean) && !assetExists(clean) && !appRouteExists(clean)) failures.push(`[broken-internal-link] ${rel} links to ${clean} which has no route or asset`);
    }

    // Metadata assets on our own host must exist.
    for (const tag of ['og:image']) {
        const v = getMeta(html, tag, 'property');
        if (v && /^https?:\/\/scamchecker\.app\//i.test(v)) {
            const p = v.replace(/^https?:\/\/scamchecker\.app/i, '');
            if (!assetExists(p)) failures.push(`[broken-asset] ${rel} ${tag}=${v} does not resolve to a public/ or app asset`);
        }
    }
    for (const m of html.matchAll(/<link[^>]*rel="(?:icon|shortcut icon|apple-touch-icon)"[^>]*href="([^"]+)"/gi)) {
        const href = m[1].replace(/^https?:\/\/scamchecker\.app/i, '');
        if (href.startsWith('/') && !href.startsWith('/_next/') && !assetExists(href)) {
            failures.push(`[broken-icon] ${rel} icon href ${href} does not resolve`);
        }
    }
}

// favicon.ico must exist (browsers + crawlers request it by convention).
if (!fs.existsSync(path.join(PUBLIC_DIR, 'favicon.ico'))) {
    failures.push('[favicon-missing] public/favicon.ico is missing — /favicon.ico will 404');
}

console.log(`\nChecked ${pages} rendered pages in .next/server/app.`);
if (failures.length) {
    console.error(`\n❌ ${failures.length} rendered-SEO issue(s):\n`);
    for (const f of failures) console.error('  - ' + f);
    process.exit(1);
}
console.log('\n✅ All rendered-SEO checks passed (titles, descriptions, Open Graph, Twitter, internal links, assets).');
