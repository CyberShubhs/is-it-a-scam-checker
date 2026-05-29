import type { Metadata } from 'next';
import Link from 'next/link';

const URL = 'https://scamchecker.app/security';

export const metadata: Metadata = {
    title: 'Security at Scam Checker | Privacy-First Design',
    description:
        'How Scam Checker is built privacy-first: client-side analysis, salted IP hashes, defence-in-depth redaction, security headers, and a coordinated disclosure process.',
    alternates: { canonical: URL },
    openGraph: {
        title: 'Security at Scam Checker',
        description:
            'Privacy-first design, redaction, security headers, coordinated disclosure.',
        url: URL,
    },
};

export default function SecurityPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-3xl prose prose-slate">
            <h1>Security at Scam Checker</h1>
            <p className="text-sm text-muted-foreground">
                Last updated: 2026-05-29.
            </p>

            <p>
                Scam Checker is open-source and built privacy-first. This page
                summarises the protections we apply, what we deliberately do
                <em> not</em> do, and how to report a vulnerability.
            </p>

            <h2>1. Privacy-first design</h2>
            <ul>
                <li>
                    Scam-check analysis runs <strong>in your browser</strong>.
                    The text you paste, the messages you screenshot, and the
                    PDFs you upload never leave your device.
                </li>
                <li>
                    Community scam reports persist only the masked value plus
                    a salted hash of the reporter&apos;s IP for rate-limit.
                    Raw IP addresses are never stored.
                </li>
                <li>
                    Public report rendering masks emails, phone numbers, and
                    URL paths so personally-identifiable details aren&apos;t
                    exposed. See the{' '}
                    <Link href="/privacy">privacy policy</Link> for the full
                    list.
                </li>
            </ul>

            <h2>2. Defence-in-depth redaction</h2>
            <p>
                The <code>/api/report</code> handler scrubs report bodies
                BEFORE the row hits the database. The public read path
                (<Link href="/reports">/reports</Link>) re-scrubs at display
                time so any legacy row also renders masked. Common patterns
                we redact: email addresses, phone numbers, 13–19-digit card
                numbers, CVV-shaped triples, OTP / 2FA codes, &quot;password
                is…&quot; phrases, US SSN-shape numbers, Australian TFN /
                Medicare-shape numbers, and JWT-like tokens.
            </p>

            <h2>3. Security headers</h2>
            <p>
                Every page served from <code>scamchecker.app</code> sends:
            </p>
            <ul>
                <li>
                    <code>Strict-Transport-Security</code> — HSTS with 2-year
                    max-age and <code>includeSubDomains</code>.
                </li>
                <li>
                    <code>Content-Security-Policy</code> — explicit allowlist
                    for script and style sources. Inline scripts are limited
                    to the JSON-LD and analytics-init blocks.
                </li>
                <li>
                    <code>X-Content-Type-Options: nosniff</code>.
                </li>
                <li>
                    <code>X-Frame-Options: DENY</code> + CSP{' '}
                    <code>frame-ancestors &apos;none&apos;</code> so we
                    can&apos;t be embedded in clickjacking frames.
                </li>
                <li>
                    <code>
                        Referrer-Policy: strict-origin-when-cross-origin
                    </code>
                    .
                </li>
                <li>
                    <code>
                        Permissions-Policy: camera=(), microphone=(),
                        geolocation=(), payment=(), usb=(),
                        accelerometer=(), gyroscope=()
                    </code>{' '}
                    — we don&apos;t use any of these.
                </li>
            </ul>

            <h2>4. API hardening</h2>
            <ul>
                <li>
                    Input length limits: <code>value</code> ≤ 500 chars,{' '}
                    <code>notes</code> ≤ 1000 chars, allowed <code>type</code>{' '}
                    enum enforced server-side.
                </li>
                <li>
                    Rate limit: 10 report submissions per hour per
                    salted-IP-hash. Beyond that the API returns 429.
                </li>
                <li>
                    Honeypot field on the submission form — bots that fill
                    hidden fields get a fake success and no database write.
                </li>
                <li>
                    All errors logged as the error <em>class</em> only — the
                    request body is never written to platform logs.
                </li>
            </ul>

            <h2>5. What we don&apos;t do</h2>
            <ul>
                <li>No advertising cookies, no retargeting pixels.</li>
                <li>No user accounts, no email/password storage.</li>
                <li>
                    No newsletter list. We don&apos;t collect emails to send
                    you anything.
                </li>
                <li>
                    No internal AI prompt is exposed in client HTML —{' '}
                    <code>scripts/check-seo-hygiene.mjs</code> enforces this
                    as part of CI.
                </li>
            </ul>

            <h2>6. Responsible disclosure</h2>
            <p>
                If you&apos;ve found a security issue, please report it via
                the <Link href="/responsible-disclosure">responsible
                disclosure page</Link>. We accept good-faith research that
                does not access other users&apos; data, does not damage
                service, and does not run destructive payloads.
            </p>

            <h2>7. Limitation</h2>
            <p>
                Scam Checker is a free privacy-first tool. We can&apos;t
                guarantee zero risk on a complex web platform — but we
                practise defence-in-depth, minimise data, and disclose
                what we collect openly. This page is engineering practice,
                not a legal warranty. See the{' '}
                <Link href="/disclaimer">disclaimer</Link> and{' '}
                <Link href="/terms">terms</Link>.
            </p>
        </div>
    );
}
