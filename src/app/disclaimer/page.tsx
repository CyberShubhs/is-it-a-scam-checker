import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import Link from 'next/link';

const URL = 'https://scamchecker.app/disclaimer';

export const metadata: Metadata = pageMetadata({
    title: "Disclaimer | Scam Checker",
    description: "Scam Checker is informational guidance, not certainty — it cannot recover funds, guarantee accuracy, or replace professional advice. Verify officially.",
    canonical: URL,
});

export default function DisclaimerPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl prose prose-slate">
            <h1>Disclaimer</h1>
            <p className="text-sm text-muted-foreground">
                Last updated: 2026-05-29.
            </p>

            <p className="text-lg">
                Scam Checker is automated guidance based on common scam
                patterns. <strong>It is not a guarantee of safety or
                danger.</strong> Use it alongside your own judgement — not
                instead of it.
            </p>

            <h2>Results are informational only</h2>
            <p>
                A Low / Medium / High risk rating is our best
                interpretation of the patterns in the content you pasted.
                It is not a verdict. It is not legal, financial, or
                cybersecurity advice.
            </p>

            <h2>When to escalate to a human</h2>
            <p>
                For anything with real consequences, contact:
            </p>
            <ul>
                <li>
                    Your <strong>bank or card issuer</strong> for
                    suspected unauthorised payments (use the number on
                    the back of your card, never one in the suspicious
                    message).
                </li>
                <li>
                    Your <strong>platform&apos;s support team</strong>{' '}
                    (Apple, Google, Microsoft, Meta, etc.) for account
                    takeover concerns.
                </li>
                <li>
                    <strong>Police or cybercrime authority</strong> in
                    your country — see{' '}
                    <Link href="/global-scam-reporting">
                        global scam reporting
                    </Link>
                    .
                </li>
                <li>
                    A <strong>legal professional</strong> for matters
                    that need legal advice.
                </li>
            </ul>

            <h2>False positives and false negatives</h2>
            <p>
                The checker may flag legitimate messages as suspicious or
                miss new / sophisticated scams. Always verify
                high-stakes claims through an independent channel —
                ideally one you went to first, not one the suspicious
                message gave you.
            </p>

            <h2>We can&apos;t recover funds</h2>
            <p>
                Scam Checker does not recover money, retrieve stolen
                accounts, or chase scammers. Anyone offering you a
                &quot;recovery service&quot; in our name is themselves a
                scam — please report it to us via the{' '}
                <Link href="/contact">contact page</Link>.
            </p>

            <h2>Third-party links</h2>
            <p>
                Links to external agencies (FTC, IC3, Action Fraud,
                Scamwatch, NCSC, CISA, Microsoft, Google, Apple, etc.)
                are provided as helpful jumping-off points. We are not
                responsible for content or privacy practices on those
                sites.
            </p>

            <h2>No warranty</h2>
            <p>
                Scam Checker is provided &quot;as is&quot; without
                warranty of any kind. To the extent permitted by law,
                we&apos;re not liable for damages or losses arising from
                your use of the tool or any decision you make based on
                its output. Specific regional consumer-protection rights
                that can&apos;t be excluded by contract still apply.
            </p>

            <h2>Related</h2>
            <ul>
                <li>
                    <Link href="/terms">Terms of use</Link>
                </li>
                <li>
                    <Link href="/privacy">Privacy policy</Link>
                </li>
                <li>
                    <Link href="/security">Security</Link> and{' '}
                    <Link href="/responsible-disclosure">
                        responsible disclosure
                    </Link>
                </li>
            </ul>
        </div>
    );
}
