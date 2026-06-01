import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { normalizeScamValue } from '@/lib/normalization';
import { redactSensitive, maskReportValue } from '@/lib/redact';
import { hostnameOf, registrableDomainOf, normalisePhone, checkIp } from '@/lib/entities';
import crypto from 'crypto';

/**
 * Derive the precise entity-matching columns for a report so the scanner's
 * matcher (src/lib/reportMatching.ts) can find it by the exact hostname / IP /
 * email-domain / phone a future user checks — not just the coarse
 * `value_normalised`. All fields are optional; we only set what applies to the
 * report's type. This is what makes new reports searchable per-entity.
 */
function deriveEntityColumns(typeLower: string, value: string) {
    const cols: {
        entity_type?: string;
        hostname?: string;
        registrable_domain?: string;
        ip_address?: string;
        email_domain?: string;
        phone_normalised?: string;
    } = {};

    if (typeLower === 'url' || typeLower === 'website' || typeLower === 'domain') {
        cols.entity_type = 'domain';
        const host = hostnameOf(value);
        const domain = registrableDomainOf(value);
        if (host) {
            cols.hostname = host;
            // A phishing URL hosted on a bare IP is also matchable by IP.
            if (checkIp(host).ok) cols.ip_address = host;
        }
        if (domain) cols.registrable_domain = domain;
    } else if (typeLower === 'ip') {
        cols.entity_type = 'ip';
        if (checkIp(value.trim()).ok) cols.ip_address = value.trim();
    } else if (typeLower === 'email') {
        cols.entity_type = 'email';
        const domain = value.toLowerCase().split('@')[1];
        if (domain) cols.email_domain = domain.replace(/[^a-z0-9.-]/g, '');
    } else if (typeLower === 'phone' || typeLower === 'sms' || typeLower === 'whatsapp') {
        cols.entity_type = 'phone';
        cols.phone_normalised = normalisePhone(value);
    }

    return cols;
}

/**
 * Hashes the request IP with a per-deployment salt. We persist this for
 * abuse / rate-limit only — never the raw IP. The salt is intentionally
 * required to be set in production via the `IP_SALT` env var.
 */
function hashIp(ip: string) {
    return crypto
        .createHash('sha256')
        .update(ip + (process.env.IP_SALT || 'dev-only-salt'))
        .digest('hex');
}

/** Maximum sizes are tighter than before — small enough that a malicious
 *  payload can't burn cheap database storage, large enough for genuine
 *  community reports. */
const MAX_VALUE_LEN = 500;
const MAX_NOTES_LEN = 1000;
const ALLOWED_TYPES = new Set(['url', 'phone', 'email', 'sms', 'message', 'whatsapp', 'domain', 'website', 'ip']);

export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => null);
        if (!body || typeof body !== 'object') {
            return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
        }
        const { type, value, notes, country, website_check } = body as Record<string, unknown>;

        // ── Validation ────────────────────────────────────────────────
        // Reject malformed input early so the database never sees it.
        if (typeof type !== 'string' || typeof value !== 'string') {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }
        const typeLower = type.toLowerCase();
        if (!ALLOWED_TYPES.has(typeLower)) {
            return NextResponse.json({ error: 'Unsupported report type' }, { status: 400 });
        }
        if (value.length === 0 || value.length > MAX_VALUE_LEN) {
            return NextResponse.json({ error: 'Value missing or too long' }, { status: 400 });
        }
        if (notes !== undefined && notes !== null) {
            if (typeof notes !== 'string') {
                return NextResponse.json({ error: 'Notes must be text' }, { status: 400 });
            }
            if (notes.length > MAX_NOTES_LEN) {
                return NextResponse.json({ error: 'Notes too long' }, { status: 400 });
            }
        }

        // Honeypot — bots fill any hidden field. Pretend success without writing.
        if (typeof website_check === 'string' && website_check.length > 0) {
            return NextResponse.json({ success: true });
        }

        const normalisedCountry =
            typeof country === 'string' && country.length <= 4 ? country : 'AU';

        const value_normalised = normalizeScamValue(typeLower, value);

        // ── Privacy scrub ─────────────────────────────────────────────
        // The reporter's notes go through the sensitive-data scrubber so
        // OTPs, CVVs, full card numbers, passwords, and IDs never persist.
        // We also scrub the value field for free-text "message" / SMS
        // submissions where someone may have pasted a body that includes
        // their bank verification code.
        const scrubbedNotes = typeof notes === 'string' ? redactSensitive(notes) : null;
        const scrubbedValue =
            typeLower === 'message' || typeLower === 'sms' || typeLower === 'whatsapp'
                ? redactSensitive(value)
                : value;

        // ── Hash IP + UA (never persist raw values) ───────────────────
        const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
        const ip_hash = hashIp(ip);
        const user_agent = req.headers.get('user-agent') || 'unknown';
        const user_agent_hash = crypto.createHash('md5').update(user_agent).digest('hex');

        // ── Rate limit: 10 per hour per IP-hash ───────────────────────
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        try {
            const recentReports = await prisma.report.count({
                where: { ip_hash, created_at: { gt: oneHourAgo } },
            });
            if (recentReports >= 10) {
                return NextResponse.json(
                    { error: 'Too many reports from this device this hour. Thanks for helping!' },
                    { status: 429 },
                );
            }

            // Precise entity columns so the report is searchable per-entity.
            const entityColumns = deriveEntityColumns(typeLower, value);

            const report = await prisma.report.create({
                data: {
                    type: typeLower,
                    value_raw: scrubbedValue.substring(0, MAX_VALUE_LEN),
                    value_normalised,
                    notes: scrubbedNotes ? scrubbedNotes.substring(0, MAX_NOTES_LEN) : null,
                    country: normalisedCountry,
                    ip_hash,
                    user_agent_hash,
                    ...entityColumns,
                },
            });

            return NextResponse.json({ success: true, id: report.id });
        } catch (dbError) {
            // Log only the error class — never the request body — to keep
            // raw user content out of Vercel logs.
            console.error('Report DB error:', (dbError as Error)?.name || 'unknown');
            return NextResponse.json({ error: 'Database service unavailable' }, { status: 503 });
        }
    } catch (error) {
        console.error('Report handler error:', (error as Error)?.name || 'unknown');
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET() {
    try {
        const reports = await prisma.report.findMany({
            take: 20,
            orderBy: { created_at: 'desc' },
            select: {
                id: true,
                type: true,
                value_raw: true,
                created_at: true,
                country: true,
            },
        });

        // Defence-in-depth: re-mask at read time using the canonical
        // helper in src/lib/redact.ts. Even if a legacy row contains
        // unmasked data, the public surface only shows the masked form.
        const masked = reports.map((r) => ({
            id: r.id,
            type: r.type,
            value: maskReportValue(r.type, r.value_raw),
            timeAgo: r.created_at,
            country: r.country,
        }));

        return NextResponse.json({ reports: masked });
    } catch (e) {
        console.error('GET reports error:', (e as Error)?.name || 'unknown');
        return NextResponse.json({ reports: [] });
    }
}
