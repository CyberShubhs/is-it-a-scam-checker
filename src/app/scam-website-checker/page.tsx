import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { ScamChecker } from '@/components/ScamChecker';
import { TrustSection } from '@/components/TrustSection';

export const metadata: Metadata = {
    title: 'Free Scam Website Checker: Verify If a Site Is Safe Before You Buy',
    description: 'Paste any website URL and get a plain-English risk result. Free scam website checker for fake online stores, lookalike domains and shopping site fraud — no sign-up.',
    alternates: {
        canonical: 'https://scamchecker.app/scam-website-checker',
    },
    openGraph: {
        title: 'Free Scam Website Checker: Verify If a Site Is Safe Before You Buy',
        description: 'Paste any website URL and get a plain-English risk result. Free scam website checker for fake online stores, lookalike domains and shopping site fraud.',
        url: 'https://scamchecker.app/scam-website-checker',
    },
};

const TOOL_JSON_LD = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    '@id': 'https://scamchecker.app/scam-website-checker#tool',
    name: 'Scam Website Checker',
    url: 'https://scamchecker.app/scam-website-checker',
    description:
        'Free scam website checker for fake online stores, lookalike domains, and shopping site fraud. Paste any URL for an instant client-side risk assessment.',
    applicationCategory: 'SecurityApplication',
    operatingSystem: 'Web',
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    inLanguage: 'en',
};

export default function ScamWebsiteCheckerPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(TOOL_JSON_LD) }}
            />
            <section className="bg-slate-50 py-12 md:py-20">
                <div className="container mx-auto px-4 text-center">
                    <div className="flex justify-center items-center gap-2 mb-6 text-sm text-slate-500">
                        <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-slate-900 font-medium">Scam Website Checker</span>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-6">
                        Free Scam Website Checker: Verify If a Site Is Safe Before You Buy
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
                        Paste the website URL — including online stores, shopping sites, and lookalike domains — to get a plain-English risk result with the red flags called out.
                    </p>

                    <ScamChecker defaultTab="url" />

                    <p className="text-sm text-slate-500 mt-6 max-w-lg mx-auto leading-relaxed">
                        <strong>Privacy:</strong> The URL is analysed in your browser. We do not store what you paste.
                    </p>
                </div>
            </section>

            <TrustSection />

            <section className="py-16 bg-white">
                <div className="container mx-auto px-4 max-w-4xl">
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">
                        What this scam website checker looks for
                    </h2>
                    <p className="text-slate-700 leading-relaxed mb-4">
                        A fake online store does not always look fake. The most expensive losses come from sites with professional photos, a working checkout, and stolen brand logos. The signal is rarely the look — it is the metadata.
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-8">
                        <li><strong>Lookalike domain.</strong> Real brand spelt wrong, swapped letters (rn vs m, 0 vs O), or the brand name buried in a subdomain (e.g. <code>nike.shop-au.com</code>).</li>
                        <li><strong>Top-level domain mismatch.</strong> Australian and UK retailers usually sit on <code>.com.au</code> or <code>.co.uk</code>. Sudden <code>.shop</code>, <code>.top</code>, <code>.xyz</code> on a &quot;closing down sale&quot; is a tell.</li>
                        <li><strong>Brand-new domain.</strong> If the site claims to be an established retailer but the domain was registered a month ago, treat it as a scam.</li>
                        <li><strong>No real contact info.</strong> Generic <code>support@gmail.com</code>, a contact form only, no street address, no ABN/Companies House registration.</li>
                        <li><strong>Payment red flags.</strong> Bank transfer or crypto only, no card option, no PayPal Goods &amp; Services.</li>
                        <li><strong>Identical 5-star reviews</strong> all dated within a week, no negative reviews anywhere on the open web.</li>
                    </ul>

                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">
                        Is this online store a scam? Quick checklist
                    </h2>
                    <ol className="list-decimal pl-6 space-y-3 text-slate-700 mb-8">
                        <li>Run the URL through the checker above.</li>
                        <li>Search <code>&quot;[domain] scam&quot;</code> and <code>&quot;[domain] reddit&quot;</code> — independent victim reports surface fast.</li>
                        <li>Check the domain on a WHOIS lookup. If it is younger than 6 months, be careful with anything above $20.</li>
                        <li>Cross-check the brand against its real, known domain (e.g. <code>nike.com</code>, not <code>nike-au-sale.shop</code>).</li>
                        <li>If anything still feels off, pay with a credit card so you have chargeback rights, or walk away.</li>
                    </ol>

                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">
                        Why a shopping site can look perfect and still be a scam
                    </h2>
                    <p className="text-slate-700 leading-relaxed mb-4">
                        Fake stores buy a ready-made Shopify theme, scrape product photos from the real brand, and clone the checkout flow. The padlock (HTTPS) on the browser bar means the connection is encrypted — not that the merchant is legitimate. Scammers get HTTPS certificates in minutes.
                    </p>
                    <p className="text-slate-700 leading-relaxed mb-4">
                        The biggest losses come from social ads pointing to a slick site running a &quot;closing down sale&quot; on a major brand. The brand never authorised it. The site exists for two to four weeks, takes thousands of orders, and disappears before chargebacks land.
                    </p>

                    <div className="grid md:grid-cols-2 gap-4 my-8">
                        <Link
                            href="/check-scam-link"
                            className="block p-5 rounded-xl bg-slate-50 border border-slate-200 hover:border-primary hover:shadow-md transition-all"
                        >
                            <h3 className="font-semibold text-slate-900 mb-1">Just need to check a single link?</h3>
                            <p className="text-slate-600 text-sm">
                                Use the dedicated scam link / URL checker — same engine, focused on lookalike domains and phishing signals.
                            </p>
                        </Link>
                        <Link
                            href="/have-i-been-scammed"
                            className="block p-5 rounded-xl bg-red-50 border border-red-200 hover:border-red-400 hover:shadow-md transition-all"
                        >
                            <h3 className="font-semibold text-red-900 mb-1">Already paid? Open the damage-control checklist.</h3>
                            <p className="text-red-800 text-sm">
                                Step-by-step actions for the first hour after a fake-store purchase, including bank chargeback timing.
                            </p>
                        </Link>
                    </div>

                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">
                        Frequently asked questions
                    </h2>
                    <div className="space-y-4 my-6">
                        <details className="bg-white border border-slate-200 rounded-lg p-4">
                            <summary className="font-semibold cursor-pointer">Is the scam website checker really free?</summary>
                            <p className="mt-2 text-slate-600">
                                Yes. There is no sign-up, no paywall, and no limit on how many sites you can check. The analysis runs in your browser — we do not store the URLs you paste.
                            </p>
                        </details>
                        <details className="bg-white border border-slate-200 rounded-lg p-4">
                            <summary className="font-semibold cursor-pointer">Does HTTPS mean a shopping website is safe?</summary>
                            <p className="mt-2 text-slate-600">
                                No. HTTPS only proves the connection is encrypted. Fake stores get SSL certificates in minutes. Treat the padlock as a baseline, not as proof of legitimacy.
                            </p>
                        </details>
                        <details className="bg-white border border-slate-200 rounded-lg p-4">
                            <summary className="font-semibold cursor-pointer">How do I check if an online store is legit before paying?</summary>
                            <p className="mt-2 text-slate-600">
                                Run the URL through the checker above, search for independent reviews on Reddit and Trustpilot, verify the domain age with a WHOIS lookup, and confirm the contact details are real. Pay by credit card so you have chargeback rights if something goes wrong.
                            </p>
                        </details>
                        <details className="bg-white border border-slate-200 rounded-lg p-4">
                            <summary className="font-semibold cursor-pointer">Can a website install malware just by me visiting it?</summary>
                            <p className="mt-2 text-slate-600">
                                Rarely, but possible — &quot;drive-by downloads&quot; exploit unpatched browsers. Keeping your browser updated and using an ad-blocker covers most of this risk. If you only visited the page and entered nothing, you are usually fine.
                            </p>
                        </details>
                        <details className="bg-white border border-slate-200 rounded-lg p-4">
                            <summary className="font-semibold cursor-pointer">What is the best scam website checker?</summary>
                            <p className="mt-2 text-slate-600">
                                Any tool that triangulates: domain age, lookalike-domain detection, known phishing lists, and visible red flags. Our checker uses these signals and links you to <Link href="/reports" className="text-primary underline">community-reported scam sites</Link> so you can see if other people have flagged it.
                            </p>
                        </details>
                    </div>

                    <p className="text-slate-700 leading-relaxed">
                        Looking for advice rather than a tool? Read the long-form guide on{' '}
                        <Link href="/guides/is-this-website-legit" className="text-primary underline">how to check if a website is legitimate before you buy</Link>,
                        or browse <Link href="/reports/websites" className="text-primary underline">recent scam website reports</Link>.
                        If you have already been hit, use the <Link href="/have-i-been-scammed" className="text-primary underline">damage-control checklist</Link>,
                        or check our <Link href="/check" className="text-primary underline">general scam checker</Link>.
                        See also the <Link href="/reports" className="text-primary underline">community scam report database</Link>.
                    </p>
                </div>
            </section>
        </div>
    );
}
