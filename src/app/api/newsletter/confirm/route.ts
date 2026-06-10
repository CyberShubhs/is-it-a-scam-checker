import { NextResponse } from 'next/server';
import { rateLimit, clientRateKey } from '@/lib/scanRateLimit';
import { addConfirmedContact, verifyConfirmToken } from '@/lib/email/newsletter';

/**
 * Newsletter confirmation — step 2 of double opt-in.
 *
 * The user lands here from the signed link in their confirmation email. On a
 * valid, unexpired signature we add the address to the Resend audience and
 * redirect back to the landing page with a status flag. All failure modes
 * redirect with an error flag instead of rendering JSON, since the caller is
 * a human in a browser, not a script.
 */
export async function GET(req: Request) {
    const redirectTo = (flag: string) =>
        NextResponse.redirect(new URL(`/weekly-scam-alerts?${flag}`, req.url), 303);

    // Light limit: confirm links are clicked once or twice, never hammered.
    const key = clientRateKey(req, 'newsletter-confirm');
    const limit = rateLimit(key, 20, 15 * 60_000);
    if (!limit.allowed) return redirectTo('subscribe_error=rate-limited');

    const secret = process.env.NEWSLETTER_CONFIRM_SECRET;
    if (!secret) return redirectTo('subscribe_error=unavailable');

    const url = new URL(req.url);
    const verification = verifyConfirmToken(
        url.searchParams.get('email'),
        url.searchParams.get('exp'),
        url.searchParams.get('sig'),
        secret,
    );
    if (!verification.valid) {
        return redirectTo(
            verification.reason === 'expired'
                ? 'subscribe_error=expired'
                : 'subscribe_error=invalid',
        );
    }

    const added = await addConfirmedContact(verification.email);
    if (!added.ok) return redirectTo('subscribe_error=unavailable');

    return redirectTo('subscribed=1');
}
