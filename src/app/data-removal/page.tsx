import type { Metadata } from 'next';
import Link from 'next/link';

const URL = 'https://scamchecker.app/data-removal';

export const metadata: Metadata = {
    title: 'Data Removal & Correction Requests | Scam Checker',
    description:
        'How to request removal, correction, or a copy of any data Scam Checker holds. We treat removal requests as a privacy right, not a favour.',
    alternates: { canonical: URL },
    openGraph: {
        title: 'Data Removal & Correction Requests — Scam Checker',
        description:
            'How to request removal, correction or a copy of any data we hold.',
        url: URL,
    },
};

export default function DataRemovalPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-3xl prose prose-slate">
            <h1>Data Removal &amp; Correction Requests</h1>
            <p className="text-sm text-muted-foreground">
                Last updated: 2026-05-29.
            </p>

            <p>
                Scam Checker doesn&apos;t require an account, doesn&apos;t
                store the content you paste into the checker, and only persists
                masked community scam reports plus a salted hash for
                rate-limit. If a public report mentions a value you recognise
                — or you want a copy of any data we hold — you can ask us to
                remove, correct, or export it.
            </p>

            <h2>What you can request</h2>
            <ul>
                <li>
                    <strong>Removal</strong> of a specific scam report from
                    the public listing.
                </li>
                <li>
                    <strong>Correction</strong> of a value, country, or note
                    that&apos;s wrong.
                </li>
                <li>
                    <strong>Copy</strong> of any report tied to a value
                    that&apos;s personally yours (so you can verify what we
                    hold).
                </li>
                <li>
                    <strong>
                        Removal of an upload, contact email, or anything else
                    </strong>{' '}
                    you sent us by other means.
                </li>
            </ul>

            <h2>How to ask</h2>
            <p>
                Email{' '}
                <a href="mailto:privacy@scamchecker.app?subject=Data%20Removal%20Request">
                    <code>privacy@scamchecker.app</code>
                </a>{' '}
                with:
            </p>
            <ol>
                <li>
                    The <strong>value</strong> or report ID you want
                    actioned (e.g. the masked email shown on{' '}
                    <Link href="/reports">/reports</Link>).
                </li>
                <li>
                    What you&apos;d like done (<em>removal</em>,{' '}
                    <em>correction</em>, or <em>copy</em>).
                </li>
                <li>
                    A short reason — useful context if you&apos;re
                    correcting something.
                </li>
                <li>
                    A contact email we can reply on (we&apos;ll only use it
                    for this request).
                </li>
            </ol>

            <h2>What we do with it</h2>
            <ul>
                <li>
                    Genuine removal / correction requests are typically
                    actioned within <strong>30 days</strong>.
                </li>
                <li>
                    We&apos;ll reply confirming what was done, or
                    explaining if we can&apos;t (e.g. a request to remove
                    every report about a known scam URL would defeat the
                    site&apos;s purpose and won&apos;t be honoured by
                    default).
                </li>
                <li>
                    Email content is held only as long as needed to
                    process the request and then deleted from the
                    operator&apos;s inbox.
                </li>
            </ul>

            <h2>Children&apos;s data</h2>
            <p>
                Scam Checker is not directed to children under 13 (16 in
                some EU/UK contexts). If you believe a child&apos;s data
                was submitted — by them or by someone else — please email
                the address above and we&apos;ll remove it on receipt
                without requiring further proof.
            </p>

            <h2>Related</h2>
            <ul>
                <li>
                    <Link href="/privacy">Privacy policy</Link> — what we
                    collect and don&apos;t collect.
                </li>
                <li>
                    <Link href="/cookies">Cookie policy</Link> — withdraw
                    analytics consent.
                </li>
                <li>
                    <Link href="/responsible-disclosure">
                        Responsible disclosure
                    </Link>{' '}
                    — if your &quot;removal&quot; request is actually a
                    security finding, please use this channel instead.
                </li>
            </ul>
        </div>
    );
}
