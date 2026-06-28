import { analyzeUrlRisk, UrlRiskResult } from './urlRisk';
import { extractUrls } from './textExtractUrls';
import { extractEntities, ExtractedEntities } from './entities';
import { analyzeDocument, DocumentMetadata } from './documentScan';
import { analyzePhoneRisk } from './phoneRisk';
import type { IpReputationResult, UrlReputationResult } from './threat-intel/types';

export type RiskLevel = 'Low' | 'Medium' | 'High';

/** Which section of "Why this result" a signal belongs to. */
export type SignalGroupId = 'content' | 'phone' | 'link' | 'document' | 'ip' | 'community';

export interface ScanSignal {
    id: string;
    label: string;
    points: number;
    explanation: string;
    matchedText?: string;
    /** Grouping for the "Why this result" UI. Defaults to 'content'. */
    group?: SignalGroupId;
}

/** A grouped bundle of signals for the "Why this result" panel. */
export interface SignalGroup {
    id: SignalGroupId;
    title: string;
    signals: ScanSignal[];
}

/** A community-report match surfaced under the scan result. */
export interface RelatedReportMatch {
    /** domain | hostname | ip | email | phone | url */
    entityType: string;
    /** Display value (already masked / registrable where appropriate). */
    value: string;
    /** Normalised grouping key (also the vote key). */
    groupKey: string;
    /** Total matching reports of any age. */
    count: number;
    /** Matching reports in the last 30 days (drives scoring). */
    count30d: number;
    lastReportedAt?: string | null;
    /** A few recent, already-masked examples. */
    examples: { value: string; type: string; timeAgo: string }[];
    /** Points this match contributes to the overall score. */
    riskContribution: number;
    /** "This was helpful" votes for this group. */
    helpfulCount: number;
    /** "I saw this too" votes for this group. */
    seenCount: number;
}

/**
 * Optional context for a scan. Backwards compatible: existing callers pass
 * only `content`. File scans pass document metadata so the scorer can fold in
 * document signals, embedded links and QR destinations.
 */
export interface ScamScanContext {
    source?: 'text' | 'url' | 'email' | 'image' | 'file';
    fileName?: string;
    fileType?: 'pdf' | 'docx' | 'txt' | 'image';
    /** Links from PDF annotations that may not be in the visible text. */
    embeddedLinks?: string[];
    /** URLs decoded from QR codes in the file. */
    qrUrls?: string[];
    metadata?: DocumentMetadata;
    ocrConfidence?: number | null;
}

export interface ScamAnalysisResult {
    score: number;
    riskLevel: RiskLevel;
    /** Flat list of every signal (content + link + document + ip + community). */
    signals: ScanSignal[];
    summary: string;
    detectedUrls?: { url: string; risk: UrlRiskResult }[];
    // ── Enrichment added 2026-06 (all additive) ──────────────────────────
    /** Signals grouped for the "Why this result" panel. */
    signalGroups?: SignalGroup[];
    /** Community reports matching the checked entities. */
    relatedReports?: RelatedReportMatch[];
    /** AbuseIPDB reputation for any public IPs found. */
    ipReputation?: IpReputationResult[];
    /** Live URL intelligence (Safe Browsing / domain age / shortener) per URL. */
    urlReputation?: UrlReputationResult[];
    /** Risk-specific "what to do next" advice lines. */
    whatToDoNext?: string[];
    /** Privacy-safe summary for the "copy" button (never the raw input). */
    safeSummary?: string;
    /** Plain-English list of what was scanned (file scans). */
    scannedItems?: string[];
    /** Entities found (urls/ips/emails/phones). */
    entities?: ExtractedEntities;
    /** Document metadata, when a file was scanned. */
    documentMeta?: DocumentMetadata;
    ocrConfidence?: number | null;
}

const SIGNALS = [
    {
        id: 'cvv_request',
        label: 'CVV / Security Code Request',
        points: 60,
        pattern: /\b(cvv|cvc|security code|3 digit code|cvv2|cip)\b/i,
        explanation: "Asking for your card's security code is a massive red flag. Legitimate companies never ask for this via text/email."
    },
    {
        id: 'otp_request',
        label: 'OTP / Verification Code Request',
        points: 60,
        pattern: /\b(otp|one.time.code|verification code|auth code|2fa code|security code)\b/i,
        explanation: "Scammers need these codes to bypass 2-factor authentication and hack your accounts."
    },
    {
        id: 'card_details',
        label: 'Credit Card Details Request',
        points: 50,
        pattern: /\b(card number|expiry date|card details|credit card|debit card)\b/i,
        explanation: "Asking for raw credit card info in a message is extremely high risk."
    },
    {
        id: 'login_creds',
        label: 'Login Credentials Request',
        points: 40, // Increased from 30
        pattern: /\b(password|login|sign in|netbank|client id|username|pin code)\b/i,
        explanation: "Phishing attacks aim to steal your password or banking login details."
    },
    {
        id: 'prize_bait',
        // Note: bare dollar amounts (e.g. a legitimate "$49.99 receipt") and the
        // standalone words "gift"/"cash" were removed in 2026-06 — they fired on
        // ordinary messages. We now require an actual prize/lottery hook word.
        label: 'Prize/Lottery Bait',
        points: 35,
        pattern: /\b(win|winner|won|prize|gift card|free money|lottery|jackpot|reward)s?\b/i,
        explanation: "Promises of money, prizes, or rewards are the most common hook used by scammers."
    },
    {
        id: 'suspicious_payment',
        label: 'Suspicious Payment Method',
        points: 45,
        pattern: /\b(crypto|bitcoin|usdt|gift card|wire transfer|payid|western union)\b/i,
        explanation: "Scammers often ask for untraceable payment methods like Gift Cards or Crypto."
    },
    {
        id: 'delivery_fee',
        label: 'Delivery / parcel fee bait',
        points: 35,
        // A parcel/delivery word near a "pay / release / held / outstanding"
        // word — the classic "pay a small fee to release your parcel" lure.
        pattern: /\b(parcel|package|delivery|shipment|customs|post(?:al)?)\b[\s\S]{0,40}\b(fee|pay|paid|release|redeliver|redelivery|held|pending|outstanding|unpaid)\b/i,
        explanation: "Fake 'pay a small fee to release your parcel' messages are one of the most common scams. Couriers do not collect fees this way."
    },
    {
        id: 'urgency',
        label: 'Urgency / Pressure',
        points: 20,
        pattern: /\b(urgent|now|today|final notice|limited time|act now|immediately|suspend|locked|expire)\b/i,
        explanation: "Creating a false sense of urgency is designed to make you act without thinking."
    },
    {
        id: 'verification_bait',
        label: 'Account Verification Bait',
        points: 30,
        pattern: /\b(verify|confirm|validate|mygov|ato|auspost|unusual activity|suspended|restriction)\b/i,
        explanation: "Scammers pretend to be trusted services (like MyGov or banks) to steal your login details."
    },
    {
        id: 'link_bait',
        label: 'Suspicious Link Request',
        points: 15,
        pattern: /\b(visit|click|tap|link|here|claim|cancel)\b/i,
        explanation: "Asking you to click a link is standard operating procedure for phishing attacks."
    }
];

/**
 * Signal IDs that are strong, specific evidence of a scam on their own — a
 * request for a card/CVV/OTP/login, an untraceable-payment ask, a parcel-fee
 * lure, a known-malicious link, a community report, or a flagged IP/URL.
 *
 * Generic phrasing alone (urgency, "verify", "click the link", a prize hook)
 * is NOT in this set. Section 6 uses it to stop a pile of common words from
 * reaching "High" without at least one of these — the main source of false
 * positives on legitimate appointment/bill/delivery messages.
 */
const STRONG_SIGNAL_IDS = new Set<string>([
    'cvv_request',
    'otp_request',
    'card_details',
    'login_creds',
    'suspicious_payment',
    'delivery_fee',
    'malicious_url',
    'doc_malicious_url',
    'doc_bank_details',
    'doc_crypto_wallet',
    'doc_credentials',
    'reported_scam',
    'ip_reputation',
    'url_blocklist',
    'url_reputation',
]);

/**
 * The most a scan can score when ONLY weak/generic signals fired — no strong
 * signal, no high-risk URL, no community report, no flagged IP. Keeps such
 * scans at "Medium" (advice: verify independently) instead of crying "High"
 * on ordinary wording.
 */
const WEAK_ONLY_MAX_SCORE = 45;

/**
 * Translate a 30-day community-report count into the points it adds, per the
 * product spec. Repeated reports are strong evidence, so the curve is steep.
 *   1-2 → +15,  3-5 → +30,  6+ → +50,  (10+ also forces a minimum level later)
 */
export function communityReportContribution(count30d: number): number {
    if (count30d >= 6) return 50;
    if (count30d >= 3) return 30;
    if (count30d >= 1) return 15;
    return 0;
}

/**
 * Core scam analysis. Backwards compatible — `context` is optional and only
 * used for file/document scans. Always async because it consults the
 * server-side reputation + IP-intel endpoint (which is gracefully skipped when
 * unavailable, e.g. in unit tests or offline).
 */
export async function calculateRiskScore(
    content: string,
    context: ScamScanContext = {},
): Promise<ScamAnalysisResult> {
    let score = 0;
    const caughtSignals: ScanSignal[] = [];

    // ── 1. Message / content text signals ────────────────────────────────
    for (const sig of SIGNALS) {
        const match = content.match(sig.pattern);
        if (match) {
            score += sig.points;
            caughtSignals.push({
                id: sig.id,
                label: sig.label,
                points: sig.points,
                explanation: sig.explanation,
                matchedText: match[0],
                group: 'content',
            });
        }
    }

    // ── 2. Link / domain analysis ────────────────────────────────────────
    const detectedUrlsRaw = extractUrls(content);
    const detectedUrls: { url: string; risk: UrlRiskResult }[] = [];

    for (const url of detectedUrlsRaw) {
        const analysis = analyzeUrlRisk(url);
        detectedUrls.push({ url, risk: analysis });

        if (analysis.riskLevel === 'High') {
            score += 50;
            caughtSignals.push({
                id: 'malicious_url',
                label: 'High Risk URL Detected',
                points: 50,
                explanation: `Referenced URL '${url}' signals: ${analysis.flags.join(', ')}`,
                matchedText: url,
                group: 'link',
            });
        } else if (analysis.riskLevel === 'Medium') {
            score += 20;
        }
        score += analysis.scoreMultiplier;
    }

    // ── 3. File / document signals (file scans only) ─────────────────────
    // Document parsing (OCR/PDF text) happens client-side before this call;
    // here we only analyse the already-extracted content into document
    // signals + entities. The raw text is never surfaced from this function.
    let documentEntities: ExtractedEntities | null = null;
    let documentMeta: DocumentMetadata | undefined;
    let scannedItems: string[] | undefined;
    if (context.source === 'file' || context.source === 'image') {
        const doc = analyzeDocument({
            fileName: context.fileName ?? '',
            fileType: context.fileType ?? (context.source === 'image' ? 'image' : 'pdf'),
            text: content,
            embeddedLinks: context.embeddedLinks,
            qrUrls: context.qrUrls,
            metadata: context.metadata,
            ocrConfidence: context.ocrConfidence,
        });
        for (const sig of doc.signals) {
            score += sig.points;
            caughtSignals.push(sig);
        }
        // Embedded links / QR destinations get the same URL-risk treatment as
        // links in the body, so a malicious QR/annotation affects the score.
        for (const u of doc.entities.urls) {
            if (detectedUrlsRaw.includes(u.raw)) continue;
            const analysis = analyzeUrlRisk(u.raw);
            detectedUrls.push({ url: u.raw, risk: analysis });
            if (analysis.riskLevel === 'High') {
                score += 50;
                caughtSignals.push({
                    id: 'doc_malicious_url',
                    label: 'High Risk link inside document',
                    points: 50,
                    explanation: `Link '${u.raw}' in the document signals: ${analysis.flags.join(', ')}`,
                    matchedText: u.raw,
                    group: 'document',
                });
            } else if (analysis.riskLevel === 'Medium') {
                score += 20;
            }
            score += analysis.scoreMultiplier;
        }
        documentEntities = doc.entities;
        documentMeta = doc.metadata;
        scannedItems = doc.scannedItems;
    }

    // ── 4. Community reports + external IP reputation ─────────────────────
    // We send only the *extracted entities* (domains, IPs, emails, phones) to
    // the server — never the raw pasted content or the file. The server matches
    // community reports and runs AbuseIPDB for any public IP. Failures here are
    // swallowed so scoring still completes (e.g. offline / unit tests).
    const entities = mergeEntities(extractEntities(content), documentEntities);
    let relatedReports: RelatedReportMatch[] = [];
    let ipReputation: IpReputationResult[] = [];
    let urlReputation: UrlReputationResult[] = [];
    try {
        const items = buildIntelItems(entities, detectedUrlsRaw);
        if (items.length > 0) {
            const res = await fetch('/api/check-reputation', {
                method: 'POST',
                body: JSON.stringify({ items }),
                headers: { 'Content-Type': 'application/json' },
            });
            if (res.ok) {
                const data = await res.json();
                relatedReports = Array.isArray(data.matches) ? data.matches : [];
                ipReputation = Array.isArray(data.ipReputation) ? data.ipReputation : [];
                urlReputation = Array.isArray(data.urlReputation) ? data.urlReputation : [];
            }
        }
    } catch {
        // Offline / build-time / test — continue with local scoring only.
    }

    // Fold community-report matches into the score + signals.
    let maxCount30d = 0;
    for (const match of relatedReports) {
        maxCount30d = Math.max(maxCount30d, match.count30d);
        const points = match.riskContribution || communityReportContribution(match.count30d);
        if (points > 0) {
            score += points;
            caughtSignals.push({
                id: 'reported_scam',
                label: 'Community-reported scam',
                points,
                explanation: `${match.value} has been reported ${match.count30d} time${match.count30d === 1 ? '' : 's'} in the last 30 days by the community.`,
                matchedText: match.value,
                group: 'community',
            });
        }
    }

    // Fold IP reputation into the score + signals.
    let ipForcesHigh = false;
    for (const rep of ipReputation) {
        if (rep.riskContribution > 0) {
            score += rep.riskContribution;
            caughtSignals.push({
                id: 'ip_reputation',
                label: 'Suspicious IP reputation',
                points: rep.riskContribution,
                explanation: rep.message,
                matchedText: rep.ip,
                group: 'ip',
            });
        }
        if ((rep.abuseConfidenceScore ?? 0) >= 80) ipForcesHigh = true;
    }

    // Fold live URL intelligence (Safe Browsing / domain age / shortener) into
    // the score + signals. A Safe Browsing blocklist hit forces High.
    let urlForcesHigh = false;
    for (const rep of urlReputation) {
        if (rep.riskContribution > 0) {
            score += rep.riskContribution;
            caughtSignals.push({
                id: rep.safeBrowsing ? 'url_blocklist' : 'url_reputation',
                label: rep.safeBrowsing ? 'Known malicious link (Safe Browsing)' : 'Live URL risk signal',
                points: rep.riskContribution,
                explanation: rep.message,
                matchedText: rep.url,
                group: 'link',
            });
        }
        if (rep.safeBrowsing) urlForcesHigh = true;
    }

    // Fold structural phone-number risk (premium-rate traps, implausible
    // lengths, placeholder/spoofed patterns) into the score + signals.
    for (const phone of entities.phones) {
        const phoneRisk = analyzePhoneRisk(phone.normalised);
        if (phoneRisk.points > 0) {
            score += phoneRisk.points;
            caughtSignals.push({
                id: 'phone_risk',
                label: 'Suspicious phone number',
                points: phoneRisk.points,
                explanation: phoneRisk.flags.join(' '),
                matchedText: phone.raw,
                group: 'phone',
            });
        }
    }

    // ── 5. Hard overrides & combinations ─────────────────────────────────
    const hasUrgency = caughtSignals.some((s) => s.id === 'urgency');
    const hasVerification = caughtSignals.some((s) => s.id === 'verification_bait');

    // CVV Request is almost always a scam.
    if (caughtSignals.some((s) => s.id === 'cvv_request')) {
        score = Math.max(score, 85);
    }
    // "Urgent" + "Verify".
    if (hasUrgency && hasVerification) {
        score += 20;
    }

    // ── 6. Weak-signal ceiling (false-positive guard) ────────────────────
    // If nothing strong fired — no card/credential/payment ask, no parcel-fee
    // lure, no high-risk URL, no community report, no flagged IP — then we only
    // saw generic wording. Cap the score so common phrases like "verify your
    // account today, click here" land at Medium ("verify independently")
    // rather than a confidence-eroding "High".
    const hasStrongSignal = caughtSignals.some(
        (s) => STRONG_SIGNAL_IDS.has(s.id) || s.points >= 40,
    );
    const hasHighRiskUrl = detectedUrls.some((u) => u.risk.riskLevel === 'High');
    const hasCommunityEvidence = maxCount30d > 0;
    const hasIpEvidence = ipReputation.some((r) => (r.riskContribution ?? 0) > 0);
    if (!hasStrongSignal && !hasHighRiskUrl && !hasCommunityEvidence && !hasIpEvidence) {
        score = Math.min(score, WEAK_ONLY_MAX_SCORE);
    }

    // ── 7. Cap score ─────────────────────────────────────────────────────
    score = Math.max(0, Math.min(100, score));

    // ── 8. Determine level (with community/IP minimum-level overrides) ───
    let riskLevel: RiskLevel = 'Low';
    if (score >= 60) riskLevel = 'High';
    else if (score >= 30) riskLevel = 'Medium';

    // Repeated community reports / high-confidence IPs / blocklisted URLs raise the floor.
    if (maxCount30d >= 10 || ipForcesHigh || urlForcesHigh) riskLevel = 'High';
    else if (maxCount30d >= 6 && riskLevel === 'Low') riskLevel = 'Medium';

    // ── 9. Build outputs ─────────────────────────────────────────────────
    const summary = generateSummary(riskLevel, caughtSignals, detectedUrls);
    const signalGroups = buildSignalGroups(caughtSignals);
    const whatToDoNext = buildWhatToDoNext(riskLevel, caughtSignals, relatedReports);
    const safeSummary = buildSafeSummary(riskLevel, score, signalGroups, relatedReports, ipReputation);

    return {
        score,
        riskLevel,
        signals: caughtSignals,
        summary,
        detectedUrls,
        signalGroups,
        relatedReports,
        ipReputation,
        urlReputation,
        whatToDoNext,
        safeSummary,
        scannedItems,
        entities,
        documentMeta,
        ocrConfidence: context.ocrConfidence ?? null,
    };
}

/** Merge two entity bundles (from message text and from a document). */
function mergeEntities(a: ExtractedEntities, b: ExtractedEntities | null): ExtractedEntities {
    if (!b) return a;
    const byKey = <T>(items: T[], key: (t: T) => string) => {
        const seen = new Set<string>();
        const out: T[] = [];
        for (const i of items) {
            const k = key(i);
            if (seen.has(k)) continue;
            seen.add(k);
            out.push(i);
        }
        return out;
    };
    return {
        urls: byKey([...a.urls, ...b.urls], (u) => u.raw.toLowerCase()),
        ips: byKey([...a.ips, ...b.ips], (i) => i.ip.toLowerCase()),
        emails: byKey([...a.emails, ...b.emails], (e) => e.email),
        phones: byKey([...a.phones, ...b.phones], (p) => p.normalised),
    };
}

/** Build the typed item list sent to /api/check-reputation. */
function buildIntelItems(
    entities: ExtractedEntities,
    detectedUrlsRaw: string[],
): { type: string; value: string }[] {
    const items: { type: string; value: string }[] = [];
    for (const url of detectedUrlsRaw) items.push({ type: 'url', value: url });
    for (const u of entities.urls) items.push({ type: 'url', value: u.raw });
    for (const ip of entities.ips) items.push({ type: 'ip', value: ip.ip });
    for (const e of entities.emails) items.push({ type: 'email', value: e.email });
    for (const p of entities.phones) items.push({ type: 'phone', value: p.normalised });
    // De-dupe by type+value.
    const seen = new Set<string>();
    return items.filter((i) => {
        const k = `${i.type}:${i.value.toLowerCase()}`;
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
    });
}

const GROUP_TITLES: Record<SignalGroupId, string> = {
    content: 'Message / content signals',
    phone: 'Phone number signals',
    link: 'Link / domain signals',
    document: 'File / document signals',
    ip: 'IP reputation signals',
    community: 'Community report signals',
};

const GROUP_ORDER: SignalGroupId[] = ['content', 'phone', 'link', 'document', 'ip', 'community'];

/** Group the flat signal list into the ordered "Why this result" sections. */
function buildSignalGroups(signals: ScanSignal[]): SignalGroup[] {
    const groups: SignalGroup[] = [];
    for (const id of GROUP_ORDER) {
        const groupSignals = signals.filter((s) => (s.group ?? 'content') === id);
        if (groupSignals.length > 0) {
            groups.push({ id, title: GROUP_TITLES[id], signals: groupSignals });
        }
    }
    return groups;
}

/** Risk-specific, actionable next steps. */
function buildWhatToDoNext(
    level: RiskLevel,
    signals: ScanSignal[],
    related: RelatedReportMatch[],
): string[] {
    const steps: string[] = [];
    if (level === 'Low') {
        steps.push('Stay cautious and verify through official channels before acting.');
        steps.push('Never share passwords, PINs or one-time codes — no legitimate service asks for them.');
    } else if (level === 'Medium') {
        steps.push('Do not click any links or send any information until you have verified this independently.');
        steps.push('Contact the company directly using a number or website you already trust — not the details in this message.');
    } else {
        steps.push('Do not pay, do not reply, and do not click any links.');
        steps.push('Block the sender and report it to your provider and local scam authority.');
        if (signals.some((s) => ['suspicious_payment', 'card_details', 'cvv_request', 'doc_bank_details', 'doc_crypto_wallet'].includes(s.id))) {
            steps.push('If you already shared payment or card details, contact your bank immediately to freeze the card or transfer.');
        }
        if (signals.some((s) => ['login_creds', 'otp_request', 'doc_credentials'].includes(s.id))) {
            steps.push('If you entered a password or code, change that password now and turn on two-factor authentication.');
        }
    }
    if (related.length > 0) {
        steps.push('This matches existing community reports — you can add your own report to help warn others.');
    }
    return steps;
}

/**
 * Privacy-safe summary for the "Copy result" button. Deliberately omits the
 * raw user input — it describes the verdict, signal categories and report
 * counts only, so a user can paste it to a friend or the bank without leaking
 * their own pasted message/card/codes.
 */
function buildSafeSummary(
    level: RiskLevel,
    score: number,
    groups: SignalGroup[],
    related: RelatedReportMatch[],
    ipReputation: IpReputationResult[],
): string {
    const lines: string[] = [];
    lines.push(`Scam check result: ${level} risk (score ${score}/100).`);
    if (groups.length > 0) {
        const groupSummary = groups
            .map((g) => `${g.title.toLowerCase()} (${g.signals.length})`)
            .join(', ');
        lines.push(`Signals detected: ${groupSummary}.`);
    } else {
        lines.push('No strong scam signals were detected, but this is not a guarantee of safety.');
    }
    if (related.length > 0) {
        const total = related.reduce((sum, r) => sum + r.count, 0);
        lines.push(`Community reports: ${total} matching report${total === 1 ? '' : 's'} found.`);
    }
    const flaggedIp = ipReputation.find((r) => (r.abuseConfidenceScore ?? 0) >= 20);
    if (flaggedIp) {
        lines.push(`IP reputation: AbuseIPDB score ${flaggedIp.abuseConfidenceScore}/100.`);
    }
    lines.push('Checked with Scam Checker — scamchecker.app/check');
    return lines.join('\n');
}

function generateSummary(level: RiskLevel, signals: ScanSignal[], urls: { url: string; risk: UrlRiskResult }[]): string {
    if (level === 'Low') {
        if (urls.some(u => u.risk.riskLevel === 'Low' && u.risk.scoreMultiplier < -50)) {
            return "This looks like a verified official website/message. However, never share passwords or codes.";
        }
        return "We didn't detect strong scam signals, but always stay vigilant.";
    }

    // Prioritize the "Reason"
    const highRiskSignals = signals.filter(s => s.points >= 40);
    const mainSignal = highRiskSignals.length > 0 ? highRiskSignals[0] : signals[0];

    const reasonText = mainSignal ? mainSignal.explanation : "Multiple suspicious patterns detected.";

    if (urls.some(u => u.risk.riskLevel === 'High')) {
        const riskyUrl = urls.find(u => u.risk.riskLevel === 'High');
        if (riskyUrl) {
            if (riskyUrl.risk.flags.length > 0) {
                return `High Risk: ${riskyUrl.risk.flags[0]}.`;
            }
        }
    }

    return `This looks ${level} Risk because ${reasonText.toLowerCase()}`;
}
