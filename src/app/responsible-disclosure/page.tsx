import type { Metadata } from 'next';
import Link from 'next/link';

const URL = 'https://scamchecker.app/responsible-disclosure';

export const metadata: Metadata = {
    title: 'Responsible Disclosure | Scam Checker',
    description:
        'Good-faith vulnerability reporting policy for Scam Checker. How to submit, what is in scope, what is out of scope, and what to expect back.',
    alternates: { canonical: URL },
    openGraph: {
        title: 'Responsible Disclosure — Scam Checker',
        description:
            'Good-faith vulnerability reporting policy and scope.',
        url: URL,
    },
};

export default function ResponsibleDisclosurePage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-3xl prose prose-slate">
            <h1>Responsible Disclosure</h1>
            <p className="text-sm text-muted-foreground">
                Last updated: 2026-05-29.
            </p>

            <p>
                Scam Checker welcomes good-faith security research. If you
                think you&apos;ve found a vulnerability, please email us
                <strong> before</strong> disclosing it publicly. We&apos;ll
                read every report and try to respond within a few business
                days.
            </p>

            <h2>How to report</h2>
            <ul>
                <li>
                    Email{' '}
                    <a href="mailto:security@scamchecker.app?subject=Security%20Vulnerability%20Report">
                        <code>security@scamchecker.app</code>
                    </a>
                </li>
                <li>
                    Include reproduction steps, the affected URL or API
                    route, and the impact.
                </li>
                <li>
                    Where useful, attach a minimal proof of concept. Do
                    NOT include real user data — synthetic test values
                    only.
                </li>
            </ul>

            <h2>In scope</h2>
            <ul>
                <li>
                    The Scam Checker production site at{' '}
                    <code>scamchecker.app</code> and all subpaths.
                </li>
                <li>
                    The public source code in{' '}
                    <a
                        href="https://github.com/BeastBoyShubhz/is-it-a-scam-checker"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        the GitHub repository
                    </a>
                    .
                </li>
            </ul>

            <h2>Rules of engagement</h2>
            <ul>
                <li>
                    <strong>No destructive testing.</strong> Don&apos;t
                    delete, modify, or exfiltrate data. Demonstrate
                    impact, then stop.
                </li>
                <li>
                    <strong>Don&apos;t access other users&apos; data.</strong>{' '}
                    If a bug allows it, prove the access exists on a
                    test account or with placeholder data, then report.
                </li>
                <li>
                    <strong>No automated mass scanning</strong> that
                    causes service degradation. The site runs on a small
                    Vercel project and a single database — please be
                    gentle with rate.
                </li>
                <li>
                    <strong>No social engineering</strong> of operators,
                    contributors, or third-party providers (Vercel,
                    GitHub, Google).
                </li>
                <li>
                    <strong>No physical attacks</strong> — we don&apos;t
                    own infrastructure for that to apply to anyway.
                </li>
                <li>
                    <strong>Give us reasonable time</strong> to remediate
                    before publishing details (typically 90 days, though
                    we&apos;ll work to be faster).
                </li>
            </ul>

            <h2>Out of scope</h2>
            <ul>
                <li>
                    Reports about third-party services (Vercel, GitHub,
                    Google Analytics, Prisma) — please report those to
                    the vendor.
                </li>
                <li>
                    Best-practice missing-header reports without a
                    concrete impact path.
                </li>
                <li>
                    Issues that require the victim to install hostile
                    browser extensions, or to be on a compromised device.
                </li>
                <li>
                    Self-XSS that requires the victim to paste payloads
                    into developer tools.
                </li>
                <li>
                    Volumetric DoS / DDoS demonstrations.
                </li>
            </ul>

            <h2>What you can expect back</h2>
            <ul>
                <li>
                    Acknowledgement of the report within a few business
                    days.
                </li>
                <li>
                    A triage decision (accepted / duplicate / out of
                    scope) with reasoning.
                </li>
                <li>
                    Where appropriate, public acknowledgement once the
                    issue is fixed (with your permission and preferred
                    handle).
                </li>
            </ul>

            <h2>Safe harbour</h2>
            <p>
                We treat good-faith research that follows the rules above
                as authorised. We won&apos;t pursue legal action,
                regulatory complaints, or platform reports against
                researchers who report vulnerabilities to us in this
                way. This is engineering practice, not legal warranty —
                see the <Link href="/disclaimer">disclaimer</Link> and{' '}
                <Link href="/terms">terms</Link>.
            </p>
        </div>
    );
}
