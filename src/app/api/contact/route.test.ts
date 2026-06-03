import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mocks (must be declared before importing the route) ──────────────────────
const create = vi.fn();
vi.mock('@/lib/db', () => ({
    prisma: { contactMessage: { create: (...a: unknown[]) => create(...a) } },
}));

const sendNotify = vi.fn();
const sendConfirm = vi.fn();
vi.mock('@/lib/email/resend', () => ({
    sendContactNotification: (...a: unknown[]) => sendNotify(...a),
    sendContactConfirmation: (...a: unknown[]) => sendConfirm(...a),
}));

// Always allow through the rate limiter for these tests.
vi.mock('@/lib/scanRateLimit', () => ({
    rateLimit: () => ({ allowed: true, remaining: 4, retryAfterSeconds: 600 }),
    clientRateKey: () => 'test-key',
}));

// Mock NextResponse.json → a real Response so .status / .json() work in node.
vi.mock('next/server', () => ({
    NextResponse: {
        json: (body: unknown, init?: { status?: number }) =>
            new Response(JSON.stringify(body), {
                status: init?.status ?? 200,
                headers: { 'content-type': 'application/json' },
            }),
    },
}));

import { POST } from './route';

function req(body: Record<string, unknown>): Request {
    return new Request('http://localhost/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'user-agent': 'test-agent' },
        body: JSON.stringify(body),
    });
}

const VALID = {
    name: 'Ada',
    email: 'ada@example.com',
    message: 'Hello there, this is a genuine test message.',
    category: 'support',
};

const STORED = {
    id: 'cm_1',
    category: 'support',
    name: 'Ada',
    email: 'ada@example.com',
    message: 'Hello there, this is a genuine test message.',
    ip_hash: 'hash',
    user_agent_hash: 'ua',
    created_at: new Date('2026-06-03T10:00:00.000Z'),
};

beforeEach(() => {
    create.mockReset();
    sendNotify.mockReset();
    sendConfirm.mockReset();
    create.mockResolvedValue(STORED);
    sendNotify.mockResolvedValue({ ok: true, id: 'em_1' });
    sendConfirm.mockResolvedValue({ ok: false, reason: 'disabled' });
});

describe('POST /api/contact', () => {
    it('stores the ContactMessage and sends the admin email after the DB write', async () => {
        const res = await POST(req(VALID));
        expect(res.status).toBe(200);
        expect((await res.json()).success).toBe(true);
        expect(create).toHaveBeenCalledTimes(1);
        // Notification is sent the persisted record (only available post-insert).
        expect(sendNotify).toHaveBeenCalledTimes(1);
        const sentInput = sendNotify.mock.calls[0][0];
        expect(sentInput.id).toBe('cm_1');
        // Request fingerprint must NOT be forwarded to the email layer.
        expect(sentInput.ipHash).toBeUndefined();
        expect(sentInput.userAgentHash).toBeUndefined();
        expect(Object.keys(sentInput)).not.toContain('ip_hash');
        expect(Object.keys(sentInput)).not.toContain('user_agent_hash');
    });

    it('still returns success when Resend returns ok:false after the DB write', async () => {
        sendNotify.mockResolvedValue({ ok: false, reason: 'provider-error' });
        const res = await POST(req(VALID));
        expect(res.status).toBe(200);
        expect((await res.json()).success).toBe(true);
        expect(create).toHaveBeenCalledTimes(1);
    });

    it('still returns success when Resend throws after the DB write', async () => {
        sendNotify.mockRejectedValue(new Error('boom'));
        const res = await POST(req(VALID));
        expect(res.status).toBe(200);
        expect((await res.json()).success).toBe(true);
    });

    it('returns a generic 503 (no DB internals) and does NOT email when the DB insert fails', async () => {
        create.mockRejectedValue(new Error('connection to db.prisma.io failed'));
        const res = await POST(req(VALID));
        expect(res.status).toBe(503);
        const json = await res.json();
        expect(json.error).toBeTruthy();
        expect(json.error).not.toMatch(/prisma|db\.prisma|connection/i);
        expect(sendNotify).not.toHaveBeenCalled();
    });

    it('honeypot: pretends success and never stores or emails', async () => {
        const res = await POST(req({ ...VALID, company: 'i-am-a-bot' }));
        expect((await res.json()).success).toBe(true);
        expect(create).not.toHaveBeenCalled();
        expect(sendNotify).not.toHaveBeenCalled();
    });

    it('attempts the optional confirmation email (best-effort)', async () => {
        await POST(req(VALID));
        expect(sendConfirm).toHaveBeenCalledTimes(1);
    });

    it('does not leak the RESEND_API_KEY in the response', async () => {
        process.env.RESEND_API_KEY = 're_secret_should_not_leak';
        try {
            const res = await POST(req(VALID));
            const text = JSON.stringify(await res.json());
            expect(text).not.toContain('re_secret_should_not_leak');
        } finally {
            delete process.env.RESEND_API_KEY;
        }
    });

    it('rejects an invalid email before storing', async () => {
        const res = await POST(req({ ...VALID, email: 'not-an-email' }));
        expect(res.status).toBe(400);
        expect(create).not.toHaveBeenCalled();
    });
});
