import { describe, it, expect } from 'vitest';
import { analyzePhoneRisk } from './phoneRisk';

describe('analyzePhoneRisk — premium-rate numbers', () => {
    const premium = [
        '+19005551234', // US 900
        '09012345678', // UK 09 national
        '+449011222333', // UK +44 9xx
        '1900654321', // AU 1900
    ];
    for (const p of premium) {
        it(`premium: ${p}`, () => {
            const r = analyzePhoneRisk(p);
            expect(r.points).toBeGreaterThanOrEqual(25);
            expect(r.flags.some((f) => /premium-rate/i.test(f))).toBe(true);
        });
    }
});

describe('analyzePhoneRisk — ordinary numbers are not flagged', () => {
    const ok = [
        '+61412345678', // AU mobile
        '+14155551234', // US mobile
        '+447911123456', // UK mobile
        '+919876543210', // wait — this is sequential-ish; keep a clean one below
        '0298765432', // AU landline
    ];
    // Replace the sequential one to avoid the placeholder rule.
    const clean = ['+61412345678', '+14155551234', '+447911123456', '0298765432'];
    for (const p of clean) {
        it(`clean: ${p}`, () => {
            const r = analyzePhoneRisk(p);
            expect(r.points).toBe(0);
            expect(r.level).toBe('Low');
        });
    }
    void ok;
});

describe('analyzePhoneRisk — structural tells', () => {
    it('flags an implausibly long number', () => {
        const r = analyzePhoneRisk('+1234567890123456');
        expect(r.flags.some((f) => /longer than/i.test(f))).toBe(true);
    });

    it('flags a placeholder (repeated digits) number', () => {
        const r = analyzePhoneRisk('0000000000');
        expect(r.flags.some((f) => /placeholder|spoofed/i.test(f))).toBe(true);
    });

    it('returns clean for an empty/garbage value', () => {
        const r = analyzePhoneRisk('');
        expect(r.points).toBe(0);
    });
});
