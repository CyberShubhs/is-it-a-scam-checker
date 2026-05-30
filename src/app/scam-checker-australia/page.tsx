import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { ScamChecker } from '@/components/ScamChecker';
import { TrustSection } from '@/components/TrustSection';

export const metadata: Metadata = pageMetadata({
    title: "Scam Checker Australia: Texts, Calls, Emails & Websites",
    description: "Free scam checker for Australians. Paste an SMS, ATO/myGov email, AusPost text or website to check for scam patterns — plus where to report.",
    canonical: "https://scamchecker.app/scam-checker-australia",
});

const TOOL_JSON_LD = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    '@id': 'https://scamchecker.app/scam-checker-australia#tool',
    name: 'Scam Checker (Australia)',
    url: 'https://scamchecker.app/scam-checker-australia',
    description:
        'Free Australia-focused scam checker. Paste an SMS, ATO/myGov email, AusPost or Linkt text, or shopping URL to spot Scamwatch-tracked patterns and find the right Australian reporting body.',
    applicationCategory: 'SecurityApplication',
    operatingSystem: 'Web',
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'AUD' },
    inLanguage: 'en-AU',
};

export default function ScamCheckerAustraliaPage() {
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
                        <span className="text-slate-900 font-medium">Scam Checker Australia</span>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-6">
                        Scam Checker Australia
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 mb-6 max-w-2xl mx-auto">
                        Paste a suspicious SMS, email, AusPost or Linkt text, fake ATO or myGov message, or a shopping website URL. Our checker scans it for the patterns scammers actually use against Australians — and tells you where to report it.
                    </p>

                    <ScamChecker />

                    <p className="text-sm text-slate-500 mt-6 max-w-lg mx-auto leading-relaxed">
                        <strong>Privacy:</strong> Analysed in your browser. Nothing you paste is stored or sent to our servers.
                    </p>
                </div>
            </section>

            <TrustSection />

            <section className="py-16 bg-white">
                <div className="container mx-auto px-4 max-w-4xl">
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">
                        Scams that target Australians most often
                    </h2>
                    <ul className="list-disc pl-6 space-y-3 text-slate-700 mb-8">
                        <li><strong>Fake AusPost / DHL / FedEx redelivery SMS.</strong> Random number, link to a lookalike domain, $2.99 &quot;redelivery fee&quot;.</li>
                        <li><strong>ATO and myGov impersonation.</strong> Fake refund SMS, fake debt threats, fake &quot;identity verification&quot; emails. The real myGov is <code>my.gov.au</code>.</li>
                        <li><strong>Linkt / toll road SMS scams.</strong> Tiny outstanding amount, disproportionate &quot;late fee&quot;. Real domain is <code>linkt.com.au</code>.</li>
                        <li><strong>Bank impersonation calls and texts.</strong> Caller ID spoofed to match CommBank, NAB, ANZ, Westpac. &quot;We&apos;ve detected fraud — please move your money to a safe account.&quot;</li>
                        <li><strong>PayID overpayment scams.</strong> Fake payment-confirmation emails on Facebook Marketplace / Gumtree, fake &quot;business upgrade fee&quot;.</li>
                        <li><strong>Fake online stores.</strong> Facebook and Instagram ads to <code>.shop</code>, <code>.top</code>, <code>.xyz</code> domains running &quot;closing down 80% off&quot; sales.</li>
                        <li><strong>Crypto investment groups.</strong> Romance-to-investment pivots from dating apps and WhatsApp.</li>
                    </ul>

                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">
                        Where to report a scam in Australia
                    </h2>
                    <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-8">
                        <li>
                            <strong>Scamwatch (ACCC):</strong> report at{' '}
                            <a href="https://www.scamwatch.gov.au/report-a-scam" target="_blank" rel="noopener noreferrer" className="text-primary underline">scamwatch.gov.au/report-a-scam</a>.
                            Forward scam SMS to <code>0429 999 888</code>.
                        </li>
                        <li>
                            <strong>ReportCyber (Australian Cyber Security Centre):</strong>{' '}
                            <a href="https://www.cyber.gov.au/report" target="_blank" rel="noopener noreferrer" className="text-primary underline">cyber.gov.au/report</a>{' '}
                            for anything involving money loss, identity theft, or business compromise.
                        </li>
                        <li>
                            <strong>ATO scams:</strong> forward suspicious emails to <code>ReportScam@ato.gov.au</code> or call the ATO scam line on <code>1800 008 540</code>.
                        </li>
                        <li>
                            <strong>Your bank:</strong> if you sent money or shared card/login details, call the fraud number on the back of your card immediately. Most banks have a 24/7 line.
                        </li>
                        <li>
                            <strong>IDCARE:</strong> free identity-theft support on <code>1800 595 160</code>.
                        </li>
                        <li>
                            <strong>7726 SMS reporting:</strong> Telstra, Optus, and TPG accept scam SMS forwarded to <code>7726</code> (spells SPAM).
                        </li>
                    </ul>

                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">
                        Australian scam-checker quick links
                    </h2>
                    <div className="grid md:grid-cols-2 gap-4 my-6">
                        <Link href="/scam-website-checker" className="block p-5 rounded-xl bg-slate-50 border border-slate-200 hover:border-primary transition-all">
                            <h3 className="font-semibold text-slate-900 mb-1">Scam website checker</h3>
                            <p className="text-slate-600 text-sm">Verify an online store or shopping site before paying.</p>
                        </Link>
                        <Link href="/scam-phone-number-checker" className="block p-5 rounded-xl bg-slate-50 border border-slate-200 hover:border-primary transition-all">
                            <h3 className="font-semibold text-slate-900 mb-1">Scam phone number checker</h3>
                            <p className="text-slate-600 text-sm">Paste the SMS or what the caller said to spot fraud patterns.</p>
                        </Link>
                        <Link href="/check-scam-text" className="block p-5 rounded-xl bg-slate-50 border border-slate-200 hover:border-primary transition-all">
                            <h3 className="font-semibold text-slate-900 mb-1">SMS &amp; WhatsApp checker</h3>
                            <p className="text-slate-600 text-sm">For AusPost, Linkt, bank, and family-impersonation texts.</p>
                        </Link>
                        <Link href="/check-scam-email" className="block p-5 rounded-xl bg-slate-50 border border-slate-200 hover:border-primary transition-all">
                            <h3 className="font-semibold text-slate-900 mb-1">Email phishing checker</h3>
                            <p className="text-slate-600 text-sm">For ATO, myGov, bank, and invoice phishing emails.</p>
                        </Link>
                    </div>

                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">Frequently asked questions (Australia)</h2>
                    <div className="space-y-4 my-6">
                        <details className="bg-white border border-slate-200 rounded-lg p-4">
                            <summary className="font-semibold cursor-pointer">Is the scam checker free for Australians?</summary>
                            <p className="mt-2 text-slate-600">Yes. No sign-up, no limit, and your content is never sent to our servers. The analysis is run in your browser.</p>
                        </details>
                        <details className="bg-white border border-slate-200 rounded-lg p-4">
                            <summary className="font-semibold cursor-pointer">Will the ATO ever send me an SMS with a link?</summary>
                            <p className="mt-2 text-slate-600">No. The ATO does not send clickable SMS links for refunds or debts. The real myGov domain is <code>my.gov.au</code> — anything else (<code>mygov-refund.com</code>, <code>my-gov.com.au</code>, <code>mygov-au.net</code>) is a scam.</p>
                        </details>
                        <details className="bg-white border border-slate-200 rounded-lg p-4">
                            <summary className="font-semibold cursor-pointer">My bank&apos;s real number called me — is the call genuine?</summary>
                            <p className="mt-2 text-slate-600">
                                Not necessarily. Caller ID can be spoofed. Hang up and call back on the number printed on your card. Read{' '}
                                <Link href="/guides/bank-impersonation-scams" className="text-primary underline">the bank impersonation guide</Link>{' '}
                                for the full script.
                            </p>
                        </details>
                        <details className="bg-white border border-slate-200 rounded-lg p-4">
                            <summary className="font-semibold cursor-pointer">I already sent money — what should I do?</summary>
                            <p className="mt-2 text-slate-600">
                                Call your bank&apos;s fraud line immediately. Report to{' '}
                                <a href="https://www.cyber.gov.au/report" target="_blank" rel="noopener noreferrer" className="text-primary underline">ReportCyber</a>{' '}
                                and Scamwatch. If identity documents were shared, contact IDCARE on <code>1800 595 160</code>. Walk through the{' '}
                                <Link href="/have-i-been-scammed" className="text-primary underline">damage-control checklist</Link>.
                            </p>
                        </details>
                    </div>

                    <p className="text-slate-700 leading-relaxed">
                        Compare with our <Link href="/scam-website-checker-uk" className="text-primary underline">UK scam website checker</Link>,
                        or use the general <Link href="/check" className="text-primary underline">scam checker</Link>.
                        Browse <Link href="/reports" className="text-primary underline">community-reported Australian scams</Link>,
                        or learn how to recognise specific patterns in our <Link href="/guides" className="text-primary underline">scam identification guides</Link>.
                    </p>
                </div>
            </section>
        </div>
    );
}
