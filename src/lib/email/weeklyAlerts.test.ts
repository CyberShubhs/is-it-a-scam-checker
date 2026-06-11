import { describe, it, expect, vi } from 'vitest';
import {
    selectRecentPosts,
    buildWeeklyAlertEmail,
    sendWeeklyBroadcast,
    sendAdminTestEmail,
    countAudience,
    UNSUBSCRIBE_PLACEHOLDER,
    type WeeklyPostItem,
    type WeeklyResendLike,
} from './weeklyAlerts';

const NOW = Date.parse('2026-06-11T00:00:00.000Z');

const FULL_ENV = {
    NODE_ENV: 'test',
    RESEND_API_KEY: 're_test',
    RESEND_FROM_EMAIL: 'alerts@scamchecker.app',
    RESEND_AUDIENCE_ID: 'seg_123',
} as NodeJS.ProcessEnv;

function post(daysAgo: number, slug = `post-${daysAgo}`): WeeklyPostItem {
    return {
        slug,
        title: `Title for ${slug} <&>`,
        summary: `Summary for ${slug}`,
        date: new Date(NOW - daysAgo * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    };
}

type CreateFn = WeeklyResendLike['broadcasts']['create'];
type ListFn = WeeklyResendLike['contacts']['list'];
type SendEmailFn = WeeklyResendLike['emails']['send'];

function mockClient(overrides: {
    create?: CreateFn;
    sendBroadcast?: WeeklyResendLike['broadcasts']['send'];
    sendEmail?: SendEmailFn;
    list?: ListFn;
} = {}) {
    const create = vi.fn<CreateFn>(overrides.create ?? (async () => ({ data: { id: 'bc_1' } })));
    const sendBroadcast = vi.fn<WeeklyResendLike['broadcasts']['send']>(
        overrides.sendBroadcast ?? (async () => ({ data: { id: 'bc_1' } })),
    );
    const sendEmail = vi.fn<SendEmailFn>(
        overrides.sendEmail ?? (async () => ({ data: { id: 'em_1' } })),
    );
    const list = vi.fn<ListFn>(
        overrides.list ??
            (async () => ({
                data: { data: [{ unsubscribed: false }, { unsubscribed: true }], has_more: false },
            })),
    );
    const client: WeeklyResendLike = {
        emails: { send: sendEmail },
        broadcasts: { create, send: sendBroadcast },
        contacts: { list },
    };
    return { client, create, sendBroadcast, sendEmail, list };
}

describe('selectRecentPosts', () => {
    it('keeps only posts inside the window, newest first, capped', () => {
        const posts = [post(10), post(2), post(0), post(9), post(5), post(1), post(3), post(4), post(6)];
        const selected = selectRecentPosts(posts, { nowMs: NOW, maxAgeDays: 8, maxPosts: 5 });
        expect(selected.map((p) => p.slug)).toEqual([
            'post-0',
            'post-1',
            'post-2',
            'post-3',
            'post-4',
        ]);
    });

    it('returns empty when nothing is fresh', () => {
        expect(selectRecentPosts([post(9), post(30)], { nowMs: NOW })).toEqual([]);
    });

    it('ignores unparsable and future dates', () => {
        const bad: WeeklyPostItem = { slug: 'bad', title: 't', summary: 's', date: 'not-a-date' };
        const future: WeeklyPostItem = { slug: 'future', title: 't', summary: 's', date: '2099-01-01' };
        expect(selectRecentPosts([bad, future, post(1)], { nowMs: NOW }).map((p) => p.slug)).toEqual([
            'post-1',
        ]);
    });
});

describe('buildWeeklyAlertEmail', () => {
    it('includes post links, escaped titles, the /check CTA, and the unsubscribe link in HTML and text', () => {
        const built = buildWeeklyAlertEmail([post(1, 'fresh-scam')], { nowMs: NOW });
        expect(built.html).toContain('https://scamchecker.app/blog/fresh-scam');
        expect(built.html).toContain('Title for fresh-scam &lt;&amp;&gt;');
        expect(built.html).toContain('https://scamchecker.app/check');
        expect(built.html).toContain(UNSUBSCRIBE_PLACEHOLDER);
        expect(built.text).toContain('https://scamchecker.app/blog/fresh-scam');
        expect(built.text).toContain(UNSUBSCRIBE_PLACEHOLDER);
        expect(built.previewText).toBe('Title for fresh-scam <&>');
        expect(built.subject).toContain("This week's scam alerts");
    });

    it('throws on an empty post list (callers must skip instead of sending)', () => {
        expect(() => buildWeeklyAlertEmail([], { nowMs: NOW })).toThrow();
    });
});

describe('sendWeeklyBroadcast', () => {
    const email = buildWeeklyAlertEmail([post(1)], { nowMs: NOW });

    it('degrades to not-configured without env', async () => {
        const result = await sendWeeklyBroadcast(email, {
            env: { NODE_ENV: 'test' } as NodeJS.ProcessEnv,
        });
        expect(result).toEqual({ ok: false, reason: 'not-configured' });
    });

    it('creates a draft against the segment then sends it', async () => {
        const { client, create, sendBroadcast } = mockClient();
        const result = await sendWeeklyBroadcast(email, { env: FULL_ENV, client });
        expect(result).toEqual({ ok: true, id: 'bc_1' });
        expect(create).toHaveBeenCalledTimes(1);
        const payload = create.mock.calls[0][0] as Record<string, unknown>;
        expect(payload.segmentId).toBe('seg_123');
        expect(payload.from).toBe('alerts@scamchecker.app');
        expect(String(payload.html)).toContain(UNSUBSCRIBE_PLACEHOLDER);
        expect(sendBroadcast).toHaveBeenCalledWith('bc_1');
    });

    it('falls back to the legacy audienceId shape when segmentId is rejected', async () => {
        const create = vi.fn<CreateFn>(async (payload) =>
            'segmentId' in payload
                ? { error: { name: 'not_found', message: 'no segment' } }
                : { data: { id: 'bc_legacy' } },
        );
        const { client, sendBroadcast } = mockClient({ create });
        const result = await sendWeeklyBroadcast(email, { env: FULL_ENV, client });
        expect(result).toEqual({ ok: true, id: 'bc_legacy' });
        expect(create).toHaveBeenCalledTimes(2);
        expect(sendBroadcast).toHaveBeenCalledWith('bc_legacy');
    });

    it('reports create-failed when both create shapes fail, and never sends', async () => {
        const { client, sendBroadcast } = mockClient({
            create: async () => ({ error: { name: 'restricted_api_key', message: 'no' } }),
        });
        const result = await sendWeeklyBroadcast(email, { env: FULL_ENV, client });
        expect(result).toEqual({ ok: false, reason: 'create-failed' });
        expect(sendBroadcast).not.toHaveBeenCalled();
    });

    it('reports send-failed when the broadcast send step errors', async () => {
        const { client } = mockClient({
            sendBroadcast: async () => ({ error: { name: 'application_error', message: 'no' } }),
        });
        const result = await sendWeeklyBroadcast(email, { env: FULL_ENV, client });
        expect(result).toEqual({ ok: false, reason: 'send-failed' });
    });
});

describe('sendAdminTestEmail', () => {
    const email = buildWeeklyAlertEmail([post(1)], { nowMs: NOW });

    it('sends only to the admin address, prefixes the subject, and swaps the placeholder', async () => {
        const { client, sendEmail } = mockClient();
        const result = await sendAdminTestEmail(email, 'admin@example.com', {
            env: FULL_ENV,
            client,
        });
        expect(result.ok).toBe(true);
        expect(sendEmail).toHaveBeenCalledTimes(1);
        const payload = sendEmail.mock.calls[0][0] as Record<string, unknown>;
        expect(payload.to).toBe('admin@example.com');
        expect(String(payload.subject)).toMatch(/^\[TEST\] /);
        expect(String(payload.html)).not.toContain(UNSUBSCRIBE_PLACEHOLDER);
        expect(String(payload.html)).toContain('https://scamchecker.app/weekly-scam-alerts');
        expect(String(payload.text)).not.toContain(UNSUBSCRIBE_PLACEHOLDER);
    });

    it('degrades to not-configured without env', async () => {
        const result = await sendAdminTestEmail(email, 'admin@example.com', {
            env: { NODE_ENV: 'test' } as NodeJS.ProcessEnv,
        });
        expect(result).toEqual({ ok: false, reason: 'not-configured' });
    });
});

describe('countAudience', () => {
    it('counts subscribed vs unsubscribed on the first page', async () => {
        const { client } = mockClient();
        const result = await countAudience({ env: FULL_ENV, client });
        expect(result.ok).toBe(true);
        expect(result.count).toEqual({ subscribed: 1, unsubscribed: 1, hasMore: false });
    });

    it('falls back to the legacy audienceId filter when segmentId is rejected', async () => {
        const list = vi.fn<ListFn>(async (options) =>
            options && 'segmentId' in options
                ? { error: { name: 'not_found', message: 'no segment' } }
                : { data: { data: [{ unsubscribed: false }], has_more: true } },
        );
        const { client } = mockClient({ list });
        const result = await countAudience({ env: FULL_ENV, client });
        expect(result.ok).toBe(true);
        expect(result.count).toEqual({ subscribed: 1, unsubscribed: 0, hasMore: true });
        expect(list).toHaveBeenCalledTimes(2);
    });

    it('reports count-failed without throwing when both filters fail', async () => {
        const { client } = mockClient({
            list: async () => ({ error: { name: 'restricted_api_key', message: 'no' } }),
        });
        const result = await countAudience({ env: FULL_ENV, client });
        expect(result).toEqual({ ok: false, reason: 'count-failed' });
    });
});
