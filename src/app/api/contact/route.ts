import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/db';
import { rateLimit, clientRateKey } from '@/lib/scanRateLimit';
import { sendContactNotification, sendContactConfirmation } from '@/lib/email/resend';

/**
 * Contact-form endpoint.
 *
 * Flow: validate → store in the DB (the source of truth) → best-effort notify.
 * Notifications are layered and ALL non-blocking — if any fail after the DB
 * write succeeds, the user still sees success:
 *   1. Optional webhook forward (CONTACT_WEBHOOK_URL) — Slack/Make/etc.
 *   2. Resend admin notification email (RESEND_* env) — see src/lib/email/resend.ts.
 *   3. Optional Resend confirmation to the user (CONTACT_SEND_CONFIRMATION_EMAIL).
 *
 * Hardening:
 *   - Honeypot field ("company") — bots fill it; we pretend success.
 *   - Rate limited per device-hash (5 / 10 min).
 *   - Strict validation + length caps.
 *   - Only a salted IP hash is stored, never the raw IP.
 *   - Email provider failures never leak to the user (generic responses only).
 */
function hashIp(ip: string) {
    return crypto
        .createHash('sha256')
        .update(ip + (process.env.IP_SALT || 'dev-only-salt'))
        .digest('hex');
}

const ALLOWED_CATEGORIES = new Set([
    'support',
    'report-scam',
    'press',
    'editorial',
    'security',
    'data-removal',
    'other',
]);

const MAX_NAME = 120;
const MAX_EMAIL = 200;
const MAX_MESSAGE = 4000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
    // 5 submissions / 10 minutes per device-hash.
    const key = clientRateKey(req, 'contact');
    const limit = rateLimit(key, 5, 10 * 60_000);
    if (!limit.allowed) {
        return NextResponse.json(
            { error: 'Too many messages from this device. Please try again later.' },
            { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } },
        );
    }

    try {
        const body = await req.json().catch(() => null);
        if (!body || typeof body !== 'object') {
            return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
        }
        const { name, email, message, category, company, subject, pagePath } =
            body as Record<string, unknown>;

        // Honeypot — a hidden field real users never see/fill. Pretend success.
        if (typeof company === 'string' && company.trim().length > 0) {
            return NextResponse.json({ success: true });
        }

        // Validation.
        if (typeof name !== 'string' || name.trim().length < 1 || name.length > MAX_NAME) {
            return NextResponse.json({ error: 'Please enter your name.' }, { status: 400 });
        }
        if (typeof email !== 'string' || !EMAIL_RE.test(email) || email.length > MAX_EMAIL) {
            return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
        }
        if (typeof message !== 'string' || message.trim().length < 10 || message.length > MAX_MESSAGE) {
            return NextResponse.json(
                { error: 'Please enter a message between 10 and 4000 characters.' },
                { status: 400 },
            );
        }
        const cat =
            typeof category === 'string' && ALLOWED_CATEGORIES.has(category) ? category : 'support';

        const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
        const ip_hash = hashIp(ip);
        const user_agent = req.headers.get('user-agent') || 'unknown';
        const user_agent_hash = crypto.createHash('md5').update(user_agent).digest('hex');

        // ── Source of truth: persist FIRST. If this throws we fail the request
        //    (caught below). Everything after is best-effort notification. ──
        const record = await prisma.contactMessage.create({
            data: {
                category: cat,
                name: name.trim().slice(0, MAX_NAME),
                email: email.trim().slice(0, MAX_EMAIL),
                message: message.trim().slice(0, MAX_MESSAGE),
                ip_hash,
                user_agent_hash,
            },
        });

        // Optional subject / source page (the form may not send these).
        const cleanSubject =
            typeof subject === 'string' && subject.trim().length > 0
                ? subject.trim().slice(0, 200)
                : undefined;
        const cleanPagePath =
            typeof pagePath === 'string' && pagePath.startsWith('/') && pagePath.length <= 200
                ? pagePath
                : undefined;

        const contactInput = {
            id: record.id,
            category: record.category,
            name: record.name,
            email: record.email,
            message: record.message,
            createdAt: record.created_at,
            subject: cleanSubject,
            pagePath: cleanPagePath,
            ipHash: record.ip_hash,
            userAgentHash: record.user_agent_hash,
        };

        // 1) Best-effort webhook forward (preserved). Non-blocking on failure.
        const webhook = process.env.CONTACT_WEBHOOK_URL;
        if (webhook) {
            try {
                await fetch(webhook, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        text: `New ${cat} enquiry from ${name.trim()} <${email.trim()}>`,
                    }),
                });
            } catch {
                // Forwarding is optional; the message is already persisted.
            }
        }

        // 2) Resend admin notification. The helper never throws and returns a
        //    typed result; a failure here is logged (with the message ID + a
        //    safe reason, never secrets) but does NOT fail the request.
        try {
            const notify = await sendContactNotification(contactInput);
            if (!notify.ok && notify.reason !== 'not-configured') {
                console.warn(`Contact ${record.id}: admin email not sent (${notify.reason}).`);
            }
        } catch {
            console.warn(`Contact ${record.id}: admin email send errored.`);
        }

        // 3) Optional confirmation email to the user (gated by env). Best-effort.
        try {
            const confirm = await sendContactConfirmation(contactInput);
            if (!confirm.ok && confirm.reason !== 'disabled' && confirm.reason !== 'not-configured') {
                console.warn(`Contact ${record.id}: confirmation email not sent (${confirm.reason}).`);
            }
        } catch {
            console.warn(`Contact ${record.id}: confirmation email send errored.`);
        }

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error('contact error:', (e as Error)?.name || 'unknown');
        return NextResponse.json({ error: 'Something went wrong. Please email us instead.' }, { status: 503 });
    }
}
