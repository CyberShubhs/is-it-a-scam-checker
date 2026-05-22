#!/usr/bin/env node
/**
 * Blog quality gate for content/blog/*.mdx.
 *
 * Fails on:
 *   - duplicate titles
 *   - duplicate or near-duplicate summaries
 *   - posts under 500 words (unless explicitly allowlisted)
 *   - fewer than 2 valid http(s) sources
 *   - missing internal Scam Checker links (>=1)
 *   - missing required frontmatter fields
 *   - source URLs that aren't http/https
 *
 * The threshold here (>= 500 words) is intentionally laxer than the generator
 * gate (>= 800 words). The generator gate is the *target* for new posts; this
 * check is the *baseline* for posts already on disk so the build can fail
 * fast if a thin post sneaks in.
 *
 * Exits non-zero on any failure.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const BLOG_DIR = path.join(ROOT, 'content', 'blog');

const MIN_WORD_COUNT = 500;
const MIN_SOURCES = 2;
const MIN_INTERNAL_LINKS = 1;

/**
 * Posts that are intentionally allowed below the word-count gate. Each entry
 * must include a `reason` so future maintainers know why it is here. Empty
 * by default — the goal is to redirect or rewrite thin posts, not to allowlist
 * them silently.
 */
const SHORT_POST_ALLOWLIST = [
    // {
    //   slug: '2026-02-22-scam-watch-roundup-general-advice',
    //   reason: 'Editorial roundup, intentionally short, internal-link-rich.',
    // },
];

const REQUIRED_FRONTMATTER = ['title', 'date', 'summary', 'tags', 'sources'];

const failures = [];

function readFile(p) {
    return fs.readFileSync(p, 'utf-8');
}

function parseFrontmatter(raw) {
    const m = raw.match(/^---\n([\s\S]*?)\n---/);
    if (!m) return null;
    const fm = m[1];
    const lines = fm.split('\n');
    const data = {};
    let key = null;
    for (const line of lines) {
        const top = line.match(/^([a-zA-Z_]+):\s*(.*)$/);
        if (top) {
            key = top[1];
            const value = top[2].trim();
            if (value === '') data[key] = [];
            else if (value.startsWith('[') && value.endsWith(']')) {
                data[key] = value
                    .slice(1, -1)
                    .split(',')
                    .map((s) => s.replace(/^\s*["']|["']\s*$/g, '').trim())
                    .filter(Boolean);
            } else {
                data[key] = value.replace(/^["']|["']$/g, '');
            }
        } else if (key && /^\s+-\s+/.test(line)) {
            const item = line.replace(/^\s+-\s+/, '').replace(/^["']|["']$/g, '').trim();
            if (!Array.isArray(data[key])) data[key] = [];
            data[key].push(item);
        }
    }
    return { data, body: raw.slice(m[0].length).trim() };
}

function countWords(body) {
    return body
        .replace(/```[\s\S]*?```/g, ' ')
        .replace(/`[^`]*`/g, ' ')
        .replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
        .replace(/\[[^\]]*\]\([^)]+\)/g, ' ')
        .replace(/[#>*_\-`~]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length > 0).length;
}

function normaliseSummary(s) {
    return (s || '')
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

if (!fs.existsSync(BLOG_DIR)) {
    console.error(`[blog-quality] expected ${BLOG_DIR} to exist`);
    process.exit(1);
}

const files = fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith('.mdx') && !f.startsWith('_'));

const titles = new Map(); // title -> slug
const summaries = new Map(); // normalised summary -> slug

for (const file of files) {
    const slug = file.replace(/\.mdx$/, '');
    const full = path.join(BLOG_DIR, file);
    const raw = readFile(full);
    const parsed = parseFrontmatter(raw);

    if (!parsed) {
        failures.push(`[no-frontmatter] ${file} has no frontmatter block.`);
        continue;
    }
    const { data, body } = parsed;

    for (const field of REQUIRED_FRONTMATTER) {
        if (data[field] === undefined || data[field] === null) {
            failures.push(`[missing-frontmatter] ${file} missing required field: ${field}`);
        }
    }

    // Title uniqueness
    const title = data.title || '';
    if (title) {
        if (titles.has(title)) {
            failures.push(`[duplicate-title] ${file} reuses the same title as ${titles.get(title)}: "${title}"`);
        } else {
            titles.set(title, file);
        }
    }

    // Summary near-duplicate (Jaccard on word sets)
    const normSummary = normaliseSummary(data.summary);
    if (normSummary) {
        // Exact match
        if (summaries.has(normSummary)) {
            failures.push(`[duplicate-summary] ${file} has the same summary as ${summaries.get(normSummary)}.`);
        } else {
            const newWords = new Set(normSummary.split(' ').filter((w) => w.length > 3));
            for (const [other, otherSlug] of summaries.entries()) {
                const otherWords = new Set(other.split(' ').filter((w) => w.length > 3));
                const intersection = [...newWords].filter((w) => otherWords.has(w)).length;
                const union = new Set([...newWords, ...otherWords]).size;
                if (union > 0 && intersection / union > 0.75) {
                    failures.push(`[near-duplicate-summary] ${file} summary >75% Jaccard overlap with ${otherSlug}.`);
                    break;
                }
            }
            summaries.set(normSummary, file);
        }
    }

    // Sources
    const sources = Array.isArray(data.sources) ? data.sources : [];
    const validSources = sources.filter((s) => /^https?:\/\//i.test(s));
    if (validSources.length < MIN_SOURCES) {
        failures.push(`[thin-sources] ${file} has ${validSources.length} valid source URL(s); needs >= ${MIN_SOURCES}.`);
    }
    for (const s of sources) {
        if (s && !/^https?:\/\//i.test(s)) {
            failures.push(`[non-http-source] ${file} has a source that is not http(s): ${s}`);
        }
    }

    // Word count
    const wc = countWords(body);
    if (wc < MIN_WORD_COUNT) {
        const allow = SHORT_POST_ALLOWLIST.find((a) => a.slug === slug);
        if (allow) {
            // Acceptable — but log so it stays visible.
            console.log(`[short-allowed] ${file} (${wc} words) — ${allow.reason}`);
        } else {
            failures.push(`[thin-post] ${file} is ${wc} words; needs >= ${MIN_WORD_COUNT} or an entry in SHORT_POST_ALLOWLIST with a reason.`);
        }
    }

    // Internal links — at least one absolute path starting with /
    const internalLinks = body.match(/\]\(\/[a-zA-Z0-9_\-/]*/g) || [];
    if (internalLinks.length < MIN_INTERNAL_LINKS) {
        failures.push(`[no-internal-links] ${file} has no internal Scam Checker links.`);
    }
}

console.log(`\nScanned ${files.length} blog posts.`);

if (failures.length > 0) {
    console.error(`\n❌ ${failures.length} blog quality issue${failures.length === 1 ? '' : 's'} found:\n`);
    for (const f of failures) console.error(`  - ${f}`);
    process.exit(1);
}

console.log('\n✅ All blog quality checks passed.');
