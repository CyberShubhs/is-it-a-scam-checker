
import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { ScamChecker } from '@/components/ScamChecker';
import { TrustSection } from '@/components/TrustSection';
import { PageFAQ } from '@/components/PageFAQ';
import { SMS_FAQS } from '@/lib/faqs';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { JsonLd } from '@/components/JsonLd';
import { toolApplicationSchema, breadcrumbSchema } from '@/lib/schema';

export const metadata: Metadata = pageMetadata({
    title: "Check if a Text Message Is a Scam | Scam Checker",
    description: "Received a suspicious SMS or WhatsApp message? Use our free tool to instantly check if a text message is a scam. Protect yourself from smishing.",
    canonical: "https://scamchecker.app/check-scam-text",
});

export default function CheckScamTextPage() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Tool + breadcrumb schema (matches the visible breadcrumb above). */}
            <JsonLd
                data={toolApplicationSchema({
                    name: 'Text Message Scam Checker',
                    path: '/check-scam-text',
                    description:
                        'Paste a suspicious SMS or WhatsApp message to check it for smishing and scam signals before you click or reply.',
                })}
            />
            <JsonLd
                data={breadcrumbSchema([
                    { name: 'Home', path: '/' },
                    { name: 'Check Text Message', path: '/check-scam-text' },
                ])}
            />
            <section className="bg-slate-50 py-12 md:py-20">
                <div className="container mx-auto px-4 text-center">
                    <div className="flex justify-center items-center gap-2 mb-6 text-sm text-slate-500">
                        <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-slate-900 font-medium">Check Text Message</span>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-6">
                        Check if a Text Message Is a Scam
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
                        Paste any suspicious SMS, WhatsApp, or social media message below to spot hidden red flags instantly.
                    </p>

                    <ScamChecker defaultTab="text" />
                </div>
            </section>

            <TrustSection />

            <section className="py-16 bg-white">
                <div className="container mx-auto px-4 max-w-4xl">

                    {/* Panic CTA for High Intent Users */}
                    <div className="mb-16 bg-red-50 border border-red-200 rounded-2xl p-8 shadow-sm">
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-red-900 mb-2">Did you already click the link?</h2>
                                <p className="text-slate-700 mb-4">
                                    If you clicked a link or replied to a suspicious text message, <strong>don't panic</strong>.
                                    Our interactive assessment tool can help you determine if you are at risk and what steps to take immediately.
                                </p>
                                <ul className="text-sm text-red-800 space-y-1 mb-4">
                                    <li className="flex items-center gap-2">✓ Stop further contact immediately</li>
                                    <li className="flex items-center gap-2">✓ Assess financial risk</li>
                                    <li className="flex items-center gap-2">✓ Secure your accounts</li>
                                </ul>
                            </div>
                            <Link
                                href="/have-i-been-scammed"
                                className="w-full md:w-auto px-8 py-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 hover:shadow-lg transition-all text-center whitespace-nowrap"
                            >
                                Start Risk Assessment
                            </Link>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-12">
                        <div className="md:col-span-2 space-y-12">
                            <div>
                                <h2 className="text-3xl font-bold text-slate-900 mb-6">How Smishing Works: The Mechanics of a Text Scam</h2>
                                <p className="text-lg text-slate-700 leading-relaxed mb-6">
                                    "Smishing" (SMS phishing) is a cyberattack that uses deceptive text messages to trick you into revealing personal information or downloading malware. Unlike email phishing, which can often be filtered by spam detectors, text scams feel more personal and urgent, making them highly effective.
                                </p>
                                <p className="text-slate-700 leading-relaxed">
                                    Scammers often use "spoofing" technology to make their messages appear as if they are coming from a legitimate source, such as your bank, a government agency like the tax office, or a delivery service. They rely on creating a false sense of urgency—claiming a package is missed, a bank account is compromised, or a relative is in trouble—to bypass your natural skepticism.
                                </p>
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-6">Real-World Examples of Scam Texts in 2025</h2>

                                <div className="space-y-6">
                                    <div className="bg-slate-50 p-6 rounded-xl border-l-4 border-orange-500">
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">1. The "Missed Delivery" Scam</h3>
                                        <p className="text-slate-600 italic mb-3">"AusPost: We attempted to deliver your parcel today but no one was home. Reschedule here: [suspicious-link]"</p>
                                        <p className="text-sm text-slate-500">
                                            <strong>Why it works:</strong> Everyone waits for packages. The link usually asks for a small "redelivery fee" to steal your credit card details.
                                        </p>
                                    </div>

                                    <div className="bg-slate-50 p-6 rounded-xl border-l-4 border-red-500">
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">2. The "Hi Mum/Dad" Scam</h3>
                                        <p className="text-slate-600 italic mb-3">"Hi Mum, I broke my phone and lost my contacts. This is my new temporary number. I need to pay a bill urgently..."</p>
                                        <p className="text-sm text-slate-500">
                                            <strong>Why it works:</strong> It targets parental instincts. If you receive this, <Link href="/guides/whatsapp-scams-examples" className="text-blue-600 hover:underline">verify their identity</Link> by calling the old number or asking a personal question only they would know.
                                        </p>
                                    </div>

                                    <div className="bg-slate-50 p-6 rounded-xl border-l-4 border-purple-500">
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">3. The Fake Bank Alert</h3>
                                        <p className="text-slate-600 italic mb-3">"Security Alert: A payment of $499.00 to AMAZON was declined. If this was not you, visit [link] to secure your account."</p>
                                        <p className="text-sm text-slate-500">
                                            <strong>Why it works:</strong> Panic. You want to stop the "theft," so you click the link and inadvertently give the scammer your login credentials.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-6">Signs You've Received a Fake Text Message</h2>
                                <ul className="space-y-4">
                                    <li className="flex gap-4">
                                        <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">1</span>
                                        <div>
                                            <strong className="text-slate-900 block">Generic Greetings</strong>
                                            <p className="text-slate-600 text-sm">Legitimate organizations usually use your name. Scammers use "Dear Customer" or no name at all.</p>
                                        </div>
                                    </li>
                                    <li className="flex gap-4">
                                        <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">2</span>
                                        <div>
                                            <strong className="text-slate-900 block">Strange Links (URL Shorteners)</strong>
                                            <p className="text-slate-600 text-sm">Be wary of bit.ly links or URLs that don't match the official company domain (e.g., `netflix-support-update.com` instead of `netflix.com`). You can use our <Link href="/check-scam-link" className="text-blue-600 hover:underline">Link Checker</Link> to inspect them safely.</p>
                                        </div>
                                    </li>
                                    <li className="flex gap-4">
                                        <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">3</span>
                                        <div>
                                            <strong className="text-slate-900 block">Demands for Immediate Action</strong>
                                            <p className="text-slate-600 text-sm">Scammers want you to act before you think. Any message demanding immediate payment or threatening account closure is likely a fraud.</p>
                                        </div>
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">What to Do If You Receive a Suspicious Text</h2>
                                <p className="text-slate-700 mb-4">
                                    1. <strong>Do Not Reply:</strong> Replying confirms your number is active, leading to more spam.<br />
                                    2. <strong>Do Not Click Links:</strong> Even clicking can install malware or flag you as a target.<br />
                                    3. <strong>Report It:</strong> Forward the message to your country's scam reporting number (e.g., 7726 usually works in UK, US, AU).<br />
                                    4. <strong>Block the Number:</strong> Use your phone's built-in block feature.
                                </p>
                                <p className="text-slate-700">
                                    For a full list of official reporting channels, visit our <Link href="/global-scam-reporting" className="text-blue-600 hover:underline font-medium">Global Scam Reporting Guide</Link>.
                                </p>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-8">
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 sticky top-24">
                                <h3 className="font-bold text-slate-900 mb-4">Related Tools</h3>
                                <div className="space-y-3">
                                    <Link href="/check-scam-email" className="block p-3 bg-white border border-slate-200 rounded-lg hover:border-blue-500 transition-colors">
                                        <div className="font-medium text-slate-900">Email Checker</div>
                                        <div className="text-xs text-slate-500">Analyze suspicious emails</div>
                                    </Link>
                                    <Link href="/check-scam-link" className="block p-3 bg-white border border-slate-200 rounded-lg hover:border-blue-500 transition-colors">
                                        <div className="font-medium text-slate-900">Website Checker</div>
                                        <div className="text-xs text-slate-500">Scan URLs for safety</div>
                                    </Link>
                                </div>

                                <h3 className="font-bold text-slate-900 mt-8 mb-4">Latest Guides</h3>
                                <div className="space-y-3">
                                    <Link href="/guides/what-to-do-if-youve-been-scammed" className="block text-sm text-slate-600 hover:text-blue-600 hover:underline">
                                        I've been scammed! What now?
                                    </Link>
                                    <Link href="/guides" className="block text-sm text-slate-600 hover:text-blue-600 hover:underline">
                                        Browse all scam guides →
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Visible SMS-specific FAQ — also emits matching FAQPage JSON-LD
                so structured data is page-unique and matches visible content. */}
            <PageFAQ
                faqs={SMS_FAQS}
                title="SMS and text scam — Frequently Asked Questions"
            />
        </div>
    );
}
