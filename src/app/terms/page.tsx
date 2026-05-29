import type { Metadata } from 'next';
import Link from 'next/link';

const URL = 'https://scamchecker.app/terms';

export const metadata: Metadata = {
    title: 'Terms of Use | Scam Checker',
    description:
        'Plain-English terms for using Scam Checker. The tool is informational guidance, not a guarantee — and the community report form has specific acceptable-use rules.',
    alternates: { canonical: URL },
    openGraph: {
        title: 'Terms of Use — Scam Checker',
        description:
            'Informational tool, not legal/financial advice. Community report rules.',
        url: URL,
    },
};

export default function TermsPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl prose prose-slate">
            <h1>Terms of Use</h1>
            <p className="text-sm text-muted-foreground">
                Last updated: 2026-05-29.
            </p>

            <p>
                These terms cover the free Scam Checker website and tools
                at <code>scamchecker.app</code>. They are written in plain
                English. They are not legal advice. Using the site means
                you accept these terms.
            </p>

            <h2>1. What the tool is — and isn&apos;t</h2>
            <ul>
                <li>
                    Scam Checker provides <strong>informational
                    guidance</strong> about whether a message, email, or
                    link looks like a scam.
                </li>
                <li>
                    It is <strong>not</strong> legal advice, financial
                    advice, fraud-recovery advice, or a substitute for
                    contacting your bank, the police, or a cybercrime
                    reporting authority for serious cases.
                </li>
                <li>
                    Risk ratings are best-effort. They may miss a scam,
                    or flag something safe — see the{' '}
                    <Link href="/disclaimer">disclaimer</Link>.
                </li>
            </ul>

            <h2>2. Submitting community scam reports</h2>
            <ul>
                <li>
                    By submitting, you confirm the report is accurate to
                    the best of your knowledge.
                </li>
                <li>
                    <strong>
                        Do not include passwords, OTPs, card numbers,
                        private addresses, bank details, or personal
                        information.
                    </strong>{' '}
                    Reports are published publicly after masking. The
                    server scrubs common sensitive patterns before save
                    as a safety net — but please don&apos;t submit them
                    in the first place.
                </li>
                <li>
                    Reports may be moderated, redacted, removed, or
                    rejected at our discretion — including for spam,
                    abuse, defamation, harassment, off-topic content, or
                    accidental disclosure of private data.
                </li>
                <li>
                    Rate limit: 10 reports per hour per device. Bypass
                    attempts may result in a permanent block.
                </li>
            </ul>

            <h2>3. Acceptable use</h2>
            <ul>
                <li>
                    No automated mass scraping of the site or its API
                    routes without prior permission.
                </li>
                <li>
                    No attempts to bypass the rate limit, honeypot, or
                    other abuse controls.
                </li>
                <li>
                    No injecting HTML, JavaScript, or any other
                    executable content into report fields.
                </li>
                <li>
                    No using the site for harassment, defamation,
                    blackmail, or any unlawful purpose.
                </li>
                <li>
                    No reverse-engineering the site to exfiltrate other
                    users&apos; data. Good-faith security research is
                    welcome via{' '}
                    <Link href="/responsible-disclosure">
                        responsible disclosure
                    </Link>
                    .
                </li>
            </ul>

            <h2>4. Intellectual property</h2>
            <p>
                Scam Checker is open source. See the GitHub repository for
                the licence governing the code.
            </p>

            <h2>5. No guarantee of detection</h2>
            <p>
                We can&apos;t guarantee that every scam will be detected
                or that every legitimate message will be cleared.
                Scammers evolve constantly. Always cross-check serious
                claims with the agency or company they purport to be
                from.
            </p>

            <h2>6. Limitation of liability</h2>
            <p>
                Scam Checker is provided &quot;as is&quot;. To the extent
                permitted by law, we&apos;re not liable for direct,
                indirect, incidental, or consequential damages arising
                out of your use of the site or any decision you make
                based on its output. Specific regional consumer-protection
                laws may give you rights that can&apos;t be excluded by
                contract — those rights still apply.
            </p>

            <h2>7. Changes</h2>
            <p>
                We update these terms as the site changes. Material
                changes will be reflected in the &quot;Last updated&quot;
                date above.
            </p>

            <h2>8. Contact</h2>
            <p>
                Email <a href="mailto:hello@scamchecker.app"><code>hello@scamchecker.app</code></a>{' '}
                or use the <Link href="/contact">contact page</Link>.
            </p>
        </div>
    );
}
