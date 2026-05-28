/**
 * Source registry + resolver.
 *
 * The blog generator MAY NOT emit raw external URLs. Instead, it picks
 * source IDs from `data/source-registry.json`, and this module resolves
 * those IDs into real URLs at write-time. Every helper here is pure and
 * testable so the same validation runs identically in the generator, the
 * source-check script, and the repair script.
 *
 * Hard guarantees enforced by callers:
 *  - Only registry-resolved URLs may appear in a post's `sources:` frontmatter.
 *  - Markdown bodies may reference external URLs only if those URLs are in
 *    the registry (or are explicitly-allowed report channels like
 *    reportfraud.ftc.gov, scamwatch.gov.au/report-a-scam, actionfraud.police.uk).
 */

import fs from 'node:fs';
import path from 'node:path';

export type SourceType =
    | 'official'
    | 'consumer-safety'
    | 'cyber-agency'
    | 'security-research'
    | 'platform-help';

export interface SourceEntry {
    id: string;
    title: string;
    url: string;
    domain: string;
    categories: string[];
    region?: string;
    sourceType: SourceType;
    lastVerifiedAt: string;
    notes?: string;
}

export interface SourceRegistry {
    schemaVersion: number;
    lastReviewedAt?: string;
    sources: SourceEntry[];
}

const DEFAULT_REGISTRY_PATH = path.join(
    process.cwd(),
    'data',
    'source-registry.json',
);

let cachedRegistry: SourceRegistry | null = null;
let cachedRegistryPath: string | null = null;

export function loadSourceRegistry(
    registryPath: string = DEFAULT_REGISTRY_PATH,
): SourceRegistry {
    if (cachedRegistry && cachedRegistryPath === registryPath) {
        return cachedRegistry;
    }
    const raw = fs.readFileSync(registryPath, 'utf-8');
    const parsed = JSON.parse(raw) as SourceRegistry;
    if (!Array.isArray(parsed.sources)) {
        throw new Error(`Source registry at ${registryPath} has no \`sources\` array.`);
    }
    cachedRegistry = parsed;
    cachedRegistryPath = registryPath;
    return parsed;
}

/** Reset the in-process cache. Used by tests that swap registry files. */
export function _resetSourceRegistryCache(): void {
    cachedRegistry = null;
    cachedRegistryPath = null;
}

export function getSourceById(
    id: string,
    registryPath?: string,
): SourceEntry | null {
    const reg = loadSourceRegistry(registryPath);
    return reg.sources.find((s) => s.id === id) ?? null;
}

/**
 * Lookup a source from a known URL. Used by the repair script to discover
 * whether a hand-written URL already maps to a registered entry (so we can
 * preserve the citation but replace the bare URL with `id`).
 */
export function getSourceByUrl(
    url: string,
    registryPath?: string,
): SourceEntry | null {
    const reg = loadSourceRegistry(registryPath);
    const normalised = url.replace(/\/$/, '').toLowerCase();
    return (
        reg.sources.find(
            (s) => s.url.replace(/\/$/, '').toLowerCase() === normalised,
        ) ?? null
    );
}

/**
 * Resolve an array of source IDs into their full SourceEntry objects. Any
 * unknown ID is collected in `missing` so the caller can fail validation
 * cleanly (rather than silently dropping citations).
 */
export function resolveSourceIds(
    ids: string[],
    registryPath?: string,
): { resolved: SourceEntry[]; missing: string[] } {
    const reg = loadSourceRegistry(registryPath);
    const idMap = new Map(reg.sources.map((s) => [s.id, s]));
    const resolved: SourceEntry[] = [];
    const missing: string[] = [];
    for (const id of ids) {
        const hit = idMap.get(id);
        if (hit) resolved.push(hit);
        else missing.push(id);
    }
    return { resolved, missing };
}

export function validateSourceIdsExist(
    ids: string[],
    registryPath?: string,
): string[] {
    const reg = loadSourceRegistry(registryPath);
    const known = new Set(reg.sources.map((s) => s.id));
    return ids.filter((id) => !known.has(id));
}

/**
 * Score and rank registry entries by relevance to a topic + cluster +
 * question text. This is how the generator picks the 2–4 sources that go
 * into a post — it never invents URLs.
 *
 * Scoring is intentionally simple and explainable: +3 for a category match,
 * +1 for a region preference, +1 for matching a keyword token in the
 * combined topic string. Ties are broken by most-recently-verified.
 */
export function rankSourcesForTopic(
    topic: {
        categories?: string[];
        region?: string;
        keywordHaystack?: string;
    },
    registryPath?: string,
): SourceEntry[] {
    const reg = loadSourceRegistry(registryPath);
    const topicCats = new Set((topic.categories ?? []).map((c) => c.toLowerCase()));
    const topicRegion = (topic.region ?? '').toLowerCase();
    const haystack = (topic.keywordHaystack ?? '').toLowerCase();

    const scored = reg.sources.map((s) => {
        let score = 0;
        for (const cat of s.categories) {
            if (topicCats.has(cat.toLowerCase())) score += 3;
        }
        if (topicRegion && (s.region ?? '').toLowerCase() === topicRegion) score += 1;
        if (haystack) {
            const tokens = [
                ...s.categories.map((c) => c.replace(/-/g, ' ')),
                s.domain,
                s.title.toLowerCase(),
            ];
            for (const t of tokens) {
                if (t && haystack.includes(t.toLowerCase())) score += 1;
            }
        }
        return { entry: s, score };
    });
    scored.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return b.entry.lastVerifiedAt.localeCompare(a.entry.lastVerifiedAt);
    });
    return scored.filter((s) => s.score > 0).map((s) => s.entry);
}

/**
 * Pick 2–4 sources for a generated post. Uses rankSourcesForTopic and
 * falls back to "general scam advice" + "reporting scams" evergreens when
 * nothing scores well for a niche topic.
 */
export function getSourcesForTopic(
    topic: {
        categories?: string[];
        region?: string;
        keywordHaystack?: string;
    },
    options: { min?: number; max?: number; registryPath?: string } = {},
): SourceEntry[] {
    const min = options.min ?? 2;
    const max = options.max ?? 4;
    const ranked = rankSourcesForTopic(topic, options.registryPath);
    const picked = ranked.slice(0, max);
    if (picked.length >= min) return picked;
    // Fallback to broad evergreens to guarantee >= min sources.
    const reg = loadSourceRegistry(options.registryPath);
    const fallbackCats = new Set([
        'general-scam-advice',
        'reporting-scams',
    ]);
    const generic = reg.sources.filter((s) =>
        s.categories.some((c) => fallbackCats.has(c)),
    );
    const seen = new Set(picked.map((p) => p.id));
    for (const g of generic) {
        if (picked.length >= min) break;
        if (!seen.has(g.id)) {
            picked.push(g);
            seen.add(g.id);
        }
    }
    return picked.slice(0, max);
}

/**
 * Domains that are always allowed in blog markdown bodies (regardless of
 * whether each specific URL is in the registry) because they are user-
 * facing reporting destinations we instruct readers to visit. Keep this
 * list short — it's an exception list, not the source-of-truth.
 */
export const REPORTING_ALLOWLIST_DOMAINS = new Set([
    'reportfraud.ftc.gov',
    'scamwatch.gov.au',
    'actionfraud.police.uk',
    'ic3.gov',
    'cyber.gov.au',
    'antifraudcentre-centreantifraude.ca',
    'getcybersafe.gc.ca',
]);

/** Internal Scam Checker hostnames that should NEVER be flagged as external. */
export const INTERNAL_HOSTS = new Set(['scamchecker.app', 'www.scamchecker.app']);

const URL_RE = /\bhttps?:\/\/[^\s)\]<>'"`]+/gi;

/**
 * Scan markdown for any external URL that is NOT in the registry and NOT
 * on the explicit reporting allowlist. Returns the offending URLs.
 *
 * This is the gate that prevents the AI from sneaking citations into the
 * body. The generator runs it after the model returns its draft; the
 * repair script runs it across the historical corpus.
 */
export function rejectUnknownExternalUrls(
    markdown: string,
    registryPath?: string,
): string[] {
    const reg = loadSourceRegistry(registryPath);
    const knownUrls = new Set(
        reg.sources.map((s) => s.url.replace(/\/$/, '').toLowerCase()),
    );
    const offenders: string[] = [];
    const seen = new Set<string>();
    const matches = markdown.match(URL_RE) ?? [];
    for (const raw of matches) {
        // Strip trailing punctuation that markdown often pulls in
        // (sentence-ending period, comma, closing bracket).
        const url = raw.replace(/[).,;:!?]+$/, '');
        if (seen.has(url)) continue;
        seen.add(url);
        let host = '';
        try {
            host = new URL(url).hostname.toLowerCase();
        } catch {
            offenders.push(url);
            continue;
        }
        // Normalise host by stripping leading "www." so the allowlist
        // works for both bare and www-prefixed forms of a domain.
        const bareHost = host.startsWith('www.') ? host.slice(4) : host;
        if (INTERNAL_HOSTS.has(host) || INTERNAL_HOSTS.has(bareHost)) continue;
        if (
            REPORTING_ALLOWLIST_DOMAINS.has(host) ||
            REPORTING_ALLOWLIST_DOMAINS.has(bareHost)
        )
            continue;
        const normalised = url.replace(/\/$/, '').toLowerCase();
        if (knownUrls.has(normalised)) continue;
        // Allow exact-prefix match against a registry URL, since the
        // generator may produce the canonical URL with or without a
        // trailing slash / fragment.
        const prefixMatch = [...knownUrls].some((u) => normalised.startsWith(u));
        if (prefixMatch) continue;
        offenders.push(url);
    }
    return offenders;
}
