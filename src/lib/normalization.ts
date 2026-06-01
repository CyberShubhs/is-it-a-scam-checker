import { getDomain } from 'tldts';

export function normalizeScamValue(type: string, value: string): string {
    const v = value.trim().toLowerCase();

    if (type === 'url' || type === 'link') {
        // Extract domain (eTLD+1)
        try {
            // handle http prefix if missing for tldts? tldts handles it usually, but let's be safe
            const domain = getDomain(v);
            return domain || v;
        } catch (e) {
            return v;
        }
    }

    if (type === 'email') {
        // Return domain part
        const parts = v.split('@');
        return parts.length > 1 ? parts[1] : v;
    }

    if (type === 'ip') {
        // IPs are matched verbatim (lower-cased for IPv6 hex consistency).
        return v;
    }

    if (type === 'phone' || type === 'sms' || type === 'text') {
        // Remove non-digits
        // If it's a text body, we can't really normalize it to a single value easily unless we hash the content.
        // But for "Report Scam", usually we report the SENDER (phone/email).
        // If reporting text content, maybe we normalize by hashing? 
        // For now, let's just strip non-alphanumeric?
        // User prompt says: "value_normalised... phone: E.164... email: domain"

        // If the user pasted a message (text), we probably want to report the SENDER if known, OR just store the text hash?
        // The modal asks: Type: URL / Domain / Phone / Email.
        // So we strictly report identifiers.
        return v.replace(/\D/g, '');
    }

    return v;
}
