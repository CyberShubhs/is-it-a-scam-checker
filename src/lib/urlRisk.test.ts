import { describe, it, expect } from 'vitest';
import { analyzeUrlRisk } from './urlRisk';

describe('analyzeUrlRisk — official brand domains are trusted', () => {
    const official = [
        'https://www.commbank.com.au',
        'https://netbank.commbank.com.au/login',
        'https://amazon.co.uk',
        'https://www.apple.com/shop',
        'https://paypal.com',
        'https://www.gov.uk/hmrc',
        'https://ing.com',
    ];
    for (const u of official) {
        it(`official: ${u}`, () => {
            const r = analyzeUrlRisk(u);
            expect(r.riskLevel).toBe('Low');
            expect(r.scoreMultiplier).toBeLessThanOrEqual(0);
        });
    }
});

describe('analyzeUrlRisk — ordinary domains are NOT flagged (no short-token FPs)', () => {
    const benign = [
        'https://startups.io',        // contains "ups" but is not UPS
        'https://branding.agency',    // contains "ing" but is not ING
        'https://pineapple.com',      // contains "apple" but is not Apple
        'https://shopping.com',       // contains "ing"/"shop"
        'https://github.com/login',   // /login path but otherwise clean
        'https://potato-farm.org',    // contains "ato" but is not the ATO
    ];
    for (const u of benign) {
        it(`benign: ${u}`, () => {
            const r = analyzeUrlRisk(u);
            expect(r.riskLevel).not.toBe('High');
        });
    }
});

describe('analyzeUrlRisk — brand impersonation is High', () => {
    const scams: [string, string][] = [
        ['http://commbank-secure.xyz', 'commbank'],
        ['http://commbannk.com', 'commbank typo'],
        ['http://my.gov.au.login-attempt.com', 'dot-split mygov'],
        ['http://ato-refund.com', 'ato'],
        ['http://usps-tracking-update.com', 'usps'],
        ['http://amazon-security-alert.com', 'amazon'],
        ['http://paypal.xyz', 'paypal on abuse TLD'],
    ];
    for (const [u, why] of scams) {
        it(`impersonation (${why}): ${u}`, () => {
            const r = analyzeUrlRisk(u);
            expect(r.riskLevel).toBe('High');
        });
    }
});

describe('analyzeUrlRisk — obfuscation & structural heuristics', () => {
    it('flags user@host credential embedding as High', () => {
        const r = analyzeUrlRisk('http://paypal.com@evil-login.com/');
        expect(r.riskLevel).toBe('High');
        expect(r.flags.some((f) => /user@host|credentials/i.test(f))).toBe(true);
    });

    it('flags punycode as High', () => {
        const r = analyzeUrlRisk('https://xn--pple-43d.com'); // homograph "apple"
        expect(r.riskLevel).toBe('High');
    });

    it('flags raw IP host as High', () => {
        const r = analyzeUrlRisk('http://203.0.113.5/login');
        expect(r.riskLevel).toBe('High');
    });

    it('flags a link shortener as Medium', () => {
        const r = analyzeUrlRisk('https://bit.ly/3abcXYZ');
        expect(r.riskLevel).toBe('Medium');
        expect(r.flags.some((f) => /shortener/i.test(f))).toBe(true);
    });

    it('flags a high-risk TLD but does not over-escalate it alone', () => {
        const r = analyzeUrlRisk('http://deals.cfd');
        expect(r.flags.some((f) => /high-risk TLD/i.test(f))).toBe(true);
        expect(r.riskLevel).not.toBe('High');
    });

    it('does NOT add a path-keyword penalty to an otherwise-clean site', () => {
        const r = analyzeUrlRisk('https://github.com/login');
        expect(r.flags.some((f) => /Sensitive-action keyword/i.test(f))).toBe(false);
    });
});
