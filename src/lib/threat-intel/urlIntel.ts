/**
 * Live URL intelligence.  SERVER-SIDE ONLY.
 * ──────────────────────────────────────────────────────────────────────────
 * Adds three external signals to a scanned URL, on top of the offline
 * heuristics in `urlRisk.ts`:
 *
 *   1. Google Safe Browsing  — is this exact URL on Google's malware/phishing
 *      blocklist?  Requires `GOOGLE_SAFE_BROWSING_API_KEY`.  Absent key → this
 *      sub-check is simply skipped (the rest still runs), so the feature ships
 *      safe and "lights up" the moment a key is added.
 *   2. Domain age (RDAP)     — how old is the registrable domain?  Brand-new
 *      domains are a strong phishing signal.  RDAP is free and needs no key.
 *   3. Shortener expansion   — follow a known link shortener to its real
 *      destination so the user sees where a bit.ly actually goes.
 *
 * Contract (mirrors abuseipdb.ts):
 *   - NEVER throws — every failure degrades to a typed, empty-ish result so the
 *     client scorer always finishes.
 *   - MUST NOT be imported by client code (it reads a secret key and does
 *     server-side fetches). The browser only ever sees the JSON it returns,
 *     typed as `UrlReputationResult` from ./types.
 *   - SSRF-guarded: only known shorteners are followed, and every hop's host is
 *     re-checked so a redirect can't point us at a private/metadata address.
 */

import { getDomain, getHostname } from 'tldts';
import { prisma } from '../db';
import type {
    UrlReputationResult,
    SafeBrowsingThreat,
} from './types';

export type { UrlReputationResult } from './types';

const SAFE_BROWSING_ENDPOINT =
    'https://safebrowsing.googleapis.com/v4/threatMatches:find';
const RDAP_ENDPOINT = 'https://rdap.org/domain/';
const REQUEST_TIMEOUT_MS = 4500;
const RESULT_CACHE_TTL_MS = 15 * 60 * 1000; // assembled result, per URL
const DOMAIN_AGE_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // registration date is stable
const MAX_REDIRECT_HOPS = 3;

const URL_SHORTENERS = new Set<string>([
    'bit.ly', 'bitly.com', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly', 'buff.ly',
    'is.gd', 'cutt.ly', 'rb.gy', 'rebrand.ly', 'shorturl.at', 't.ly', 'lnkd.in',
    'tiny.cc', 'soo.gd', 'clck.ru', 'shrtco.de', 'short.io', 'tr.im',
]);

const SAFE_BROWSING_THREAT_MAP: Record<string, SafeBrowsingThreat> = {
    MALWARE: 'malware',
    SOCIAL_ENGINEERING: 'social_engineering',
    UNWANTED_SOFTWARE: 'unwanted_software',
    POTENTIALLY_HARMFUL_APPLICATION: 'potentially_harmful_application',
};

const THREAT_LABEL: Record<SafeBrowsingThreat, string> = {
    malware: 'malware',
    social_engineering: 'phishing / social engineering',
    unwanted_software: 'unwanted software',
    potentially_harmful_application: 'a potentially harmful application',
};

// ── small utilities ──────────────────────────────────────────────────────────

function normaliseUrl(raw: string): string {
    const t = raw.trim();
    return /^[a-z][a-z0-9+.-]*:\/\//i.test(t) ? t : `https://${t}`;
}

/** Host is unsafe to fetch (SSRF guard): non-http(s), localhost, or a private/
 *  link-local/loopback IP literal. */
function isUnsafeFetchTarget(urlStr: string): boolean {
    let u: URL;
    try {
        u = new URL(urlStr);
    } catch {
        return true;
    }
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return true;
    const host = u.hostname.toLowerCase();
    if (host === 'localhost' || host.endsWith('.localhost')) return true;
    if (host.endsWith('.local') || host.endsWith('.internal')) return true;
    // IPv4 literal in a private / loopback / link-local / reserved range.
    const m = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (m) {
        const [a, b] = [Number(m[1]), Number(m[2])];
        if (a === 10 || a === 127 || a === 0) return true;
        if (a === 169 && b === 254) return true; // link-local incl. cloud metadata
        if (a === 172 && b >= 16 && b <= 31) return true;
        if (a === 192 && b === 168) return true;
        if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
    }
    // Any IPv6 literal — refuse (covers ::1, fc00::/7, fe80::, etc.).
    if (host.includes(':')) return true;
    return false;
}

function registrableDomainOf(urlStr: string): string | null {
    try {
        return getDomain(urlStr) || getHostname(urlStr) || null;
    } catch {
        return null;
    }
}

async function fetchWithTimeout(
    url: string,
    init: RequestInit,
    fetchImpl: typeof fetch,
): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
        return await fetchImpl(url, { ...init, signal: controller.signal });
    } finally {
        clearTimeout(timer);
    }
}

// ── scoring (pure, unit-testable) ────────────────────────────────────────────

/** Days → points/risk for a registrable domain's age. */
export function scoreDomainAge(days: number | null): { points: number; level: 'Low' | 'Medium' | 'High' } {
    if (days === null || days < 0) return { points: 0, level: 'Low' };
    if (days < 14) return { points: 30, level: 'High' };
    if (days < 45) return { points: 20, level: 'Medium' };
    if (days < 90) return { points: 10, level: 'Medium' };
    return { points: 0, level: 'Low' };
}

// ── Safe Browsing ────────────────────────────────────────────────────────────

async function checkSafeBrowsing(
    url: string,
    apiKey: string,
    fetchImpl: typeof fetch,
): Promise<SafeBrowsingThreat | null> {
    const body = {
        client: { clientId: 'scamchecker', clientVersion: '1.0.0' },
        threatInfo: {
            threatTypes: [
                'MALWARE',
                'SOCIAL_ENGINEERING',
                'UNWANTED_SOFTWARE',
                'POTENTIALLY_HARMFUL_APPLICATION',
            ],
            platformTypes: ['ANY_PLATFORM'],
            threatEntryTypes: ['URL'],
            threatEntries: [{ url }],
        },
    };
    const res = await fetchWithTimeout(
        `${SAFE_BROWSING_ENDPOINT}?key=${encodeURIComponent(apiKey)}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        },
        fetchImpl,
    );
    if (!res.ok) return null;
    const json = (await res.json()) as { matches?: { threatType?: string }[] };
    const threat = json?.matches?.[0]?.threatType;
    return (threat && SAFE_BROWSING_THREAT_MAP[threat]) || null;
}

// ── RDAP domain age (with DB cache of the registration date) ─────────────────

async function readDomainAgeCache(domain: string): Promise<string | null> {
    try {
        const row = await prisma.threatIntelCache.findUnique({
            where: { source_type_value: { source: 'RDAP', type: 'DOMAIN', value: domain } },
        });
        if (!row || row.expires_at.getTime() < Date.now()) return null;
        const payload = JSON.parse(row.payload_json) as { registrationDate?: string | null };
        return payload.registrationDate ?? null;
    } catch {
        return null;
    }
}

async function writeDomainAgeCache(domain: string, registrationDate: string | null): Promise<void> {
    try {
        const expires = new Date(Date.now() + DOMAIN_AGE_CACHE_TTL_MS);
        await prisma.threatIntelCache.upsert({
            where: { source_type_value: { source: 'RDAP', type: 'DOMAIN', value: domain } },
            create: {
                source: 'RDAP',
                type: 'DOMAIN',
                value: domain,
                payload_json: JSON.stringify({ registrationDate }),
                risk_score: 0,
                expires_at: expires,
            },
            update: {
                payload_json: JSON.stringify({ registrationDate }),
                created_at: new Date(),
                expires_at: expires,
            },
        });
    } catch {
        // best-effort cache write
    }
}

async function fetchRegistrationDate(domain: string, fetchImpl: typeof fetch): Promise<string | null> {
    try {
        const res = await fetchWithTimeout(
            `${RDAP_ENDPOINT}${encodeURIComponent(domain)}`,
            { headers: { Accept: 'application/rdap+json' } },
            fetchImpl,
        );
        if (!res.ok) return null;
        const json = (await res.json()) as { events?: { eventAction?: string; eventDate?: string }[] };
        const reg = json?.events?.find((e) => e.eventAction === 'registration');
        return reg?.eventDate ?? null;
    } catch {
        return null;
    }
}

function ageInDays(registrationDate: string | null): number | null {
    if (!registrationDate) return null;
    const t = Date.parse(registrationDate);
    if (Number.isNaN(t)) return null;
    return Math.max(0, Math.floor((Date.now() - t) / (24 * 60 * 60 * 1000)));
}

async function getDomainAgeDays(
    domain: string,
    fetchImpl: typeof fetch,
    useDbCache: boolean,
): Promise<number | null> {
    if (useDbCache) {
        const cached = await readDomainAgeCache(domain);
        if (cached !== null) return ageInDays(cached);
    }
    const reg = await fetchRegistrationDate(domain, fetchImpl);
    if (useDbCache) await writeDomainAgeCache(domain, reg);
    return ageInDays(reg);
}

// ── shortener expansion (SSRF-guarded, shortener hosts only) ─────────────────

async function expandShortener(
    startUrl: string,
    fetchImpl: typeof fetch,
): Promise<{ finalUrl: string | null; redirects: number }> {
    let current = startUrl;
    let redirects = 0;
    for (let i = 0; i < MAX_REDIRECT_HOPS; i++) {
        if (isUnsafeFetchTarget(current)) break;
        let res: Response;
        try {
            res = await fetchWithTimeout(current, { method: 'HEAD', redirect: 'manual' }, fetchImpl);
        } catch {
            break;
        }
        const loc = res.headers.get('location');
        if (res.status >= 300 && res.status < 400 && loc) {
            const next = new URL(loc, current).toString();
            if (isUnsafeFetchTarget(next)) break;
            current = next;
            redirects++;
            continue;
        }
        break;
    }
    return { finalUrl: redirects > 0 ? current : null, redirects };
}

// ── in-memory result cache ───────────────────────────────────────────────────

const resultCache = new Map<string, { result: UrlReputationResult; expires: number }>();

/** Test helper — clears the in-process result cache between unit tests. */
export function __clearUrlIntelCache(): void {
    resultCache.clear();
}

export interface UrlIntelOptions {
    apiKey?: string; // defaults to process.env.GOOGLE_SAFE_BROWSING_API_KEY
    fetchImpl?: typeof fetch;
    useDbCache?: boolean;
}

/**
 * Resolve live intelligence for a single URL. Always resolves; never throws.
 */
export async function getUrlIntel(
    rawUrl: string,
    opts: UrlIntelOptions = {},
): Promise<UrlReputationResult> {
    const apiKey = opts.apiKey ?? process.env.GOOGLE_SAFE_BROWSING_API_KEY;
    const fetchImpl = opts.fetchImpl ?? globalThis.fetch;
    const useDbCache = opts.useDbCache ?? true;

    const url = normaliseUrl(rawUrl);
    const cacheKey = url.toLowerCase();

    const cached = resultCache.get(cacheKey);
    if (cached && cached.expires > Date.now()) {
        return { ...cached.result, cached: true };
    }

    const domain = registrableDomainOf(url);

    try {
        const isShortener = !!domain && URL_SHORTENERS.has(domain);

        const [safeBrowsing, domainAgeDays, expansion] = await Promise.all([
            apiKey ? checkSafeBrowsing(url, apiKey, fetchImpl).catch(() => null) : Promise.resolve(null),
            domain ? getDomainAgeDays(domain, fetchImpl, useDbCache).catch(() => null) : Promise.resolve(null),
            isShortener ? expandShortener(url, fetchImpl).catch(() => ({ finalUrl: null, redirects: 0 })) : Promise.resolve({ finalUrl: null, redirects: 0 }),
        ]);

        const flags: string[] = [];
        let riskContribution = 0;
        let riskLevel: UrlReputationResult['riskLevel'] = 'Low';

        if (safeBrowsing) {
            riskContribution += 60;
            riskLevel = 'High';
            flags.push(`Google Safe Browsing lists this URL as ${THREAT_LABEL[safeBrowsing]}.`);
        }

        const ageScore = scoreDomainAge(domainAgeDays);
        if (ageScore.points > 0 && domainAgeDays !== null) {
            riskContribution += ageScore.points;
            if (riskLevel !== 'High') riskLevel = ageScore.level;
            flags.push(
                `The domain ${domain} was registered about ${domainAgeDays} day${domainAgeDays === 1 ? '' : 's'} ago — brand-new domains are common in scams.`,
            );
        }

        if (expansion.finalUrl) {
            flags.push(`This shortened link actually points to ${expansion.finalUrl}.`);
        }

        const checkedSafeBrowsing = !!apiKey;
        let status: UrlReputationResult['status'];
        if (riskContribution > 0) status = 'ok';
        else if (checkedSafeBrowsing || domainAgeDays !== null) status = 'clean';
        else status = 'not-enabled';

        const message =
            flags.length > 0
                ? flags.join(' ')
                : status === 'clean'
                  ? 'No live blocklist or domain-age red flags were found for this link. This is not a guarantee it is safe.'
                  : 'Live URL intelligence is not enabled.';

        const result: UrlReputationResult = {
            status,
            url,
            finalUrl: expansion.finalUrl,
            safeBrowsing: safeBrowsing ?? null,
            domainAgeDays,
            redirects: expansion.redirects,
            riskLevel,
            riskContribution,
            message,
            cached: false,
        };

        resultCache.set(cacheKey, { result, expires: Date.now() + RESULT_CACHE_TTL_MS });
        return result;
    } catch {
        return {
            status: 'error',
            url,
            finalUrl: null,
            safeBrowsing: null,
            domainAgeDays: null,
            redirects: 0,
            riskLevel: 'Unknown',
            riskContribution: 0,
            message: 'Live URL check is temporarily unavailable.',
            cached: false,
        };
    }
}
