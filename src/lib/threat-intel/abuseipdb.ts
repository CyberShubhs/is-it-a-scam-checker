/**
 * AbuseIPDB IP-reputation lookup.  SERVER-SIDE ONLY.
 * ──────────────────────────────────────────────────────────────────────────
 * This module talks to the AbuseIPDB v2 `check` endpoint with the secret
 * `ABUSEIPDB_API_KEY`. It must NEVER be imported from a client component — the
 * key would leak into the browser bundle. It is consumed exclusively by the
 * `/api/ip-reputation` route handler (and tests).
 *
 * Safety rails baked in here:
 *   1. Strict IP validation (IPv4 + IPv6) before any network call.
 *   2. Private / loopback / reserved ranges are refused locally — we never
 *      send an internal address to a third party.
 *   3. Two-layer cache (in-process Map + DB `ThreatIntelCache`) with a 24-hour
 *      TTL so we don't re-bill / re-rate-limit the same IP.
 *   4. Graceful degradation: a missing key, a 429, or any network error
 *      returns a typed result the caller can show — it never throws, so scam
 *      scoring continues without IP intel.
 *
 * The distilled `riskContribution` (points) feeds the overall scam score; the
 * `message` is the human-readable line shown under the result.
 */

import { checkIp } from '../entities';
import { prisma } from '../db';
import type { IpReputationResult } from './types';

// Re-export the shared types so existing importers of this module keep working.
export type { IpReputationResult, IpReputationStatus } from './types';

const ABUSEIPDB_ENDPOINT = 'https://api.abuseipdb.com/api/v2/check';
const MAX_AGE_IN_DAYS = 90;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours per the spec
const REQUEST_TIMEOUT_MS = 6000;

/** Subset of the AbuseIPDB `data` object we read + persist. */
interface AbuseIpdbData {
    abuseConfidenceScore?: number;
    totalReports?: number;
    countryCode?: string | null;
    usageType?: string | null;
    isp?: string | null;
    domain?: string | null;
    lastReportedAt?: string | null;
}

/**
 * Map an AbuseIPDB confidence score (and report count) onto our risk band +
 * the points it adds to the scam score. Pure + exported so the thresholds can
 * be unit-tested without any network or DB.
 *
 * Spec thresholds:
 *   ≥80  → high-risk signal
 *   50-79 → medium/high-risk signal
 *   20-49 → medium signal
 *   anything with reports is still worth surfacing; 0/none is "no reports
 *   found" — explicitly NOT a clean bill of health.
 */
export function scoreAbuseConfidence(
    score: number,
    totalReports: number,
): { riskLevel: IpReputationResult['riskLevel']; riskContribution: number; status: 'ok' | 'no-reports' } {
    if (score >= 80) return { riskLevel: 'High', riskContribution: 50, status: 'ok' };
    if (score >= 50) return { riskLevel: 'High', riskContribution: 35, status: 'ok' };
    if (score >= 20) return { riskLevel: 'Medium', riskContribution: 20, status: 'ok' };
    if (score > 0 || totalReports > 0)
        return { riskLevel: 'Low', riskContribution: 8, status: 'ok' };
    return { riskLevel: 'Low', riskContribution: 0, status: 'no-reports' };
}

/** Build the human-readable summary line for a scored AbuseIPDB result. */
function buildMessage(status: 'ok' | 'no-reports', data: AbuseIpdbData): string {
    if (status === 'no-reports') {
        return 'No recent AbuseIPDB reports found for this IP. This is not a guarantee that it is safe.';
    }
    const score = data.abuseConfidenceScore ?? 0;
    const reports = data.totalReports ?? 0;
    const reportPart =
        reports > 0
            ? ` with ${reports} report${reports === 1 ? '' : 's'} in the last ${MAX_AGE_IN_DAYS} days`
            : '';
    return `IP reputation: This IP has an AbuseIPDB confidence score of ${score}/100${reportPart}.`;
}

/** Assemble the final result object from a provider `data` payload. */
function resultFromData(ip: string, data: AbuseIpdbData, cached: boolean): IpReputationResult {
    const score = data.abuseConfidenceScore ?? 0;
    const reports = data.totalReports ?? 0;
    const { riskLevel, riskContribution, status } = scoreAbuseConfidence(score, reports);
    return {
        status,
        ip,
        abuseConfidenceScore: score,
        totalReports: reports,
        countryCode: data.countryCode ?? null,
        usageType: data.usageType ?? null,
        isp: data.isp ?? null,
        domain: data.domain ?? null,
        lastReportedAt: data.lastReportedAt ?? null,
        riskLevel,
        riskContribution,
        message: buildMessage(status, data),
        cached,
    };
}

// ── In-process (L1) cache ────────────────────────────────────────────────────
// Survives across requests within a warm Fluid Compute instance. The DB cache
// (L2) survives cold starts and is shared across instances.
const memoryCache = new Map<string, { data: AbuseIpdbData; expires: number }>();

/** Test helper — clears the in-process cache between unit tests. */
export function __clearIpReputationCache(): void {
    memoryCache.clear();
}

/** Read the DB cache, returning the payload if a non-expired row exists. */
async function readDbCache(ip: string): Promise<AbuseIpdbData | null> {
    try {
        const row = await prisma.threatIntelCache.findUnique({
            where: { source_type_value: { source: 'AbuseIPDB', type: 'IP', value: ip } },
        });
        if (!row) return null;
        if (row.expires_at.getTime() < Date.now()) return null; // stale
        return JSON.parse(row.payload_json) as AbuseIpdbData;
    } catch {
        // A missing table / unreachable DB must not break the lookup — we just
        // skip the cache and (at worst) hit the API again.
        return null;
    }
}

/** Upsert the DB cache row with a fresh 24-hour expiry. */
async function writeDbCache(ip: string, data: AbuseIpdbData): Promise<void> {
    try {
        const now = new Date();
        const expires = new Date(now.getTime() + CACHE_TTL_MS);
        await prisma.threatIntelCache.upsert({
            where: { source_type_value: { source: 'AbuseIPDB', type: 'IP', value: ip } },
            create: {
                source: 'AbuseIPDB',
                type: 'IP',
                value: ip,
                payload_json: JSON.stringify(data),
                risk_score: data.abuseConfidenceScore ?? 0,
                expires_at: expires,
            },
            update: {
                payload_json: JSON.stringify(data),
                risk_score: data.abuseConfidenceScore ?? 0,
                created_at: now,
                expires_at: expires,
            },
        });
    } catch {
        // Cache writes are best-effort; never surface a DB hiccup to the user.
    }
}

export interface IpReputationOptions {
    /** Override the API key (tests). Defaults to process.env.ABUSEIPDB_API_KEY. */
    apiKey?: string;
    /** Inject a fetch implementation (tests). Defaults to global fetch. */
    fetchImpl?: typeof fetch;
    /** Disable the DB cache layer (tests / environments with no DB). */
    useDbCache?: boolean;
}

/**
 * Look up an IP's reputation. Always resolves (never rejects) so a failure
 * here can't take down scam scoring.
 *
 * Lookup order: validate → in-memory cache → DB cache → AbuseIPDB API → cache
 * the fresh result in both layers.
 */
export async function getIpReputation(
    ip: string,
    opts: IpReputationOptions = {},
): Promise<IpReputationResult> {
    const apiKey = opts.apiKey ?? process.env.ABUSEIPDB_API_KEY;
    const fetchImpl = opts.fetchImpl ?? globalThis.fetch;
    const useDbCache = opts.useDbCache ?? true;
    const cleanIp = ip.trim();

    // 1. Strict validation — refuse malformed and private/reserved IPs locally.
    const validity = checkIp(cleanIp);
    if (!validity.ok) {
        if (validity.reason === 'private') {
            return {
                status: 'private',
                ip: cleanIp,
                riskLevel: 'Unknown',
                riskContribution: 0,
                message:
                    'This is a private or reserved IP address, so an external reputation check does not apply.',
                cached: false,
            };
        }
        return {
            status: 'invalid',
            ip: cleanIp,
            riskLevel: 'Unknown',
            riskContribution: 0,
            message: 'That does not look like a valid public IP address.',
            cached: false,
        };
    }

    // 2. No key configured → degrade gracefully (do not crash).
    if (!apiKey) {
        return {
            status: 'not-enabled',
            ip: cleanIp,
            riskLevel: 'Unknown',
            riskContribution: 0,
            message: 'External IP reputation check is not enabled.',
            cached: false,
        };
    }

    // 3. Cache lookups (L1 in-memory, then L2 DB). A hit skips the API call.
    const mem = memoryCache.get(cleanIp);
    if (mem && mem.expires > Date.now()) {
        return resultFromData(cleanIp, mem.data, true);
    }
    if (useDbCache) {
        const dbData = await readDbCache(cleanIp);
        if (dbData) {
            memoryCache.set(cleanIp, { data: dbData, expires: Date.now() + CACHE_TTL_MS });
            return resultFromData(cleanIp, dbData, true);
        }
    }

    // 4. Call AbuseIPDB with a hard timeout.
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
        const url = `${ABUSEIPDB_ENDPOINT}?ipAddress=${encodeURIComponent(cleanIp)}&maxAgeInDays=${MAX_AGE_IN_DAYS}`;
        const res = await fetchImpl(url, {
            method: 'GET',
            headers: { Key: apiKey, Accept: 'application/json' },
            signal: controller.signal,
        });

        // 429 (or 401/403 quota issues) → "temporarily unavailable", never throw.
        if (res.status === 429) {
            return {
                status: 'rate-limited',
                ip: cleanIp,
                riskLevel: 'Unknown',
                riskContribution: 0,
                message: 'IP reputation check is temporarily unavailable. Please try again later.',
                cached: false,
            };
        }
        if (!res.ok) {
            return {
                status: 'error',
                ip: cleanIp,
                riskLevel: 'Unknown',
                riskContribution: 0,
                message: 'IP reputation check is temporarily unavailable.',
                cached: false,
            };
        }

        const json = (await res.json()) as { data?: AbuseIpdbData };
        const data = json?.data ?? {};

        // Cache the fresh result in both layers (24h), then return it.
        memoryCache.set(cleanIp, { data, expires: Date.now() + CACHE_TTL_MS });
        if (useDbCache) await writeDbCache(cleanIp, data);

        return resultFromData(cleanIp, data, false);
    } catch {
        // Network error / abort / bad JSON — degrade, don't break scoring.
        return {
            status: 'error',
            ip: cleanIp,
            riskLevel: 'Unknown',
            riskContribution: 0,
            message: 'IP reputation check is temporarily unavailable.',
            cached: false,
        };
    } finally {
        clearTimeout(timer);
    }
}
