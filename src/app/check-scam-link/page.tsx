
import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { ScamChecker } from '@/components/ScamChecker';
import { TrustSection } from '@/components/TrustSection';
import { PageFAQ } from '@/components/PageFAQ';
import { LINK_FAQS } from '@/lib/faqs';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { JsonLd } from '@/components/JsonLd';
import { toolApplicationSchema, breadcrumbSchema } from '@/lib/schema';

export const metadata: Metadata = pageMetadata({
    title: "Check if a Link or URL Is a Scam | Scam Checker",
    description: "Suspicious link? Check if a website URL is safe or a scam. Detect malicious sites and shortened links instantly.",
    canonical: "https://scamchecker.app/check-scam-link",
});

export default function CheckScamLinkPage() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Tool + breadcrumb schema (matches the visible breadcrumb above). */}
            <JsonLd
                data={toolApplicationSchema({
                    name: 'Link & URL Scam Checker',
                    path: '/check-scam-link',
                    description:
                        'Paste a suspicious link or URL to check it for scam signals — lookalike domains, shorteners and known phishing patterns.',
                })}
            />
            <JsonLd
                data={breadcrumbSchema([
                    { name: 'Home', path: '/' },
                    { name: 'Check Website URL', path: '/check-scam-link' },
                ])}
            />
            <section className="bg-slate-50 py-12 md:py-20">
                <div className="container mx-auto px-4 text-center">
                    <div className="flex justify-center items-center gap-2 mb-6 text-sm text-slate-500">
                        <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-slate-900 font-medium">Check Website URL</span>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-6">
                        Check if a Link or URL Is a Scam
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
                        Paste any link, URL, or website address to check if it's safe before you click.
                    </p>

                    <ScamChecker defaultTab="url" />
                </div>
            </section>

            <TrustSection />

            <section className="py-16 bg-white">
                <div className="container mx-auto px-4 max-w-4xl">

                    {/* Panic CTA */}
                    <div className="mb-16 bg-red-50 border border-red-200 rounded-2xl p-8 shadow-sm">
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-red-900 mb-2">Did you visit the website or enter your password?</h2>
                                <p className="text-slate-700 mb-4">
                                    Visiting a malicious site can sometimes trigger automatic downloads, and entering data puts you at immediate risk.
                                </p>
                                <ul className="text-sm text-red-800 space-y-1 mb-4">
                                    <li className="flex items-center gap-2">✓ Close the browser tab immediately</li>
                                    <li className="flex items-center gap-2">✓ Change your passwords from a different device</li>
                                    <li className="flex items-center gap-2">✓ Contact your bank if you entered card details</li>
                                </ul>
                            </div>
                            <Link
                                href="/have-i-been-scammed"
                                className="w-full md:w-auto px-8 py-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 hover:shadow-lg transition-all text-center whitespace-nowrap"
                            >
                                Start Assessment
                            </Link>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-12">
                        <div className="md:col-span-2 space-y-12">
                            <div>
                                <h2 className="text-3xl font-bold text-slate-900 mb-6">How to Spot a Fake Website Link</h2>
                                <p className="text-lg text-slate-700 leading-relaxed mb-6">
                                    Scammers are experts at creating fake websites that look almost identical to the real ones. This technique, known as "typosquatting" or URL spoofing, tricks you into believing you are logging into your bank, Netflix, or email account, when you are actually handing your credentials directly to criminals.
                                </p>
                                <p className="text-slate-700 leading-relaxed">
                                    Just because a website has a padlock icon (HTTPS) does not mean it is legitimate. It simply means the connection is encrypted—scammers use encrypted connections too.
                                </p>
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-6">The Anatomy of a Scam URL</h2>

                                <div className="space-y-6">
                                    <div className="bg-slate-50 p-6 rounded-xl border-l-4 border-orange-500">
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">1. Typosquatting (Lookalike Domains)</h3>
                                        <p className="text-slate-600 mb-3">
                                            Scammers register domains that look like popular sites but have small spelling mistakes.
                                        </p>
                                        <ul className="text-sm text-slate-500 space-y-2 list-disc pl-5">
                                            <li>Real: <code>netflix.com</code></li>
                                            <li>Fake: <code>neftlex.com</code> (Transposed letters)</li>
                                            <li>Fake: <code>netflix-support-update.com</code> (Added words)</li>
                                        </ul>
                                    </div>

                                    <div className="bg-slate-50 p-6 rounded-xl border-l-4 border-red-500">
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">2. Top-Level Domain (TLD) Tricks</h3>
                                        <p className="text-slate-600 mb-3">
                                            Most major brands use <strong>.com</strong>, <strong>.org</strong>, or local domains like <strong>.com.au</strong> or <strong>.co.uk</strong>. Be very suspicious of specialized TLDs.
                                        </p>
                                        <p className="text-sm text-slate-500">
                                            <strong>Watch out for:</strong> <code>.xyz</code>, <code>.top</code>, <code>.online</code>, <code>.shop</code> (when not a known shop).
                                        </p>
                                    </div>

                                    <div className="bg-slate-50 p-6 rounded-xl border-l-4 border-purple-500">
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">3. URL Shorteners</h3>
                                        <p className="text-slate-600 mb-3">
                                            Scammers use services like bit.ly, tinyurl, or is.gd to hide the true destination of a link.
                                        </p>
                                        <p className="text-sm text-slate-500">
                                            <strong>Rule of Thumb:</strong> Never click a shortened link from an unknown sender. Use our <Link href="#" className="font-bold">Link Checker</Link> above to reveal the true URL first.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-6">What is "Drive-By Download"?</h2>
                                <p className="text-slate-700 mb-4">
                                    Some sophisticated scam sites can infect your computer with malware just by visiting them. This is called a "drive-by download."
                                </p>
                                <p className="text-slate-700 mb-4">
                                    They exploit outdated vulnerabilities in your browser. This is why it is critical to:
                                </p>
                                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                                    <li>Keep your browser (Chrome, Safari, Edge) updated.</li>
                                    <li>Use an ad-blocker to prevent malicious ads from loading.</li>
                                    <li>Install a reputable antivirus program.</li>
                                </ul>
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">How to Verify a Website Manually</h2>
                                <p className="text-slate-700 mb-4">
                                    1. <strong>Check the "About Us" Page:</strong> Fake sites often have generic text or poor grammar.<br />
                                    2. <strong>Look for Contact Info:</strong> Legit businesses have a real address and phone number. Fake ones often only have a web form.<br />
                                    3. <strong>Check Domain Age:</strong> You can use a "Whois" lookup tool. If a major bank's website was created 2 days ago, it's a scam.
                                </p>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-8">
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 sticky top-24">
                                <h3 className="font-bold text-slate-900 mb-4">Verify Communications</h3>
                                <div className="space-y-3">
                                    <Link href="/check-scam-text" className="block p-3 bg-white border border-slate-200 rounded-lg hover:border-blue-500 transition-colors">
                                        <div className="font-medium text-slate-900">Text Message Checker</div>
                                        <div className="text-xs text-slate-500">Scan SMS and WhatsApp</div>
                                    </Link>
                                    <Link href="/check-scam-email" className="block p-3 bg-white border border-slate-200 rounded-lg hover:border-blue-500 transition-colors">
                                        <div className="font-medium text-slate-900">Email Checker</div>
                                        <div className="text-xs text-slate-500">Analyze suspicious emails</div>
                                    </Link>
                                </div>

                                <h3 className="font-bold text-slate-900 mt-8 mb-4">Global Reporting</h3>
                                <p className="text-sm text-slate-600 mb-4">
                                    Found a fake website? Help take it down by reporting it.
                                </p>
                                <Link href="/global-scam-reporting" className="block w-full text-center py-2 px-4 bg-white border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors">
                                    Report a Scam Site
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Link/URL-specific FAQs with matching FAQPage JSON-LD. */}
            <PageFAQ
                faqs={LINK_FAQS}
                title="Suspicious link — Frequently Asked Questions"
            />
        </div>
    );
}
