import type { Metadata } from 'next';
import Link from 'next/link';

const URL = 'https://scamchecker.app/privacy';

export const metadata: Metadata = {
    title: 'Privacy Policy: How We Protect Your Data | Scam Checker',
    description:
        'Privacy-first scam checker. Pasted content stays in your browser; community reports are masked and hashed; analytics requires consent. Engineering practice, not legal warranty.',
    alternates: { canonical: URL },
    openGraph: {
        title: 'Privacy Policy — Scam Checker',
        description:
            'Privacy-first by design. What we collect and what we deliberately do not collect.',
        url: URL,
    },
};

export default function PrivacyPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl prose prose-slate">
            <h1>Privacy Policy</h1>
            <p className="text-sm text-muted-foreground">
                Last updated: 2026-05-29.
            </p>

            <p>
                Scam Checker is a free, privacy-first tool. The checker
                analyses what you paste <strong>in your browser</strong>,
                not on our servers. The community-report database holds
                only masked values and salted hashes. This page is written
                in plain English; it is engineering practice, not legal
                advice.
            </p>

            <h2>1. What Scam Checker does</h2>
            <p>
                We help you decide whether a message, email, link, SMS,
                screenshot, or PDF you received is a scam. The analysis
                is local to your device. We also publish community-reported
                scams so other readers can search for the same value.
            </p>

            <h2>2. Data we collect</h2>
            <h3>2.1 Scam checker tool (/check and dedicated tool pages)</h3>
            <ul>
                <li>
                    Pasted text, URLs, screenshots, PDFs, etc. —{' '}
                    <strong>nothing is transmitted to our servers</strong>.
                    Analysis runs entirely in your browser via JavaScript.
                </li>
                <li>
                    File OCR (images, PDFs) is done with{' '}
                    <code>tesseract.js</code> and <code>pdfjs-dist</code>{' '}
                    in the browser. Files are never uploaded.
                </li>
            </ul>

            <h3>2.2 Community scam reports (/api/report)</h3>
            <ul>
                <li>
                    The <em>type</em> of scam (e.g. email, phone, URL).
                </li>
                <li>
                    The <em>value</em> (the scammer&apos;s phone, email,
                    or URL) — truncated to 500 characters, sensitive
                    patterns stripped by{' '}
                    <a
                        href="https://github.com/BeastBoyShubhz/is-it-a-scam-checker/blob/main/src/lib/redact.ts"
                        rel="noopener noreferrer"
                        target="_blank"
                    >
                        the server-side scrubber
                    </a>{' '}
                    before write, and masked at display time.
                </li>
                <li>
                    Optional <em>notes</em> — capped at 1000 characters and
                    scrubbed for OTPs, CVVs, card numbers, passwords, SSN /
                    TFN / Medicare numbers, and JWT-shaped tokens before
                    saving.
                </li>
                <li>
                    <strong>Salted SHA-256 hash</strong> of the request IP
                    address (NOT the raw IP). Used for rate-limit only.
                </li>
                <li>
                    MD5 hash of the User-Agent string (NOT the raw UA).
                    Opaque grouping signal for abuse defence.
                </li>
                <li>
                    Country code (2 letters) — coarse geo only.
                </li>
            </ul>

            <h3>2.3 Server logs (Vercel)</h3>
            <ul>
                <li>
                    Request-level metadata only: route, status code,
                    region, response time. <strong>No request bodies</strong>
                    are written to logs.
                </li>
            </ul>

            <h3>2.4 Analytics (opt-in only)</h3>
            <ul>
                <li>
                    Google Analytics 4 (<code>G-4NCNQMQVFB</code>) loads
                    only after explicit consent via the cookie banner.
                </li>
                <li>
                    Vercel Analytics counts page views. No event
                    parameters carry user content.
                </li>
                <li>
                    The allowed GA4 event parameters are listed in{' '}
                    <a
                        href="https://github.com/BeastBoyShubhz/is-it-a-scam-checker/blob/main/src/lib/analytics.ts"
                        rel="noopener noreferrer"
                        target="_blank"
                    >
                        <code>src/lib/analytics.ts</code>
                    </a>{' '}
                    in the repo. Anything outside the allowlist is dropped.
                </li>
                <li>
                    We never send the contents of your pasted text, URLs,
                    phone numbers, emails, OCR output, OTPs, card details,
                    or report notes to GA.
                </li>
            </ul>

            <h2>3. Data we deliberately do NOT collect</h2>
            <ul>
                <li>The text of pasted messages, emails, SMS, WhatsApp.</li>
                <li>Uploaded images / PDFs (bytes never leave your browser).</li>
                <li>Raw IP addresses (only a salted hash for rate-limit).</li>
                <li>Raw User-Agent strings (only an MD5 hash).</li>
                <li>Passwords, login credentials, OTPs, card numbers, CVVs.</li>
                <li>Newsletter / mailing-list sign-ups — we don&apos;t run one.</li>
                <li>Cross-site tracking pixels or advertising IDs.</li>
                <li>Browser fingerprinting techniques.</li>
            </ul>

            <h2>4. Cookies</h2>
            <p>
                Detail lives on the dedicated{' '}
                <Link href="/cookies">Cookie Policy</Link>. Summary:
            </p>
            <ul>
                <li>
                    <code>sc_consent</code> — first-party, lax SameSite,
                    6-month expiry. Stores your cookie-consent decision.
                </li>
                <li>
                    Google Analytics cookies (<code>_ga</code>,{' '}
                    <code>_ga_&lt;id&gt;</code>) — only after you accept.
                </li>
                <li>No advertising cookies. No tracking pixels.</li>
            </ul>

            <h2>5. AI &amp; third-party processors</h2>
            <ul>
                <li>
                    <strong>Vercel</strong> hosts the site and ships
                    request-level logs.
                </li>
                <li>
                    <strong>Prisma + Postgres</strong> stores the masked
                    community reports.
                </li>
                <li>
                    <strong>Google Analytics 4</strong> — consent-gated.
                </li>
                <li>
                    <strong>Gemini / Groq APIs</strong> are used only
                    inside the daily GitHub Action that generates blog
                    posts. They receive the FindQuestions topic prompt and
                    a pre-curated source ID list, never user data.
                </li>
            </ul>
            <p>
                We do not train any AI model on user submissions, and we
                do not sell or share data with advertisers.
            </p>

            <h2>6. Retention</h2>
            <ul>
                <li>
                    <strong>Reports</strong>: kept while still useful for
                    the community report database. A 24-month rolling
                    retention is on the engineering backlog (tracked in{' '}
                    <code>docs/privacy-data-map.md</code>).
                </li>
                <li>
                    <strong>Consent cookie</strong>: 6 months, then
                    re-prompt.
                </li>
                <li>
                    <strong>Analytics cookies</strong>: GA4 default (13
                    months).
                </li>
                <li>
                    <strong>Vercel logs</strong>: per Vercel plan default.
                </li>
            </ul>

            <h2>7. Your rights</h2>
            <p>
                Wherever you are, you can request:
            </p>
            <ul>
                <li>
                    A <strong>copy</strong> of any report tied to a value
                    that&apos;s yours.
                </li>
                <li>
                    <strong>Correction</strong> of inaccurate data.
                </li>
                <li>
                    <strong>Removal</strong> of a specific report.
                </li>
                <li>
                    Withdrawal of <strong>analytics consent</strong> at
                    any time via the cookie banner or{' '}
                    <Link href="/cookies">/cookies</Link>.
                </li>
            </ul>
            <p>
                Submit requests via the{' '}
                <Link href="/data-removal">data removal page</Link>. Some
                regions (EU/UK GDPR, California CCPA, Australian Privacy
                Principles) grant additional formal rights — we honour
                the substance of these requests in the same workflow.
            </p>

            <h2>8. Security</h2>
            <p>
                See the dedicated <Link href="/security">security page</Link>
                {' '}for the engineering details: defence-in-depth
                redaction, security headers, API hardening, and our
                <Link href="/responsible-disclosure">
                    {' '}
                    coordinated disclosure
                </Link>{' '}
                policy.
            </p>

            <h2>9. Children</h2>
            <p>
                Scam Checker is not directed to children under 13 (16 in
                some EU/UK contexts). If a parent or guardian believes a
                child&apos;s data was submitted, email{' '}
                <a href="mailto:privacy@scamchecker.app">
                    <code>privacy@scamchecker.app</code>
                </a>{' '}
                and we&apos;ll remove it on receipt.
            </p>

            <h2>10. Changes</h2>
            <p>
                We update this policy when our data practice changes.
                Material changes will be flagged on the homepage banner
                or via a new cookie-consent prompt where appropriate.
            </p>

            <h2>11. Contact</h2>
            <p>
                Privacy questions: <a href="mailto:privacy@scamchecker.app">
                    <code>privacy@scamchecker.app</code>
                </a>. Security: <Link href="/responsible-disclosure">
                    responsible disclosure
                </Link>. General contact:{' '}
                <Link href="/contact">contact page</Link>.
            </p>

            <p className="text-sm text-muted-foreground">
                This page is engineering practice and transparency,
                not a legal warranty. Specific regional requirements
                (GDPR, ePrivacy, CCPA, Australian Privacy Principles)
                require legal review before commercial scale-up.
            </p>
        </div>
    );
}
