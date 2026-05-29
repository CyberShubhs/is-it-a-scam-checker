import type { Metadata } from 'next';
import Link from 'next/link';

const URL = 'https://scamchecker.app/cookies';

export const metadata: Metadata = {
    title: 'Cookie Policy | Scam Checker',
    description:
        'How Scam Checker uses cookies. Necessary cookies only by default. Analytics cookies require explicit consent — Reject is as easy as Accept.',
    alternates: { canonical: URL },
    openGraph: {
        title: 'Cookie Policy — Scam Checker',
        description:
            'Necessary cookies only by default. Analytics cookies require consent.',
        url: URL,
    },
};

export default function CookiesPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-3xl prose prose-slate">
            <h1>Cookie Policy</h1>
            <p className="text-sm text-muted-foreground">
                Last updated: 2026-05-29.
            </p>

            <p>
                Scam Checker keeps cookie use to a minimum. Most of the site
                works without any cookies at all. This page lists what we set,
                what they do, and how to remove them.
            </p>

            <h2>1. Necessary cookies (always on)</h2>
            <ul>
                <li>
                    <strong>
                        <code>sc_consent</code>
                    </strong>{' '}
                    — stores your cookie-consent decision (granted / denied,
                    version, timestamp). First-party, lax SameSite,{' '}
                    <strong>6-month expiry</strong>. Removing this cookie
                    re-prompts you on next visit.
                </li>
            </ul>

            <h2>2. Analytics cookies (off until you consent)</h2>
            <p>
                If — and only if — you accept analytics, we load Google
                Analytics 4 (<code>G-4NCNQMQVFB</code>). GA sets the following
                first-party cookies:
            </p>
            <ul>
                <li>
                    <code>_ga</code>, <code>_ga_&lt;id&gt;</code> — distinguish
                    unique visitors. 13-month expiry by default.
                </li>
            </ul>
            <p>
                We never send the contents of your pasted messages, URLs,
                phone numbers, emails, OTPs, files, or report notes to GA. The
                allowed event parameters are listed in{' '}
                <a
                    href="https://github.com/BeastBoyShubhz/is-it-a-scam-checker/blob/main/src/lib/analytics.ts"
                    rel="noopener noreferrer"
                    target="_blank"
                >
                    <code>src/lib/analytics.ts</code>
                </a>{' '}
                in the open-source repo.
            </p>

            <h2>3. Withdrawing or changing consent</h2>
            <p>
                You can withdraw consent at any time:
            </p>
            <ul>
                <li>
                    Use the cookie banner&apos;s &quot;Manage preferences&quot;
                    button (visible on every page until you decide).
                </li>
                <li>
                    Clear the <code>sc_consent</code> cookie from your browser.
                    On next page load you&apos;ll be re-prompted.
                </li>
                <li>
                    If you previously granted consent, you can also{' '}
                    <strong>opt out via your browser&apos;s Google Analytics
                    opt-out</strong> add-on, or by adjusting browser
                    cookie permissions.
                </li>
            </ul>

            <h2>4. Cookies we do NOT set</h2>
            <ul>
                <li>No advertising / retargeting cookies.</li>
                <li>No cross-site tracking pixels.</li>
                <li>No social-network share-tracking cookies.</li>
                <li>No fingerprinting / canvas / WebRTC IP techniques.</li>
            </ul>

            <h2>5. Browser controls</h2>
            <p>
                You can also block or clear cookies at the browser level.
                Helpful links from major browser vendors:{' '}
                <a
                    href="https://support.google.com/chrome/answer/95647"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Chrome
                </a>
                ,{' '}
                <a
                    href="https://support.mozilla.org/en-US/kb/clear-cookies-and-site-data-firefox"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Firefox
                </a>
                ,{' '}
                <a
                    href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Safari
                </a>
                ,{' '}
                <a
                    href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Edge
                </a>
                .
            </p>

            <h2>6. Questions or rights</h2>
            <p>
                See the <Link href="/privacy">Privacy Policy</Link> for the
                broader data-protection statement, or the{' '}
                <Link href="/data-removal">data removal</Link> page if
                you&apos;d like a copy or deletion of any data tied to a value
                you recognise.
            </p>
        </div>
    );
}
