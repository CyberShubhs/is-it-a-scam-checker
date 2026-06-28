import { describe, it, expect, beforeEach } from 'vitest';
import { getUrlIntel, scoreDomainAge, __clearUrlIntelCache } from './urlIntel';

beforeEach(() => __clearUrlIntelCache());

/** A fetch stub that routes by endpoint so no real network is touched. */
function makeFetch(opts: {
    safeBrowsingThreat?: string | null;
    registrationDate?: string | null;
    rdapStatus?: number;
    redirectTo?: string;
}): typeof fetch {
    return (async (input: string | URL | Request) => {
        const url = typeof input === 'string' ? input : input.toString();
        if (url.includes('safebrowsing.googleapis.com')) {
            const body = opts.safeBrowsingThreat
                ? { matches: [{ threatType: opts.safeBrowsingThreat }] }
                : {};
            return new Response(JSON.stringify(body), { status: 200 });
        }
        if (url.includes('rdap.org')) {
            if (opts.rdapStatus && opts.rdapStatus !== 200) {
                return new Response('not found', { status: opts.rdapStatus });
            }
            const events = opts.registrationDate
                ? { events: [{ eventAction: 'registration', eventDate: opts.registrationDate }] }
                : {};
            return new Response(JSON.stringify(events), { status: 200 });
        }
        if (opts.redirectTo) {
            return new Response(null, { status: 301, headers: { location: opts.redirectTo } });
        }
        return new Response(null, { status: 200 });
    }) as unknown as typeof fetch;
}

const old = new Date(Date.now() - 5 * 365 * 24 * 3600 * 1000).toISOString();
const fresh = new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString();

describe('scoreDomainAge', () => {
    it('scores brand-new domains highest', () => {
        expect(scoreDomainAge(3).level).toBe('High');
        expect(scoreDomainAge(3).points).toBeGreaterThanOrEqual(30);
    });
    it('scores month-old domains as Medium', () => {
        expect(scoreDomainAge(30).level).toBe('Medium');
    });
    it('does not penalise established domains or unknown age', () => {
        expect(scoreDomainAge(900).points).toBe(0);
        expect(scoreDomainAge(null).points).toBe(0);
    });
});

describe('getUrlIntel — Safe Browsing', () => {
    it('marks a Safe-Browsing phishing hit as High', async () => {
        const r = await getUrlIntel('https://evil-login.test/secure', {
            apiKey: 'test-key',
            useDbCache: false,
            fetchImpl: makeFetch({ safeBrowsingThreat: 'SOCIAL_ENGINEERING', registrationDate: old }),
        });
        expect(r.safeBrowsing).toBe('social_engineering');
        expect(r.riskLevel).toBe('High');
        expect(r.riskContribution).toBeGreaterThanOrEqual(60);
        expect(r.status).toBe('ok');
    });
});

describe('getUrlIntel — domain age', () => {
    it('flags a brand-new domain even without a Safe Browsing key', async () => {
        const r = await getUrlIntel('https://brand-new-shop.test', {
            apiKey: undefined,
            useDbCache: false,
            fetchImpl: makeFetch({ registrationDate: fresh }),
        });
        expect(r.safeBrowsing).toBeNull();
        expect(r.domainAgeDays).not.toBeNull();
        expect(r.riskContribution).toBeGreaterThan(0);
        expect(r.status).toBe('ok');
    });

    it('reports clean for an old domain with nothing else wrong', async () => {
        const r = await getUrlIntel('https://established.test', {
            apiKey: 'test-key',
            useDbCache: false,
            fetchImpl: makeFetch({ safeBrowsingThreat: null, registrationDate: old }),
        });
        expect(r.riskContribution).toBe(0);
        expect(r.status).toBe('clean');
        expect(r.riskLevel).toBe('Low');
    });
});

describe('getUrlIntel — robustness', () => {
    it('never throws on RDAP failure', async () => {
        const r = await getUrlIntel('https://whatever.test', {
            apiKey: undefined,
            useDbCache: false,
            fetchImpl: makeFetch({ rdapStatus: 500 }),
        });
        expect(r).toBeTruthy();
        expect(['clean', 'not-enabled', 'ok', 'error']).toContain(r.status);
    });
});
