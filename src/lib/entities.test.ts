import { describe, it, expect } from 'vitest';
import {
    checkIp,
    isValidPublicIp,
    hostnameOf,
    registrableDomainOf,
    normalisePhone,
    extractEntities,
} from './entities';

describe('IP validation (checkIp / isValidPublicIp)', () => {
    it('accepts public IPv4', () => {
        expect(checkIp('45.33.32.156')).toEqual({ ok: true, version: 4 });
        expect(isValidPublicIp('8.8.8.8')).toBe(true);
    });

    it('rejects the required private IPv4 ranges', () => {
        for (const ip of ['127.0.0.1', '10.1.2.3', '172.16.5.5', '172.31.255.1', '192.168.0.1']) {
            expect(checkIp(ip)).toEqual({ ok: false, reason: 'private' });
        }
    });

    it('rejects other reserved IPv4 ranges (CGNAT, link-local, multicast)', () => {
        for (const ip of ['100.64.0.1', '169.254.1.1', '224.0.0.1', '0.0.0.0']) {
            expect(checkIp(ip).ok).toBe(false);
        }
    });

    it('rejects malformed IPv4', () => {
        expect(checkIp('999.1.1.1')).toEqual({ ok: false, reason: 'invalid' });
        expect(checkIp('1.2.3')).toEqual({ ok: false, reason: 'invalid' });
        expect(checkIp('not-an-ip')).toEqual({ ok: false, reason: 'invalid' });
    });

    it('accepts public IPv6 and rejects reserved IPv6', () => {
        expect(checkIp('2001:4860:4860::8888')).toEqual({ ok: true, version: 6 });
        expect(checkIp('::1')).toEqual({ ok: false, reason: 'private' }); // loopback
        expect(checkIp('::')).toEqual({ ok: false, reason: 'private' }); // unspecified
        expect(checkIp('fc00::1').ok).toBe(false); // unique-local fc00::/7
        expect(checkIp('fd12:3456::1').ok).toBe(false);
        expect(checkIp('fe80::1234').ok).toBe(false); // link-local fe80::/10
        expect(checkIp('ff02::1').ok).toBe(false); // multicast
    });
});

describe('normalisation helpers', () => {
    it('extracts hostname and registrable domain from a URL', () => {
        expect(hostnameOf('https://login.secure-bank.co/path')).toBe('login.secure-bank.co');
        expect(registrableDomainOf('https://login.secure-bank.co/path')).toBe('secure-bank.co');
    });

    it('adds a scheme for bare domains', () => {
        expect(hostnameOf('paypal.com')).toBe('paypal.com');
        expect(registrableDomainOf('foo.bar.example.co.uk')).toBe('example.co.uk');
    });

    it('normalises phones to digits, keeping a leading +', () => {
        expect(normalisePhone('+61 400 123 456')).toBe('+61400123456');
        expect(normalisePhone('(415) 555-0190')).toBe('4155550190');
    });
});

describe('extractEntities', () => {
    it('pulls a URL and its registrable domain out of a message', () => {
        const e = extractEntities('Login at http://commbank-secure.xyz/verify now');
        expect(e.urls).toHaveLength(1);
        expect(e.urls[0].registrableDomain).toBe('commbank-secure.xyz');
    });

    it('extracts an IP embedded in a URL', () => {
        const e = extractEntities('Open http://45.33.32.156/login to continue');
        expect(e.ips.map((i) => i.ip)).toContain('45.33.32.156');
    });

    it('extracts a bare public IP from a message', () => {
        const e = extractEntities('The server 8.8.8.8 sent this');
        expect(e.ips).toHaveLength(1);
        expect(e.ips[0]).toEqual({ ip: '8.8.8.8', version: 4 });
    });

    it('ignores private IPs', () => {
        const e = extractEntities('Internal host 192.168.1.1 and 10.0.0.5');
        expect(e.ips).toHaveLength(0);
    });

    it('extracts email + domain', () => {
        const e = extractEntities('Reply to support@fake-paypal.com immediately');
        expect(e.emails).toHaveLength(1);
        expect(e.emails[0].domain).toBe('fake-paypal.com');
    });

    it('extracts a phone number without mistaking the IP or domain', () => {
        const e = extractEntities('Call +61 400 123 456 about http://45.33.32.156');
        // Exactly one phone, and the IP is captured as an IP — not as a second phone.
        expect(e.phones).toHaveLength(1);
        expect(e.phones[0].normalised).toBe('+61400123456');
        expect(e.ips.map((i) => i.ip)).toEqual(['45.33.32.156']);
    });

    it('returns empty structures for empty input', () => {
        expect(extractEntities('')).toEqual({ urls: [], ips: [], emails: [], phones: [] });
    });
});
