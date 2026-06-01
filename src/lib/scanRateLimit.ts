/**
 * Lightweight in-memory rate limiter for the scan / report / IP-reputation
 * API routes.
 *
 * It is a fixed-window counter keyed by a hash of the caller's IP. On Fluid
 * Compute the counters live per warm instance rather than globally, so this is
 * a pragmatic burst-control layer (it blunts hammering and accidental loops),
 * not a hard distributed quota. It needs no external store, so it can never
 * become a new failure mode for the core scanner. For a strict global quota a
 * shared store (Vercel KV / Upstash) would be the next step.
 */

import crypto from 'crypto';

interface Bucket {
    count: number;
    resetAt: number;
}

const buckets = new Map<string, Bucket>();

// Opportunistic cleanup so the map can't grow without bound under churn.
function sweep(now: number) {
    if (buckets.size < 5000) return;
    for (const [key, b] of buckets) {
        if (b.resetAt <= now) buckets.delete(key);
    }
}

export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    /** Seconds until the window resets — surfaced as Retry-After. */
    retryAfterSeconds: number;
}

/**
 * Consume one token for `key`. Returns whether the call is allowed plus the
 * remaining budget and the reset delay.
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
    const now = Date.now();
    sweep(now);
    const existing = buckets.get(key);

    if (!existing || existing.resetAt <= now) {
        buckets.set(key, { count: 1, resetAt: now + windowMs });
        return { allowed: true, remaining: limit - 1, retryAfterSeconds: Math.ceil(windowMs / 1000) };
    }

    if (existing.count >= limit) {
        return {
            allowed: false,
            remaining: 0,
            retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
        };
    }

    existing.count += 1;
    return {
        allowed: true,
        remaining: limit - existing.count,
        retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000),
    };
}

/**
 * Derive a stable, privacy-preserving rate-limit key from a request. We hash
 * the forwarded IP with a per-deployment salt so the raw IP never sits in
 * memory or logs. A `scope` prefix keeps each endpoint's budget independent.
 */
export function clientRateKey(req: Request, scope: string): string {
    const ip =
        req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        req.headers.get('x-real-ip') ||
        '127.0.0.1';
    const hash = crypto
        .createHash('sha256')
        .update(ip + (process.env.IP_SALT || 'dev-only-salt'))
        .digest('hex')
        .slice(0, 32);
    return `${scope}:${hash}`;
}

/** Test helper — clears all rate-limit buckets between unit tests. */
export function __clearRateLimitBuckets(): void {
    buckets.clear();
}
