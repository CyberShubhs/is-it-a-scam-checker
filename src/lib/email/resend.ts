/**
 * Resend email notifications for the contact form.  SERVER-ONLY.
 * ──────────────────────────────────────────────────────────────────────────
 * This module reads the secret `RESEND_API_KEY` and must NEVER be imported by a
 * client component. It is consumed only by the `/api/contact` route handler (and
 * unit tests). No value here is prefixed `NEXT_PUBLIC_`, so Next.js never inlines
 * it into the browser bundle.
 *
 * Design goals:
 *   - Pure email builders (subject/text/html) so escaping + formatting are unit
 *     testable without touching the network.
 *   - All user-submitted values are HTML-escaped before going into the HTML body.
 *   - Never throws: every failure returns a typed { ok:false } result so the API
 *     route can keep the DB write as the source of truth and still return success.
 *   - Degrades safely when env vars are missing (returns 'not-configured').
 *   - Never logs secrets or provider stack traces.
 */

import { Resend } from 'resend';

export interface ContactMessageInput {
    id: string;
    category: string;
    name: string;
    email: string;
    message: string;
    createdAt: Date;
    /** Optional explicit subject (the form may not send one). */
    subject?: string;
    /** Optional page the enquiry came from (e.g. '/contact'). */
    pagePath?: string;
    // Request fingerprint (IP hash, user-agent) is intentionally NOT part of
    // this type — it must never reach email content. It stays server-side in
    // the DB for anti-spam/rate-limiting only.
}

export type SendResult = { ok: true; id?: string } | { ok: false; reason: string };

/** Minimal shape of the Resend client we use — lets tests inject a mock. */
interface ResendLike {
    emails: {
        send(payload: Record<string, unknown>): Promise<{ data?: { id?: string } | null; error?: unknown }>;
    };
}

export interface SendOptions {
    /** Override env (tests). Defaults to process.env. */
    env?: NodeJS.ProcessEnv;
    /** Inject a Resend client (tests). Defaults to a real client built from env. */
    client?: ResendLike;
}

interface ResendConfig {
    apiKey?: string;
    from?: string;
    to?: string;
    cc?: string;
    sendConfirmation: boolean;
}

function readConfig(env: NodeJS.ProcessEnv): ResendConfig {
    return {
        apiKey: env.RESEND_API_KEY,
        from: env.RESEND_FROM_EMAIL,
        to: env.CONTACT_TO_EMAIL,
        cc: env.CONTACT_CC_EMAIL,
        sendConfirmation: env.CONTACT_SEND_CONFIRMATION_EMAIL === 'true',
    };
}

/** Escape the five HTML-significant characters. Exported for tests. */
export function escapeHtml(input: string): string {
    return String(input)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/** Collapse whitespace + strip CR/LF, then truncate — used for the subject. */
function oneLine(input: string, max = 78): string {
    const cleaned = input.replace(/\s+/g, ' ').trim();
    return cleaned.length > max ? `${cleaned.slice(0, max - 1)}…` : cleaned;
}

/** A short, human subject for the admin email — derived from the message when
 *  no explicit subject was provided. */
function deriveSubject(msg: ContactMessageInput): string {
    return msg.subject?.trim() || oneLine(msg.message) || 'New enquiry';
}

// ── Email builders (pure) ────────────────────────────────────────────────────

export interface BuiltEmail {
    subject: string;
    text: string;
    html: string;
    replyTo: string;
}

/** Admin notification email. All user values are HTML-escaped in the HTML body. */
export function buildContactNotificationEmail(msg: ContactMessageInput): BuiltEmail {
    const subjectLine = oneLine(deriveSubject(msg), 120);
    const subject = `[Scam Checker Contact] ${msg.category}: ${subjectLine}`;

    const created = msg.createdAt.toISOString();
    const rows: [string, string][] = [
        ['ID', msg.id],
        ['Category', msg.category],
        ['Name', msg.name],
        ['Email', msg.email],
        ['Subject', subjectLine],
        ['Created', created],
    ];
    if (msg.pagePath) rows.push(['Source page', msg.pagePath]);
    // Note: request fingerprint (IP hash, user-agent) is deliberately NOT
    // included in any email. It is kept server-side only for rate limiting.

    const text =
        rows.map(([k, v]) => `${k}: ${v}`).join('\n') +
        `\n\nMessage:\n${msg.message}\n`;

    const htmlRows = rows
        .map(
            ([k, v]) =>
                `<tr><td style="padding:4px 12px 4px 0;color:#64748b;white-space:nowrap;vertical-align:top">${escapeHtml(
                    k,
                )}</td><td style="padding:4px 0;color:#0f172a">${escapeHtml(v)}</td></tr>`,
        )
        .join('');

    const html = `<!doctype html><html><body style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#0f172a">
<h2 style="margin:0 0 12px">New contact enquiry</h2>
<table style="border-collapse:collapse;font-size:14px">${htmlRows}</table>
<h3 style="margin:18px 0 6px">Message</h3>
<div style="white-space:pre-wrap;font-size:14px;border-left:3px solid #e2e8f0;padding-left:12px;color:#0f172a">${escapeHtml(
        msg.message,
    )}</div>
</body></html>`;

    return { subject, text, html, replyTo: msg.email };
}

/** Optional confirmation email sent back to the user. No internal metadata. */
export function buildContactConfirmationEmail(msg: ContactMessageInput): Omit<BuiltEmail, 'replyTo'> {
    const subject = 'We received your message — Scam Checker';
    const text =
        `Hi ${msg.name},\n\n` +
        `Thanks for contacting Scam Checker. We've received your message ` +
        `(category: ${msg.category}) and will reply by email.\n\n` +
        `For your security, never share passwords, card numbers or one-time codes. ` +
        `To check a suspicious message, use the scam checker at https://scamchecker.app/check.\n\n` +
        `— The Scam Checker team`;

    const html = `<!doctype html><html><body style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#0f172a;font-size:14px">
<p>Hi ${escapeHtml(msg.name)},</p>
<p>Thanks for contacting <strong>Scam Checker</strong>. We&#39;ve received your message
(category: <strong>${escapeHtml(msg.category)}</strong>) and will reply by email.</p>
<p>For your security, never share passwords, card numbers or one-time codes. To check a
suspicious message, use the <a href="https://scamchecker.app/check">scam checker</a>.</p>
<p>— The Scam Checker team</p>
</body></html>`;

    return { subject, text, html };
}

// ── Senders (read env, call Resend, never throw) ─────────────────────────────

function clientFor(config: ResendConfig, opts: SendOptions): ResendLike | null {
    if (opts.client) return opts.client;
    if (!config.apiKey) return null;
    return new Resend(config.apiKey) as unknown as ResendLike;
}

/**
 * Send the admin notification. Returns a typed result and NEVER throws — a
 * missing config or provider error degrades to { ok:false } so the caller can
 * still treat the DB write as success.
 */
export async function sendContactNotification(
    msg: ContactMessageInput,
    opts: SendOptions = {},
): Promise<SendResult> {
    const env = opts.env ?? process.env;
    const config = readConfig(env);
    if (!config.apiKey || !config.from || !config.to) {
        return { ok: false, reason: 'not-configured' };
    }
    const client = clientFor(config, opts);
    if (!client) return { ok: false, reason: 'not-configured' };

    const email = buildContactNotificationEmail(msg);
    try {
        const res = await client.emails.send({
            from: config.from,
            to: config.to,
            ...(config.cc ? { cc: config.cc } : {}),
            replyTo: email.replyTo,
            subject: email.subject,
            text: email.text,
            html: email.html,
        });
        if (res.error) {
            // Log a generic class only — never the provider payload / secrets.
            console.warn('Resend notification error for contact', msg.id);
            return { ok: false, reason: 'provider-error' };
        }
        return { ok: true, id: res.data?.id };
    } catch {
        console.warn('Resend notification threw for contact', msg.id);
        return { ok: false, reason: 'send-failed' };
    }
}

/**
 * Send the optional user confirmation. Only sends when
 * CONTACT_SEND_CONFIRMATION_EMAIL === 'true'. Never throws.
 */
export async function sendContactConfirmation(
    msg: ContactMessageInput,
    opts: SendOptions = {},
): Promise<SendResult> {
    const env = opts.env ?? process.env;
    const config = readConfig(env);
    if (!config.sendConfirmation) return { ok: false, reason: 'disabled' };
    if (!config.apiKey || !config.from) return { ok: false, reason: 'not-configured' };

    const client = clientFor(config, opts);
    if (!client) return { ok: false, reason: 'not-configured' };

    const email = buildContactConfirmationEmail(msg);
    try {
        const res = await client.emails.send({
            from: config.from,
            to: msg.email,
            subject: email.subject,
            text: email.text,
            html: email.html,
        });
        if (res.error) {
            console.warn('Resend confirmation error for contact', msg.id);
            return { ok: false, reason: 'provider-error' };
        }
        return { ok: true, id: res.data?.id };
    } catch {
        console.warn('Resend confirmation threw for contact', msg.id);
        return { ok: false, reason: 'send-failed' };
    }
}
