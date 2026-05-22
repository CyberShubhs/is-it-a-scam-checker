import { getDomain, getHostname, getSubdomain } from 'tldts';
import levenshtein from 'fast-levenshtein';

export interface UrlRiskResult {
    riskLevel: 'Low' | 'Medium' | 'High';
    flags: string[];
    scoreMultiplier: number; // 0 to 100 add-on
}

const HIGH_RISK_TLDS = ['xyz', 'top', 'click', 'info', 'icu', 'shop', 'club', 'live', 'online', 'vip'];
const BRANDS = [
    { name: 'commbank', domain: 'commbank.com.au' },
    { name: 'nab', domain: 'nab.com.au' },
    { name: 'anz', domain: 'anz.com.au' },
    { name: 'westpac', domain: 'westpac.com.au' },
    { name: 'ing', domain: 'ing.com.au' },
    { name: 'macquarie', domain: 'macquarie.com.au' },
    { name: 'mygov', domain: 'my.gov.au' },
    { name: 'ato', domain: 'ato.gov.au' },
    { name: 'servicesaustralia', domain: 'servicesaustralia.gov.au' },
    { name: 'vicroads', domain: 'vicroads.vic.gov.au' },
    { name: 'auspost', domain: 'auspost.com.au' },
    { name: 'microsoft', domain: 'microsoft.com' },
    { name: 'apple', domain: 'apple.com' },
    { name: 'google', domain: 'google.com' },
    { name: 'paypal', domain: 'paypal.com' },
    { name: 'facebook', domain: 'facebook.com' },
    { name: 'instagram', domain: 'instagram.com' },
    { name: 'whatsapp', domain: 'whatsapp.com' },
    { name: 'netflix', domain: 'netflix.com' }
];

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

    // 4. Branding impersonation
    //
    // (`brandDetected` was previously tracked here as a side flag; it is
    // unused downstream so removed.)

    for (const brand of BRANDS) {
        const strippedHostname = hostnameFn.replace(/[-.]/g, '');

        // 1. Exact match of brand inside stripped hostname
        const brandInHostname = strippedHostname.includes(brand.name);

        // 2. Fuzzy match of stripped hostname vs Brand Name (e.g. commbannk vs commbank)
        // This catches "co.m.bank" -> "combank" (dist 1 to commbank)
        let isFuzzyMatch = false;
        if (Math.abs(strippedHostname.length - brand.name.length) <= 2) {
            const dist = levenshtein.get(strippedHostname, brand.name);
            isFuzzyMatch = (dist <= 1) || (dist <= 2 && brand.name.length > 6);
        }

        if (brandInHostname || isFuzzyMatch) {
            // It matches a brand we know.
            // Is it the OFFICIAL domain?
            if (domainFn === brand.domain || domainFn.endsWith('.' + brand.domain)) {
                // If `domainFn` IS `brand.domain`, we are good.
                if (domainFn === brand.domain) {
                    return { riskLevel: 'Low', flags: ['Verified official website'], scoreMultiplier: -100 };
                }
            } else {
                // It contains the brand name, but the eTLD+1 is NOT the official brand domain.

                // Subdomain Impersonation: e.g. commbank.support.com
                if (subdomainFn.includes(brand.name)) {
                    flags.push(`Brand '${brand.name}' found in subdomain, but actual domain is different`);
                    riskLevel = 'High';
                    scoreMultiplier += 60;
                }
                // Dot-splitting/Typosquatting in Hostname
                else {
                    flags.push(`Hostname closely resembles '${brand.name}' but is hosted on '${domainFn}'`);
                    riskLevel = 'High';
                    scoreMultiplier += 60;
                }
            }
        } else {
            // Check Levenshtein distance on the *domain name part* (without TLD) against brand name
            // e.g. "commbannk.com" -> compare "commbannk" with "commbank"
            const domainNamePart = domainFn.split('.')[0];
            if (domainNamePart.length > 3 && brand.name.length > 3) {
                const dist = levenshtein.get(domainNamePart, brand.name);
                if (dist === 1 || (dist <= 2 && brand.name.length > 6)) {
                    flags.push(`Domain '${domainFn}' closely resembles '${brand.name}' (Typosquatting)`);
                    riskLevel = 'High';
                    scoreMultiplier += 60;
                }
            }
        }
    }

    return {
        riskLevel,
        flags: Array.from(new Set(flags)),
        scoreMultiplier
    };
}
