
import type { Metadata } from 'next';
import { ScamChecker } from '@/components/ScamChecker';
import { TrustSection } from '@/components/TrustSection';
import { PageFAQ } from '@/components/PageFAQ';
import { EMAIL_FAQS } from '@/lib/faqs';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export const metadata: Metadata = {
    title: "Check if an Email Is a Scam | Scam Checker",
    description: "Not sure about an email? Paste it here to check for phishing scams, fake invoices, and imposter emails. Free instant email analysis.",
    alternates: {
        canonical: 'https://scamchecker.app/check-scam-email',
    },
    // Page-specific OG/Twitter — keeps social cards distinct from the
    // root site OG and from the other checker pages.
    openGraph: {
        title: 'Check if an Email Is a Scam — Free Phishing Email Checker',
        description:
            'Paste a suspicious email and spot phishing tells: spoofed senders, fake invoices, hidden links, and bank-impersonation language.',
        url: 'https://scamchecker.app/check-scam-email',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Check if an Email Is a Scam — Free Phishing Email Checker',
        description:
            'Phishing email check in seconds. Paste, read the red flags, decide if it is safe to open.',
    },
};

export default function CheckScamEmailPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <section className="bg-slate-50 py-12 md:py-20">
                <div className="container mx-auto px-4 text-center">
                    <div className="flex justify-center items-center gap-2 mb-6 text-sm text-slate-500">
                        <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-slate-900 font-medium">Check Email</span>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-6">
                        Check if an Email Is a Scam
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
                        Analyze suspicious emails for phishing attempts, fake invoices, or impersonation fraud.
                    </p>

                    <ScamChecker defaultTab="email" />
                </div>
            </section>

            <TrustSection />

            <section className="py-16 bg-white">
                <div className="container mx-auto px-4 max-w-4xl">

                    {/* Panic CTA */}
                    <div className="mb-16 bg-red-50 border border-red-200 rounded-2xl p-8 shadow-sm">
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-red-900 mb-2">Did you reply or download an attachment?</h2>
                                <p className="text-slate-700 mb-4">
                                    If you engaged with a suspicious email, your device or identity could be at risk.
                                    <strong>Do not forward the email</strong> to your personal accounts.
                                </p>
                                <ul className="text-sm text-red-800 space-y-1 mb-4">
                                    <li className="flex items-center gap-2">✓ Disconnect from your network</li>
                                    <li className="flex items-center gap-2">✓ Run a virus scan immediately</li>
                                    <li className="flex items-center gap-2">✓ Change passwords if you clicked a link</li>
                                </ul>
                            </div>
                            <Link
                                href="/have-i-been-scammed"
                                className="w-full md:w-auto px-8 py-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 hover:shadow-lg transition-all text-center whitespace-nowrap"
                            >
                                Help Me Fix This
                            </Link>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-12">
                        <div className="md:col-span-2 space-y-12">
                            <div>
                                <h2 className="text-3xl font-bold text-slate-900 mb-6">Identifying Scam Emails: A Comprehensive Guide</h2>
                                <p className="text-lg text-slate-700 leading-relaxed mb-6">
                                    Phishing emails are the most common entry point for cyberattacks. They are designed to steal your identity, login credentials, or financial information by impersonating trusted organizations like Netflix, Amazon, PayPal, or government bodies (IRS/ATO).
                                </p>
                                <p className="text-slate-700 leading-relaxed">
                                    Modern phishing is sophisticated. Scammers use authentic logos, professional formatting, and even personalized data (like your name or partial address) obtained from data breaches to make their emails look legitimate.
                                </p>
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-6">3 Types of Email Scams to Watch For</h2>

                                <div className="space-y-6">
                                    <div className="bg-slate-50 p-6 rounded-xl border-l-4 border-orange-500">
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">1. The "Account Suspended" Panic</h3>
                                        <p className="text-slate-600 italic mb-3">"Netflix: Your payment failed. Update your details immediately to avoid account suspension."</p>
                                        <p className="text-sm text-slate-500">
                                            <strong>The Goal:</strong> To panic you into clicking a link that steals your credit card details. <Link href="/check-scam-link" className="text-blue-600 hover:underline">Check the link</Link> before clicking!
                                        </p>
                                    </div>

                                    <div className="bg-slate-50 p-6 rounded-xl border-l-4 border-red-500">
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">2. The Fake Invoice (Geek Squad/Norton)</h3>
                                        <p className="text-slate-600 italic mb-3">"Thank you for your purchase of Norton 360 Lifetime. You have been charged $499.00. Call to cancel."</p>
                                        <p className="text-sm text-slate-500">
                                            <strong>The Goal:</strong> There is no charge. They want you to call the number so they can "refund" you, which involves installing remote access software on your PC.
                                        </p>
                                    </div>

                                    <div className="bg-slate-50 p-6 rounded-xl border-l-4 border-purple-500">
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">3. CEO Fraud / Business Email Compromise</h3>
                                        <p className="text-slate-600 italic mb-3">"Hi, are you at your desk? I need you to buy 5 Apple Gift Cards for a client. I'm in a meeting, so text me the codes."</p>
                                        <p className="text-sm text-slate-500">
                                            <strong>The Goal:</strong> Impersonating a boss to trick employees into sending money or gift cards.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-6">How to Analyze Email Headers (Advanced)</h2>
                                <p className="text-slate-700 mb-4">
                                    If you receive an email that looks real but feels "off," checking the "From" name isn't enough. Scammers can spoof names easily. You need to look at the <strong>Return-Path</strong> and <strong>Reply-To</strong> headers.
                                </p>
                                <ul className="space-y-4 bg-slate-50 p-6 rounded-xl border border-slate-200">
                                    <li className="flex gap-4">
                                        <div className="font-mono text-xs bg-slate-200 p-1 rounded h-fit">FROM</div>
                                        <div>
                                            <p className="text-sm text-slate-900 font-bold">Amazon Support &lt;support@amazon-security-alert.xyz&gt;</p>
                                            <p className="text-xs text-red-600">The name says Amazon, but the domain is .xyz, not .com.</p>
                                        </div>
                                    </li>
                                    <li className="flex gap-4">
                                        <div className="font-mono text-xs bg-slate-200 p-1 rounded h-fit">REPLY-TO</div>
                                        <div>
                                            <p className="text-sm text-slate-900 font-bold">refunds@gmail.com</p>
                                            <p className="text-xs text-red-600">Why would a big company use a personal Gmail address for support?</p>
                                        </div>
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">What to Do After Receiving a Scam Email</h2>
                                <p className="text-slate-700 mb-4">
                                    1. <strong>Mark as Junk/Spam:</strong> This trains your email provider to block similar messages.<br />
                                    2. <strong>Block the Sender:</strong> Prevent future emails from that specific address.<br />
                                    3. <strong>Report It:</strong> Forward phishing emails to the Anti-Phishing Working Group (APWG) at <em>reportphishing@apwg.org</em>.<br />
                                    4. <strong>Delete It:</strong> Do not keep it in your inbox.
                                </p>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-8">
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 sticky top-24">
                                <h3 className="font-bold text-slate-900 mb-4">Check Other Channels</h3>
                                <div className="space-y-3">
                                    <Link href="/check-scam-text" className="block p-3 bg-white border border-slate-200 rounded-lg hover:border-blue-500 transition-colors">
                                        <div className="font-medium text-slate-900">Text Message Checker</div>
                                        <div className="text-xs text-slate-500">Scan SMS and WhatsApp</div>
                                    </Link>
                                    <Link href="/check-scam-link" className="block p-3 bg-white border border-slate-200 rounded-lg hover:border-blue-500 transition-colors">
                                        <div className="font-medium text-slate-900">URL Checker</div>
                                        <div className="text-xs text-slate-500">Scan suspicious links</div>
                                    </Link>
                                </div>

                                <h3 className="font-bold text-slate-900 mt-8 mb-4">Essential Reading</h3>
                                <ul className="space-y-3">
                                    <li>
                                        <Link href="/have-i-been-scammed" className="text-red-600 font-medium hover:underline">
                                            ⚠️ I clicked a link! What now?
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/global-scam-reporting" className="text-slate-600 hover:text-blue-600 hover:underline">
                                            Where to report scams
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Email-specific FAQs with matching FAQPage JSON-LD. */}
            <PageFAQ
                faqs={EMAIL_FAQS}
                title="Phishing email — Frequently Asked Questions"
            />
        </div>
    );
}
