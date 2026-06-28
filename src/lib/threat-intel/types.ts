/**
 * Shared threat-intel types.
 *
 * Kept in their own module (no imports, no `prisma`, no `fetch`) so both the
 * server-only AbuseIPDB helper AND client code (the scam scorer, the result
 * UI) can reference the SAME `IpReputationResult` shape without the client
 * bundle ever importing server-only code. Import these as `import type`.
 */

export type IpReputationStatus =
    | 'ok' // a usable AbuseIPDB result (fresh or cached)
    | 'no-reports' // valid public IP but AbuseIPDB has nothing — NOT "safe"
    | 'invalid' // not a syntactically valid IP
    | 'private' // private/reserved IP — external check does not apply
    | 'not-enabled' // ABUSEIPDB_API_KEY is not configured
    | 'rate-limited' // AbuseIPDB (or our limiter) said slow down
    | 'error'; // network / parse / other failure

export interface IpReputationResult {
    status: IpReputationStatus;
    ip: string;
    abuseConfidenceScore?: number;
    totalReports?: number;
    countryCode?: string | null;
    usageType?: string | null;
    isp?: string | null;
    domain?: string | null;
    lastReportedAt?: string | null;
    /** Distilled risk band for the UI. 'Unknown' when we couldn't check. */
    riskLevel: 'Low' | 'Medium' | 'High' | 'Unknown';
    /** Points this signal contributes to the overall scam score. */
    riskContribution: number;
    /** Plain-English line shown to the user. */
    message: string;
    cached: boolean;
}

export type UrlReputationStatus =
    | 'ok' // checked and we have something to report (blocklist hit or young domain)
    | 'clean' // checked, nothing adverse found
    | 'not-enabled' // no Safe Browsing key AND nothing else worth reporting
    | 'error'; // network / parse / other failure

/** The Google Safe Browsing threat types we surface, mapped to plain words. */
export type SafeBrowsingThreat =
    | 'malware'
    | 'social_engineering' // phishing
    | 'unwanted_software'
    | 'potentially_harmful_application';

/**
 * Server-side URL intelligence for a single URL: a Safe Browsing verdict, the
 * registrable domain's age (via RDAP), and the resolved destination of a link
 * shortener. Shares the same "never throws, degrades to empty" contract as
 * IpReputationResult so the client scorer can always finish.
 */
export interface UrlReputationResult {
    status: UrlReputationStatus;
    /** The URL as submitted (already de-duped/normalised by the caller). */
    url: string;
    /** Where a shortener/redirect actually points, if we resolved it. */
    finalUrl?: string | null;
    /** Non-null when Google Safe Browsing matched a known-bad URL. */
    safeBrowsing?: SafeBrowsingThreat | null;
    /** Age of the registrable domain in days (RDAP). Null if unknown. */
    domainAgeDays?: number | null;
    /** Number of redirect hops followed when expanding a shortener. */
    redirects?: number;
    riskLevel: 'Low' | 'Medium' | 'High' | 'Unknown';
    /** Points this signal contributes to the overall scam score. */
    riskContribution: number;
    /** Plain-English line shown to the user. */
    message: string;
    cached: boolean;
}
