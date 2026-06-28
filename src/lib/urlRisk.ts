import { getDomain, getHostname, getSubdomain } from 'tldts';
import levenshtein from 'fast-levenshtein';

export interface UrlRiskResult {
    riskLevel: 'Low' | 'Medium' | 'High';
    flags: string[];
    scoreMultiplier: number; // 0 to 100 add-on
}

// TLDs disproportionately used for abuse (spam/phishing/malware) relative to
// their legitimate footprint. Deliberately EXCLUDES high-legit-use TLDs like
// .info / .shop / .online / .club that the old list flagged and that produced
// false positives. Includes the free Freenom set (tk/ml/ga/cf/gq) and the
// newer abuse-heavy gTLDs (cfd/sbs/rest/zip/mov) per industry abuse reports.
const HIGH_RISK_TLDS = [
    'xyz', 'top', 'click', 'icu', 'vip', 'cfd', 'sbs', 'rest',
    'gq', 'cf', 'tk', 'ml', 'ga', 'work', 'zip', 'mov',
];
/**
 * Brands scammers most commonly impersonate, with their official registrable
 * domain. `name` is the brand token we look for in a hostname. A domain is
 * treated as official when it is in this list OR its main label exactly equals
 * `name` (so `amazon.co.uk`, `apple.de` etc. are recognised without listing
 * every ccTLD). See `matchesBrandImpersonation`.
 */
const BRANDS: { name: string; domain: string }[] = [
    // Australia — banks & government
    { name: 'commbank', domain: 'commbank.com.au' },
    { name: 'netbank', domain: 'commbank.com.au' },
    { name: 'nab', domain: 'nab.com.au' },
    { name: 'anz', domain: 'anz.com.au' },
    { name: 'westpac', domain: 'westpac.com.au' },
    { name: 'bendigobank', domain: 'bendigobank.com.au' },
    { name: 'ing', domain: 'ing.com.au' },
    { name: 'ing', domain: 'ing.com' },
    { name: 'macquarie', domain: 'macquarie.com.au' },
    { name: 'mygov', domain: 'my.gov.au' },
    { name: 'ato', domain: 'ato.gov.au' },
    { name: 'servicesaustralia', domain: 'servicesaustralia.gov.au' },
    { name: 'vicroads', domain: 'vicroads.vic.gov.au' },
    { name: 'linkt', domain: 'linkt.com.au' },
    { name: 'auspost', domain: 'auspost.com.au' },
    // UK — banks, government & couriers
    { name: 'hmrc', domain: 'gov.uk' },
    { name: 'barclays', domain: 'barclays.co.uk' },
    { name: 'lloyds', domain: 'lloydsbank.com' },
    { name: 'halifax', domain: 'halifax.co.uk' },
    { name: 'natwest', domain: 'natwest.com' },
    { name: 'monzo', domain: 'monzo.com' },
    { name: 'revolut', domain: 'revolut.com' },
    { name: 'royalmail', domain: 'royalmail.com' },
    { name: 'evri', domain: 'evri.com' },
    { name: 'dpd', domain: 'dpd.co.uk' },
    // US — banks, government & couriers
    { name: 'chase', domain: 'chase.com' },
    { name: 'wellsfargo', domain: 'wellsfargo.com' },
    { name: 'bankofamerica', domain: 'bankofamerica.com' },
    { name: 'irs', domain: 'irs.gov' },
    { name: 'usps', domain: 'usps.com' },
    { name: 'fedex', domain: 'fedex.com' },
    { name: 'ups', domain: 'ups.com' },
    // Global — couriers, tech, retail & crypto
    { name: 'dhl', domain: 'dhl.com' },
    { name: 'microsoft', domain: 'microsoft.com' },
    { name: 'apple', domain: 'apple.com' },
    { name: 'google', domain: 'google.com' },
    { name: 'amazon', domain: 'amazon.com' },
    { name: 'ebay', domain: 'ebay.com' },
    { name: 'paypal', domain: 'paypal.com' },
    { name: 'facebook', domain: 'facebook.com' },
    { name: 'instagram', domain: 'instagram.com' },
    { name: 'whatsapp', domain: 'whatsapp.com' },
    { name: 'netflix', domain: 'netflix.com' },
    { name: 'coinbase', domain: 'coinbase.com' },
    { name: 'binance', domain: 'binance.com' },
    { name: 'metamask', domain: 'metamask.io' },
];

/** Link-shortener hosts whose true destination is hidden until resolved. */
const URL_SHORTENERS = new Set<string>([
    'bit.ly', 'bitly.com', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly', 'buff.ly',
    'is.gd', 'cutt.ly', 'rb.gy', 'rebrand.ly', 'shorturl.at', 't.ly', 'lnkd.in',
    'tiny.cc', 'soo.gd', 'clck.ru', 'shrtco.de', 'short.io', 'tr.im',
]);

/** Sensitive-action keywords that show up in phishing URL paths. */
const PHISHING_PATH_KEYWORDS =
    /\b(login|signin|sign-in|verify|secure|account|update|confirm|password|webscr|recover|unlock|wallet|billing)\b/i;

/**
 * Reputable public suffixes. Used so a brand on a ccTLD variant (amazon.co.uk,
 * apple.de) is recognised as official, while the SAME label on an abuse-prone
 * suffix (paypal.xyz) is NOT auto-trusted and falls through to impersonation.
 */
const TRUSTED_SUFFIXES = new Set<string>([
    'com', 'net', 'org', 'co', 'io', 'gov', 'edu',
    'co.uk', 'org.uk', 'gov.uk', 'ac.uk',
    'com.au', 'gov.au', 'org.au', 'net.au',
    'de', 'fr', 'it', 'es', 'nl', 'ca', 'co.nz', 'co.jp', 'ie', 'ch', 'se',
]);

/**
 * Decide whether `hostname`/`domain` is impersonating `brand` — boundary-aware
 * so it does NOT fire on real words that merely contain a short brand token
 * (e.g. "startups.io" ≠ UPS, "branding.com" ≠ ING, "pineapple.com" ≠ Apple).
 *
 * Returns one of: 'official' | 'impersonation' | null (no relation).
 */
function matchesBrandImpersonation(
    hostname: string,
    domain: string,
    subdomain: string,
    brand: { name: string; domain: string },
): 'official' | 'impersonation' | null {
    const name = brand.name;
    const mainLabel = domain.split('.')[0];
    const suffix = domain.split('.').slice(1).join('.');
    const brandMainLabel = brand.domain.split('.')[0];

    // Official: the exact registered domain (or a subdomain of it).
    if (domain === brand.domain || domain.endsWith('.' + brand.domain)) {
        return 'official';
    }
    // Official: same main label as the brand's own domain, on a reputable
    // suffix — covers ccTLD variants (amazon.co.uk, apple.de) WITHOUT trusting
    // the same label on an abuse-prone suffix (paypal.xyz). Only applies when
    // the brand token IS the brand domain's main label (so "mygov" → my.gov.au
    // does not accidentally bless mygov.com).
    if (name === brandMainLabel && mainLabel === name && TRUSTED_SUFFIXES.has(suffix)) {
        return 'official';
    }

    const labelTokens = mainLabel.split(/[-_]/).filter(Boolean); // "amazon-secure" → [amazon, secure]
    const subLabels = subdomain ? subdomain.split('.').filter(Boolean) : [];
    const subStripped = subLabels.join(''); // dot-split: "my.gov.au" → "mygovau"
    const stripped = hostname.replace(/[-._]/g, '');
    const thr = name.length > 6 ? 2 : 1;

    // Brand token appears at a real boundary (hyphen/dot label).
    if (labelTokens.includes(name) || subLabels.includes(name)) return 'impersonation';

    // Dot-splitting that reconstructs the brand across subdomain labels.
    if (name.length >= 5 && subStripped.includes(name)) return 'impersonation';

    // Typosquat of the registrable main label (e.g. "commbannk", "app1e").
    if (mainLabel.length > 3 && levenshtein.get(mainLabel, name) <= thr) return 'impersonation';

    // Longer brands: typo inside a hyphen token, or fuzzy of the whole stripped
    // hostname (catches "co.m.bank" → "combank" ≈ "commbank").
    if (name.length >= 5) {
        if (labelTokens.some((t) => Math.abs(t.length - name.length) <= 2 && levenshtein.get(t, name) <= thr)) {
            return 'impersonation';
        }
        if (Math.abs(stripped.length - name.length) <= 2 && levenshtein.get(stripped, name) <= thr) {
            return 'impersonation';
        }
    }

    return null;
}

export function analyzeUrlRisk(inputUrl: string): UrlRiskResult {
    let url = inputUrl.trim();
    if (!url.startsWith('http')) {
        url = 'https://' + url;
    }

    const flags: string[] = [];
    let riskLevel: 'Low' | 'Medium' | 'High' = 'Low';
    let scoreMultiplier = 0;

    let parsed;
    try {
        parsed = {
            hostname: getHostname(url),
            domain: getDomain(url),
            subdomain: getSubdomain(url),
            publicSuffix: getDomain(url)?.split('.').slice(1).join('.') // simplistic
        };
    } catch (e) {
        return { riskLevel: 'Medium', flags: ['Invalid URL format'], scoreMultiplier: 10 };
    }

    if (!parsed.hostname || !parsed.domain) {
        // Could be an IP address or localhost or invalid
        if (parsed.hostname && /^\d+\.\d+\.\d+\.\d+$/.test(parsed.hostname)) {
            return { riskLevel: 'High', flags: ['IP address matching used instead of domain'], scoreMultiplier: 50 };
        }
        return { riskLevel: 'Low', flags: [], scoreMultiplier: 0 };
    }

    const hostnameFn = parsed.hostname.toLowerCase();
    const domainFn = parsed.domain.toLowerCase();
    const subdomainFn = parsed.subdomain ? parsed.subdomain.toLowerCase() : '';

    // 1. Punycode
    if (hostnameFn.startsWith('xn--')) {
        flags.push('Detected Punycode (non-standard characters in domain)'); // Homograph attack signal
        riskLevel = 'High';
        scoreMultiplier += 50;
    }

    // 2. Suspicious TLD
    const tld = domainFn.split('.').pop();
    if (tld && HIGH_RISK_TLDS.includes(tld)) {
        flags.push(`Uses high-risk TLD (.${tld}) often associated with scams`);
        scoreMultiplier += 20;
    }

    // 3. Subdomain depth
    const parts = hostnameFn.split('.');
    if (parts.length >= 4) {
        scoreMultiplier += 10;
        flags.push('Excessive subdomains (often used to hide true domain)');
    }

    // 4. Branding impersonation (boundary-aware — see matchesBrandImpersonation)
    let brandImpersonated = false;
    for (const brand of BRANDS) {
        const verdict = matchesBrandImpersonation(hostnameFn, domainFn, subdomainFn, brand);
        if (verdict === 'official') {
            // A known brand on its real domain — strongly trusted, short-circuit.
            return { riskLevel: 'Low', flags: ['Verified official website'], scoreMultiplier: -100 };
        }
        if (verdict === 'impersonation' && !brandImpersonated) {
            flags.push(`Hostname imitates '${brand.name}' but is hosted on '${domainFn}', not the official site`);
            riskLevel = 'High';
            scoreMultiplier += 60;
            brandImpersonated = true; // count the impersonation penalty once
        }
    }

    // 5. Embedded credentials (user@host) — a classic link-obfuscation trick.
    const authority = url.replace(/^[a-z]+:\/\//i, '').split(/[/?#]/)[0];
    if (authority.includes('@')) {
        flags.push('URL embeds credentials before the host (user@host) — a common obfuscation trick');
        if (riskLevel !== 'High') riskLevel = 'High';
        scoreMultiplier += 50;
    }

    // 6. Link shortener — the true destination is hidden until it is resolved.
    if (URL_SHORTENERS.has(domainFn)) {
        flags.push('Link shortener hides the real destination — expand it before trusting it');
        if (riskLevel === 'Low') riskLevel = 'Medium';
        scoreMultiplier += 15;
    }

    // 7. Many hyphens in the registrable name (common in fake/lookalike sites).
    const mainLabel = domainFn.split('.')[0];
    if ((mainLabel.match(/-/g) || []).length >= 3) {
        flags.push('Domain name uses an unusual number of hyphens');
        scoreMultiplier += 10;
    }

    // 8. Unusually long hostname — often used to bury a lookalike or hide intent.
    if (hostnameFn.length > 30) {
        flags.push('Unusually long hostname');
        scoreMultiplier += 5;
    }

    // 9. Sensitive-action keyword in the path — only counts alongside another
    // suspicious signal, so ordinary sites with a /login page aren't flagged.
    let pathAndQuery = '';
    try {
        const u = new URL(url);
        pathAndQuery = `${u.pathname}${u.search}`.toLowerCase();
    } catch {
        pathAndQuery = '';
    }
    if (scoreMultiplier > 0 && PHISHING_PATH_KEYWORDS.test(pathAndQuery)) {
        flags.push('Sensitive-action keyword (login/verify/secure…) in the URL path');
        scoreMultiplier += 10;
    }

    // Promote to Medium if heuristics stacked up without a single High trigger.
    if (riskLevel === 'Low' && scoreMultiplier >= 30) {
        riskLevel = 'Medium';
    }

    return {
        riskLevel,
        flags: Array.from(new Set(flags)),
        scoreMultiplier,
    };
}
