import { describe, it, expect } from 'vitest';
import { calculateRiskScore } from './scamScorer';

/**
 * Labeled accuracy corpus for the scam scorer.
 *
 * The point of this file is to guard the 2026-06 false-positive recalibration:
 *   - LEGIT messages (ordinary appointment / delivery / receipt wording) must
 *     never be rated "High".
 *   - SCAM messages with a real strong signal (card/credential/payment/parcel
 *     fee / malicious link) must stay "High".
 *   - WEAK-only phishing-flavoured wording with no strong signal should land at
 *     "Medium" (advice: verify independently), not "High".
 *
 * Scores run fully offline — the /api/check-reputation fetch is swallowed in
 * the scorer, so community/IP contributions are absent here by design.
 */

const NOT_HIGH = (level: string) => level !== 'High';

describe('Scam scorer — legitimate messages must NOT be High', () => {
    const legit: string[] = [
        'Hi, your appointment with Dr. Lee is confirmed for tomorrow at 3pm. Reply YES to confirm.',
        'Your Amazon order has shipped and will arrive today. Track it in the app.',
        'Reminder: your electricity bill is due on June 30. Thanks for being a customer.',
        'Thanks for your purchase! Your $49.99 receipt is attached. Cash refunds available within 30 days.',
        'Team lunch is today at noon — please confirm if you can make it.',
        'Your package was delivered. We hope you enjoy your order!',
        'Newsletter: 5 tips to win at chess. Click here to read this week’s edition.',
    ];

    for (const msg of legit) {
        it(`legit: ${msg.slice(0, 48)}…`, async () => {
            const r = await calculateRiskScore(msg);
            expect(NOT_HIGH(r.riskLevel)).toBe(true);
        });
    }
});

describe('Scam scorer — weak generic phishing wording should be Medium, not High', () => {
    const weak: string[] = [
        'Please verify your details and click the link to update your account today.',
        'Urgent: confirm your information now to avoid your account being suspended.',
        'Action required: validate your account immediately by tapping the link below.',
    ];

    for (const msg of weak) {
        it(`weak→medium: ${msg.slice(0, 40)}…`, async () => {
            const r = await calculateRiskScore(msg);
            expect(r.riskLevel).toBe('Medium');
            expect(r.score).toBeLessThan(60);
        });
    }
});

describe('Scam scorer — real scams with a strong signal must be High', () => {
    const scams: string[] = [
        'URGENT: Your account is locked. Verify now at http://commbank-secure.xyz and enter your password and OTP.',
        'Your parcel is held. Pay the $2.99 release fee here: http://auspost-redelivery.top',
        'Send 500 USDT to this wallet to claim your crypto airdrop reward now.',
        'Give me your card number, expiry date and CVV to process the refund.',
        'Confirm your identity: enter your netbank client id and password to unlock your account.',
    ];

    for (const msg of scams) {
        it(`scam→high: ${msg.slice(0, 40)}…`, async () => {
            const r = await calculateRiskScore(msg);
            expect(r.riskLevel).toBe('High');
            expect(r.score).toBeGreaterThanOrEqual(60);
        });
    }
});

describe('Scam scorer — prize_bait no longer fires on bare dollar amounts', () => {
    it('a plain $ amount alone does not add prize bait', async () => {
        const r = await calculateRiskScore('Your refund of $250 has been processed to your account.');
        expect(r.signals.some((s) => s.id === 'prize_bait')).toBe(false);
        expect(NOT_HIGH(r.riskLevel)).toBe(true);
    });

    it('an actual lottery hook still fires prize bait', async () => {
        const r = await calculateRiskScore('Congratulations! You won the lottery jackpot — claim your prize now.');
        expect(r.signals.some((s) => s.id === 'prize_bait')).toBe(true);
    });
});
