import { NextResponse } from 'next/server';
import { getIpReputation } from '@/lib/threat-intel/abuseipdb';
import { rateLimit, clientRateKey } from '@/lib/scanRateLimit';

/**
 * Standalone IP-reputation endpoint, used by the dedicated IP checker page.
 *
 * Accepts `{ ip }`, validates + classifies it (private/reserved IPs are
 * refused locally and never sent to AbuseIPDB), then returns the typed
 * reputation result. The `ABUSEIPDB_API_KEY` is read server-side only — it is
 * never exposed to the browser.
 *
 * Rate limited per device-hash because each allowed call can spend an
 * AbuseIPDB API credit. A missing key, a 429 from AbuseIPDB, or a network
 * error all come back as a typed, non-throwing result the UI can render.
 */
export async function POST(req: Request) {
    // 20 IP lookups/min per device-hash.
    const key = clientRateKey(req, 'ip-reputation');
    const limit = rateLimit(key, 20, 60_000);
    if (!limit.allowed) {
        return NextResponse.json(
            {
                status: 'rate-limited',
                message: 'IP reputation check is temporarily unavailable. Please try again shortly.',
                riskLevel: 'Unknown',
                riskContribution: 0,
                ip: '',
                cached: false,
            },
            { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } },
        );
    }

    try {
        const body = await req.json().catch(() => null);
        const ip = typeof body?.ip === 'string' ? body.ip.trim() : '';
        if (!ip || ip.length > 64) {
            return NextResponse.json(
                {
                    status: 'invalid',
                    message: 'Please enter a valid IP address.',
                    riskLevel: 'Unknown',
                    riskContribution: 0,
                    ip,
                    cached: false,
                },
                { status: 400 },
            );
        }

        const result = await getIpReputation(ip);
        return NextResponse.json(result);
    } catch (e) {
        console.error('ip-reputation error:', (e as Error)?.name || 'unknown');
        return NextResponse.json(
            {
                status: 'error',
                message: 'IP reputation check is temporarily unavailable.',
                riskLevel: 'Unknown',
                riskContribution: 0,
                ip: '',
                cached: false,
            },
            { status: 200 },
        );
    }
}
