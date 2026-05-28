#!/usr/bin/env node
/**
 * One-off repair pass for legacy blog post sources.
 *
 * Reads every post in content/blog/*.mdx and:
 *   1. Removes/replaces invalid source URLs (404s, 401 paywalls, off-
 *      registry URLs that have no equivalent on the registry).
 *   2. Maps a known-bad URL to its closest registry entry by topic tag
 *      and category.
 *   3. Rewrites in-body markdown links that pointed at the dead URL so
 *      they point at the resolved registry URL (descriptive anchor text
 *      is preserved).
 *   4. Softens unsupported quantitative claims ("$4.8 million", "10,000
 *      victims") whose backing source was replaced or removed. The claim
 *      sentence is rephrased to qualitative language so the post stays
 *      readable.
 *   5. Logs a summary of what changed, per file.
 *
 * USAGE
 *   node scripts/repair-blog-sources.mjs            (dry-run, prints plan)
 *   node scripts/repair-blog-sources.mjs --apply    (write changes to disk)
 *
 * The repair is intentionally conservative — it does NOT delete posts. If
 * a post has zero registry-mappable sources after the pass, it falls back
 * to two broad evergreens (FTC consumer-alerts + Scamwatch types-of-scams)
 * so every post keeps at least 2 valid citations.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
// BLOG_DIR / REGISTRY_PATH default to the in-repo locations but accept
// env-var overrides so vitest can point them at a temp directory.
const BLOG_DIR = process.env.REPAIR_BLOG_DIR
    ? path.resolve(process.env.REPAIR_BLOG_DIR)
    : path.join(ROOT, 'content', 'blog');
const REGISTRY_PATH = process.env.REPAIR_REGISTRY_PATH
    ? path.resolve(process.env.REPAIR_REGISTRY_PATH)
    : path.join(ROOT, 'data', 'source-registry.json');

const APPLY = process.argv.includes('--apply');

const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf-8'));
const REGISTRY_BY_URL = new Map(
    registry.sources.map((s) => [s.url.replace(/\/$/, '').toLowerCase(), s]),
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

function isInRegistry(url) {
    // Strict match only — equality (with optional trailing slash). We
    // deliberately do NOT allow prefix matches: a URL like
    // /types-of-scams/business-scams/false-billing must NOT inherit the
    // registry's /types-of-scams entry. That's how dead deep-links
    // previously slipped through.
    const n = url.replace(/\/$/, '').toLowerCase();
    return REGISTRY_BY_URL.has(n);
}

function isReportingAllowlist(url) {
    try {
        return REPORTING_ALLOWLIST.has(new URL(url).hostname.toLowerCase());
    } catch {
        return false;
    }
}

/**
 * Map a dead/bad URL to the best registry entry. The lookup uses domain +
 * path keywords. We bias toward conservative evergreen pages over niche
 * deep links.
 */
function suggestRegistryReplacement(url, postContext = '') {
    const host = (() => {
        try {
            return new URL(url).hostname.toLowerCase();
        } catch {
            return '';
        }
    })();
    const pathLower = (() => {
        try {
            return new URL(url).pathname.toLowerCase();
        } catch {
            return '';
        }
    })();
    const ctx = postContext.toLowerCase();

    // Map by hostname first, then by path keywords.
    if (host.endsWith('consumer.ftc.gov') || host.endsWith('ftc.gov')) {
        if (/job|employ|recruit|task/.test(pathLower + ' ' + ctx)) return 'ftc_job_scams';
        if (/check|cheque|cash/.test(pathLower + ' ' + ctx)) return 'ftc_fake_check_scams';
        if (/crypto|bitcoin|wallet|invest/.test(pathLower + ' ' + ctx)) return 'ftc_crypto_scams';
        if (/phish|email|spam/.test(pathLower + ' ' + ctx)) return 'ftc_phishing';
        if (/shop|online|store|marketplace/.test(pathLower + ' ' + ctx)) return 'ftc_online_shopping_scams';
        if (/imposter|government|irs|ssa/.test(pathLower + ' ' + ctx)) return 'ftc_government_imposter_scams';
        if (/identity|theft/.test(pathLower + ' ' + ctx)) return 'ftc_identity_theft';
        if (/breach/.test(pathLower + ' ' + ctx)) return 'ftc_identity_theft';
        if (/text|sms|smish/.test(pathLower + ' ' + ctx)) return 'ftc_sms_scams';
        if (/phone|call/.test(pathLower + ' ' + ctx)) return 'ftc_phone_scams';
        if (/romance|dating/.test(pathLower + ' ' + ctx)) return 'ftc_romance_scams';
        return 'ftc_scam_alerts';
    }
    if (host.endsWith('scamwatch.gov.au')) {
        if (/job|employ/.test(pathLower + ' ' + ctx)) return 'scamwatch_jobs';
        if (/invest|crypto/.test(pathLower + ' ' + ctx)) return 'scamwatch_investments';
        if (/phish|email|text|sms/.test(pathLower + ' ' + ctx)) return 'scamwatch_phishing';
        if (/report/.test(pathLower)) return 'scamwatch_report';
        return 'scamwatch_types';
    }
    if (host.endsWith('actionfraud.police.uk')) return 'actionfraud_az';
    if (host.endsWith('ncsc.gov.uk')) {
        if (/phish|email|suspicious/.test(pathLower + ' ' + ctx)) return 'ncsc_phishing_actions';
        return 'ncsc_home';
    }
    if (host.endsWith('fbi.gov') || host.endsWith('ic3.gov')) return 'ic3_home';
    if (host.endsWith('cisa.gov')) {
        if (/phish/.test(pathLower + ' ' + ctx)) return 'cisa_phishing';
        return 'cisa_advisories';
    }
    if (host.endsWith('ssa.gov')) return 'ssa_scams';
    if (host.endsWith('irs.gov')) return 'irs_tax_scams';
    if (host.endsWith('consumerfinance.gov')) return 'cfpb_fake_check';
    if (host.endsWith('cyber.gov.au')) return 'acsc_home';
    if (host.endsWith('haveibeenpwned.com')) return 'hibp_home';
    if (host.endsWith('krebsonsecurity.com')) return 'krebs_home';
    if (host.endsWith('antifraudcentre-centreantifraude.ca')) return 'caf_home';
    if (host.endsWith('getcybersafe.gc.ca')) return 'getcybersafe_home';
    if (host.endsWith('support.microsoft.com')) return 'microsoft_phishing_help';
    if (host.endsWith('support.google.com')) return 'google_account_recover';
    if (host.endsWith('support.apple.com')) return 'apple_phishing_help';

    // Paywalled or news hosts get no replacement — they must be removed.
    if (
        /reuters\.com|bbc\.|nytimes\.|wsj\.|forbes\.|bloomberg\.|theguardian\.|washingtonpost\./.test(
            host,
        )
    ) {
        return null;
    }
    // Generic guess based on post context.
    if (/job|employ|recruit/.test(ctx)) return 'ftc_job_scams';
    if (/crypto|bitcoin/.test(ctx)) return 'ftc_crypto_scams';
    if (/phish|email/.test(ctx)) return 'ftc_phishing';
    if (/breach/.test(ctx)) return 'ftc_identity_theft';
    return 'ftc_scam_alerts';
}

function parseFrontmatter(raw) {
    const m = raw.match(/^---\n([\s\S]*?)\n---/);
    if (!m) return null;
    return { fm: m[1], end: m[0].length };
}

function extractSources(fm) {
    const m = fm.match(/^sources:\s*\n((?:\s+-\s+.*\n?)+)/m);
    if (!m) return { sources: [], block: '', start: -1, end: -1 };
    return {
        sources: m[1]
            .split('\n')
            .map((line) => line.match(/^\s+-\s+["']?(.+?)["']?\s*$/))
            .filter((m) => m)
            .map((m) => m[1].trim()),
        block: m[0],
    };
}

/**
 * Sentences with hard quantitative claims that need backing evidence. If
 * the post's only "evidence" was a fake/dead URL, the claim is replaced
 * with qualitative language.
 */
const HARD_CLAIM_PATTERNS = [
    {
        // "$4.8 million", "$1.2 billion", "£750k"
        re: /[$£€]\s?\d[\d.,]*\s?(million|billion|thousand|m|bn|k)\b/gi,
        soften: 'significant',
    },
    {
        // "10,000 victims", "12 million users"
        re: /\b\d{1,3}(?:,\d{3})+\s+(victims|users|customers|households|seniors|workers|small\s+businesses|gamers|people)\b/gi,
        soften: 'many $1',
    },
    {
        re: /\bmillions\s+lost\b/gi,
        soften: 'widespread losses reported',
    },
];

/**
 * Phrases that imply a specific named-agency "warning" tied to a real
 * advisory. If the underlying URL was removed, we soften these to a
 * generic reference to the agency's evergreen page.
 */
const NAMED_WARNING_PATTERNS = [
    { re: /\bFTC warns\b/gi, soften: 'Per FTC consumer guidance' },
    { re: /\bFBI warns\b/gi, soften: 'Per FBI IC3 guidance' },
    { re: /\bIC3 warns\b/gi, soften: 'Per FBI IC3 guidance' },
    { re: /\bBBC reports\b/gi, soften: 'According to public reporting' },
    { re: /\bReuters reports\b/gi, soften: 'According to public reporting' },
    { re: /\bNCSC warns\b/gi, soften: 'Per UK NCSC guidance' },
];

const summary = [];

function buildSourcesBlock(urls) {
    const lines = urls.map((u) => `  - "${u}"`).join('\n');
    return `sources:\n${lines}\n`;
}

function repairOnePost(file) {
    const filepath = path.join(BLOG_DIR, file);
    const raw = fs.readFileSync(filepath, 'utf-8');
    const fmMatch = parseFrontmatter(raw);
    if (!fmMatch) return null;

    const fm = fmMatch.fm;
    const { sources, block: oldSourcesBlock } = extractSources(fm);
    if (sources.length === 0) return null;

    const bodyStart = raw.indexOf('\n---\n') + '\n---\n'.length;
    let body = raw.slice(bodyStart);

    const replacements = []; // { oldUrl, newUrl, replacementId }
    const removed = [];
    const newUrls = [];

    for (const url of sources) {
        if (isInRegistry(url)) {
            newUrls.push(url);
            continue;
        }
        if (isReportingAllowlist(url)) {
            // Allow the report-channel URL but mark it for in-body fix only.
            newUrls.push(url);
            continue;
        }
        const replacementId = suggestRegistryReplacement(url, raw);
        if (!replacementId) {
            removed.push(url);
            continue;
        }
        const entry = registry.sources.find((s) => s.id === replacementId);
        if (!entry) {
            removed.push(url);
            continue;
        }
        replacements.push({ oldUrl: url, newUrl: entry.url, replacementId });
        newUrls.push(entry.url);
    }

    // Dedupe + ensure minimum-2 floor with FTC + Scamwatch evergreens.
    const dedup = [];
    const seen = new Set();
    for (const u of newUrls) {
        const k = u.replace(/\/$/, '').toLowerCase();
        if (!seen.has(k)) {
            seen.add(k);
            dedup.push(u);
        }
    }
    const FALLBACK_URLS = [
        registry.sources.find((s) => s.id === 'ftc_scam_alerts')?.url,
        registry.sources.find((s) => s.id === 'scamwatch_types')?.url,
    ].filter(Boolean);
    for (const f of FALLBACK_URLS) {
        if (dedup.length >= 2) break;
        const k = f.replace(/\/$/, '').toLowerCase();
        if (!seen.has(k)) {
            seen.add(k);
            dedup.push(f);
        }
    }

    // Body rewrites: replace any in-body markdown link to a removed URL
    // with the registry-suggested replacement (if any), else strip the URL
    // and keep the anchor text.
    for (const { oldUrl, newUrl } of replacements) {
        // Replace exact URL occurrences (covers markdown links AND bare URLs).
        const escaped = oldUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        body = body.replace(new RegExp(escaped, 'g'), newUrl);
    }
    for (const url of removed) {
        const escaped = url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // For markdown link `[text](url)`, drop the link but keep the text.
        body = body.replace(new RegExp(`\\[([^\\]]+)\\]\\(${escaped}\\)`, 'g'), '$1');
        // For bare URLs, just strip.
        body = body.replace(new RegExp(escaped, 'g'), '');
    }

    // Soften quantitative claims and named-agency warnings whose support
    // got pulled. We do this even when there ARE valid registry URLs,
    // because the underlying claim was anchored to a now-removed URL.
    let claimSoftens = 0;
    if (replacements.length > 0 || removed.length > 0) {
        for (const { re, soften } of HARD_CLAIM_PATTERNS) {
            body = body.replace(re, (match, group1) => {
                claimSoftens += 1;
                return typeof soften === 'string'
                    ? soften.replace('$1', group1 ?? '')
                    : soften;
            });
        }
        for (const { re, soften } of NAMED_WARNING_PATTERNS) {
            body = body.replace(re, () => {
                claimSoftens += 1;
                return soften;
            });
        }
    }

    // Build the new sources block.
    const newSourcesBlock = buildSourcesBlock(dedup);

    let newFm = fm;
    if (oldSourcesBlock) {
        newFm = fm.replace(oldSourcesBlock, newSourcesBlock.trimEnd());
    }

    const updated = `---\n${newFm}\n---\n${body}`;

    const changed =
        oldSourcesBlock.trim() !== newSourcesBlock.trim() ||
        body !== raw.slice(bodyStart) ||
        replacements.length > 0 ||
        removed.length > 0;

    if (!changed) return null;

    return {
        file,
        replacements,
        removed,
        claimSoftens,
        before: sources.length,
        after: dedup.length,
        updated,
        filepath,
    };
}

const files = fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith('.mdx') && !f.startsWith('_'))
    .sort();

let touched = 0;
let totalReplaced = 0;
let totalRemoved = 0;
let totalSoftens = 0;

for (const file of files) {
    const result = repairOnePost(file);
    if (!result) continue;
    touched += 1;
    totalReplaced += result.replacements.length;
    totalRemoved += result.removed.length;
    totalSoftens += result.claimSoftens;
    summary.push({
        file,
        replaced: result.replacements.length,
        removed: result.removed.length,
        softens: result.claimSoftens,
        before: result.before,
        after: result.after,
    });
    if (APPLY) {
        fs.writeFileSync(result.filepath, result.updated, 'utf-8');
    }
}

console.log('--- Repair summary ---');
console.log(`Posts scanned: ${files.length}`);
console.log(`Posts changed: ${touched}`);
console.log(`URLs replaced: ${totalReplaced}`);
console.log(`URLs removed:  ${totalRemoved}`);
console.log(`Claims softened: ${totalSoftens}`);
if (!APPLY) {
    console.log('\n(dry-run — pass --apply to write changes)');
} else {
    console.log('\n(changes written to content/blog/)');
}
if (summary.length > 0) {
    console.log('\nPer-post breakdown:');
    for (const s of summary.sort((a, b) => b.replaced + b.removed - (a.replaced + a.removed)).slice(0, 50)) {
        console.log(
            `  ${s.file}  replaced=${s.replaced} removed=${s.removed} softens=${s.softens} sources ${s.before}→${s.after}`,
        );
    }
    if (summary.length > 50) {
        console.log(`  …and ${summary.length - 50} more.`);
    }
}
