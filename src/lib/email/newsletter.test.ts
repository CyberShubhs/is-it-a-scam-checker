import { describe, it, expect, vi } from 'vitest';
import {
    normalizeEmail,
    signConfirmToken,
    verifyConfirmToken,
    buildConfirmUrl,
    buildConfirmEmail,
    isNewsletterConfigured,
    sendConfirmRequest,
    addConfirmedContact,
    CONFIRM_TTL_MS,
    type NewsletterResendLike,
} from './newsletter';

const SECRET = 'unit-test-secret';
const NOW = Date.parse('2026-06-11T00:00:00.000Z');

const FULL_ENV = {
    NODE_ENV: 'test',
    RESEND_API_KEY: 're_test',
    RESEND_FROM_EMAIL: 'alerts@scamchecker.app',
    RESEND_AUDIENCE_ID: 'aud_123',
    NEWSLETTER_CONFIRM_SECRET: SECRET,
} as NodeJS.ProcessEnv;

type SendFn = NewsletterResendLike['emails']['send'];
type CreateFn = NewsletterResendLike['contacts']['create'];

function mockClient(overrides: { send?: SendFn; create?: CreateFn } = {}) {
    const send = vi.fn<SendFn>(overrides.send ?? (async () => ({ data: { id: 'em_1' } })));
    const create = vi.fn<CreateFn>(overrides.create ?? (async () => ({ data: { id: 'ct_1' } })));
    const client: NewsletterResendLike = {
        emails: { send },
        contacts: { create },
    };
    return { client, send, create };
}

describe('normalizeEmail', () => {
    it('lowercases and trims valid addresses', () => {
        expect(normalizeEmail('  Ada@Example.COM ')).toBe('ada@example.com');
    });
    it('rejects invalid, oversized, and non-string input', () => {
        expect(normalizeEmail('not-an-email')).toBeNull();
        expect(normalizeEmail('a@b')).toBeNull();
        expect(normalizeEmail(`${'x'.repeat(200)}@example.com`)).toBeNull();
        expect(normalizeEmail(42)).toBeNull();
        expect(normalizeEmail(undefined)).toBeNull();
    });
});

describe('confirm tokens', () => {
    it('round-trips a valid token', () => {
        const token = signConfirmToken('ada@example.com', SECRET, NOW);
        const result = verifyConfirmToken(
            token.email,
            String(token.expiresAtMs),
            token.signature,
            SECRET,
            NOW + 1000,
        );
        expect(result).toEqual({ valid: true, email: 'ada@example.com' });
    });

    it('rejects a tampered email', () => {
        const token = signConfirmToken('ada@example.com', SECRET, NOW);
        const result = verifyConfirmToken(
            'eve@example.com',
            String(token.expiresAtMs),
            token.signature,
            SECRET,
            NOW,
        );
        expect(result).toEqual({ valid: false, reason: 'invalid' });
    });

    it('rejects a tampered expiry', () => {
        const token = signConfirmToken('ada@example.com', SECRET, NOW);
        const result = verifyConfirmToken(
            token.email,
            String(token.expiresAtMs + 999_999),
            token.signature,
            SECRET,
            NOW,
        );
        expect(result).toEqual({ valid: false, reason: 'invalid' });
    });

    it('rejects a wrong-length or garbage signature without throwing', () => {
        const token = signConfirmToken('ada@example.com', SECRET, NOW);
        expect(
            verifyConfirmToken(token.email, String(token.expiresAtMs), 'short', SECRET, NOW),
        ).toEqual({ valid: false, reason: 'invalid' });
        expect(verifyConfirmToken(token.email, 'NaN', token.signature, SECRET, NOW)).toEqual({
            valid: false,
            reason: 'invalid',
        });
    });

    it('rejects an expired token as expired (not invalid)', () => {
        const token = signConfirmToken('ada@example.com', SECRET, NOW);
        const after = NOW + CONFIRM_TTL_MS + 1;
        const result = verifyConfirmToken(
            token.email,
            String(token.expiresAtMs),
            token.signature,
            SECRET,
            after,
        );
        expect(result).toEqual({ valid: false, reason: 'expired' });
    });
});

describe('buildConfirmUrl / buildConfirmEmail', () => {
    it('builds an absolute confirm URL carrying email, exp and sig', () => {
        const token = signConfirmToken('ada@example.com', SECRET, NOW);
        const url = new URL(buildConfirmUrl(token));
        expect(url.origin).toBe('https://scamchecker.app');
        expect(url.pathname).toBe('/api/newsletter/confirm');
        expect(url.searchParams.get('email')).toBe('ada@example.com');
        expect(url.searchParams.get('exp')).toBe(String(token.expiresAtMs));
        expect(url.searchParams.get('sig')).toBe(token.signature);
    });

    it('embeds the confirm URL in both text and html bodies', () => {
        const built = buildConfirmEmail('https://scamchecker.app/api/newsletter/confirm?x=1&y=2');
        expect(built.text).toContain('https://scamchecker.app/api/newsletter/confirm?x=1&y=2');
        // HTML attribute context: & must be escaped.
        expect(built.html).toContain('x=1&amp;y=2');
        expect(built.subject.toLowerCase()).toContain('confirm');
        expect(built.text).toContain('48 hours');
    });
});

describe('isNewsletterConfigured', () => {
    it('requires all four env vars', () => {
        expect(isNewsletterConfigured(FULL_ENV)).toBe(true);
        const required = [
            'RESEND_API_KEY',
            'RESEND_FROM_EMAIL',
            'RESEND_AUDIENCE_ID',
            'NEWSLETTER_CONFIRM_SECRET',
        ];
        for (const key of required) {
            expect(isNewsletterConfigured({ ...FULL_ENV, [key]: undefined })).toBe(false);
        }
    });
});

describe('sendConfirmRequest', () => {
    it('degrades to not-configured without env', async () => {
        const result = await sendConfirmRequest('ada@example.com', {
            env: { NODE_ENV: 'test' } as NodeJS.ProcessEnv,
        });
        expect(result).toEqual({ ok: false, reason: 'not-configured' });
    });

    it('sends the confirmation email to the subscriber only', async () => {
        const { client, send } = mockClient();
        const result = await sendConfirmRequest('ada@example.com', {
            env: FULL_ENV,
            client,
            now: NOW,
        });
        expect(result.ok).toBe(true);
        expect(send).toHaveBeenCalledTimes(1);
        const payload = send.mock.calls[0][0] as Record<string, unknown>;
        expect(payload.to).toBe('ada@example.com');
        expect(payload.from).toBe('alerts@scamchecker.app');
        expect(String(payload.text)).toContain('/api/newsletter/confirm?');
    });

    it('returns provider-error without throwing when Resend errors', async () => {
        const { client } = mockClient({
            send: async () => ({ error: { message: 'boom' } }),
        });
        const result = await sendConfirmRequest('ada@example.com', { env: FULL_ENV, client });
        expect(result).toEqual({ ok: false, reason: 'provider-error' });
    });

    it('returns send-failed without throwing when the client throws', async () => {
        const { client } = mockClient({
            send: async () => {
                throw new Error('net');
            },
        });
        const result = await sendConfirmRequest('ada@example.com', { env: FULL_ENV, client });
        expect(result).toEqual({ ok: false, reason: 'send-failed' });
    });
});

describe('addConfirmedContact', () => {
    it('degrades to not-configured without an audience id', async () => {
        const env = { ...FULL_ENV, RESEND_AUDIENCE_ID: undefined } as NodeJS.ProcessEnv;
        const result = await addConfirmedContact('ada@example.com', { env });
        expect(result).toEqual({ ok: false, reason: 'not-configured' });
    });

    it('creates the contact via the current segments shape, subscribed', async () => {
        const { client, create } = mockClient();
        const result = await addConfirmedContact('ada@example.com', { env: FULL_ENV, client });
        expect(result.ok).toBe(true);
        expect(create).toHaveBeenCalledTimes(1);
        expect(create).toHaveBeenCalledWith({
            email: 'ada@example.com',
            unsubscribed: false,
            segments: [{ id: 'aud_123' }],
        });
    });

    it('falls back to the legacy audienceId shape when segments are rejected', async () => {
        const create = vi.fn<CreateFn>(async (payload) =>
            'segments' in payload
                ? { error: { name: 'not_found', message: 'segment not found' } }
                : { data: { id: 'ct_legacy' } },
        );
        const { client } = mockClient({ create });
        const result = await addConfirmedContact('ada@example.com', { env: FULL_ENV, client });
        expect(result).toEqual({ ok: true, id: 'ct_legacy' });
        expect(create).toHaveBeenCalledTimes(2);
        expect(create).toHaveBeenLastCalledWith({
            email: 'ada@example.com',
            audienceId: 'aud_123',
            unsubscribed: false,
        });
    });

    it('returns provider-error without throwing when both shapes fail', async () => {
        const { client, create } = mockClient({
            create: async () => ({ error: { name: 'restricted_api_key', message: 'boom' } }),
        });
        const result = await addConfirmedContact('ada@example.com', { env: FULL_ENV, client });
        expect(result).toEqual({ ok: false, reason: 'provider-error' });
        expect(create).toHaveBeenCalledTimes(2);
    });
});
