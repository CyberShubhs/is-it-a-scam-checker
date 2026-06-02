import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/db';
import { normalizeScamValue } from '@/lib/normalization';
import { rateLimit, clientRateKey } from '@/lib/scanRateLimit';
import { getVoteTallies, VOTE_TYPES } from '@/lib/reportGroups';

/**
 * Community vote endpoint: "This was helpful" (HELPFUL) and "I saw this too"
 * (SEEN_TOO) on a grouped report.
 *
 * Privacy + abuse controls:
 *   - Only a salted SHA-256 hash of the IP is stored (never the raw IP).
 *   - A unique index on (value_normalised, vote_type, ip_hash) means a device
 *     can cast each vote type once per value — duplicates are silently ignored.
 *   - Rate limited per device-hash.
 *
 * Accepts either a pre-normalised `value_normalised`, or a `{ type, value }`
 * pair which is normalised server-side. Returns the fresh tallies so the UI can
 * update without a reload.
 */
function hashIp(ip: string) {
    return crypto
        .createHash('sha256')
        .update(ip + (process.env.IP_SALT || 'dev-only-salt'))
        .digest('hex');
}

export async function POST(req: Request) {
    // 40 votes/min per device-hash — generous for browsing, blocks scripted spam.
    const key = clientRateKey(req, 'report-vote');
    const limit = rateLimit(key, 40, 60_000);
    if (!limit.allowed) {
        return NextResponse.json(
            { error: 'rate_limited' },
            { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } },
        );
    }

    try {
        const body = await req.json().catch(() => null);
        if (!body || typeof body !== 'object') {
            return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
        }
        const { value_normalised, type, value, vote_type } = body as Record<string, unknown>;

        if (typeof vote_type !== 'string' || !VOTE_TYPES.includes(vote_type as never)) {
            return NextResponse.json({ error: 'Invalid vote type' }, { status: 400 });
        }

        // Resolve the grouping key from either a direct value_normalised or a
        // {type, value} pair (normalised the same way reports are).
        let key_normalised = '';
        if (typeof value_normalised === 'string' && value_normalised.length > 0) {
            key_normalised = value_normalised;
        } else if (typeof type === 'string' && typeof value === 'string' && value.length > 0) {
            key_normalised = normalizeScamValue(type.toLowerCase(), value);
        }
        if (!key_normalised || key_normalised.length > 500) {
            return NextResponse.json({ error: 'Missing or invalid value' }, { status: 400 });
        }

        const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
        const ip_hash = hashIp(ip);
        const user_agent = req.headers.get('user-agent') || 'unknown';
        const user_agent_hash = crypto.createHash('md5').update(user_agent).digest('hex');

        try {
            await prisma.reportVote.create({
                data: { value_normalised: key_normalised, vote_type, ip_hash, user_agent_hash },
            });
        } catch (e) {
            // P2002 = unique constraint violation → this device already voted.
            // Treat as success (idempotent) rather than an error.
            const code = (e as { code?: string })?.code;
            if (code !== 'P2002') {
                console.error('report-vote create error:', code || 'unknown');
            }
        }

        const tallies = await getVoteTallies([key_normalised]);
        const t = tallies.get(key_normalised) ?? { helpful: 0, seen: 0 };
        return NextResponse.json({ value_normalised: key_normalised, helpfulCount: t.helpful, seenCount: t.seen });
    } catch (e) {
        console.error('report-vote error:', (e as Error)?.name || 'unknown');
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
