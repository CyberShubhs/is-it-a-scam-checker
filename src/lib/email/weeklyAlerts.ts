/**
 * Weekly scam-alerts campaign email.  SERVER/SCRIPT-ONLY.
 * ──────────────────────────────────────────────────────────────────────────
 * Builds and sends the weekly digest of new blog/scam-alert posts to the
 * confirmed Resend segment/audience via the Broadcasts API.
 *
 * Why Broadcasts (not looping emails.send):
 *   - Resend automatically EXCLUDES unsubscribed contacts from a broadcast.
 *   - The {{{RESEND_UNSUBSCRIBE_URL}}} variable renders a per-recipient,
 *     Resend-hosted unsubscribe link that flips the contact's `unsubscribed`
 *     flag — no unsubscribe endpoint for us to build or secure.
 *
 * Content policy: the email is built ONLY from our own published blog
 * frontmatter (title/summary/date/slug). No user-submitted reports, scanned
 * content, addresses, phone numbers, or IPs can reach a campaign.
 *
 * NOTE: imports here are RELATIVE (not '@/...') because this module is also
 * consumed by scripts/send-weekly-alerts.ts under tsx, matching the
 * convention of src/lib modules shared with scripts/generate-scam-post.ts.
 */

import { Resend } from 'resend';
import { SITE_URL } from '../seo';
import { escapeHtml } from './resend';

// Resend substitutes this per-recipient in broadcast HTML/text. Triple braces
// prevent HTML-escaping of the URL.
export const UNSUBSCRIBE_PLACEHOLDER = '{{{RESEND_UNSUBSCRIBE_URL}}}';

export interface WeeklyPostItem {
    /** Blog slug (filename without .mdx). */
    slug: string;
    title: string;
    summary: string;
    /** ISO date string (frontmatter `updated` || `date`). */
    date: string;
}

// ── Post selection (pure) ────────────────────────────────────────────────────

export interface SelectOptions {
    nowMs?: number;
    /** Posts older than this are excluded (default 8 days — one weekly cycle + slack). */
    maxAgeDays?: number;
    /** Cap so a backfill week can't produce a wall of links. */
    maxPosts?: number;
}

export function selectRecentPosts(
    posts: WeeklyPostItem[],
    { nowMs = Date.now(), maxAgeDays = 8, maxPosts = 5 }: SelectOptions = {},
): WeeklyPostItem[] {
    const cutoff = nowMs - maxAgeDays * 24 * 60 * 60 * 1000;
    return posts
        .filter((p) => {
            const t = Date.parse(p.date);
            return Number.isFinite(t) && t >= cutoff && t <= nowMs;
        })
        .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
        .slice(0, maxPosts);
}

// ── Email builder (pure) ─────────────────────────────────────────────────────

export interface BuiltWeeklyEmail {
    subject: string;
    previewText: string;
    html: string;
    text: string;
}

function formatWeekOf(nowMs: number): string {
    return new Date(nowMs).toLocaleDateString('en-AU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'Australia/Sydney',
    });
}

export function buildWeeklyAlertEmail(
    posts: WeeklyPostItem[],
    { nowMs = Date.now() }: { nowMs?: number } = {},
): BuiltWeeklyEmail {
    if (posts.length === 0) {
        throw new Error('buildWeeklyAlertEmail requires at least one post');
    }
    const subject = `This week's scam alerts — ${formatWeekOf(nowMs)}`;
    const previewText = posts[0].title;

    const textItems = posts
        .map((p) => `• ${p.title}\n  ${p.summary}\n  ${SITE_URL}/blog/${p.slug}`)
        .join('\n\n');

    const text =
        `Scam Checker — weekly scam alerts (${formatWeekOf(nowMs)})\n\n` +
        `New this week:\n\n${textItems}\n\n` +
        `Got a suspicious message, link, or file right now?\n` +
        `Check it free and privately: ${SITE_URL}/check\n\n` +
        `—\nYou're receiving this because you confirmed your email at ` +
        `${SITE_URL}/weekly-scam-alerts.\n` +
        `Unsubscribe with one click: ${UNSUBSCRIBE_PLACEHOLDER}\n`;

    const htmlItems = posts
        .map(
            (p) => `<tr><td style="padding:0 0 20px">
<a href="${SITE_URL}/blog/${encodeURIComponent(p.slug)}" style="color:#1d4ed8;font-weight:700;font-size:16px;text-decoration:none">${escapeHtml(p.title)}</a>
<p style="margin:6px 0 0;color:#334155;font-size:14px;line-height:1.5">${escapeHtml(p.summary)}</p>
</td></tr>`,
        )
        .join('\n');

    const html = `<!doctype html><html><body style="margin:0;background:#f8fafc;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;border:1px solid #e2e8f0">
<tr><td style="padding:28px 28px 8px">
<h1 style="margin:0;font-size:20px;color:#0f172a">🛡️ This week&#39;s scam alerts</h1>
<p style="margin:8px 0 0;color:#64748b;font-size:13px">${escapeHtml(formatWeekOf(nowMs))} · scamchecker.app</p>
</td></tr>
<tr><td style="padding:20px 28px 0">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
${htmlItems}
</table>
</td></tr>
<tr><td style="padding:4px 28px 28px">
<a href="${SITE_URL}/check" style="display:inline-block;background:#0f172a;color:#ffffff;padding:10px 18px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600">Check a suspicious message now — free</a>
<p style="margin:24px 0 0;color:#94a3b8;font-size:12px;line-height:1.6">
You&#39;re receiving this because you confirmed your email at
<a href="${SITE_URL}/weekly-scam-alerts" style="color:#64748b">scamchecker.app/weekly-scam-alerts</a>.<br/>
<a href="${UNSUBSCRIBE_PLACEHOLDER}" style="color:#64748b">Unsubscribe</a> — one click, no questions asked.
</p>
</td></tr>
</table>
</td></tr></table>
</body></html>`;

    return { subject, previewText, html, text };
}

// ── Resend plumbing (never throws) ───────────────────────────────────────────

export type WeeklyResult =
    | { ok: true; id?: string }
    | { ok: false; reason: string };

interface ResendResponse<T> {
    data?: T | null;
    error?: unknown;
}

/** Minimal Resend surface used here — injectable for tests. */
export interface WeeklyResendLike {
    emails: {
        send(payload: Record<string, unknown>): Promise<ResendResponse<{ id?: string }>>;
    };
    broadcasts: {
        create(payload: Record<string, unknown>): Promise<ResendResponse<{ id: string }>>;
        send(id: string): Promise<ResendResponse<{ id: string }>>;
    };
    contacts: {
        list(
            options?: Record<string, unknown>,
        ): Promise<ResendResponse<{ data: { unsubscribed?: boolean }[]; has_more: boolean }>>;
    };
}

export interface WeeklyOptions {
    env?: NodeJS.ProcessEnv;
    client?: WeeklyResendLike;
}

interface WeeklyConfig {
    apiKey?: string;
    from?: string;
    audienceId?: string;
}

function readConfig(env: NodeJS.ProcessEnv): WeeklyConfig {
    return {
        apiKey: env.RESEND_API_KEY,
        from: env.RESEND_FROM_EMAIL,
        audienceId: env.RESEND_AUDIENCE_ID,
    };
}

function clientFor(config: WeeklyConfig, opts: WeeklyOptions): WeeklyResendLike | null {
    if (opts.client) return opts.client;
    if (!config.apiKey) return null;
    return new Resend(config.apiKey) as unknown as WeeklyResendLike;
}

function providerErrorName(error: unknown): string {
    if (error && typeof error === 'object' && 'name' in error) {
        const name = (error as { name?: unknown }).name;
        if (typeof name === 'string') return name;
    }
    return 'unknown';
}

/**
 * Create the broadcast as a DRAFT against the segment (legacy-audience
 * fallback, same dual-ID handling as newsletter.ts), then trigger the send.
 * Unsubscribed contacts are excluded by Resend automatically.
 */
export async function sendWeeklyBroadcast(
    email: BuiltWeeklyEmail,
    opts: WeeklyOptions = {},
): Promise<WeeklyResult> {
    const env = opts.env ?? process.env;
    const config = readConfig(env);
    if (!config.apiKey || !config.from || !config.audienceId) {
        return { ok: false, reason: 'not-configured' };
    }
    const client = clientFor(config, opts);
    if (!client) return { ok: false, reason: 'not-configured' };

    const base = {
        name: email.subject,
        from: config.from,
        subject: email.subject,
        previewText: email.previewText,
        html: email.html,
        text: email.text,
    };

    try {
        let created = await client.broadcasts.create({ ...base, segmentId: config.audienceId });
        if (created.error) {
            const segmentError = providerErrorName(created.error);
            created = await client.broadcasts.create({ ...base, audienceId: config.audienceId });
            if (created.error) {
                console.warn(
                    `[weekly-alerts] broadcast create failed (segments: ${segmentError}; legacy audience: ${providerErrorName(created.error)}).`,
                );
                return { ok: false, reason: 'create-failed' };
            }
        }
        const broadcastId = created.data?.id;
        if (!broadcastId) return { ok: false, reason: 'create-failed' };

        const sent = await client.broadcasts.send(broadcastId);
        if (sent.error) {
            console.warn(
                `[weekly-alerts] broadcast ${broadcastId} send failed (${providerErrorName(sent.error)}).`,
            );
            return { ok: false, reason: 'send-failed' };
        }
        console.log(`[weekly-alerts] broadcast sent (id: ${broadcastId}).`);
        return { ok: true, id: broadcastId };
    } catch {
        console.warn('[weekly-alerts] broadcast threw.');
        return { ok: false, reason: 'send-failed' };
    }
}

/**
 * Manual test send: deliver the exact campaign to ONE admin/test address via
 * the transactional API. Broadcast variables aren't substituted there, so the
 * unsubscribe placeholder is swapped for the landing page and the subject is
 * prefixed so it can't be mistaken for the real campaign.
 */
export async function sendAdminTestEmail(
    email: BuiltWeeklyEmail,
    to: string,
    opts: WeeklyOptions = {},
): Promise<WeeklyResult> {
    const env = opts.env ?? process.env;
    const config = readConfig(env);
    if (!config.apiKey || !config.from) return { ok: false, reason: 'not-configured' };
    const client = clientFor(config, opts);
    if (!client) return { ok: false, reason: 'not-configured' };

    const testUnsubTarget = `${SITE_URL}/weekly-scam-alerts`;
    try {
        const res = await client.emails.send({
            from: config.from,
            to,
            subject: `[TEST] ${email.subject}`,
            html: email.html.split(UNSUBSCRIBE_PLACEHOLDER).join(testUnsubTarget),
            text: email.text.split(UNSUBSCRIBE_PLACEHOLDER).join(testUnsubTarget),
        });
        if (res.error) {
            console.warn(`[weekly-alerts] test send failed (${providerErrorName(res.error)}).`);
            return { ok: false, reason: 'send-failed' };
        }
        console.log('[weekly-alerts] test email sent to admin address.');
        return { ok: true, id: res.data?.id };
    } catch {
        console.warn('[weekly-alerts] test send threw.');
        return { ok: false, reason: 'send-failed' };
    }
}

export interface AudienceCount {
    subscribed: number;
    unsubscribed: number;
    /** True when more pages exist — counts are then a lower bound. */
    hasMore: boolean;
}

/** Estimate recipients for dry-run reporting (first page; lower bound). */
export async function countAudience(
    opts: WeeklyOptions = {},
): Promise<WeeklyResult & { count?: AudienceCount }> {
    const env = opts.env ?? process.env;
    const config = readConfig(env);
    if (!config.apiKey || !config.audienceId) return { ok: false, reason: 'not-configured' };
    const client = clientFor(config, opts);
    if (!client) return { ok: false, reason: 'not-configured' };

    try {
        let res = await client.contacts.list({ segmentId: config.audienceId, limit: 100 });
        if (res.error) {
            res = await client.contacts.list({ audienceId: config.audienceId, limit: 100 });
        }
        if (res.error || !res.data) {
            console.warn(`[weekly-alerts] contact count failed (${providerErrorName(res.error)}).`);
            return { ok: false, reason: 'count-failed' };
        }
        const unsubscribed = res.data.data.filter((c) => c.unsubscribed).length;
        return {
            ok: true,
            count: {
                subscribed: res.data.data.length - unsubscribed,
                unsubscribed,
                hasMore: res.data.has_more,
            },
        };
    } catch {
        console.warn('[weekly-alerts] contact count threw.');
        return { ok: false, reason: 'count-failed' };
    }
}
