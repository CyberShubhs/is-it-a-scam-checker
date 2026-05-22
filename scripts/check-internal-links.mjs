#!/usr/bin/env node
/**
 * Static SEO link-quality check.
 *
 * Walks src/app and src/components for .tsx files and verifies:
 *   1. No banned generic anchor text (click here / read more / learn more)
 *   2. No empty <a> or <Link> anchors
 *   3. Every blog post page template includes ≥5 internal links
 *   4. Important pages (/check, /reports, /guides, /have-i-been-scammed)
 *      are referenced from the homepage and footer
 *   5. Every internal href referenced anywhere has a matching app/ route
 *      OR a public/ static asset
 *   6. The sitemap includes the priority hub pages
 *
 * Exits non-zero on any failure.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const APP = path.join(SRC, 'app');
const COMPONENTS = path.join(SRC, 'components');
const PUBLIC_DIR = path.join(ROOT, 'public');
const HOMEPAGE = path.join(APP, 'page.tsx');
const FOOTER = path.join(COMPONENTS, 'Footer.tsx');
const BLOG_POST = path.join(APP, 'blog', '[slug]', 'page.tsx');
const SITEMAP = path.join(APP, 'sitemap.ts');

const BANNED_TEXTS = ['click here', 'read more', 'learn more'];

const IMPORTANT_TARGETS = [
    '/check',
    '/reports',
    '/guides',
    '/have-i-been-scammed',
];

const PRIORITY_HUBS = [
    '/scam-types',
    '/scam-examples',
    '/scam-guides',
    '/scam-tools',
    '/latest-scams',
    '/report-a-scam',
    '/reports/websites',
    '/reports/phone-numbers',
    '/reports/emails',
    '/reports/crypto-wallets',
    '/reports/latest',
    '/reports/trending',
];

// Blog category hubs are added to the sitemap dynamically (see BLOG_CATEGORIES
// in src/lib/posts.ts), so we verify them by checking that the routes exist
// on disk rather than that the sitemap source contains the literal string.
const BLOG_CATEGORY_HUBS = [
    '/blog/scam-alerts',
    '/blog/phishing',
    '/blog/fake-websites',
    '/blog/crypto-scams',
    '/blog/job-scams',
    '/blog/marketplace-scams',
    '/blog/text-message-scams',
];

const failures = [];

/** Recursively yield every .tsx file under a directory. */
function* walk(dir) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) yield* walk(full);
        else if (entry.isFile() && entry.name.endsWith('.tsx')) yield full;
    }
}

function relPath(p) {
    return path.relative(ROOT, p);
}

function readFile(p) {
    return fs.readFileSync(p, 'utf-8');
}

/**
 * Extract every <Link ...>...</Link> and <a ...>...</a> as
 * { tag, attrs, body } objects. Single-line minded — JSX parsing is hard
 * but this catches the common cases.
 */
function extractAnchors(source) {
    const out = [];
    const re = /<(Link|a)\b([^>]*)>([\s\S]*?)<\/\1>/g;
    let m;
    while ((m = re.exec(source)) !== null) {
        out.push({ tag: m[1], attrs: m[2], body: m[3], index: m.index });
    }
    return out;
}

/**
 * Strip ONLY tag markers (keep inner text). Used for the banned-text check.
 */
function visibleText(jsx) {
    let s = jsx.replace(/<[^>]+>/g, ' ');
    s = s.replace(/\{[\s\S]*?\}/g, ' '); // expressions are unknown text → ignore for matching
    s = s.replace(/&[a-z]+;/gi, ' ');
    return s.replace(/\s+/g, ' ').trim();
}

/**
 * True if the anchor body contains any user-visible content — text,
 * a JSX expression (which emits something at runtime), or nested child text.
 */
function hasVisibleContent(jsx) {
    let s = jsx.replace(/<[^>]+>/g, ' ');
    // Treat any JSX expression as a content placeholder — it emits something.
    s = s.replace(/\{[\s\S]*?\}/g, 'X');
    s = s.replace(/&[a-z]+;/gi, ' ');
    return s.replace(/\s+/g, '').length > 0;
}

function getHref(attrs) {
    const stringMatch = attrs.match(/\bhref\s*=\s*"([^"]*)"/);
    if (stringMatch) return { value: stringMatch[1], dynamic: false };
    if (/\bhref\s*=\s*\{/.test(attrs)) return { value: null, dynamic: true };
    return { value: null, dynamic: false };
}

/* ---------- 1 + 2: anchor quality across all .tsx ---------- */

const allHrefs = new Set();
let totalAnchors = 0;

for (const file of [...walk(APP), ...walk(COMPONENTS)]) {
    const src = readFile(file);
    const anchors = extractAnchors(src);
    for (const a of anchors) {
        totalAnchors++;
        const href = getHref(a.attrs);
        if (href.value && href.value.startsWith('/')) allHrefs.add(href.value);

        const text = visibleText(a.body).toLowerCase();
        const ariaLabel = (a.attrs.match(/aria-label\s*=\s*"([^"]+)"/) || [])[1];
        const title = (a.attrs.match(/title\s*=\s*"([^"]+)"/) || [])[1];

        // Anchors used as scroll targets (no href attr at all) are fine.
        const hasHref = /\bhref\s*=/.test(a.attrs);

        // Empty anchor — fail only if there is genuinely no content + no a11y label.
        if (
            hasHref &&
            !ariaLabel &&
            !title &&
            !hasVisibleContent(a.body)
        ) {
            failures.push(
                `[empty-anchor] ${relPath(file)} — <${a.tag} href="${href.value ?? '<dynamic>'}"> has no visible content and no aria-label`,
            );
        }

        // Banned generic phrases as the entire visible text.
        if (text && BANNED_TEXTS.includes(text)) {
            failures.push(
                `[banned-anchor-text] ${relPath(file)} — anchor text "${text}" is too generic (href=${href.value ?? '<dynamic>'})`,
            );
        }
    }
}

/* ---------- 3: blog post template internal-link count ---------- */

if (fs.existsSync(BLOG_POST)) {
    const src = readFile(BLOG_POST);
    const internal = (src.match(/href="\/[^"]*"/g) || []).filter(
        (h) => !h.startsWith('href="//'),
    );
    if (internal.length < 5) {
        failures.push(
            `[blog-internal-links] ${relPath(BLOG_POST)} contains only ${internal.length} internal links; need at least 5`,
        );
    }
} else {
    failures.push(`[missing-file] expected ${relPath(BLOG_POST)} to exist`);
}

/* ---------- 4: important pages linked from homepage + footer ---------- */

function hrefSet(file) {
    if (!fs.existsSync(file)) {
        failures.push(`[missing-file] expected ${relPath(file)} to exist`);
        return new Set();
    }
    const src = readFile(file);
    const matches = src.match(/href="(\/[^"]*)"/g) || [];
    return new Set(matches.map((m) => m.slice(6, -1)));
}

const homepageHrefs = hrefSet(HOMEPAGE);
const footerHrefs = hrefSet(FOOTER);

for (const target of IMPORTANT_TARGETS) {
    if (!homepageHrefs.has(target) && !footerHrefs.has(target)) {
        failures.push(
            `[priority-target-unlinked] ${target} is not linked from homepage or footer`,
        );
    }
}

/* ---------- 5: every internal href maps to a route ---------- */

function appRouteExists(href) {
    // Strip query/hash
    const clean = href.split('#')[0].split('?')[0];
    if (clean === '/' || clean === '') {
        return fs.existsSync(path.join(APP, 'page.tsx'));
    }
    const segments = clean.split('/').filter(Boolean);

    // Try exact static path
    const staticPath = path.join(APP, ...segments, 'page.tsx');
    if (fs.existsSync(staticPath)) return true;

    // Try matching with a [slug] dynamic segment at any position
    function tryDir(currentDir, remaining) {
        if (remaining.length === 0) {
            return fs.existsSync(path.join(currentDir, 'page.tsx'));
        }
        const [head, ...tail] = remaining;
        const direct = path.join(currentDir, head);
        if (fs.existsSync(direct) && fs.statSync(direct).isDirectory()) {
            if (tryDir(direct, tail)) return true;
        }
        // Look for any [param] sibling
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

    // Static asset in /public?
    const publicPath = path.join(PUBLIC_DIR, ...segments);
    if (fs.existsSync(publicPath)) return true;

    return false;
}

for (const href of allHrefs) {
    if (!href.startsWith('/')) continue; // external
    if (href.startsWith('//')) continue;
    if (!appRouteExists(href)) {
        failures.push(`[broken-internal-link] ${href} has no matching app route or public asset`);
    }
}

/* ---------- 6: sitemap includes priority hubs ---------- */

if (fs.existsSync(SITEMAP)) {
    const src = readFile(SITEMAP);
    for (const hub of PRIORITY_HUBS) {
        if (!src.includes(`'${hub}'`) && !src.includes(`"${hub}"`)) {
            failures.push(`[sitemap-missing] ${hub} not present in sitemap.ts`);
        }
    }
} else {
    failures.push(`[missing-file] expected ${relPath(SITEMAP)} to exist`);
}

/* ---------- 6b: every blog category hub is reachable ---------- */

for (const hub of BLOG_CATEGORY_HUBS) {
    if (!appRouteExists(hub)) {
        failures.push(`[missing-blog-category-hub] ${hub} has no matching app route`);
    }
}

/* ---------- 7: /llms.txt exists and is non-trivial ---------- */

const LLMS_TXT = path.join(PUBLIC_DIR, 'llms.txt');
if (!fs.existsSync(LLMS_TXT)) {
    failures.push('[missing-file] public/llms.txt must exist (so /llms.txt returns 200)');
} else {
    const body = readFile(LLMS_TXT);
    if (body.length < 200) {
        failures.push('[llms-txt-thin] public/llms.txt is unexpectedly short (<200 chars)');
    }
    for (const expected of ['scamchecker.app', 'sitemap']) {
        if (!body.toLowerCase().includes(expected.toLowerCase())) {
            failures.push(`[llms-txt-missing-content] public/llms.txt should mention "${expected}"`);
        }
    }
}

/* ---------- 8: blog post template still drives users to /check + /have-i-been-scammed ---------- */

if (fs.existsSync(BLOG_POST)) {
    const src = readFile(BLOG_POST);
    if (!src.includes('"/check"')) {
        failures.push('[blog-cta-missing] blog post page must link to /check');
    }
    if (!src.includes('"/have-i-been-scammed"')) {
        failures.push('[blog-cta-missing] blog post page must link to /have-i-been-scammed');
    }
    if (!src.includes('"/reports"')) {
        failures.push('[blog-cta-missing] blog post page must link to /reports');
    }
    // It must render exactly one <h1>
    const h1Count = (src.match(/<h1\b/g) || []).length;
    if (h1Count !== 1) {
        failures.push(`[blog-h1] blog post template has ${h1Count} <h1> tags; should have exactly 1`);
    }
}

/* ---------- summary ---------- */

console.log(`\nScanned ${totalAnchors} anchors across src/app and src/components.`);
console.log(`Internal hrefs referenced: ${[...allHrefs].filter((h) => h.startsWith('/')).length}`);

if (failures.length > 0) {
    console.error(`\n❌ ${failures.length} link-quality issue${failures.length === 1 ? '' : 's'} found:\n`);
    for (const f of failures) console.error(`  - ${f}`);
    process.exit(1);
}

console.log('\n✅ All internal-link quality checks passed.');
