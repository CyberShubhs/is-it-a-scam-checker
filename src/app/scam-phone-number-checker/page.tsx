import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { ScamChecker } from '@/components/ScamChecker';
import { TrustSection } from '@/components/TrustSection';

export const metadata: Metadata = {
    title: 'Free Scam Phone Number Checker: Check Suspicious Calls & SMS',
    description: 'Paste a phone number, voicemail transcript, or scam call script to check for scam patterns. Free scam phone number checker — also handles SMS and voicemail text.',
    alternates: {
        canonical: 'https://scamchecker.app/scam-phone-number-checker',
    },
    openGraph: {
        title: 'Free Scam Phone Number Checker: Check Suspicious Calls & SMS',
        description: 'Paste a phone number, voicemail transcript, or scam call script to check for scam patterns. Free scam phone number checker — also handles SMS and voicemail text.',
        url: 'https://scamchecker.app/scam-phone-number-checker',
    },
};

const TOOL_JSON_LD = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    '@id': 'https://scamchecker.app/scam-phone-number-checker#tool',
    name: 'Scam Phone Number Checker',
    url: 'https://scamchecker.app/scam-phone-number-checker',
    description:
        'Paste a phone number, voicemail transcript, or scam call script. The free scam phone number checker flags impersonation, urgency, OTP harvesting, and known robocall patterns. Does not run live carrier lookup.',
    applicationCategory: 'SecurityApplication',
    operatingSystem: 'Web',
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    inLanguage: 'en',
};

export default function ScamPhoneNumberCheckerPage() {
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
                        <span className="text-slate-900 font-medium">Scam Phone Number Checker</span>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-6">
                        Free Scam Phone Number Checker
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 mb-6 max-w-2xl mx-auto">
                        Paste the phone number, the SMS text, or what the caller said. Our checker scans the content for the patterns scam callers actually use — fake bank fraud teams, ATO/IRS &quot;arrest warrant&quot; threats, fake delivery redelivery fees, and recorded robocalls.
                    </p>
                    <p className="text-md text-slate-500 mb-8 max-w-2xl mx-auto">
                        We do not run live carrier lookup or caller-ID verification. If you only have a number with no context, search community reports below for matches.
                    </p>

                    <ScamChecker defaultTab="text" />

                    <p className="text-sm text-slate-500 mt-6 max-w-lg mx-auto leading-relaxed">
                        <strong>Privacy:</strong> Content is analysed in your browser. Nothing you paste is stored.
                    </p>
                </div>
            </section>

            <TrustSection />

            <section className="py-16 bg-white">
                <div className="container mx-auto px-4 max-w-4xl">
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">
                        How to check if a phone number is a scam
                    </h2>
                    <ol className="list-decimal pl-6 space-y-3 text-slate-700 mb-8">
                        <li>
                            <strong>Paste any message they sent you</strong> into the checker above. SMS, voicemail transcript, or what the caller said — the analysis flags urgency, impersonation, OTP harvesting, and lookalike links.
                        </li>
                        <li>
                            <strong>Search community reports for the number.</strong> Browse{' '}
                            <Link href="/reports/phone-numbers" className="text-primary underline">scam phone number reports</Link>
                            {' '}— if other users have flagged the same number, it shows here.
                        </li>
                        <li>
                            <strong>Do not call back unknown numbers.</strong> Returning the call can confirm your number is live and trigger more scam attempts. Look up the organisation independently and call them on a number you trust.
                        </li>
                        <li>
                            <strong>Block and report.</strong> Forward scam SMS to 7726 (UK, Australia, US carriers support this). In Australia, forward to <code>0429 999 888</code> (Scamwatch).
                        </li>
                    </ol>

                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">
                        Red flags in scam calls and scam SMS
                    </h2>
                    <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-8">
                        <li><strong>Caller ID matches a real bank or government agency.</strong> Caller ID is trivially spoofable. The fact that &quot;CommBank&quot; or &quot;HMRC&quot; appears means nothing.</li>
                        <li><strong>&quot;Move your money to a safe account.&quot;</strong> No bank fraud team ever asks for this. It is the single most reliable tell.</li>
                        <li><strong>&quot;Read me the code we just sent.&quot;</strong> OTP harvesting. Never share a one-time code with someone who called you, no matter who they claim to be.</li>
                        <li><strong>&quot;An arrest warrant has been issued.&quot;</strong> Tax authorities (ATO, HMRC, IRS) do not send police over the phone. This is a script.</li>
                        <li><strong>&quot;Press 1 to speak to an officer.&quot;</strong> Robocalls from government agencies are essentially always scams.</li>
                        <li><strong>SMS with a payment link</strong> from <code>+61 4xx</code>, <code>+44 7xxx</code>, or a random international number claiming to be AusPost, Royal Mail, USPS, DHL, Linkt, the ATO, HMRC, or a bank.</li>
                        <li><strong>Voicemail demanding immediate callback</strong> on a number that is not the official line for the organisation.</li>
                    </ul>

                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">
                        Common scam call scripts the checker recognises
                    </h2>
                    <div className="grid md:grid-cols-2 gap-4 mb-8">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="font-medium mb-1">Bank fraud-team impersonation</p>
                            <p className="text-sm text-slate-700">&quot;We&apos;ve detected suspicious activity. Did you authorise a $3,500 transfer? Please move your funds to the safe account I&apos;m setting up now.&quot;</p>
                        </div>
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="font-medium mb-1">Tax authority &quot;arrest warrant&quot;</p>
                            <p className="text-sm text-slate-700">&quot;This is the ATO/HMRC/IRS. A legal case has been filed. Press 1 to speak to an officer or be arrested within 24 hours.&quot;</p>
                        </div>
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="font-medium mb-1">Tech support &quot;Microsoft&quot; call</p>
                            <p className="text-sm text-slate-700">&quot;We can see hackers in your computer right now. Please install AnyDesk so we can clean it for you.&quot;</p>
                        </div>
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="font-medium mb-1">Recorded redelivery / customs fee SMS</p>
                            <p className="text-sm text-slate-700">&quot;AusPost: redelivery fee of $2.99 outstanding. Click here to pay before parcel is returned.&quot;</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 my-8">
                        <Link
                            href="/check-scam-text"
                            className="block p-5 rounded-xl bg-slate-50 border border-slate-200 hover:border-primary hover:shadow-md transition-all"
                        >
                            <h3 className="font-semibold text-slate-900 mb-1">Got an SMS or WhatsApp message?</h3>
                            <p className="text-slate-600 text-sm">Run it through the dedicated SMS / WhatsApp scam checker.</p>
                        </Link>
                        <Link
                            href="/have-i-been-scammed"
                            className="block p-5 rounded-xl bg-red-50 border border-red-200 hover:border-red-400 hover:shadow-md transition-all"
                        >
                            <h3 className="font-semibold text-red-900 mb-1">Already shared an OTP or moved money?</h3>
                            <p className="text-red-800 text-sm">Open the damage-control checklist — the first hour matters most.</p>
                        </Link>
                    </div>

                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">Frequently asked questions</h2>
                    <div className="space-y-4 my-6">
                        <details className="bg-white border border-slate-200 rounded-lg p-4">
                            <summary className="font-semibold cursor-pointer">Can you look up who owns a phone number?</summary>
                            <p className="mt-2 text-slate-600">
                                No. We do not run live carrier lookup, caller-ID verification, or reverse phone lookup. Numbers can be spoofed in seconds — caller ID is unreliable. The checker analyses the <em>content</em> of the message or call, which is far harder for a scammer to disguise.
                            </p>
                        </details>
                        <details className="bg-white border border-slate-200 rounded-lg p-4">
                            <summary className="font-semibold cursor-pointer">Is this scam call checker free?</summary>
                            <p className="mt-2 text-slate-600">
                                Yes. No sign-up, no limits, nothing stored. Paste the call transcript, the SMS, or what the caller said and read the result.
                            </p>
                        </details>
                        <details className="bg-white border border-slate-200 rounded-lg p-4">
                            <summary className="font-semibold cursor-pointer">My bank is calling me from its real number — can I trust the call?</summary>
                            <p className="mt-2 text-slate-600">
                                No. Caller ID is trivially spoofable. If you are not sure, hang up and call the number on the back of your card. A real bank will not pressure you, ask you to read back codes, or tell you to move money to a &quot;safe account&quot;.
                            </p>
                        </details>
                        <details className="bg-white border border-slate-200 rounded-lg p-4">
                            <summary className="font-semibold cursor-pointer">Should I call back a missed call from an unknown number?</summary>
                            <p className="mt-2 text-slate-600">
                                Usually no. Calling back confirms your number is active and may flag you as a higher-value target. If it&apos;s urgent, the caller will leave a voicemail or text.
                            </p>
                        </details>
                        <details className="bg-white border border-slate-200 rounded-lg p-4">
                            <summary className="font-semibold cursor-pointer">Where do I report a scam phone number?</summary>
                            <p className="mt-2 text-slate-600">
                                In Australia, forward the SMS to 0429 999 888 (Scamwatch) and report to{' '}
                                <Link href="/global-scam-reporting" className="text-primary underline">your country&apos;s reporting body</Link>. UK: Action Fraud. US: FTC Report Fraud. Most carriers also accept scam SMS forwarded to 7726.
                            </p>
                        </details>
                    </div>

                    <p className="text-slate-700 leading-relaxed">
                        Want broader analysis? Use the general{' '}
                        <Link href="/check" className="text-primary underline">scam checker</Link>{' '}
                        or browse <Link href="/reports/phone-numbers" className="text-primary underline">community-reported phone numbers</Link>.
                        Suspicious link in the message? Try the{' '}
                        <Link href="/check-scam-link" className="text-primary underline">URL scam checker</Link>.
                        Bigger picture: read about <Link href="/guides/bank-impersonation-scams" className="text-primary underline">bank impersonation scams</Link>{' '}
                        and the <Link href="/have-i-been-scammed" className="text-primary underline">damage-control checklist</Link>.
                    </p>
                </div>
            </section>
        </div>
    );
}
