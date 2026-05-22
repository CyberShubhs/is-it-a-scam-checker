import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { ScamChecker } from '@/components/ScamChecker';
import { TrustSection } from '@/components/TrustSection';

export const metadata: Metadata = {
    title: 'Scam Website Checker UK: Check if a Website Is a Scam Before You Buy',
    description: 'Free scam website checker for the UK. Paste a Royal Mail, HMRC, DVLA or shopping site URL to check for scam patterns — and find Action Fraud reporting steps.',
    alternates: {
        canonical: 'https://scamchecker.app/scam-website-checker-uk',
    },
    openGraph: {
        title: 'Scam Website Checker UK: Check if a Website Is a Scam Before You Buy',
        description: 'Free scam website checker for the UK. Paste a Royal Mail, HMRC, DVLA or shopping site URL to check for scam patterns — and find Action Fraud reporting steps.',
        url: 'https://scamchecker.app/scam-website-checker-uk',
    },
};

export default function ScamWebsiteCheckerUKPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <section className="bg-slate-50 py-12 md:py-20">
                <div className="container mx-auto px-4 text-center">
                    <div className="flex justify-center items-center gap-2 mb-6 text-sm text-slate-500">
                        <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-slate-900 font-medium">Scam Website Checker (UK)</span>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-6">
                        Scam Website Checker UK
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 mb-6 max-w-2xl mx-auto">
                        Paste a UK website URL — including Royal Mail, HMRC, DVLA, Evri, parcel-redelivery, and online store sites — to check for scam patterns before you enter card details.
                    </p>

                    <ScamChecker defaultTab="url" />

                    <p className="text-sm text-slate-500 mt-6 max-w-lg mx-auto leading-relaxed">
                        <strong>Privacy:</strong> Content is analysed in your browser. We do not store URLs.
                    </p>
                </div>
            </section>

            <TrustSection />

            <section className="py-16 bg-white">
                <div className="container mx-auto px-4 max-w-4xl">
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">
                        Scam websites that target people in the UK
                    </h2>
                    <ul className="list-disc pl-6 space-y-3 text-slate-700 mb-8">
                        <li><strong>Royal Mail and Evri redelivery scams.</strong> SMS link to a lookalike domain asking for a small &quot;redelivery fee&quot;. Real domains: <code>royalmail.com</code> and <code>evri.com</code>.</li>
                        <li><strong>HMRC tax-refund and tax-debt scams.</strong> &quot;You are due a refund of £243.50&quot; or &quot;arrest warrant for unpaid tax&quot;. The real HMRC site is <code>gov.uk</code> — anything else is a scam.</li>
                        <li><strong>DVLA fake licence-renewal sites.</strong> &quot;Your licence needs updating&quot; with a card capture. The real site is <code>gov.uk/dvla</code>.</li>
                        <li><strong>Fake online stores</strong> running &quot;closing down 80% off&quot; sales of UK brands on <code>.shop</code>, <code>.top</code>, <code>.xyz</code> domains.</li>
                        <li><strong>Energy / cost-of-living grant scams.</strong> &quot;You qualify for a £400 energy rebate.&quot; The real schemes go through your supplier, never via SMS link.</li>
                        <li><strong>Bank impersonation</strong> from Barclays, Lloyds, HSBC, Monzo, Santander — &quot;move your money to a safe account&quot; is always a scam.</li>
                    </ul>

                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">
                        How to check if a UK website is a scam
                    </h2>
                    <ol className="list-decimal pl-6 space-y-3 text-slate-700 mb-8">
                        <li>Run the URL through the checker above.</li>
                        <li>Verify the real domain. UK government sites are always under <code>gov.uk</code>. UK retailers usually sit on <code>.co.uk</code> or <code>.com</code>.</li>
                        <li>Check Companies House (<code>find-and-update.company-information.service.gov.uk</code>) for the listed business — fake stores rarely have a registered UK entity.</li>
                        <li>Look up the domain age. A &quot;trusted retailer since 2008&quot; whose domain was registered last month is a scam.</li>
                        <li>Pay by credit card or PayPal Goods &amp; Services for chargeback / buyer protection.</li>
                    </ol>

                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">
                        Where to report a scam website in the UK
                    </h2>
                    <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-8">
                        <li>
                            <strong>Action Fraud:</strong>{' '}
                            <a href="https://www.actionfraud.police.uk/" target="_blank" rel="noopener noreferrer" className="text-primary underline">actionfraud.police.uk</a>{' '}
                            — the UK&apos;s national fraud reporting centre. Call <code>0300 123 2040</code> if you have lost money.
                        </li>
                        <li>
                            <strong>National Cyber Security Centre (NCSC):</strong> forward suspicious emails to{' '}
                            <code>report@phishing.gov.uk</code> and suspicious texts to <code>7726</code>.
                        </li>
                        <li>
                            <strong>HMRC scams:</strong> forward to <code>phishing@hmrc.gov.uk</code>, or text scam SMS to <code>60599</code>.
                        </li>
                        <li>
                            <strong>Your bank:</strong> if you have already shared card details or sent money, call the fraud number on the back of your card immediately.
                        </li>
                        <li>
                            <strong>Citizens Advice consumer helpline:</strong> <code>0808 223 1133</code> if you bought from a fake store.
                        </li>
                    </ul>

                    <div className="grid md:grid-cols-2 gap-4 my-8">
                        <Link
                            href="/scam-website-checker"
                            className="block p-5 rounded-xl bg-slate-50 border border-slate-200 hover:border-primary hover:shadow-md transition-all"
                        >
                            <h3 className="font-semibold text-slate-900 mb-1">Global scam website checker</h3>
                            <p className="text-slate-600 text-sm">Same engine, country-neutral version of this page.</p>
                        </Link>
                        <Link
                            href="/scam-checker-australia"
                            className="block p-5 rounded-xl bg-slate-50 border border-slate-200 hover:border-primary hover:shadow-md transition-all"
                        >
                            <h3 className="font-semibold text-slate-900 mb-1">Scam Checker Australia</h3>
                            <p className="text-slate-600 text-sm">Country-specific guidance for Australian Scamwatch / ATO / AusPost scams.</p>
                        </Link>
                    </div>

                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">Frequently asked questions (UK)</h2>
                    <div className="space-y-4 my-6">
                        <details className="bg-white border border-slate-200 rounded-lg p-4">
                            <summary className="font-semibold cursor-pointer">Is the UK scam website checker free?</summary>
                            <p className="mt-2 text-slate-600">Yes. No sign-up, no limit. The check runs in your browser, so what you paste never leaves your device.</p>
                        </details>
                        <details className="bg-white border border-slate-200 rounded-lg p-4">
                            <summary className="font-semibold cursor-pointer">Does HMRC ever send a tax-refund link by SMS or email?</summary>
                            <p className="mt-2 text-slate-600">
                                No. HMRC never notifies refunds by SMS or asks you to click a link to claim. Refunds appear in your bank account or your Personal Tax Account on{' '}
                                <code>gov.uk</code> after a return is filed.
                            </p>
                        </details>
                        <details className="bg-white border border-slate-200 rounded-lg p-4">
                            <summary className="font-semibold cursor-pointer">A Royal Mail / Evri text said I owe a fee — is it real?</summary>
                            <p className="mt-2 text-slate-600">
                                Almost always a scam. Real Royal Mail and Evri delivery cards or app notifications never ask for payment via an SMS link. Verify directly at{' '}
                                <code>royalmail.com</code> or <code>evri.com</code>.
                            </p>
                        </details>
                        <details className="bg-white border border-slate-200 rounded-lg p-4">
                            <summary className="font-semibold cursor-pointer">I already paid — can I get my money back?</summary>
                            <p className="mt-2 text-slate-600">
                                Possibly. Credit-card chargebacks and the bank&apos;s Contingent Reimbursement Model can recover funds in some cases. Speed matters — call your bank&apos;s fraud line in the first hour, then file with Action Fraud. The{' '}
                                <Link href="/have-i-been-scammed" className="text-primary underline">damage-control checklist</Link> walks through the steps.
                            </p>
                        </details>
                    </div>

                    <p className="text-slate-700 leading-relaxed">
                        Try the general <Link href="/check" className="text-primary underline">scam checker</Link>,
                        the <Link href="/check-scam-link" className="text-primary underline">URL checker</Link>,
                        or search <Link href="/reports/websites" className="text-primary underline">community-reported scam sites</Link>.
                        Already a victim? Open the <Link href="/have-i-been-scammed" className="text-primary underline">damage-control checklist</Link>{' '}
                        or browse our <Link href="/reports" className="text-primary underline">scam reports database</Link>.
                    </p>
                </div>
            </section>
        </div>
    );
}
