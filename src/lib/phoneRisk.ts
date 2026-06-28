/**
 * Lightweight, offline phone-number risk heuristics.
 *
 * This is intentionally conservative — it does NOT try to be a full numbering
 * plan validator. It flags the handful of structural tells that genuinely
 * matter for scam triage:
 *   - premium-rate ranges (US/CA 900-976, UK 09, AU 190x) that exist to bill
 *     the *caller* a high per-minute fee — a classic "call this number" trap;
 *   - implausible lengths (too short to be a real subscriber number, or longer
 *     than the E.164 maximum of 15 digits);
 *   - placeholder / obviously-spoofed runs (all one digit, or only one or two
 *     distinct digits).
 *
 * Community-report matching (handled separately by the scorer) covers "this
 * exact number was reported"; this module adds the structural layer on top.
 *
 * Input is the scorer's normalised phone string: `+<digits>` when a country
 * code was present, otherwise `<digits>`.
 */

export interface PhoneRiskResult {
    level: 'Low' | 'Medium';
    points: number;
    flags: string[];
}

/** Country codes we know how to strip to recover a roughly-national number. */
const KNOWN_CCS = ['1', '44', '61', '64', '91', '353', '49', '33', '971'];

function toNational(digits: string, hasPlus: boolean): { national: string; cc: string } {
    if (hasPlus) {
        for (const cc of KNOWN_CCS) {
            if (digits.startsWith(cc) && digits.length - cc.length >= 6) {
                return { national: digits.slice(cc.length), cc };
            }
        }
    }
    return { national: digits, cc: '' };
}

function isPremiumRate(digits: string, national: string, cc: string): boolean {
    return (
        /^1?900\d/.test(national) || // US/CA 900 premium area code
        /^09\d/.test(digits) || // UK national 09xx premium
        (cc === '44' && /^9\d/.test(national)) || // +44 9xx premium
        /^1?90[0-2]\d/.test(national) // AU 1900 / 1901 / 1902 premium
    );
}

function looksLikePlaceholder(digits: string): boolean {
    if (digits.length < 6) return false; // shortcodes handled elsewhere
    const distinct = new Set(digits.split('')).size;
    if (distinct <= 2) return true; // 0000000, 1212121, etc.
    if (/^(0123456789|1234567890|9876543210)/.test(digits)) return true;
    return false;
}

export function analyzePhoneRisk(normalised: string): PhoneRiskResult {
    const flags: string[] = [];
    let points = 0;

    const hasPlus = normalised.startsWith('+');
    const digits = normalised.replace(/\D/g, '');
    if (!digits) return { level: 'Low', points: 0, flags: [] };

    const { national, cc } = toNational(digits, hasPlus);

    if (isPremiumRate(digits, national, cc)) {
        points += 25;
        flags.push(
            'Premium-rate number — calling or texting it can charge you a high per-minute fee. A real bank or agency will not ask you to call a premium line.',
        );
    }

    // Length sanity. Shortcodes (4–6 digits) are common and legitimate, so we
    // only flag clearly-implausible lengths.
    if (digits.length > 0 && digits.length <= 3) {
        points += 10;
        flags.push('Phone number is too short to be a real subscriber number.');
    } else if (digits.length > 15) {
        points += 10;
        flags.push('Phone number is longer than any valid international number (15 digits max).');
    }

    if (looksLikePlaceholder(digits)) {
        points += 10;
        flags.push('Phone number looks like a placeholder or spoofed pattern (repeated or sequential digits).');
    }

    return { level: points >= 25 ? 'Medium' : 'Low', points, flags };
}
