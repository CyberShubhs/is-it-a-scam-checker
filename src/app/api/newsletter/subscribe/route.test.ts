import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mocks (must be declared before importing the route) ──────────────────────
const sendConfirm = vi.fn();
const isConfigured = vi.fn();
vi.mock('@/lib/email/newsletter', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@/lib/email/newsletter')>();
    return {
        ...actual, // keep the REAL normalizeEmail so validation is exercised
        sendConfirmRequest: (...a: unknown[]) => sendConfirm(...a),
        isNewsletterConfigured: (...a: unknown[]) => isConfigured(...a),
    };
});

const rateLimitFn = vi.fn();
vi.mock('@/lib/scanRateLimit', () => ({
    rateLimit: (...a: unknown[]) => rateLimitFn(...a),
    clientRateKey: () => 'test-key',
}));

vi.mock('next/server', () => ({
    NextResponse: {
        json: (body: unknown, init?: { status?: number; headers?: Record<string, string> }) =>
            new Response(JSON.stringify(body), {
                status: init?.status ?? 200,
                headers: { 'content-type': 'application/json', ...(init?.headers ?? {}) },
            }),
    },
}));

import { POST } from './route';

function req(body: Record<string, unknown>): Request {
    return new Request('http://localhost/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
    });
}

beforeEach(() => {
    sendConfirm.mockReset();
    isConfigured.mockReset();
    rateLimitFn.mockReset();
    sendConfirm.mockResolvedValue({ ok: true, id: 'em_1' });
    isConfigured.mockReturnValue(true);
    rateLimitFn.mockReturnValue({ allowed: true, remaining: 4, retryAfterSeconds: 900 });
});

describe('POST /api/newsletter/subscribe', () => {
    it('sends a confirmation request for a valid email (normalised)', async () => {
        const res = await POST(req({ email: '  Ada@Example.COM ' }));
        expect(res.status).toBe(200);
        expect(await res.json()).toEqual({ success: true });
        expect(sendConfirm).toHaveBeenCalledWith('ada@example.com');
    });

    it('rejects an invalid email with 400 and sends nothing', async () => {
        const res = await POST(req({ email: 'not-an-email' }));
        expect(res.status).toBe(400);
        expect(sendConfirm).not.toHaveBeenCalled();
    });

    it('pretends success on the honeypot without sending', async () => {
        const res = await POST(req({ email: 'ada@example.com', company: 'Bot Pty Ltd' }));
        expect(res.status).toBe(200);
        expect(await res.json()).toEqual({ success: true });
        expect(sendConfirm).not.toHaveBeenCalled();
    });

    it('returns 503 when the newsletter env is not configured', async () => {
        isConfigured.mockReturnValue(false);
        const res = await POST(req({ email: 'ada@example.com' }));
        expect(res.status).toBe(503);
        expect(sendConfirm).not.toHaveBeenCalled();
    });

    it('returns a generic 503 when the provider send fails', async () => {
        sendConfirm.mockResolvedValue({ ok: false, reason: 'provider-error' });
        const res = await POST(req({ email: 'ada@example.com' }));
        expect(res.status).toBe(503);
        const body = (await res.json()) as { error: string };
        expect(body.error).not.toMatch(/provider|resend/i);
    });

    it('returns 429 with Retry-After when rate limited', async () => {
        rateLimitFn.mockReturnValue({ allowed: false, remaining: 0, retryAfterSeconds: 120 });
        const res = await POST(req({ email: 'ada@example.com' }));
        expect(res.status).toBe(429);
        expect(res.headers.get('Retry-After')).toBe('120');
        expect(sendConfirm).not.toHaveBeenCalled();
    });

    it('rejects a non-JSON body with 400', async () => {
        const res = await POST(
            new Request('http://localhost/api/newsletter/subscribe', {
                method: 'POST',
                body: 'not-json',
            }),
        );
        expect(res.status).toBe(400);
    });
});
