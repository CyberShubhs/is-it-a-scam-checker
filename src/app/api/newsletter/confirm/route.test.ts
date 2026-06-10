import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { signConfirmToken } from '@/lib/email/newsletter';

// ── Mocks (must be declared before importing the route) ──────────────────────
// verifyConfirmToken stays REAL — we sign tokens with the same secret below so
// the signature path is exercised end-to-end. Only the Resend call is mocked.
const addContact = vi.fn();
vi.mock('@/lib/email/newsletter', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@/lib/email/newsletter')>();
    return {
        ...actual,
        addConfirmedContact: (...a: unknown[]) => addContact(...a),
    };
});

const rateLimitFn = vi.fn();
vi.mock('@/lib/scanRateLimit', () => ({
    rateLimit: (...a: unknown[]) => rateLimitFn(...a),
    clientRateKey: () => 'test-key',
}));

vi.mock('next/server', () => ({
    NextResponse: {
        redirect: (url: URL | string, status?: number) =>
            new Response(null, {
                status: status ?? 307,
                headers: { location: String(url) },
            }),
    },
}));

import { GET } from './route';

const SECRET = 'route-test-secret';
const NOW = Date.now();

function confirmRequest(params: Record<string, string>): Request {
    const search = new URLSearchParams(params).toString();
    return new Request(`https://scamchecker.app/api/newsletter/confirm?${search}`);
}

function tokenParams(email = 'ada@example.com', secret = SECRET) {
    const token = signConfirmToken(email, secret, NOW);
    return { email: token.email, exp: String(token.expiresAtMs), sig: token.signature };
}

beforeEach(() => {
    addContact.mockReset();
    rateLimitFn.mockReset();
    addContact.mockResolvedValue({ ok: true, id: 'ct_1' });
    rateLimitFn.mockReturnValue({ allowed: true, remaining: 19, retryAfterSeconds: 900 });
    vi.stubEnv('NEWSLETTER_CONFIRM_SECRET', SECRET);
});

afterEach(() => {
    vi.unstubAllEnvs();
});

function location(res: Response): string {
    return res.headers.get('location') || '';
}

describe('GET /api/newsletter/confirm', () => {
    it('adds the contact and redirects with subscribed=1 for a valid token', async () => {
        const res = await GET(confirmRequest(tokenParams()));
        expect(res.status).toBe(303);
        expect(location(res)).toContain('/weekly-scam-alerts?subscribed=1');
        expect(addContact).toHaveBeenCalledWith('ada@example.com');
    });

    it('redirects with invalid for a token signed with the wrong secret', async () => {
        const res = await GET(confirmRequest(tokenParams('ada@example.com', 'other-secret')));
        expect(location(res)).toContain('subscribe_error=invalid');
        expect(addContact).not.toHaveBeenCalled();
    });

    it('redirects with invalid when the email is swapped', async () => {
        const params = tokenParams();
        const res = await GET(confirmRequest({ ...params, email: 'eve@example.com' }));
        expect(location(res)).toContain('subscribe_error=invalid');
        expect(addContact).not.toHaveBeenCalled();
    });

    it('redirects with expired for an expired token', async () => {
        const expired = signConfirmToken('ada@example.com', SECRET, NOW - 49 * 60 * 60 * 1000);
        const res = await GET(
            confirmRequest({
                email: expired.email,
                exp: String(expired.expiresAtMs),
                sig: expired.signature,
            }),
        );
        expect(location(res)).toContain('subscribe_error=expired');
        expect(addContact).not.toHaveBeenCalled();
    });

    it('redirects with unavailable when the secret is missing', async () => {
        vi.stubEnv('NEWSLETTER_CONFIRM_SECRET', '');
        const res = await GET(confirmRequest(tokenParams()));
        expect(location(res)).toContain('subscribe_error=unavailable');
        expect(addContact).not.toHaveBeenCalled();
    });

    it('redirects with unavailable when the audience add fails', async () => {
        addContact.mockResolvedValue({ ok: false, reason: 'provider-error' });
        const res = await GET(confirmRequest(tokenParams()));
        expect(location(res)).toContain('subscribe_error=unavailable');
    });

    it('redirects with rate-limited when over the limit', async () => {
        rateLimitFn.mockReturnValue({ allowed: false, remaining: 0, retryAfterSeconds: 60 });
        const res = await GET(confirmRequest(tokenParams()));
        expect(location(res)).toContain('subscribe_error=rate-limited');
        expect(addContact).not.toHaveBeenCalled();
    });
});
