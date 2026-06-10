import { NextResponse } from 'next/server';
import { rateLimit, clientRateKey } from '@/lib/scanRateLimit';
import {
    isNewsletterConfigured,
    normalizeEmail,
    sendConfirmRequest,
} from '@/lib/email/newsletter';

/**
 * Newsletter signup — step 1 of double opt-in.
 *
 * Flow: rate-limit → validate → email a signed confirmation link. Nothing is
 * stored anywhere until the link is clicked (see ../confirm/route.ts), so this
 * endpoint cannot be used to build a list of unverified addresses.
 *
 * Hardening (mirrors /api/contact):
 *   - Honeypot field ("company") — bots fill it; we pretend success.
 *   - 5 requests / 15 minutes per device-hash.
 *   - Generic responses only — never reveals provider state or whether an
 *     address is already subscribed.
 */
export async function POST(req: Request) {
    const key = clientRateKey(req, 'newsletter');
    const limit = rateLimit(key, 5, 15 * 60_000);
    if (!limit.allowed) {
        return NextResponse.json(
            { error: 'Too many signup attempts from this device. Please try again later.' },
            { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } },
        );
    }

    if (!isNewsletterConfigured()) {
        return NextResponse.json(
            { error: 'Signups are temporarily unavailable. Please try again later.' },
            { status: 503 },
        );
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
        return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
    }
    const { email, company } = body as Record<string, unknown>;

    // Honeypot — hidden field real users never fill. Pretend success.
    if (typeof company === 'string' && company.trim().length > 0) {
        return NextResponse.json({ success: true });
    }

    const cleanEmail = normalizeEmail(email);
    if (!cleanEmail) {
        return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    const sent = await sendConfirmRequest(cleanEmail);
    if (!sent.ok) {
        // Provider failures stay generic — no provider details leak to clients.
        return NextResponse.json(
            { error: 'We could not send the confirmation email. Please try again later.' },
            { status: 503 },
        );
    }

    return NextResponse.json({ success: true });
}
