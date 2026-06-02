import { describe, it, expect, vi } from 'vitest';
import {
    escapeHtml,
    buildContactNotificationEmail,
    buildContactConfirmationEmail,
    sendContactNotification,
    sendContactConfirmation,
    type ContactMessageInput,
} from './resend';

function makeMsg(overrides: Partial<ContactMessageInput> = {}): ContactMessageInput {
    return {
        id: 'cm_123',
        category: 'support',
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        message: 'Hello, I have a question about a suspicious text.',
        createdAt: new Date('2026-06-03T10:00:00.000Z'),
        ...overrides,
    };
}

/** A mock Resend client that records the payload and returns a fixed result. */
function mockClient(result: { data?: { id?: string } | null; error?: unknown } = { data: { id: 'em_1' } }) {
    const send = vi.fn().mockResolvedValue(result);
    return { client: { emails: { send } }, send };
}

const FULL_ENV = {
    RESEND_API_KEY: 're_test_key',
    RESEND_FROM_EMAIL: 'Scam Checker <contact@mail.scamchecker.app>',
    CONTACT_TO_EMAIL: 'owner@example.com',
} as unknown as NodeJS.ProcessEnv;

describe('escapeHtml', () => {
    it('escapes the five HTML-significant characters', () => {
        expect(escapeHtml(`<script>alert("x")&'</script>`)).toBe(
            '&lt;script&gt;alert(&quot;x&quot;)&amp;&#39;&lt;/script&gt;',
        );
    });
});

describe('buildContactNotificationEmail', () => {
    it('formats the subject as [Scam Checker Contact] {category}: {subject}', () => {
        const email = buildContactNotificationEmail(makeMsg({ subject: 'Bug report' }));
        expect(email.subject).toBe('[Scam Checker Contact] support: Bug report');
    });

    it('sets replyTo to the submitter email and includes core fields', () => {
        const email = buildContactNotificationEmail(makeMsg());
        expect(email.replyTo).toBe('ada@example.com');
        expect(email.text).toContain('cm_123');
        expect(email.text).toContain('ada@example.com');
        expect(email.html).toContain('Ada Lovelace');
    });

    it('escapes HTML/script content in the HTML body', () => {
        const email = buildContactNotificationEmail(
            makeMsg({ name: '<b>x</b>', message: '<script>steal()</script>' }),
        );
        expect(email.html).not.toContain('<script>steal()</script>');
        expect(email.html).toContain('&lt;script&gt;steal()&lt;/script&gt;');
        expect(email.html).toContain('&lt;b&gt;x&lt;/b&gt;');
        // Plain-text part keeps the raw message (no HTML injection risk there).
        expect(email.text).toContain('<script>steal()</script>');
    });
});

describe('sendContactNotification', () => {
    it('returns not-configured and never calls Resend when env vars are missing', async () => {
        const { client, send } = mockClient();
        const res = await sendContactNotification(makeMsg(), { env: {} as NodeJS.ProcessEnv, client });
        expect(res).toEqual({ ok: false, reason: 'not-configured' });
        expect(send).not.toHaveBeenCalled();
    });

    it('sends via Resend with correct fields when configured', async () => {
        const { client, send } = mockClient({ data: { id: 'em_42' } });
        const res = await sendContactNotification(makeMsg({ subject: 'Hi' }), { env: FULL_ENV, client });
        expect(res).toEqual({ ok: true, id: 'em_42' });
        expect(send).toHaveBeenCalledTimes(1);
        const payload = send.mock.calls[0][0];
        expect(payload.from).toBe(FULL_ENV.RESEND_FROM_EMAIL);
        expect(payload.to).toBe('owner@example.com');
        expect(payload.replyTo).toBe('ada@example.com');
        expect(payload.subject).toBe('[Scam Checker Contact] support: Hi');
        // The secret API key is NEVER part of the send payload.
        expect(JSON.stringify(payload)).not.toContain('re_test_key');
    });

    it('escapes injected HTML in the payload html', async () => {
        const { client, send } = mockClient();
        await sendContactNotification(makeMsg({ message: '<img src=x onerror=alert(1)>' }), {
            env: FULL_ENV,
            client,
        });
        const payload = send.mock.calls[0][0] as { html: string };
        expect(payload.html).not.toContain('<img src=x');
        expect(payload.html).toContain('&lt;img src=x');
    });

    it('degrades to ok:false (never throws) when the provider errors', async () => {
        const { client } = mockClient({ error: { message: 'rate limited' } });
        const res = await sendContactNotification(makeMsg(), { env: FULL_ENV, client });
        expect(res.ok).toBe(false);
    });

    it('degrades to ok:false (never throws) when the client throws', async () => {
        const client = { emails: { send: vi.fn().mockRejectedValue(new Error('network')) } };
        const res = await sendContactNotification(makeMsg(), { env: FULL_ENV, client });
        expect(res.ok).toBe(false);
    });
});

describe('sendContactConfirmation', () => {
    it('is skipped (disabled) unless CONTACT_SEND_CONFIRMATION_EMAIL=true', async () => {
        const { client, send } = mockClient();
        const res = await sendContactConfirmation(makeMsg(), { env: FULL_ENV, client });
        expect(res).toEqual({ ok: false, reason: 'disabled' });
        expect(send).not.toHaveBeenCalled();
    });

    it('sends to the submitter when enabled', async () => {
        const { client, send } = mockClient({ data: { id: 'em_c1' } });
        const env = { ...FULL_ENV, CONTACT_SEND_CONFIRMATION_EMAIL: 'true' } as NodeJS.ProcessEnv;
        const res = await sendContactConfirmation(makeMsg(), { env, client });
        expect(res).toEqual({ ok: true, id: 'em_c1' });
        expect(send.mock.calls[0][0].to).toBe('ada@example.com');
    });

    it('escapes the user name in the confirmation HTML', () => {
        const email = buildContactConfirmationEmail(makeMsg({ name: '<i>x</i>' }));
        expect(email.html).toContain('&lt;i&gt;x&lt;/i&gt;');
        expect(email.html).not.toContain('<i>x</i>');
    });
});
