/**
 * Entity extraction + normalisation.
 *
 * Pulls the concrete "things a scammer hides behind" out of free text:
 * URLs, IP addresses, email addresses and phone numbers. Everything here is
 * pure and isomorphic (no DOM, no network) so it runs identically in the
 * browser scanner, the server API routes, and unit tests.
 *
 * Why this exists:
 *   - The scam scorer needs the *registrable domain* and *hostname* of every
 *     link so it can match community reports precisely.
 *   - The IP-reputation feature needs valid, public IPs only (private/reserved
 *     ranges must never be sent to AbuseIPDB).
 *   - Document scanning needs to surface the same entities from extracted PDF/
 *     image text.
 *
 * Keeping the logic in one tested module means the browser, the server, and
 * the report-matcher can never drift apart on what counts as "the same" URL
 * or phone number.
 */

import { getDomain, getHostname } from 'tldts';
import { extractUrls } from './textExtractUrls';

export interface UrlEntity {
    /** The raw substring as it appeared in the text. */
    raw: string;
    /** Full host, e.g. `login.secure-bank.co`. Null if unparseable. */
    hostname: string | null;
    /** eTLD+1, e.g. `secure-bank.co`. Null if unparseable. */
    registrableDomain: string | null;
}

export interface IpEntity {
    /** The IP exactly as detected (already validated + public). */
    ip: string;
    version: 4 | 6;
}

export interface EmailEntity {
    raw: string;
    /** Lower-cased full address. */
    email: string;
    /** Lower-cased domain part. */
    domain: string;
}

export interface PhoneEntity {
    raw: string;
    /** Digits only (loose E.164 — leading country code preserved if `+`). */
    normalised: string;
}

export interface ExtractedEntities {
    urls: UrlEntity[];
    ips: IpEntity[];
    emails: EmailEntity[];
    phones: PhoneEntity[];
}

// ── IP validation ──────────────────────────────────────────────────────────

export type IpCheck =
    | { ok: true; version: 4 | 6 }
    | { ok: false; reason: 'invalid' | 'private' };

/** Parse a dotted-quad into its four octets, or null if malformed. */
function parseIpv4(ip: string): number[] | null {
    const m = ip.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (!m) return null;
    const octets = [m[1], m[2], m[3], m[4]].map((d) => Number(d));
    if (octets.some((o) => o < 0 || o > 255)) return null;
    return octets;
}

/**
 * True for any IPv4 we must NOT send to a public reputation API: the RFC1918
 * private blocks the spec calls out (10/8, 172.16/12, 192.168/16, 127/8) plus
 * the other non-routable ranges (this-network, CGNAT, link-local, multicast,
 * reserved, broadcast) for defence in depth.
 */
function isPrivateIpv4(o: number[]): boolean {
    const [a, b] = o;
    if (a === 0) return true; // 0.0.0.0/8  "this network"
    if (a === 10) return true; // 10.0.0.0/8 private
    if (a === 127) return true; // 127.0.0.0/8 loopback
    if (a === 100 && b >= 64 && b <= 127) return true; // 100.64.0.0/10 CGNAT
    if (a === 169 && b === 254) return true; // 169.254.0.0/16 link-local
    if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12 private
    if (a === 192 && b === 168) return true; // 192.168.0.0/16 private
    if (a === 192 && b === 0 && o[2] === 0) return true; // 192.0.0.0/24
    if (a >= 224) return true; // 224/4 multicast, 240/4 reserved, 255.255.255.255
    return false;
}

/**
 * Expand any well-formed IPv6 string (including `::` compression and an
 * embedded trailing IPv4) into its eight 16-bit groups. Returns null for
 * anything malformed. Zone IDs (`%eth0`) are stripped before parsing.
 */
function expandIpv6(input: string): number[] | null {
    let s = input.trim().toLowerCase();
    const zone = s.indexOf('%');
    if (zone !== -1) s = s.slice(0, zone);
    if (!s.includes(':')) return null;

    // Translate a trailing dotted-quad (e.g. ::ffff:1.2.3.4) into two hextets.
    const lastColon = s.lastIndexOf(':');
    const tail = s.slice(lastColon + 1);
    if (tail.includes('.')) {
        const v4 = parseIpv4(tail);
        if (!v4) return null;
        const hi = ((v4[0] << 8) | v4[1]).toString(16);
        const lo = ((v4[2] << 8) | v4[3]).toString(16);
        s = s.slice(0, lastColon + 1) + hi + ':' + lo;
    }

    const halves = s.split('::');
    if (halves.length > 2) return null; // at most one '::' allowed

    const toNums = (segment: string): number[] | null => {
        if (segment === '') return [];
        const out: number[] = [];
        for (const g of segment.split(':')) {
            if (!/^[0-9a-f]{1,4}$/.test(g)) return null;
            out.push(parseInt(g, 16));
        }
        return out;
    };

    if (halves.length === 1) {
        const nums = toNums(halves[0]);
        return nums && nums.length === 8 ? nums : null;
    }

    const head = toNums(halves[0]);
    const back = toNums(halves[1]);
    if (!head || !back) return null;
    const missing = 8 - (head.length + back.length);
    if (missing < 1) return null; // '::' must stand in for ≥1 zero group
    return [...head, ...Array(missing).fill(0), ...back];
}

/** True for IPv6 we must never send externally (loopback, ULA, link-local…). */
function isPrivateIpv6(groups: number[]): boolean {
    const first = groups[0];
    const firstByte = first >> 8;
    const allZeroExceptLast = groups.slice(0, 7).every((g) => g === 0);
    if (allZeroExceptLast && (groups[7] === 0 || groups[7] === 1)) return true; // :: and ::1
    if (firstByte === 0xfc || firstByte === 0xfd) return true; // fc00::/7 unique-local
    if ((first >> 6) === 0x3fa) return true; // fe80::/10 link-local
    if (firstByte === 0xff) return true; // ff00::/8 multicast
    return false;
}

/**
 * Strict validation used before any external IP lookup. Returns the IP version
 * on success, or why it was rejected. Private/reserved ranges are reported as
 * `'private'` so callers can show "we don't scan internal addresses".
 */
export function checkIp(ip: string): IpCheck {
    const v4 = parseIpv4(ip);
    if (v4) {
        return isPrivateIpv4(v4) ? { ok: false, reason: 'private' } : { ok: true, version: 4 };
    }
    const v6 = expandIpv6(ip);
    if (v6) {
        return isPrivateIpv6(v6) ? { ok: false, reason: 'private' } : { ok: true, version: 6 };
    }
    return { ok: false, reason: 'invalid' };
}

/** Convenience predicate: a syntactically valid, publicly routable IP. */
export function isValidPublicIp(ip: string): boolean {
    return checkIp(ip).ok;
}

// ── Normalisation helpers ────────────────────────────────────────────────────

/** Lower-cased host for a URL/domain string, with a synthetic scheme if needed. */
export function hostnameOf(value: string): string | null {
    const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(value) ? value : `http://${value}`;
    const host = getHostname(withScheme);
    return host ? host.toLowerCase() : null;
}

/** eTLD+1 (registrable domain) for a URL/domain string. */
export function registrableDomainOf(value: string): string | null {
    const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(value) ? value : `http://${value}`;
    const dom = getDomain(withScheme);
    return dom ? dom.toLowerCase() : null;
}

/** Digits-only phone (keeps a leading country code; drops formatting). */
export function normalisePhone(value: string): string {
    const trimmed = value.trim();
    const hasPlus = trimmed.startsWith('+');
    const digits = trimmed.replace(/\D/g, '');
    return hasPlus ? `+${digits}` : digits;
}

// ── Extraction patterns ─────────────────────────────────────────────────────

const EMAIL_RE = /([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
const IPV4_RE = /\b\d{1,3}(?:\.\d{1,3}){3}\b/g;
// Candidate IPv6 tokens — anything that looks like hex groups joined by
// colons. Validated afterwards with expandIpv6, so false positives are cheap.
const IPV6_CANDIDATE_RE = /\[?[0-9A-Fa-f]{0,4}(?::[0-9A-Fa-f]{0,4}){2,7}\]?/g;
// Phone-shaped runs. Mirrors the tuned pattern in redact.ts: an optional
// country code, optional area code, then 6–8 grouped digits.
const PHONE_RE = /(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?)\d{3,4}[\s.-]?\d{3,4}/g;

function dedupe<T>(items: T[], key: (t: T) => string): T[] {
    const seen = new Set<string>();
    const out: T[] = [];
    for (const item of items) {
        const k = key(item);
        if (seen.has(k)) continue;
        seen.add(k);
        out.push(item);
    }
    return out;
}

/**
 * Extract and normalise every URL, public IP, email and phone number in a
 * block of text. The order of operations matters: URLs and emails are pulled
 * first and blanked out of a working copy so their embedded digits/dots can't
 * masquerade as phone numbers. IPs are read from the original text so that an
 * IP-host URL (`http://45.33.32.156/login`) still yields its IP for reputation
 * scoring.
 */
export function extractEntities(text: string): ExtractedEntities {
    if (!text) return { urls: [], ips: [], emails: [], phones: [] };

    // URLs (reuse the scorer's tuned extractor) → hostname + registrable domain.
    const urls: UrlEntity[] = extractUrls(text).map((raw) => ({
        raw,
        hostname: hostnameOf(raw),
        registrableDomain: registrableDomainOf(raw),
    }));

    // Emails.
    const emails: EmailEntity[] = [];
    for (const m of text.matchAll(EMAIL_RE)) {
        const email = m[0].toLowerCase().replace(/[.,;]+$/, '');
        const domain = m[2].toLowerCase().replace(/[.,;]+$/, '');
        emails.push({ raw: m[0], email, domain });
    }

    // IPs — IPv4 then IPv6 candidates, each strictly validated + de-private-ised.
    const ips: IpEntity[] = [];
    for (const m of text.matchAll(IPV4_RE)) {
        const check = checkIp(m[0]);
        if (check.ok) ips.push({ ip: m[0], version: 4 });
    }
    for (const m of text.matchAll(IPV6_CANDIDATE_RE)) {
        const candidate = m[0].replace(/^\[|\]$/g, '');
        if (!candidate.includes('::') && candidate.split(':').length !== 8) continue;
        const check = checkIp(candidate);
        if (check.ok && check.version === 6) ips.push({ ip: candidate, version: 6 });
    }

    // Phones — run against a residual copy with URLs/emails/IPs blanked so we
    // don't mistake a domain, IP or email-embedded number for a phone.
    let residual = text;
    for (const u of urls) residual = residual.split(u.raw).join(' ');
    for (const e of emails) residual = residual.split(e.raw).join(' ');
    for (const ip of ips) residual = residual.split(ip.ip).join(' ');
    const phones: PhoneEntity[] = [];
    for (const m of residual.matchAll(PHONE_RE)) {
        const normalised = normalisePhone(m[0]);
        const digitCount = normalised.replace(/\D/g, '').length;
        // 8–15 digits is the E.164 sweet spot; shorter is noise, longer is an
        // ID/account number rather than a dialable phone.
        if (digitCount < 8 || digitCount > 15) continue;
        phones.push({ raw: m[0].trim(), normalised });
    }

    return {
        urls: dedupe(urls, (u) => u.raw.toLowerCase()),
        ips: dedupe(ips, (i) => i.ip.toLowerCase()),
        emails: dedupe(emails, (e) => e.email),
        phones: dedupe(phones, (p) => p.normalised),
    };
}
