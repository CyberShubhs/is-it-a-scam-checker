import { NextResponse } from 'next/server';
import { matchCommunityReports, IntelItem } from '@/lib/reportMatching';
import { getIpReputation } from '@/lib/threat-intel/abuseipdb';
import { isValidPublicIp } from '@/lib/entities';
import { rateLimit, clientRateKey } from '@/lib/scanRateLimit';
import type { IpReputationResult } from '@/lib/threat-intel/types';

/**
 * Reputation + intel endpoint used by the scanner.
 *
 * It receives ONLY the extracted entities the browser found (domains, IPs,
 * emails, phones) — never the raw pasted message or the uploaded file. For
 * each it returns:
 *   - `matches`     : rich community-report matches (count, last-reported,
 *                     masked examples, risk contribution)
 *   - `ipReputation`: AbuseIPDB reputation for any public IP (server-side key)
 *   - `results`     : a legacy [{value,count}] shape kept for backward compat
 *
 * Hardening:
 *   - Rate limited per IP-hash (burst control on a DB-touching, API-spending
 *     endpoint).
 *   - Capped number of items so one request can't fan out into hundreds of
 *     queries / AbuseIPDB calls.
 *   - Every external/DB failure degrades to empty data rather than a 500, so
 *     the client-side scorer can always finish.
 */

// At most this many entities per request — protects the DB and the AbuseIPDB
// quota from an oversized payload.
const MAX_ITEMS = 25;
// At most this many distinct IPs get an external reputation lookup per request.
const MAX_IP_LOOKUPS = 5;

export async function POST(req: Request) {
    // ── Rate limit: 30 scans/min per device-hash ─────────────────────────
    const key = clientRateKey(req, 'check-reputation');
    const limit = rateLimit(key, 30, 60_000);
    if (!limit.allowed) {
        return NextResponse.json(
            { results: [], matches: [], ipReputation: [], error: 'rate_limited' },
            { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } },
        );
    }

    try {
        const body = await req.json().catch(() => null);
        const rawItems = body?.items;
        if (!Array.isArray(rawItems)) {
            return NextResponse.json({ results: [], matches: [], ipReputation: [] });
        }

        // Validate + clamp the item list.
        const items: IntelItem[] = rawItems
            .filter(
                (i: unknown): i is IntelItem =>
                    !!i &&
                    typeof (i as IntelItem).type === 'string' &&
                    typeof (i as IntelItem).value === 'string' &&
                    (i as IntelItem).value.length > 0 &&
                    (i as IntelItem).value.length <= 500,
            )
            .slice(0, MAX_ITEMS);

        if (items.length === 0) {
            return NextResponse.json({ results: [], matches: [], ipReputation: [] });
        }

        // Community report matching (DB).
        const matches = await matchCommunityReports(items);

        // External IP reputation for any valid public IPs (server-side only).
        const ipValues = Array.from(
            new Set(
                items
                    .filter((i) => i.type.toLowerCase() === 'ip')
                    .map((i) => i.value.trim())
                    .filter((v) => isValidPublicIp(v)),
            ),
        ).slice(0, MAX_IP_LOOKUPS);

        const ipReputation: IpReputationResult[] = await Promise.all(
            ipValues.map((ip) => getIpReputation(ip)),
        );

        // Legacy shape: [{ value, count }] for any older consumers.
        const results = matches.map((m) => ({ value: m.value, count: m.count }));

        return NextResponse.json({ results, matches, ipReputation });
    } catch (e) {
        console.error('check-reputation error:', (e as Error)?.name || 'unknown');
        return NextResponse.json({ results: [], matches: [], ipReputation: [] });
    }
}
