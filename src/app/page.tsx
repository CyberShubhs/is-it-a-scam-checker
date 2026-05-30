import { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { LatestScams } from '@/components/LatestScams';
import { ScamChecker } from '@/components/ScamChecker';
import { FAQ } from '@/components/FAQ';
import { GENERAL_FAQS } from '@/lib/faqs';
import { TrustSection } from '@/components/TrustSection';
import { getAllPosts } from '@/lib/posts';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MessageSquare, Mail, Globe, ArrowRight, BookOpen, ShieldCheck, AlertTriangle, Search, Newspaper } from 'lucide-react';

// SEO note: title/meta tuned for the "scam checker", "online scam checker",
// and "is this a scam" intent buckets. GSC shows homepage CTR of 2.78% at
// avg position 16 — this version leads with the tool's plain-English value
// proposition to lift CTR while we work on rank.
export const metadata: Metadata = pageMetadata({
    title: "Scam Checker: Check Links, Emails & Messages for Fraud",
    description: "Free scam checker. Paste a suspicious link, email, SMS or website for a plain-English fraud risk result in seconds — no sign-up, nothing stored.",
    canonical: "https://scamchecker.app",
});

const popularGuides = [
    { slug: 'is-this-website-legit', title: 'How to Tell If a Website Is Legitimate', description: 'Before entering payment details, check these signs' },
    { slug: 'how-to-spot-a-fake-link', title: 'Recognising Fake and Malicious Links', description: 'Subdomain tricks and lookalike domains explained' },
    { slug: 'scam-text-message-examples', title: 'Common SMS Scam Patterns and Examples', description: 'Parcel fees, bank alerts, and urgency tactics' },
    { slug: 'whatsapp-scams-examples', title: 'WhatsApp and Messaging App Scams', description: 'Family impersonation and investment frauds' },
    { slug: 'email-phishing-examples', title: 'Email Phishing: Real Examples and Red Flags', description: 'Invoice scams, credential theft, and fake alerts' },
    { slug: 'payid-scams-australia', title: 'Payment Platform Scams and Overpayment Tricks', description: 'PayID, Zelle, Venmo, and similar platforms' },
    { slug: 'bank-impersonation-scams', title: 'Bank Impersonation Scams: How Fraudsters Pose as Your Bank', description: 'Phone calls, texts, and emails claiming to be your bank' },
    { slug: 'facebook-marketplace-scams', title: 'Marketplace Scams: Facebook, eBay, and Classified Sites', description: 'Buyer and seller fraud tactics' },
];

export default function Home() {
    const recentPosts = getAllPosts().slice(0, 4);

    return (
        <div className="flex flex-col min-h-screen">

            {/* Hero Section */}
            <section className="bg-slate-50 py-12 md:py-20">
                <div className="container mx-auto px-4 text-center">
                    {/* H1 matches the GSC target query "scam checker" — single
                        H1 per page; the rest of the page uses H2/H3. */}
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-6">
                        Scam Checker: Check Links, Emails, Messages &amp; Websites for Fraud
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 mb-4 max-w-3xl mx-auto">
                        Paste a suspicious link, email, SMS, WhatsApp message, or website below. Our free scam checker analyses it for common fraud patterns — fake delivery alerts, bank impersonation, phishing attempts, investment groups, OTP requests — and gives you a plain-English risk result with red flags and next steps.
                    </p>
                    <p className="text-md text-slate-500 mb-8 max-w-2xl mx-auto">
                        Completely free, requires no sign-up, and your content is never stored. Works for scams targeting users worldwide.
                    </p>

                    <div className="flex flex-wrap justify-center gap-4 mb-10">
                        <Button asChild variant="outline" size="lg" className="rounded-full bg-white hover:bg-slate-100">
                            <Link href="/check-scam-text" className="gap-2">
                                <MessageSquare className="w-4 h-4 text-blue-500" />
                                Analyse a suspicious text message
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="rounded-full bg-white hover:bg-slate-100">
                            <Link href="/check-scam-email" className="gap-2">
                                <Mail className="w-4 h-4 text-amber-500" />
                                Analyse a suspicious email
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="rounded-full bg-white hover:bg-slate-100">
                            <Link href="/check-scam-link" className="gap-2">
                                <Globe className="w-4 h-4 text-green-500" />
                                Check a suspicious link or URL
                            </Link>
                        </Button>
                    </div>

                    <a id="checker" className="scroll-mt-24"></a>
                    <ScamChecker />

                    <p className="text-sm text-slate-500 mt-6 max-w-lg mx-auto leading-relaxed">
                        <strong>Your privacy matters:</strong> Content is analysed in your browser and never stored on our servers.
                        <br />
                        This tool provides guidance based on known patterns. Always verify suspicious requests through official channels.
                    </p>
                </div>
            </section>

            {/* Popular scam checks
                ----------------------------------------------------------------
                GSC told us /check and /reports are our strongest commercial-
                intent pages (highest CTR, best avg position). This section
                pushes link authority to those pages with descriptive anchors
                that also match real query intents like "is this website
                legit", "check scam link", etc. */}
            <section className="py-12 bg-white border-t border-slate-100">
                <div className="container mx-auto px-4 max-w-5xl">
                    <h2 className="text-2xl md:text-3xl font-bold text-center mb-3 text-slate-900">
                        Popular scam checks people run on this site
                    </h2>
                    <p className="text-center text-slate-600 mb-8 max-w-2xl mx-auto">
                        Pick the situation that matches yours. Each link opens
                        the right tool for the job — no sign-up, nothing stored.
                    </p>
                    <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 list-none p-0">
                        <li>
                            <Link
                                href="/check"
                                className="block h-full p-5 rounded-xl bg-slate-50 border border-slate-200 hover:border-primary hover:shadow-md transition-all"
                            >
                                <h3 className="font-semibold text-slate-900 mb-1">
                                    I got a scam message — check it for me
                                </h3>
                                <p className="text-slate-600 text-sm">
                                    Paste any SMS, WhatsApp or social DM into the
                                    main scam checker to see if it matches known
                                    fraud patterns.
                                </p>
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/check-scam-link"
                                className="block h-full p-5 rounded-xl bg-slate-50 border border-slate-200 hover:border-primary hover:shadow-md transition-all"
                            >
                                <h3 className="font-semibold text-slate-900 mb-1">
                                    Is this website legit, or is the link a scam?
                                </h3>
                                <p className="text-slate-600 text-sm">
                                    Run a URL through the link checker for
                                    lookalike domain, redirect, and phishing
                                    signal detection before you click.
                                </p>
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/check-scam-email"
                                className="block h-full p-5 rounded-xl bg-slate-50 border border-slate-200 hover:border-primary hover:shadow-md transition-all"
                            >
                                <h3 className="font-semibold text-slate-900 mb-1">
                                    Is this email a phishing attempt?
                                </h3>
                                <p className="text-slate-600 text-sm">
                                    Paste the email body or sender to check for
                                    fake invoices, credential theft, and business
                                    email compromise tactics.
                                </p>
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/check-scam-text"
                                className="block h-full p-5 rounded-xl bg-slate-50 border border-slate-200 hover:border-primary hover:shadow-md transition-all"
                            >
                                <h3 className="font-semibold text-slate-900 mb-1">
                                    Someone asked me for an OTP or code
                                </h3>
                                <p className="text-slate-600 text-sm">
                                    Use the SMS/WhatsApp checker to verify
                                    OTP-harvesting messages, fake bank codes, and
                                    "read back the number" scams.
                                </p>
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/reports"
                                className="block h-full p-5 rounded-xl bg-slate-50 border border-slate-200 hover:border-primary hover:shadow-md transition-all"
                            >
                                <h3 className="font-semibold text-slate-900 mb-1">
                                    Search the community scam report database
                                </h3>
                                <p className="text-slate-600 text-sm">
                                    Browse recent reports of scam websites,
                                    phone numbers, and emails submitted by other
                                    users.
                                </p>
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/have-i-been-scammed"
                                className="block h-full p-5 rounded-xl bg-red-50 border border-red-200 hover:border-red-400 hover:shadow-md transition-all"
                            >
                                <h3 className="font-semibold text-red-900 mb-1">
                                    I clicked a suspicious link — have I been
                                    scammed?
                                </h3>
                                <p className="text-red-800 text-sm">
                                    Open the damage-control checklist for the
                                    fastest way to lock down your accounts and
                                    money.
                                </p>
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/scam-website-checker"
                                className="block h-full p-5 rounded-xl bg-slate-50 border border-slate-200 hover:border-primary hover:shadow-md transition-all"
                            >
                                <h3 className="font-semibold text-slate-900 mb-1">
                                    Is this online store or website a scam?
                                </h3>
                                <p className="text-slate-600 text-sm">
                                    Use the scam website checker for shopping
                                    sites and lookalike domains before you pay.
                                </p>
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/scam-phone-number-checker"
                                className="block h-full p-5 rounded-xl bg-slate-50 border border-slate-200 hover:border-primary hover:shadow-md transition-all"
                            >
                                <h3 className="font-semibold text-slate-900 mb-1">
                                    Is this phone number or call a scam?
                                </h3>
                                <p className="text-slate-600 text-sm">
                                    Paste an SMS, voicemail transcript, or
                                    caller&apos;s script into the scam phone
                                    number checker.
                                </p>
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/crypto-scam-checker"
                                className="block h-full p-5 rounded-xl bg-slate-50 border border-slate-200 hover:border-primary hover:shadow-md transition-all"
                            >
                                <h3 className="font-semibold text-slate-900 mb-1">
                                    Is this crypto site or DM a scam?
                                </h3>
                                <p className="text-slate-600 text-sm">
                                    Use the crypto scam checker for wallet
                                    drainers, fake exchanges, and investment
                                    groups.
                                </p>
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/guides/job-scams"
                                className="block h-full p-5 rounded-xl bg-slate-50 border border-slate-200 hover:border-primary hover:shadow-md transition-all"
                            >
                                <h3 className="font-semibold text-slate-900 mb-1">
                                    Is this job offer or recruiter a scam?
                                </h3>
                                <p className="text-slate-600 text-sm">
                                    Use the job scam checker for fake recruiter
                                    DMs, task scams, and fake-cheque onboarding
                                    setups.
                                </p>
                            </Link>
                        </li>
                    </ul>
                </div>
            </section>

            {/* Trust Section */}
            <TrustSection />

            {/* Have I Been Scammed CTA */}
            <section className="py-12 bg-red-50 border-y border-red-100">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-2xl md:text-3xl font-bold text-red-900 mb-4">
                        Think you might have already been scammed?
                    </h2>
                    <p className="text-lg text-red-800 mb-8 max-w-2xl mx-auto">
                        If you already clicked a link, replied to a message, or sent money, checking the message now won't help. You need a damage control plan.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Button asChild size="lg" className="bg-red-600 hover:bg-red-700 text-white border-0">
                            <Link href="/have-i-been-scammed">
                                Open the &quot;I think I got scammed&quot; checklist
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="bg-white hover:bg-red-50 text-red-900 border-red-200">
                            <Link href="/guides/what-to-do-if-youve-been-scammed">
                                Read the full scam recovery guide
                            </Link>
                        </Button>
                    </div>
                    <div className="mt-6 text-sm text-red-700/80">
                        Common issues: <strong>"I clicked a fake link"</strong>, <strong>"I sent gift cards"</strong>, <strong>"I shared my password"</strong>
                    </div>
                </div>
            </section>

            {/* How Our Scam Detection Works */}
            <section className="py-16 bg-white border-t border-slate-100">
                <div className="container mx-auto px-4 max-w-4xl">
                    <h2 className="text-2xl md:text-3xl font-bold text-center mb-4 text-slate-900">How Our Scam Detection Technology Works</h2>
                    <p className="text-center text-slate-600 mb-12 max-w-2xl mx-auto">
                        When you paste content into the checker, our system scans for patterns that scammers commonly use. Here is what happens behind the scenes:
                    </p>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-7 h-7 text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-lg mb-2 text-slate-900">Text Pattern Analysis</h3>
                            <p className="text-slate-600 text-sm">We scan for urgency language, threats, requests for money or personal information, and impersonation of trusted organisations like banks, delivery services, and government agencies.</p>
                        </div>
                        <div className="text-center">
                            <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle className="w-7 h-7 text-amber-600" />
                            </div>
                            <h3 className="font-semibold text-lg mb-2 text-slate-900">URL and Link Verification</h3>
                            <p className="text-slate-600 text-sm">Links are checked for lookalike domains, suspicious subdomains, URL shorteners hiding malicious destinations, and domains that do not match the claimed sender.</p>
                        </div>
                        <div className="text-center">
                            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ShieldCheck className="w-7 h-7 text-green-600" />
                            </div>
                            <h3 className="font-semibold text-lg mb-2 text-slate-900">Risk Assessment and Guidance</h3>
                            <p className="text-slate-600 text-sm">Based on the red flags found, you receive a risk score (Low, Medium, or High) with explanations and specific advice on what to do next.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Common Fraud Patterns We Detect */}
            <section className="py-16 bg-slate-50 border-t border-slate-100">
                <div className="container mx-auto px-4 max-w-4xl">
                    <h2 className="text-2xl md:text-3xl font-bold text-center mb-4 text-slate-900">Fraud Patterns and Scam Tactics We Detect</h2>
                    <p className="text-center text-slate-600 mb-10 max-w-2xl mx-auto">
                        Scammers worldwide use predictable tactics. Our checker looks for these common warning signs:
                    </p>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-xl border border-slate-200">
                            <h3 className="font-semibold text-lg mb-3 text-slate-900">Urgency and Pressure Tactics</h3>
                            <p className="text-slate-600 text-sm mb-2">Scammers create panic to prevent you from thinking clearly:</p>
                            <ul className="text-slate-600 text-sm space-y-1">
                                <li>• &quot;Act now or your account will be suspended&quot;</li>
                                <li>• &quot;You have 24 hours to respond&quot;</li>
                                <li>• Threats of arrest, legal action, or financial penalties</li>
                                <li>• Claims that you have won a prize that expires soon</li>
                            </ul>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-slate-200">
                            <h3 className="font-semibold text-lg mb-3 text-slate-900">Suspicious Payment Requests</h3>
                            <p className="text-slate-600 text-sm mb-2">Legitimate organisations never ask for payment this way:</p>
                            <ul className="text-slate-600 text-sm space-y-1">
                                <li>• Gift cards, cryptocurrency, or wire transfers</li>
                                <li>• Overpayment scams asking you to refund the difference</li>
                                <li>• Requests to send money to &quot;verify&quot; your account</li>
                                <li>• Fake invoices for services you did not order</li>
                            </ul>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-slate-200">
                            <h3 className="font-semibold text-lg mb-3 text-slate-900">Organisation Impersonation</h3>
                            <p className="text-slate-600 text-sm mb-2">Fraudsters pose as trusted entities to steal your information:</p>
                            <ul className="text-slate-600 text-sm space-y-1">
                                <li>• Banks and financial institutions</li>
                                <li>• Delivery companies (DHL, FedEx, UPS, postal services)</li>
                                <li>• Tax authorities and government agencies</li>
                                <li>• Technology companies (Microsoft, Apple, Google)</li>
                            </ul>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-slate-200">
                            <h3 className="font-semibold text-lg mb-3 text-slate-900">Malicious Links and Fake Websites</h3>
                            <p className="text-slate-600 text-sm mb-2">Designed to steal credentials or install malware:</p>
                            <ul className="text-slate-600 text-sm space-y-1">
                                <li>• Lookalike domains (e.g., paypa1.com, amaz0n-secure.com)</li>
                                <li>• Legitimate brand in subdomain (paypal.scam-site.com)</li>
                                <li>• URL shorteners hiding the real destination</li>
                                <li>• Newly registered domains with no history</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Types of Scams You Can Analyse */}
            <section className="py-12 bg-white border-t border-slate-100">
                <div className="container mx-auto px-4">
                    <h2 className="text-2xl font-bold text-center mb-8 text-slate-800">Types of Suspicious Content You Can Analyse</h2>
                    <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                        <Link href="/check-scam-text" className="group p-6 rounded-xl border border-slate-200 hover:border-blue-200 hover:shadow-md transition-all">
                            <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600">Check Text Messages for Scam Signs</h3>
                            <p className="text-slate-600 text-sm">Verify SMS, WhatsApp, Telegram, or social media messages that seem suspicious. Common examples include fake delivery alerts, bank warnings, and family impersonation scams.</p>
                        </Link>
                        <Link href="/check-scam-email" className="group p-6 rounded-xl border border-slate-200 hover:border-amber-200 hover:shadow-md transition-all">
                            <h3 className="font-semibold text-lg mb-2 group-hover:text-amber-600">Analyse Emails for Phishing Attempts</h3>
                            <p className="text-slate-600 text-sm">Check emails for phishing signs, fake invoices, credential theft attempts, and business email compromise. We analyse sender patterns, link destinations, and content signatures.</p>
                        </Link>
                        <Link href="/check-scam-link" className="group p-6 rounded-xl border border-slate-200 hover:border-green-200 hover:shadow-md transition-all">
                            <h3 className="font-semibold text-lg mb-2 group-hover:text-green-600">Verify Website URLs Before Clicking</h3>
                            <p className="text-slate-600 text-sm">Scan links and URLs before visiting. We check for lookalike domains, recently registered sites, and URL patterns associated with phishing and malware distribution.</p>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Why Scams Work Worldwide */}
            <section className="py-12 bg-slate-50 border-t border-slate-100">
                <div className="container mx-auto px-4 max-w-4xl">
                    <h2 className="text-2xl font-bold text-center mb-6 text-slate-900">Why Online Scams Are So Effective</h2>
                    <p className="text-slate-600 mb-6">
                        Scammers exploit universal human psychology. They create urgency to prevent rational thinking, impersonate trusted authorities to lower your guard, and use fear of loss to push you toward quick decisions. These tactics work regardless of where you live.
                    </p>
                    <p className="text-slate-600 mb-6">
                        Modern scams are sophisticated. They use real company logos, mimic official communication styles, and register domains that look legitimate at first glance. Even experienced internet users can be fooled when they are distracted, tired, or stressed.
                    </p>
                    <p className="text-slate-600">
                        That is why automated checking tools are valuable. They apply consistent analysis without the emotional reactions that scammers exploit. When you receive something suspicious, let our tool provide a second opinion before you act.
                    </p>
                </div>
            </section>

            {/* Popular Scam Guides Section */}
            <section className="py-12 bg-white border-t border-slate-100">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-center gap-3 mb-3">
                        <BookOpen className="w-6 h-6 text-primary" />
                        <h2 className="text-2xl font-bold text-slate-800">Learn to Identify Specific Scam Types</h2>
                    </div>
                    <p className="text-center text-slate-600 mb-8 max-w-2xl mx-auto">
                        Our guides explain how different scam types work, show real examples, and provide step-by-step advice on protecting yourself.
                    </p>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
                        {popularGuides.map((guide) => (
                            <Link
                                key={guide.slug}
                                href={`/guides/${guide.slug}`}
                                className="group p-5 rounded-xl bg-slate-50 border border-slate-200 hover:border-primary/50 hover:shadow-md transition-all"
                            >
                                <h3 className="font-semibold text-slate-900 mb-2 group-hover:text-primary transition-colors">
                                    {guide.title}
                                </h3>
                                <p className="text-slate-500 text-sm">{guide.description}</p>
                            </Link>
                        ))}
                    </div>
                    <div className="text-center mt-8">
                        <Button asChild variant="outline" size="lg">
                            <Link href="/guides" className="gap-2">
                                Browse all scam identification guides
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Latest scam alerts from the blog */}
            {recentPosts.length > 0 && (
                <section className="py-12 bg-slate-50 border-t border-slate-100">
                    <div className="container mx-auto px-4 max-w-6xl">
                        <div className="flex items-center justify-center gap-3 mb-3">
                            <Newspaper className="w-6 h-6 text-primary" />
                            <h2 className="text-2xl font-bold text-slate-800">
                                Latest scam alerts and fraud news
                            </h2>
                        </div>
                        <p className="text-center text-slate-600 mb-8 max-w-2xl mx-auto">
                            Real scams reported recently. Click any alert to read the full breakdown,
                            red flags, and what to do if you have been targeted.
                        </p>
                        <ul className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 list-none p-0">
                            {recentPosts.map((p) => (
                                <li key={p.slug}>
                                    <Link
                                        href={`/blog/${p.slug}`}
                                        className="group p-5 rounded-xl bg-white border border-slate-200 hover:border-primary/50 hover:shadow-md transition-all flex flex-col h-full"
                                    >
                                        <time
                                            dateTime={p.frontmatter.date}
                                            className="text-xs font-medium text-slate-500 mb-1"
                                        >
                                            {new Date(p.frontmatter.date).toLocaleDateString(
                                                'en-AU',
                                                { day: 'numeric', month: 'long', year: 'numeric' },
                                            )}
                                        </time>
                                        <h3 className="font-semibold text-slate-900 mb-2 group-hover:text-primary transition-colors leading-snug">
                                            {p.frontmatter.title}
                                        </h3>
                                        <p className="text-slate-500 text-sm">
                                            {p.frontmatter.summary}
                                        </p>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        <div className="text-center mt-8">
                            <Button asChild variant="outline" size="lg">
                                <Link href="/blog" className="gap-2">
                                    Read every scam alert on the blog
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </section>
            )}

            <LatestScams />

            {/* Quick navigation hub */}
            <nav
                aria-label="Scam Checker site navigation"
                className="py-12 bg-white border-t border-slate-100"
            >
                <div className="container mx-auto px-4 max-w-5xl">
                    <h2 className="text-2xl font-bold text-center text-slate-900 mb-3">
                        Where to go next on Scam Checker
                    </h2>
                    <p className="text-center text-slate-600 mb-8 max-w-2xl mx-auto">
                        Pick the path that matches your situation — verify a message, recover from a scam, or learn how scammers operate.
                    </p>
                    <ul className="grid md:grid-cols-3 gap-3 text-sm list-none p-0">
                        <li>
                            <Link
                                href="/check"
                                className="block p-4 rounded-lg border border-slate-200 hover:border-primary text-slate-800 hover:text-primary"
                            >
                                Check if a website or message is a scam
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/guides"
                                className="block p-4 rounded-lg border border-slate-200 hover:border-primary text-slate-800 hover:text-primary"
                            >
                                Read scam identification guides
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/reports"
                                className="block p-4 rounded-lg border border-slate-200 hover:border-primary text-slate-800 hover:text-primary"
                            >
                                View community-reported scam reports
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/have-i-been-scammed"
                                className="block p-4 rounded-lg border border-red-200 hover:border-red-400 text-red-700 font-semibold"
                            >
                                Have I been scammed? Damage-control checklist
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/global-scam-reporting"
                                className="block p-4 rounded-lg border border-slate-200 hover:border-primary text-slate-800 hover:text-primary"
                            >
                                Report a scam in your country
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/how-it-works"
                                className="block p-4 rounded-lg border border-slate-200 hover:border-primary text-slate-800 hover:text-primary"
                            >
                                How our scam detection technology works
                            </Link>
                        </li>
                    </ul>
                </div>
            </nav>

            {/* FAQ Section */}
            <FAQ />

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@graph": [
                            // WebSite + Organization are now emitted site-wide
                            // from src/app/layout.tsx. The previous SearchAction
                            // here was misleading — there is no /?q= search
                            // surface — so it was removed (structured data must
                            // match visible content).
                            {
                                "@type": "WebApplication",
                                "@id": "https://scamchecker.app/#scam-checker-app",
                                "name": "Scam Checker",
                                "url": "https://scamchecker.app/check",
                                "description":
                                    "Free, privacy-first scam checker. Paste a message, email, URL, SMS, image, or PDF and get an instant client-side risk assessment with the red flags called out.",
                                "applicationCategory": "SecurityApplication",
                                "operatingSystem": "Web",
                                "isAccessibleForFree": true,
                                "offers": {
                                    "@type": "Offer",
                                    "price": "0",
                                    "priceCurrency": "USD"
                                }
                            },
                            {
                                // FAQPage is built from the SAME GENERAL_FAQS
                                // array the visible <FAQ /> accordion renders,
                                // so structured data always matches what users
                                // see (a Google/Ahrefs requirement). Previously
                                // this was a hand-maintained 4-question list
                                // that had drifted from the 7 visible questions.
                                "@type": "FAQPage",
                                "mainEntity": GENERAL_FAQS.map((f) => ({
                                    "@type": "Question",
                                    name: f.question,
                                    acceptedAnswer: {
                                        "@type": "Answer",
                                        text: f.answer,
                                    },
                                })),
                            }
                        ]
                    })
                }}
            />

        </div>
    );
}
