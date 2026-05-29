/**
 * Sensitive-data scrubber.
 *
 * Used in two places:
 *   1. `notes` field on `/api/report` — scrubbed BEFORE the row is
 *      persisted, so the database never carries an OTP / card / password
 *      a reporter accidentally pasted in.
 *   2. Public-facing `notes` and `value_raw` rendering on `/reports*` —
 *      scrubbed again as a defence-in-depth pass so any legacy row that
 *      slipped through is also masked at display time.
 *
 * Rules are intentionally conservative: we'd rather over-redact than
 * leak. Categories covered:
 *   - email addresses
 *   - international + local phone numbers
 *   - 13–19 digit card numbers (with spaces / hyphens)
 *   - 3–4 digit CVV-like patterns adjacent to a "cvv" / "code" cue
 *   - 4–8 digit OTP / verification codes adjacent to "otp" / "code" cue
 *   - "password is …", "pin is …" patterns
 *   - common Australian TFN / Medicare and US SSN patterns
 *   - long base64-looking secrets (eyJ… JWTs)
 *
 * The replacements are deterministic ASCII so they survive the YAML +
 * markdown pipeline.
 */

const EMAIL_RE = /([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
// Match a leading "+" and 8–15 digits with optional separators, OR a
// 9–13 digit run with separators. Tight enough to avoid matching dates,
// loose enough to catch +61 4xx xxx xxx, (415) 555-0190, 0412 345 678.
const PHONE_RE =
    /(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?)\d{3,4}[\s.-]?\d{3,4}/g;
const CARD_RE = /\b(?:\d[ -]?){13,19}\b/g;
// CVV / OTP / verification-code regexes allow a connector word ("is", "was",
// "=", ":") between the label and the digits so natural phrasing like
// "the cvv is 123" or "OTP was 482911" is caught.
const CVV_RE =
    /\b(?:cvv|cvc|sec(?:urity)?\s+code)\b(?:\s+(?:is|was|=|:))?\s*\d{3,4}\b/gi;
const OTP_RE =
    /\b(?:otp|one[- ]?time\s+(?:code|password)|verification\s+code|2fa\s+code)\b(?:\s+(?:is|was|=|:))?\s*\d{4,8}\b/gi;
const PASSWORD_RE = /\b(?:password|passwd|pwd|pin)\s*(?:is|=|:)\s*\S+/gi;
const SSN_RE = /\b\d{3}[- ]?\d{2}[- ]?\d{4}\b/g; // US SSN shape
// AU TFN / Medicare shapes are only matched when explicitly labelled,
// because their digit signature otherwise collides with phone numbers
// and dates. The phone regex below catches anonymous 9-digit runs.
const TFN_RE = /\btfn\s*(?:is|=|:)?\s*\d{3}[- ]?\d{3}[- ]?\d{3}\b/gi;
const MEDICARE_RE =
    /\bmedicare\s*(?:#|number|is|=|:)?\s*\d{4}[- ]?\d{5}[- ]?\d(?:\/\d)?\b/gi;
const JWT_RE = /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g;

function maskEmail(local: string, domain: string): string {
    const head = local.slice(0, 1);
    return `${head}***@${domain.split('.').slice(-2).join('.')}`;
}

export interface RedactOptions {
    /**
     * When true, keep the last 3 digits of phone numbers and card numbers
     * so the reader can still recognise their own number. Reports rendered
     * publicly use `keepTail: false`.
     */
    keepTail?: boolean;
}

export function redactSensitive(input: string, options: RedactOptions = {}): string {
    if (!input) return input;
    let out = input;

    out = out.replace(JWT_RE, '[redacted-token]');
    out = out.replace(EMAIL_RE, (_match, local, domain) => maskEmail(local, domain));

    out = out.replace(CARD_RE, (match) => {
        const digits = match.replace(/\D/g, '');
        if (digits.length < 13) return match;
        return options.keepTail
            ? `[redacted-card-ending-${digits.slice(-3)}]`
            : '[redacted-card]';
    });

    out = out.replace(CVV_RE, '[redacted-cvv]');
    out = out.replace(OTP_RE, '[redacted-otp]');
    out = out.replace(PASSWORD_RE, '[redacted-credential]');
    out = out.replace(SSN_RE, '[redacted-ssn]');
    out = out.replace(TFN_RE, '[redacted-id]');
    out = out.replace(MEDICARE_RE, '[redacted-id]');

    // Phones — match AFTER the structured patterns above so SSN/TFN/Medicare
    // win their digit shapes first.
    out = out.replace(PHONE_RE, (match) => {
        const digits = match.replace(/\D/g, '');
        if (digits.length < 8) return match; // probably not a phone
        return options.keepTail
            ? `[redacted-phone-ending-${digits.slice(-3)}]`
            : '[redacted-phone]';
    });

    return out;
}

/**
 * Mask a single submitted report value for display on `/reports*`.
 * Distinct from the body-scrub above because the value field has a known
 * shape (one phone / email / URL per row) and the masking rule is exact:
 *   - email   →  j***@example.com
 *   - phone   →  +61 *** *** 123
 *   - URL     →  domain only, no path (paths can carry tokens)
 */
export function maskReportValue(type: string, val: string): string {
    if (!val) return '';
    const t = type.toLowerCase();
    if (t === 'email') {
        const [u, d] = val.split('@');
        if (!d) return `${val.slice(0, 2)}***`;
        return `${u.slice(0, 2)}***@${d}`;
    }
    if (t === 'phone' || t === 'sms' || t === 'whatsapp') {
        const digits = val.replace(/\D/g, '');
        if (digits.length < 4) return val;
        const tail = digits.slice(-3);
        const cc = val.startsWith('+') ? val.slice(0, Math.min(4, val.indexOf(' ') + 1)) || '+' : '';
        return `${cc}*** *** ${tail}`.trim();
    }
    if (t === 'url' || t === 'website' || t === 'domain') {
        try {
            const u = new URL(val.startsWith('http') ? val : `http://${val}`);
            // Show the registrable host only — drop path/query/hash, which
            // can carry tokens and personally identifiable parameters.
            return u.host;
        } catch {
            return val.slice(0, 60);
        }
    }
    return val.slice(0, 80);
}
