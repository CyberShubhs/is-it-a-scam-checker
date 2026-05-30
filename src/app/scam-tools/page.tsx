import { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
    ShieldCheck,
    MessageSquare,
    Mail,
    Globe,
    Search,
    AlertTriangle,
    BookOpen,
} from 'lucide-react';

export const metadata: Metadata = pageMetadata({
    title: "Free Scam Checker Tools: Messages, Emails & Links",
    description: "Every free scam-checking tool in one place — text message checker, email phishing detector, URL safety analyser and the damage-control checklist.",
    canonical: "https://scamchecker.app/scam-tools",
});

export default function ScamToolsHub() {
    return (
        <div className="bg-slate-50 min-h-screen">
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <nav aria-label="Breadcrumb" className="mb-6 text-sm">
                    <ol className="flex items-center gap-2 text-slate-500">
                        <li>
                            <Link href="/" className="hover:text-slate-900">
                                Scam Checker home
                            </Link>
                        </li>
                        <li aria-hidden="true">/</li>
                        <li className="text-slate-700" aria-current="page">
                            Free scam-checking tools
                        </li>
                    </ol>
                </nav>

                <header className="mb-10">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 leading-tight">
                        Free scam-checking tools for messages, emails, and links
                    </h1>
                    <p className="text-lg text-slate-600 leading-relaxed">
                        Every scam-checking tool on Scam Checker is free, requires no sign-up, and analyses your content without storing it. This page collects all of them in one place so you can pick the right one for whatever you have just received — a suspicious text, a strange-looking email, a link a friend forwarded, or a website with prices that look too good to be true.
                    </p>
                </header>

                <section className="bg-white border border-slate-200 rounded-xl p-6 mb-8">
                    <p className="text-slate-700 mb-4 leading-relaxed">
                        Scams work because they catch you in a hurry. The whole strategy depends on you reacting fast — clicking the link, replying to the message, calling the number, or sending the payment before your guard goes up. The tools below exist to give you a one-minute pause where an automated check can flag the obvious red flags for you: lookalike domains, urgency phrases, impersonation patterns, and known fraudulent senders.
                    </p>
                    <p className="text-slate-700 mb-4 leading-relaxed">
                        Each tool is tuned for a specific kind of input. The general-purpose checker handles anything you paste in and tries to detect the type for you, but if you already know what you have — a text message, an email, or just a URL — the dedicated tools give you slightly tighter analysis. None of them store your content. Analysis runs as a request to our checker API and the request body is not retained after the response is returned.
                    </p>
                    <p className="text-slate-700 leading-relaxed">
                        Already replied, clicked, or sent money? The tools below help you verify suspicious content <em>before</em> you act. If you have already engaged, the right starting point is the recovery checklist further down this page, not another check.
                    </p>
                </section>

                <h2 className="text-2xl font-bold text-slate-900 mb-6">
                    Choose the right scam-checking tool for what you received
                </h2>
                <ul className="grid md:grid-cols-2 gap-4 list-none p-0 mb-12">
                    <li>
                        <Link
                            href="/check"
                            className="block h-full p-6 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all"
                        >
                            <Search className="w-8 h-8 text-blue-600 mb-3" />
                            <h3 className="font-semibold text-lg text-slate-900 mb-2">
                                General scam checker — paste anything to verify it
                            </h3>
                            <p className="text-sm text-slate-600">
                                Best when you are not sure what kind of content you have. The checker auto-detects messages, emails, and URLs, then runs the right analysis.
                            </p>
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/check-scam-text"
                            className="block h-full p-6 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all"
                        >
                            <MessageSquare className="w-8 h-8 text-blue-600 mb-3" />
                            <h3 className="font-semibold text-lg text-slate-900 mb-2">
                                Check a suspicious text or SMS message
                            </h3>
                            <p className="text-sm text-slate-600">
                                Tuned for SMS, WhatsApp, Telegram, and DMs — fake delivery alerts, family-impersonation pleas, bank scam texts, and toll/parking notices.
                            </p>
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/check-scam-email"
                            className="block h-full p-6 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all"
                        >
                            <Mail className="w-8 h-8 text-amber-600 mb-3" />
                            <h3 className="font-semibold text-lg text-slate-900 mb-2">
                                Check a suspicious email for phishing signs
                            </h3>
                            <p className="text-sm text-slate-600">
                                Designed for full email content — senders, subject lines, headers, fake invoices, credential-theft attempts, and business email compromise.
                            </p>
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/check-scam-link"
                            className="block h-full p-6 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all"
                        >
                            <Globe className="w-8 h-8 text-emerald-600 mb-3" />
                            <h3 className="font-semibold text-lg text-slate-900 mb-2">
                                Check a suspicious link or URL before clicking
                            </h3>
                            <p className="text-sm text-slate-600">
                                URL-focused analysis — lookalike domains, recently registered sites, link shorteners, suspicious subdomains, and known phishing patterns.
                            </p>
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/have-i-been-scammed"
                            className="block h-full p-6 rounded-xl bg-white border-2 border-red-200 hover:border-red-400 hover:shadow-md transition-all"
                        >
                            <AlertTriangle className="w-8 h-8 text-red-600 mb-3" />
                            <h3 className="font-semibold text-lg text-red-900 mb-2">
                                Have I been scammed? — damage-control checklist
                            </h3>
                            <p className="text-sm text-red-800">
                                Use this if you have already clicked, replied, or sent money. Step-by-step recovery actions ranked by urgency.
                            </p>
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/i-got-a-scam-message"
                            className="block h-full p-6 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all"
                        >
                            <ShieldCheck className="w-8 h-8 text-blue-600 mb-3" />
                            <h3 className="font-semibold text-lg text-slate-900 mb-2">
                                I got a scam message — what to do next
                            </h3>
                            <p className="text-sm text-slate-600">
                                Decision tree for the most common situation — you received something suspicious but have not engaged yet.
                            </p>
                        </Link>
                    </li>
                </ul>

                <section
                    aria-label="Reading material"
                    className="bg-white border border-slate-200 rounded-xl p-6 mb-8"
                >
                    <div className="flex items-start gap-4">
                        <BookOpen className="w-9 h-9 text-amber-500 flex-shrink-0" />
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">
                                Want context before you check?
                            </h2>
                            <p className="text-slate-700 mb-4 leading-relaxed">
                                If you would rather understand the scam pattern before running an automated check, our deeper resources cover the most common categories with real examples and protection advice.
                            </p>
                            <ul className="space-y-2 list-disc pl-5">
                                <li>
                                    <Link
                                        href="/scam-types"
                                        className="text-blue-700 hover:underline"
                                    >
                                        Browse scam types organised by category
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/scam-examples"
                                        className="text-blue-700 hover:underline"
                                    >
                                        See real scam message examples and red flags
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/scam-guides"
                                        className="text-blue-700 hover:underline"
                                    >
                                        Read step-by-step scam identification guides
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/latest-scams"
                                        className="text-blue-700 hover:underline"
                                    >
                                        Check the latest scam alerts and fraud news
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/reports"
                                        className="text-blue-700 hover:underline"
                                    >
                                        View community-reported scam phone numbers, URLs, and emails
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/report-a-scam"
                                        className="text-blue-700 hover:underline"
                                    >
                                        Report a scam to Scam Checker and official authorities
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>

                <div className="bg-slate-900 rounded-3xl p-12 text-center text-white">
                    <h2 className="text-2xl md:text-3xl font-bold mb-4">
                        Not sure which tool to use?
                    </h2>
                    <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
                        Start with the general checker — paste whatever you received, and it will figure out the right analysis for you.
                    </p>
                    <div className="flex justify-center gap-4 flex-wrap">
                        <Button asChild size="lg" className="bg-white text-slate-900 hover:bg-slate-100">
                            <Link href="/check">
                                Open the free scam checker now
                            </Link>
                        </Button>
                        <Button asChild size="lg" variant="outline" className="border-slate-700 text-white hover:bg-slate-800 hover:text-white">
                            <Link href="/how-it-works">
                                Read how the scam detection works
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
