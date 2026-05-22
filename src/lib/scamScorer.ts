
import { analyzeUrlRisk, UrlRiskResult } from './urlRisk';
import { extractUrls } from './textExtractUrls';

export type RiskLevel = 'Low' | 'Medium' | 'High';

export interface ScanSignal {
    id: string;
    label: string;
    points: number;
    explanation: string;
    matchedText?: string;
}

export interface ScamAnalysisResult {
    score: number;
    riskLevel: RiskLevel;
    signals: ScanSignal[];
    summary: string;
    detectedUrls?: { url: string; risk: UrlRiskResult }[];
}

const SIGNALS = [
    {
        id: 'cvv_request',
        label: 'CVV / Security Code Request',
        points: 60,
        pattern: /\b(cvv|cvc|security code|3 digit code|cvv2|cip)\b/i,
        explanation: "Asking for your card's security code is a massive red flag. legitimate companies never ask for this via text/email."
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
        label: 'Prize/Lottery Bait',
        points: 35,
        pattern: /\b(win|winner|won|\$\d+|prize|gift|free money|cash|reward)s?\b/i,
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

export async function calculateRiskScore(content: string): Promise<ScamAnalysisResult> {
    let score = 0;
    const caughtSignals: ScanSignal[] = [];
    const normalizedContent = content.toLowerCase();

    // 1. Evaluate Text Signals
    for (const sig of SIGNALS) {
        const match = content.match(sig.pattern);
        if (match) {
            score += sig.points;
            caughtSignals.push({
                id: sig.id,
                label: sig.label,
                points: sig.points,
                explanation: sig.explanation,
                matchedText: match[0]
            });
        }
    }

    // 2. URL Analysis
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
                matchedText: url
            });
        } else if (analysis.riskLevel === 'Medium') {
            score += 20;
        } else if (analysis.scoreMultiplier < 0) {
            // Official domain detected - reduce score?
            // Only if the message doesn't have other high risk signals (e.g. "verified bank" but asking for CVV is still bad)
            // But usually if it's the official domain, it's low risk.
            // score += analysis.scoreMultiplier; // This might be too aggressive if we simply subtract.
            // Let's rely on the URL logic's multiplier
        }
        score += analysis.scoreMultiplier;
    }

    // 2.5 Check Reputation (Server-side DB)
    try {
        const itemsToCheck = detectedUrlsRaw.map(u => ({ type: 'url', value: u }));
        // Also check if the content itself looks like a phone number?
        // Simple regex for phone:
        const phoneMatch = content.match(/^(\+?61|0)4\d{8}$/); // Aussie mobile
        if (phoneMatch) {
            itemsToCheck.push({ type: 'phone', value: phoneMatch[0] });
            itemsToCheck.push({ type: 'sms', value: phoneMatch[0] });
        }

        if (itemsToCheck.length > 0) {
            // Use absolute URL if possible? In client, relative is fine.
            // In server environment (tests), this might fail, which is expected (we mock or ignore).
            const res = await fetch('/api/check-reputation', {
                method: 'POST',
                body: JSON.stringify({ items: itemsToCheck }),
                headers: { 'Content-Type': 'application/json' }
            });

            if (res.ok) {
                const data = await res.json();
                const matches: { value: string; count: number }[] = data.results || [];

                for (const match of matches) {
                    if (match.count > 0) {
                        score += 40;
                        caughtSignals.push({
                            id: 'reported_scam',
                            label: 'Community Reported Scam',
                            points: 40,
                            explanation: `This has been reported ${match.count} times in the last 30 days.`
                        });

                        if (match.count > 5) {
                            score += 20; // High confidence boost
                        }
                    }
                }
            }
        }
    } catch (e) {
        // Ignore fetch errors (e.g. offline, build time, tests)
    }


    // 3. Hard Overrides & Combinations
    const hasPayment = caughtSignals.some(s => s.id === 'suspicious_payment' || s.id === 'card_details' || s.id === 'cvv_request');
    const hasPrize = caughtSignals.some(s => s.id === 'prize_bait');
    const hasUrgency = caughtSignals.some(s => s.id === 'urgency');
    const hasVerification = caughtSignals.some(s => s.id === 'verification_bait');

    // CVV Request is almost always a scam
    if (caughtSignals.some(s => s.id === 'cvv_request')) {
        score = Math.max(score, 85);
    }

    // "Urgent" + "Verify"
    if (hasUrgency && hasVerification) {
        score += 20;
    }

    // 4. Cap Score
    score = Math.max(0, Math.min(100, score));

    // 5. Determine Level
    let riskLevel: RiskLevel = 'Low';
    if (score >= 60) riskLevel = 'High';
    else if (score >= 30) riskLevel = 'Medium';

    // 6. Generate Summary
    const summary = generateSummary(riskLevel, caughtSignals, detectedUrls);

    return {
        score,
        riskLevel,
        signals: caughtSignals,
        summary,
        detectedUrls
    };
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
            // E.g. "This link looks like it's pretending to be a bank because the brand name appears in the subdomain..."
            // We can use the flags from the URL analysis
            if (riskyUrl.risk.flags.length > 0) {
                return `High Risk: ${riskyUrl.risk.flags[0]}.`;
            }
        }
    }

    return `This looks ${level} Risk because ${reasonText.toLowerCase()}`;
}
