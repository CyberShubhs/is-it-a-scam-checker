import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { ReportLookup } from '@/components/ReportLookup';
import { TrustSection } from '@/components/TrustSection';

export const metadata: Metadata = pageMetadata({
    title: 'Scam Report Lookup: Search Reported Numbers, Sites & Emails',
    description:
        'Look up a phone number, website, email or IP in our community scam report database. See if it has been reported, how often, and when it was last flagged.',
    canonical: 'https://scamchecker.app/scam-report-lookup',
});

const TOOL_JSON_LD = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    '@id': 'https://scamchecker.app/scam-report-lookup#tool',
    name: 'Scam Report Lookup',
    url: 'https://scamchecker.app/scam-report-lookup',
    description:
        'Search the community scam report database for a specific phone number, website/domain, email address or IP. Shows match count, recency and masked examples.',
    applicationCategory: 'SecurityApplication',
    operatingSystem: 'Web',
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    inLanguage: 'en',
};

export default function ScamReportLookupPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(TOOL_JSON_LD) }} />

            <section className="bg-slate-50 py-12 md:py-20">
                <div className="container mx-auto px-4">
                    <div className="flex justify-center items-center gap-2 mb-6 text-sm text-slate-500">
                        <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-slate-900 font-medium">Scam Report Lookup</span>
                    </div>

                    <div className="text-center max-w-2xl mx-auto mb-8">
                        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-6">
                            Scam Report Lookup
                        </h1>
                        <p className="text-lg md:text-xl text-slate-600 mb-4">
                            Has this number, website, email or IP been reported as a scam? Search our community
                            report database to see how many times it has been flagged and when it was last
                            reported.
                        </p>
                        <p className="text-md text-slate-500">
                            Wondering &quot;<strong>have I been scammed?</strong>&quot; — start by looking up the
                            sender here, then open the{' '}
                            <Link href="/have-i-been-scammed" className="text-primary underline">have I been scammed checklist</Link>.
                        </p>
                    </div>

                    <div className="max-w-2xl mx-auto">
                        <ReportLookup />
                    </div>
                </div>
            </section>

            <TrustSection />

            <section className="py-16 bg-white">
                <div className="container mx-auto px-4 max-w-4xl">
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">
                        How the scam report lookup works
                    </h2>
                    <p className="text-slate-700 leading-relaxed mb-4">
                        Every day, people who receive scam texts, calls, emails and links report them here. The
                        lookup searches those community reports for the exact phone number, website domain,
                        email address or IP you enter. If others have flagged the same thing, you&apos;ll see
                        the total number of reports, how many landed in the last 30 days, and a few recent
                        (masked) examples.
                    </p>
                    <p className="text-slate-700 leading-relaxed mb-8">
                        Matching reports are a strong warning sign. But remember: scammers churn through numbers
                        and domains quickly, so a brand-new scam may not be listed yet. <strong>No match does
                        not mean it is safe.</strong> If anything else feels off, trust that instinct.
                    </p>

                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">
                        What you can look up
                    </h2>
                    <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-8">
                        <li><strong>Phone numbers</strong> — scam calls, missed-call &quot;wangiri&quot; numbers, fake delivery and bank SMS senders.</li>
                        <li><strong>Websites and domains</strong> — fake stores, phishing login pages, lookalike bank sites.</li>
                        <li><strong>Email addresses</strong> — phishing senders, fake invoices, business-email-compromise addresses.</li>
                        <li><strong>IP addresses</strong> — we also run a live AbuseIPDB reputation check for any IP you search.</li>
                    </ul>

                    <div className="grid md:grid-cols-2 gap-4 my-8">
                        <Link href="/check" className="block p-5 rounded-xl bg-slate-50 border border-slate-200 hover:border-primary hover:shadow-md transition-all">
                            <h3 className="font-semibold text-slate-900 mb-1">Have the full message?</h3>
                            <p className="text-slate-600 text-sm">Paste it into the scam checker — it extracts and checks every link, number and email automatically.</p>
                        </Link>
                        <Link href="/reports" className="block p-5 rounded-xl bg-slate-50 border border-slate-200 hover:border-primary hover:shadow-md transition-all">
                            <h3 className="font-semibold text-slate-900 mb-1">Browse all reports</h3>
                            <p className="text-slate-600 text-sm">See the latest community scam reports across websites, phone numbers, emails and crypto wallets.</p>
                        </Link>
                    </div>

                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">Frequently asked questions</h2>
                    <div className="space-y-4 my-6">
                        <details className="bg-white border border-slate-200 rounded-lg p-4">
                            <summary className="font-semibold cursor-pointer">I found a match — what should I do?</summary>
                            <p className="mt-2 text-slate-600">Do not engage. Don&apos;t click links, call back, or reply. Block the sender and, if you shared any details, open the <Link href="/have-i-been-scammed" className="text-primary underline">have I been scammed checklist</Link> right away.</p>
                        </details>
                        <details className="bg-white border border-slate-200 rounded-lg p-4">
                            <summary className="font-semibold cursor-pointer">There&apos;s no match — am I safe?</summary>
                            <p className="mt-2 text-slate-600">Not necessarily. New scams appear before anyone reports them. Run the full message through the <Link href="/check" className="text-primary underline">scam checker</Link> for a content-based risk analysis as well.</p>
                        </details>
                        <details className="bg-white border border-slate-200 rounded-lg p-4">
                            <summary className="font-semibold cursor-pointer">Can I add my own report?</summary>
                            <p className="mt-2 text-slate-600">Yes — and please do. Use the &quot;Report this scam&quot; button in the results to add it to the database. Reports are masked before they appear publicly, so your details stay private.</p>
                        </details>
                    </div>

                    <p className="text-slate-700 leading-relaxed">
                        Related tools: the full{' '}
                        <Link href="/check" className="text-primary underline">scam checker</Link>, the{' '}
                        <Link href="/check-scam-ip" className="text-primary underline">suspicious IP address checker</Link>, the{' '}
                        <Link href="/scam-phone-number-checker" className="text-primary underline">scam phone number checker</Link>, and the full{' '}
                        <Link href="/reports" className="text-primary underline">community scam report database</Link>.
                    </p>
                </div>
            </section>
        </div>
    );
}
