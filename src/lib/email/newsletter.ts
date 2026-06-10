/**
 * Weekly scam-alerts newsletter — double opt-in via Resend.  SERVER-ONLY.
 * ──────────────────────────────────────────────────────────────────────────
 * Reads the secrets `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESEND_AUDIENCE_ID`
 * and `NEWSLETTER_CONFIRM_SECRET`. Must NEVER be imported by a client
 * component — consumed only by the /api/newsletter/* route handlers and tests.
 *
 * Privacy model:
 *   - We store nothing about a subscriber until they CLICK the confirmation
 *     link (double opt-in). The pending state lives entirely inside a signed,
 *     expiring token in the email — no DB row, no cookie.
 *   - Only the email address ever reaches Resend. No page content, scan
 *     results, IPs, or analytics identifiers.
 *
 * Mirrors src/lib/email/resend.ts: pure builders, typed never-throw senders,
 * graceful 'not-configured' degradation, injectable client for tests.
 */

import crypto from 'crypto';
import { Resend } from 'resend';
import { SITE_URL } from '@/lib/seo';
import { escapeHtml } from './resend';

export type NewsletterResult =
    | { ok: true; id?: string }
    | { ok: false; reason: string };

/** Minimal Resend surface we use — lets tests inject a mock. */
export interface NewsletterResendLike {
    emails: {
        send(payload: Record<string, unknown>): Promise<{ data?: { id?: string } | null; error?: unknown }>;
    };
    contacts: {
        create(payload: Record<string, unknown>): Promise<{ data?: { id?: string } | null; error?: unknown }>;
    };
}

export interface NewsletterOptions {
    /** Override env (tests). Defaults to process.env. */
    env?: NodeJS.ProcessEnv;
    /** Inject a Resend client (tests). Defaults to a real client built from env. */
    client?: NewsletterResendLike;
    /** Override "now" in ms (tests). */
    now?: number;
}

interface NewsletterConfig {
    apiKey?: string;
    from?: string;
    audienceId?: string;
    confirmSecret?: string;
}

function readConfig(env: NodeJS.ProcessEnv): NewsletterConfig {
    return {
        apiKey: env.RESEND_API_KEY,
        from: env.RESEND_FROM_EMAIL,
        audienceId: env.RESEND_AUDIENCE_ID,
        confirmSecret: env.NEWSLETTER_CONFIRM_SECRET,
    };
}

/** True when every env var needed for signup + confirm is present. */
export function isNewsletterConfigured(env: NodeJS.ProcessEnv = process.env): boolean {
    const c = readConfig(env);
    return Boolean(c.apiKey && c.from && c.audienceId && c.confirmSecret);
}

// ── Email normalisation / validation ────────────────────────────────────────

export const MAX_EMAIL_LENGTH = 200;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Lowercase + trim; returns null when the address is not plausibly valid. */
export function normalizeEmail(input: unknown): string | null {
    if (typeof input !== 'string') return null;
    const email = input.trim().toLowerCase();
    if (!email || email.length > MAX_EMAIL_LENGTH || !EMAIL_RE.test(email)) return null;
    return email;
}

// ── Signed confirmation tokens (stateless double opt-in) ─────────────────────

/** How long a confirmation link stays valid. */
export const CONFIRM_TTL_MS = 48 * 60 * 60 * 1000;

function hmac(email: string, expiresAtMs: number, secret: string): string {
    return crypto
        .createHmac('sha256', secret)
        .update(`${email}|${expiresAtMs}`)
        .digest('hex');
}

export interface ConfirmToken {
    email: string;
    expiresAtMs: number;
    signature: string;
}

/** Sign a confirmation token for `email`, valid for CONFIRM_TTL_MS. */
export function signConfirmToken(
    email: string,
    secret: string,
    nowMs: number = Date.now(),
): ConfirmToken {
    const expiresAtMs = nowMs + CONFIRM_TTL_MS;
    return { email, expiresAtMs, signature: hmac(email, expiresAtMs, secret) };
}

export type ConfirmVerification =
    | { valid: true; email: string }
    | { valid: false; reason: 'invalid' | 'expired' };

/** Verify a token from the confirm URL. Timing-safe signature comparison. */
export function verifyConfirmToken(
    email: unknown,
    exp: unknown,
    signature: unknown,
    secret: string,
    nowMs: number = Date.now(),
): ConfirmVerification {
    const cleanEmail = normalizeEmail(email);
    const expiresAtMs = typeof exp === 'string' ? Number.parseInt(exp, 10) : NaN;
    if (!cleanEmail || !Number.isFinite(expiresAtMs) || typeof signature !== 'string') {
        return { valid: false, reason: 'invalid' };
    }
    const expected = hmac(cleanEmail, expiresAtMs, secret);
    const a = Buffer.from(expected, 'utf8');
    const b = Buffer.from(signature, 'utf8');
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
        return { valid: false, reason: 'invalid' };
    }
    if (expiresAtMs <= nowMs) return { valid: false, reason: 'expired' };
    return { valid: true, email: cleanEmail };
}

/** Build the absolute confirmation URL embedded in the opt-in email. */
export function buildConfirmUrl(token: ConfirmToken): string {
    const params = new URLSearchParams({
        email: token.email,
        exp: String(token.expiresAtMs),
        sig: token.signature,
    });
    return `${SITE_URL}/api/newsletter/confirm?${params.toString()}`;
}

// ── Confirmation email builder (pure) ────────────────────────────────────────

export interface BuiltConfirmEmail {
    subject: string;
    text: string;
    html: string;
}

export function buildConfirmEmail(confirmUrl: string): BuiltConfirmEmail {
    const subject = 'Confirm your subscription — Scam Checker weekly alerts';
    const text =
        `Hi,\n\n` +
        `You (or someone using this address) asked to receive the free weekly ` +
        `scam-alerts email from Scam Checker.\n\n` +
        `Confirm your subscription by opening this link:\n${confirmUrl}\n\n` +
        `The link expires in 48 hours. If you didn't request this, just ignore ` +
        `this email — you will NOT be subscribed and we keep no record of your address.\n\n` +
        `— The Scam Checker team\n${SITE_URL}`;

    const html = `<!doctype html><html><body style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#0f172a;font-size:14px">
<p>Hi,</p>
<p>You (or someone using this address) asked to receive the free <strong>weekly
scam-alerts email</strong> from Scam Checker.</p>
<p style="margin:24px 0">
<a href="${escapeHtml(confirmUrl)}" style="background:#0f172a;color:#ffffff;padding:10px 18px;border-radius:8px;text-decoration:none;display:inline-block">Confirm my subscription</a>
</p>
<p style="color:#64748b">The link expires in 48 hours. If you didn&#39;t request this,
ignore this email — you will <strong>not</strong> be subscribed and we keep no record
of your address.</p>
<p>— The Scam Checker team · <a href="${SITE_URL}">scamchecker.app</a></p>
</body></html>`;

    return { subject, text, html };
}

// ── Senders (read env, call Resend, never throw) ─────────────────────────────

function clientFor(config: NewsletterConfig, opts: NewsletterOptions): NewsletterResendLike | null {
    if (opts.client) return opts.client;
    if (!config.apiKey) return null;
    return new Resend(config.apiKey) as unknown as NewsletterResendLike;
}

/**
 * Step 1 of double opt-in: email a signed confirmation link. Stores nothing.
 */
export async function sendConfirmRequest(
    email: string,
    opts: NewsletterOptions = {},
): Promise<NewsletterResult> {
    const env = opts.env ?? process.env;
    const config = readConfig(env);
    if (!config.apiKey || !config.from || !config.confirmSecret) {
        return { ok: false, reason: 'not-configured' };
    }
    const client = clientFor(config, opts);
    if (!client) return { ok: false, reason: 'not-configured' };

    const token = signConfirmToken(email, config.confirmSecret, opts.now ?? Date.now());
    const built = buildConfirmEmail(buildConfirmUrl(token));
    try {
        const res = await client.emails.send({
            from: config.from,
            to: email,
            subject: built.subject,
            text: built.text,
            html: built.html,
        });
        if (res.error) {
            // Generic class only — never the provider payload or the address.
            console.warn('Newsletter confirm email: provider error.');
            return { ok: false, reason: 'provider-error' };
        }
        return { ok: true, id: res.data?.id };
    } catch {
        console.warn('Newsletter confirm email: send threw.');
        return { ok: false, reason: 'send-failed' };
    }
}

/**
 * Step 2 of double opt-in: the user clicked the link — add them to the Resend
 * audience. Resend treats an existing contact as a no-op/update, so repeated
 * clicks are harmless.
 */
export async function addConfirmedContact(
    email: string,
    opts: NewsletterOptions = {},
): Promise<NewsletterResult> {
    const env = opts.env ?? process.env;
    const config = readConfig(env);
    if (!config.apiKey || !config.audienceId) {
        return { ok: false, reason: 'not-configured' };
    }
    const client = clientFor(config, opts);
    if (!client) return { ok: false, reason: 'not-configured' };

    try {
        const res = await client.contacts.create({
            email,
            audienceId: config.audienceId,
            unsubscribed: false,
        });
        if (res.error) {
            console.warn('Newsletter contact create: provider error.');
            return { ok: false, reason: 'provider-error' };
        }
        return { ok: true, id: res.data?.id };
    } catch {
        console.warn('Newsletter contact create: threw.');
        return { ok: false, reason: 'send-failed' };
    }
}
