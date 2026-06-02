import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/db';
import { rateLimit, clientRateKey } from '@/lib/scanRateLimit';

/**
 * Contact-form endpoint.
 *
 * There is no transactional email provider wired, so a real enquiry is stored
 * server-side (ContactMessage) so nothing is lost — and, if CONTACT_WEBHOOK_URL
 * is set, forwarded (best-effort) to Slack/email/Make so the owner is notified.
 *
 * Hardening:
 *   - Honeypot field ("company") — bots fill it; we pretend success.
 *   - Rate limited per device-hash (5 / 10 min).
 *   - Strict validation + length caps.
 *   - Only a salted IP hash is stored, never the raw IP.
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
        const { name, email, message, category, company } = body as Record<string, unknown>;

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

        await prisma.contactMessage.create({
            data: {
                category: cat,
                name: name.trim().slice(0, MAX_NAME),
                email: email.trim().slice(0, MAX_EMAIL),
                message: message.trim().slice(0, MAX_MESSAGE),
                ip_hash,
                user_agent_hash,
            },
        });

        // Best-effort notification forward (non-blocking failure).
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

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error('contact error:', (e as Error)?.name || 'unknown');
        return NextResponse.json({ error: 'Something went wrong. Please email us instead.' }, { status: 503 });
    }
}
