import { describe, it, expect } from 'vitest';
import { redactSensitive, maskReportValue } from './redact';

describe('redactSensitive', () => {
    it('masks email addresses', () => {
        const out = redactSensitive('contact me at alice@example.com please');
        expect(out).not.toContain('alice@example.com');
        expect(out).toMatch(/a\*\*\*@example\.com/);
    });

    it('redacts 13-19 digit card numbers (with spaces)', () => {
        const out = redactSensitive('card 4242 4242 4242 4242 expires 12/27');
        expect(out).not.toMatch(/4242 4242/);
        expect(out).toContain('[redacted-card]');
    });

    it('redacts CVV-shaped values when labelled', () => {
        const out = redactSensitive('the cvv is 123');
        expect(out).toContain('[redacted-cvv]');
    });

    it('redacts OTP codes when labelled', () => {
        const out = redactSensitive('your OTP is 482911 — do not share');
        expect(out).toContain('[redacted-otp]');
    });

    it('redacts password / pin disclosure phrases', () => {
        const out = redactSensitive("my password is hunter2");
        expect(out).toContain('[redacted-credential]');
    });

    it('redacts US SSN shape', () => {
        const out = redactSensitive('ssn 123-45-6789 here');
        expect(out).toContain('[redacted-ssn]');
    });

    it('redacts Australian TFN when explicitly labelled', () => {
        const out = redactSensitive('TFN: 123 456 789 was sent');
        expect(out).toContain('[redacted-id]');
    });

    it('redacts JWT-looking tokens', () => {
        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIn0.signaturepartabcdef';
        const out = redactSensitive(`auth: ${token}`);
        expect(out).toContain('[redacted-token]');
        expect(out).not.toContain(token);
    });

    it('masks phone numbers with international format', () => {
        const out = redactSensitive('call +61 412 345 678 today');
        expect(out).not.toContain('+61 412 345 678');
        expect(out).toContain('[redacted-phone]');
    });

    it('preserves the surrounding sentence', () => {
        const out = redactSensitive('please contact alice@example.com about the case');
        expect(out).toContain('please contact');
        expect(out).toContain('about the case');
    });

    it('is a no-op on empty input', () => {
        expect(redactSensitive('')).toBe('');
    });
});

describe('maskReportValue', () => {
    it('masks email values for public display', () => {
        expect(maskReportValue('email', 'someone@example.com')).toBe(
            'so***@example.com',
        );
    });

    it('reduces URLs to their host only (paths can carry tokens)', () => {
        expect(
            maskReportValue('url', 'https://evil.example.com/path?session=secret'),
        ).toBe('evil.example.com');
    });

    it('masks phone numbers but keeps the last three digits', () => {
        const out = maskReportValue('phone', '+61 412 345 678');
        expect(out).toMatch(/\*\*\* 678$/);
    });

    it('falls back to a length-capped string for unknown types', () => {
        const out = maskReportValue('unknown', 'a'.repeat(120));
        expect(out.length).toBeLessThanOrEqual(80);
    });
});
