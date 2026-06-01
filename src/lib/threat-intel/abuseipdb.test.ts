import { describe, it, expect, beforeEach } from 'vitest';
import {
    getIpReputation,
    scoreAbuseConfidence,
    __clearIpReputationCache,
} from './abuseipdb';

/** Build a fake `fetch` that returns a fixed AbuseIPDB-shaped JSON body. */
function mockFetch(data: Record<string, unknown>, status = 200) {
    const state = { calls: 0 };
    const impl = (async () => {
        state.calls++;
        return {
            ok: status >= 200 && status < 300,
            status,
            json: async () => ({ data }),
        } as unknown as Response;
    }) as unknown as typeof fetch & { state: { calls: number } };
    impl.state = state;
    return impl;
}

describe('scoreAbuseConfidence thresholds', () => {
    it('maps a >=80 score to a High-risk signal', () => {
        expect(scoreAbuseConfidence(82, 14)).toMatchObject({ riskLevel: 'High', status: 'ok' });
        expect(scoreAbuseConfidence(82, 14).riskContribution).toBe(50);
    });
    it('maps 50-79 to a high contribution, 20-49 to medium', () => {
        expect(scoreAbuseConfidence(60, 3).riskLevel).toBe('High');
        expect(scoreAbuseConfidence(35, 1).riskLevel).toBe('Medium');
    });
    it('treats a zero score / no reports as "no-reports", not safe', () => {
        expect(scoreAbuseConfidence(0, 0)).toMatchObject({ status: 'no-reports', riskContribution: 0 });
    });
});

describe('getIpReputation', () => {
    beforeEach(() => __clearIpReputationCache());

    it('does not crash and reports "not-enabled" when the API key is missing', async () => {
        const r = await getIpReputation('45.33.32.156', { apiKey: '', useDbCache: false });
        expect(r.status).toBe('not-enabled');
        expect(r.message).toMatch(/not enabled/i);
    });

    it('rejects an invalid IP before any network call', async () => {
        const fetchImpl = mockFetch({});
        const r = await getIpReputation('999.1.1.1', { apiKey: 'k', fetchImpl, useDbCache: false });
        expect(r.status).toBe('invalid');
        expect(fetchImpl.state.calls).toBe(0);
    });

    it('rejects a private IP before any network call', async () => {
        const fetchImpl = mockFetch({});
        const r = await getIpReputation('192.168.1.1', { apiKey: 'k', fetchImpl, useDbCache: false });
        expect(r.status).toBe('private');
        expect(fetchImpl.state.calls).toBe(0);
    });

    it('turns a high abuseConfidenceScore into a High-risk signal', async () => {
        const fetchImpl = mockFetch({
            abuseConfidenceScore: 82,
            totalReports: 14,
            countryCode: 'US',
            isp: 'Evil Hosting',
        });
        const r = await getIpReputation('45.33.32.156', { apiKey: 'k', fetchImpl, useDbCache: false });
        expect(r.status).toBe('ok');
        expect(r.riskLevel).toBe('High');
        expect(r.riskContribution).toBe(50);
        expect(r.message).toContain('82/100');
        expect(r.message).toContain('14 reports');
    });

    it('reuses the in-memory cache for repeat lookups of the same IP', async () => {
        const fetchImpl = mockFetch({ abuseConfidenceScore: 30, totalReports: 2 });
        const first = await getIpReputation('1.2.3.4', { apiKey: 'k', fetchImpl, useDbCache: false });
        const second = await getIpReputation('1.2.3.4', { apiKey: 'k', fetchImpl, useDbCache: false });
        expect(fetchImpl.state.calls).toBe(1); // second call served from cache
        expect(first.cached).toBe(false);
        expect(second.cached).toBe(true);
        expect(second.abuseConfidenceScore).toBe(30);
    });

    it('says "no recent reports" for a clean public IP without marking it safe', async () => {
        const fetchImpl = mockFetch({ abuseConfidenceScore: 0, totalReports: 0 });
        const r = await getIpReputation('9.9.9.9', { apiKey: 'k', fetchImpl, useDbCache: false });
        expect(r.status).toBe('no-reports');
        expect(r.message).toMatch(/no recent abuseipdb reports/i);
        expect(r.riskContribution).toBe(0);
    });

    it('degrades to "rate-limited" on HTTP 429', async () => {
        const fetchImpl = mockFetch({}, 429);
        const r = await getIpReputation('77.88.99.11', { apiKey: 'k', fetchImpl, useDbCache: false });
        expect(r.status).toBe('rate-limited');
        expect(r.message).toMatch(/temporarily unavailable/i);
    });
});
