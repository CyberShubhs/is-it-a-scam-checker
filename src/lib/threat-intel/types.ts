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
