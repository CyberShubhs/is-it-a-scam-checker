import { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { ScamChecker } from '@/components/ScamChecker';
import { TrustSection } from '@/components/TrustSection';
import { LatestScams } from '@/components/LatestScams';
import { FAQ } from '@/components/FAQ';
import Link from 'next/link';

// SEO note: /check is our highest-CTR page (2.66% at avg position 5.79 in
// GSC). The retitle targets the cluster "scam checker / check scam link /
// check scam message / is this a scam" without keyword stuffing.
export const metadata: Metadata = pageMetadata({
    title: "Free Scam Checker: Check Links, Emails, Texts & Websites",
    description: "Paste a suspicious link, email, SMS or message and get a plain-English scam risk result with red flags and next steps. Free, private, no sign-up.",
    canonical: "https://scamchecker.app/check",
});

export default function CheckPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <section className="bg-slate-50 py-12 md:py-20">
                <div className="container mx-auto px-4 text-center">
                    {/* H1 mirrors the new SEO title. One H1 per page. */}
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-6">
                        Free Scam Checker: Check Links, Emails, Texts &amp; Websites
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 mb-4 max-w-3xl mx-auto">
                        Not sure whether to trust that text, email, or website? Paste the content below and our tool will analyse it for common fraud patterns. We check for phishing tactics, malicious URLs, impersonation attempts, and urgency-based manipulation.
                    </p>
                    <p className="text-md text-slate-500 mb-8 max-w-2xl mx-auto">
                        Analysis happens in your browser. We do not store what you paste. Results are instant.
                    </p>

                    <ScamChecker />

                    <p className="text-sm text-slate-500 mt-6 max-w-lg mx-auto leading-relaxed">
                        <strong>Privacy guarantee:</strong> Your content is analysed locally and never transmitted to our servers.
                        <br />
                        This tool provides guidance. Always verify requests through official channels when in doubt.
                    </p>
                </div>
            </section>

            {/* "What is a scam checker?" explainer + scenarios
                ----------------------------------------------------------------
                Targets the "scam checker" / "scammer check" head terms with a
                short, human explanation, then funnels users into the right
                tool for their situation. Each scenario links to a tool page
                so the page redistributes authority. */}
            <section className="py-12 bg-white border-t border-slate-100">
                <div className="container mx-auto px-4 max-w-4xl">
                    <h2 className="text-2xl font-bold mb-4 text-slate-900">
                        What is a scam checker, and when should I use one?
                    </h2>
                    <p className="text-slate-700 leading-relaxed mb-4">
                        A scam checker is a tool that scans a message, email,
                        link, or website for the patterns scammers actually use
                        — urgency, impersonation of trusted brands, lookalike
                        domains, requests for OTPs or gift cards, and dozens of
                        other tells. Instead of guessing, you get a clear
                        risk rating with the specific red flags called out.
                    </p>
                    <p className="text-slate-700 leading-relaxed mb-8">
                        Use this scam checker whenever a message lands in your
                        inbox or DMs and your gut says "wait — is this real?"
                        It takes seconds and your content is never sent to our
                        servers.
                    </p>

                    <h3 className="text-xl font-bold mb-4 text-slate-900">
                        Common situations this tool handles
                    </h3>
                    <ul className="grid sm:grid-cols-2 gap-3 list-none p-0">
                        <li className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                            <strong className="text-slate-900 block mb-1">
                                "I got a scam message — is this a scam?"
                            </strong>
                            <span className="text-slate-600 text-sm">
                                Paste it into the checker above, or use the
                                dedicated{' '}
                                <Link
                                    href="/check-scam-text"
                                    className="text-primary hover:underline"
                                >
                                    SMS and WhatsApp scam checker
                                </Link>{' '}
                                for messaging-app scams.
                            </span>
                        </li>
                        <li className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                            <strong className="text-slate-900 block mb-1">
                                "Someone asked me for my OTP / verification code"
                            </strong>
                            <span className="text-slate-600 text-sm">
                                That's almost always fraud. Run the message
                                through the{' '}
                                <Link
                                    href="/check-scam-text"
                                    className="text-primary hover:underline"
                                >
                                    SMS/WhatsApp checker
                                </Link>{' '}
                                and never share codes with anyone.
                            </span>
                        </li>
                        <li className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                            <strong className="text-slate-900 block mb-1">
                                "I clicked a suspicious link — what now?"
                            </strong>
                            <span className="text-slate-600 text-sm">
                                Open the{' '}
                                <Link
                                    href="/have-i-been-scammed"
                                    className="text-primary hover:underline font-semibold"
                                >
                                    have I been scammed damage-control checklist
                                </Link>
                                {' '}— it walks you through the first hour
                                after a phishing click.
                            </span>
                        </li>
                        <li className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                            <strong className="text-slate-900 block mb-1">
                                "Is this website legit, or is it a fake?"
                            </strong>
                            <span className="text-slate-600 text-sm">
                                Use the{' '}
                                <Link
                                    href="/check-scam-link"
                                    className="text-primary hover:underline"
                                >
                                    link / URL scam checker
                                </Link>{' '}
                                — it flags lookalike domains, new registrations,
                                and known phishing patterns.
                            </span>
                        </li>
                        <li className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                            <strong className="text-slate-900 block mb-1">
                                "Has anyone else been targeted by this?"
                            </strong>
                            <span className="text-slate-600 text-sm">
                                Search the{' '}
                                <Link
                                    href="/reports"
                                    className="text-primary hover:underline"
                                >
                                    community scam report database
                                </Link>{' '}
                                for the phone number, URL, or email address.
                            </span>
                        </li>
                        <li className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                            <strong className="text-slate-900 block mb-1">
                                "Is this email a phishing attempt?"
                            </strong>
                            <span className="text-slate-600 text-sm">
                                Paste the email body into the{' '}
                                <Link
                                    href="/check-scam-email"
                                    className="text-primary hover:underline"
                                >
                                    email phishing checker
                                </Link>{' '}
                                — fake invoices and credential-theft attempts
                                follow predictable templates.
                            </span>
                        </li>
                    </ul>
                </div>
            </section>

            {/* Step-by-Step: How to Use This Scam Checker */}
            <section className="py-12 bg-white border-t border-slate-100">
                <div className="container mx-auto px-4 max-w-4xl">
                    <h2 className="text-2xl font-bold mb-6 text-slate-900">Step-by-Step: How to Use This Scam Detection Tool</h2>
                    <div className="prose prose-slate max-w-none">
                        <p className="text-slate-600 mb-4">
                            Using the checker is simple. Copy the suspicious content — whether it is a text message, the body of an email, or a URL someone sent you — and paste it into the input box above. Analysis begins automatically.
                        </p>
                        <p className="text-slate-600 mb-4">
                            Within seconds, you will receive a risk rating (Low, Medium, or High) along with specific red flags we detected. Each flag is explained in plain language so you understand exactly why something appears suspicious.
                        </p>
                        <p className="text-slate-600">
                            No automated tool is perfect. If you remain uncertain after checking, contact the supposed sender through official channels. For example, if someone claims to be your bank, call the number on your card — not the number in the suspicious message.
                        </p>
                    </div>
                </div>
            </section>

            {/* What This Tool Scans For */}
            <section className="py-12 bg-slate-50 border-t border-slate-100">
                <div className="container mx-auto px-4 max-w-4xl">
                    <h2 className="text-2xl font-bold mb-6 text-slate-900">Fraud Patterns and Warning Signs This Tool Detects</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white p-5 rounded-lg border border-slate-200">
                            <h3 className="font-semibold text-lg mb-3 text-slate-900">Urgency and Threat Language</h3>
                            <p className="text-slate-600 text-sm mb-2">Scammers create panic to prevent clear thinking:</p>
                            <ul className="text-slate-600 text-sm space-y-1">
                                <li>• &quot;Act immediately or lose access to your account&quot;</li>
                                <li>• &quot;Your package will be returned if you do not pay now&quot;</li>
                                <li>• Threats of arrest, lawsuits, or account termination</li>
                                <li>• Artificial deadlines (&quot;respond within 24 hours&quot;)</li>
                            </ul>
                        </div>
                        <div className="bg-white p-5 rounded-lg border border-slate-200">
                            <h3 className="font-semibold text-lg mb-3 text-slate-900">Unusual Payment and Information Requests</h3>
                            <p className="text-slate-600 text-sm mb-2">Legitimate organisations do not operate this way:</p>
                            <ul className="text-slate-600 text-sm space-y-1">
                                <li>• Requests for passwords, PINs, or security codes</li>
                                <li>• Payment via gift cards, cryptocurrency, or wire transfer</li>
                                <li>• Asking you to read back a verification code</li>
                                <li>• Requests to download software for &quot;security&quot;</li>
                            </ul>
                        </div>
                        <div className="bg-white p-5 rounded-lg border border-slate-200">
                            <h3 className="font-semibold text-lg mb-3 text-slate-900">Brand and Authority Impersonation</h3>
                            <p className="text-slate-600 text-sm mb-2">Fraudsters exploit trust in known organisations:</p>
                            <ul className="text-slate-600 text-sm space-y-1">
                                <li>• Banks and financial services (Chase, HSBC, PayPal)</li>
                                <li>• Delivery companies (DHL, FedEx, UPS, postal services)</li>
                                <li>• Government agencies (tax authorities, immigration)</li>
                                <li>• Technology companies (Microsoft, Apple, Amazon)</li>
                            </ul>
                        </div>
                        <div className="bg-white p-5 rounded-lg border border-slate-200">
                            <h3 className="font-semibold text-lg mb-3 text-slate-900">Suspicious URL Structures</h3>
                            <p className="text-slate-600 text-sm mb-2">Malicious links often have telltale patterns:</p>
                            <ul className="text-slate-600 text-sm space-y-1">
                                <li>• Misspelled domains (e.g., paypa1.com, arnazon.com)</li>
                                <li>• Real brand in subdomain (paypal.scam-domain.com)</li>
                                <li>• URL shorteners hiding the actual destination</li>
                                <li>• Unusual top-level domains for known brands</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Already Clicked the Link or Responded to the Message? */}
            <section className="py-12 bg-white border-t border-slate-100">
                <div className="container mx-auto px-4 max-w-4xl">
                    <h2 className="text-2xl font-bold mb-6 text-slate-900">Already Clicked or Responded?</h2>
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                        <h3 className="text-xl font-bold text-red-800 mb-2">Not sure if it already happened?</h3>
                        <p className="text-slate-700 mb-6">
                            If you are thinking "<strong>I clicked a scam link</strong>" or "<strong>I gave my details to a scammer</strong>", do not panic. We have a dedicated tool to help you assess the damage and take control.
                        </p>
                        <div className="flex flex-wrap gap-4 mb-6">
                            <Link
                                href="/have-i-been-scammed"
                                className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors"
                            >
                                Have I Been Scammed? Start Assessment
                            </Link>
                        </div>
                        <p className="text-slate-700 mb-4 font-semibold">Immediate steps if you already acted:</p>
                        <ul className="text-slate-700 space-y-3 mb-4">
                            <li><strong>Entered credentials on a fake site?</strong> Change that password immediately on the real website. Enable two-factor authentication if available. Use a unique password for each account.</li>
                            <li><strong>Provided payment card details?</strong> Contact your bank or card issuer immediately. Request a new card number. Monitor statements for unauthorised charges.</li>
                            <li><strong>Sent money to a scammer?</strong> Contact your bank or payment service immediately. File a report with local law enforcement. Report the scam to consumer protection agencies.</li>
                            <li><strong>Gave remote access to your device?</strong> Disconnect from the internet. Run a full antivirus scan. Change all passwords from a different device. Consider professional malware removal.</li>
                        </ul>
                        <p className="text-slate-600 text-sm">
                            Reporting scams helps protect others. Consider reporting to your local consumer protection agency and the platform where you received the scam.
                        </p>
                    </div>
                </div>
            </section>

            {/* Clear Next Steps After Checking */}
            <section className="py-12 bg-slate-50 border-t border-slate-100">
                <div className="container mx-auto px-4 max-w-4xl">
                    <h2 className="text-2xl font-bold mb-6 text-slate-900">What to Do After Checking Your Suspicious Content</h2>
                    <ol className="space-y-4 text-slate-700">
                        <li className="flex gap-4">
                            <span className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">1</span>
                            <div>
                                <strong>Review the risk assessment above.</strong> If the result shows Medium or High risk, treat the message as potentially fraudulent. Do not click links, call numbers, or reply to the sender.
                            </div>
                        </li>
                        <li className="flex gap-4">
                            <span className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">2</span>
                            <div>
                                <strong>Verify through official channels.</strong> If the message claims to be from a company or organisation, contact them directly using contact information from their official website — never from the suspicious message itself.
                            </div>
                        </li>
                        <li className="flex gap-4">
                            <span className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">3</span>
                            <div>
                                <strong>Avoid clicking embedded links.</strong> Instead of clicking, type the official website address directly into your browser. Scammers rely on you automattically clicking without examining the destination.
                            </div>
                        </li>
                        <li className="flex gap-4">
                            <span className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">4</span>
                            <div>
                                <strong>Block and report the sender.</strong> Most messaging platforms allow you to report scam messages. This helps protect other users from the same campaign.
                            </div>
                        </li>
                        <li className="flex gap-4">
                            <span className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">5</span>
                            <div>
                                <strong>Learn more about specific scam types.</strong> Read our <Link href="/guides" className="text-primary hover:underline">comprehensive guides on identifying phishing, impersonation, and online fraud</Link> to recognise future threats.
                            </div>
                        </li>
                    </ol>
                </div>
            </section>

            {/* Trust Section */}
            <TrustSection />

            <LatestScams />

            <FAQ />
        </div>
    );
}
