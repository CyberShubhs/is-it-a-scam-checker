import React from 'react';
import { Metadata } from 'next';
import { prisma } from '@/lib/db';
import { Report } from '@prisma/client';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertOctagon, BookOpen, ShieldCheck, Users, TrendingUp, Globe, Phone, Mail, Coins, Clock, Flame, ArrowRight } from 'lucide-react';
import { PageFAQ } from '@/components/PageFAQ';
import { REPORTS_FAQS } from '@/lib/faqs';
import { maskReportValue, redactSensitive } from '@/lib/redact';

// SEO note: /reports is the second-highest CTR page in GSC (2.9% at avg
// position 5.91). Title/meta tuned for "scam reports", "reported scam
// websites", and "scam report database" intent.
export const metadata: Metadata = {
    title: 'Live Scam Reports: Search Reported Websites, Emails & Phone Numbers',
    description: 'Browse recent scam reports submitted by users — suspicious websites, emails, phone numbers and messages. Search the community scam report database.',
    alternates: {
        canonical: 'https://scamchecker.app/reports',
    },
    openGraph: {
        title: 'Live Scam Reports: Search Reported Websites, Emails & Phone Numbers',
        description: 'Browse recent scam reports submitted by users — suspicious websites, emails, phone numbers and messages.',
        url: 'https://scamchecker.app/reports',
    },
};

export const dynamic = 'force-dynamic';


// Public-facing masking is now delegated to src/lib/redact.ts so the
// API route and the page renderer never drift out of sync. URL values are
// also rendered as the host only (path can carry tokens) — see
// maskReportValue.
const maskValue = (type: string, val: string) => maskReportValue(type, val);

export default async function ReportsPage() {
    let reports: Report[] = [];
    let error = false;

    try {
        reports = await prisma.report.findMany({
            take: 50,
            orderBy: { created_at: 'desc' },
        });
    } catch (e) {
        error = true;
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <div className="mb-8">
                    <Link href="/" className="text-sm text-slate-500 hover:text-slate-900 transition-colors mb-4 inline-block">&larr; Return to Scam Checker home</Link>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            {/* H1 matches the new SEO title and tells visitors
                                what they can actually do here: search reports. */}
                            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                                <AlertOctagon className="w-8 h-8 text-red-600" />
                                Live Scam Reports: Search Reported Websites, Emails &amp; Phone Numbers
                            </h1>
                            <p className="text-slate-600 mt-2">
                                Browse recent scam reports submitted by users —
                                suspicious websites, phishing emails, scam phone
                                numbers, and SMS senders. This is the community
                                scam report database. Search the feed below, or
                                use the category filters to narrow your search.
                            </p>
                            <p className="text-sm text-slate-500 mt-3">
                                Not sure if something is a scam yet?{' '}
                                <Link
                                    href="/check"
                                    className="text-primary hover:underline"
                                >
                                    Run it through the free scam checker first
                                </Link>
                                . Already clicked a suspicious link?{' '}
                                <Link
                                    href="/have-i-been-scammed"
                                    className="text-red-600 hover:underline font-semibold"
                                >
                                    Open the have-I-been-scammed checklist
                                </Link>
                                .
                            </p>
                        </div>
                        <Button asChild variant="default" className="bg-red-600 hover:bg-red-700">
                            <Link href="/check">Report a suspicious message or link</Link>
                        </Button>
                    </div>
                </div>

                {/* Why Community Reports Matter */}
                <section className="bg-white p-6 rounded-xl border border-slate-200 mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <Users className="w-6 h-6 text-primary" />
                        <h2 className="text-xl font-bold text-slate-900">How Community Reports Help Everyone Stay Safe</h2>
                    </div>
                    <p className="text-slate-600 mb-4">
                        Scammers frequently change phone numbers, domains, and tactics to avoid detection. By sharing what you receive, you help others recognise active fraud campaigns before they become victims. Every report contributes to a collective defence network.
                    </p>
                    <p className="text-slate-600">
                        If you see a number or link here that matches something you received, treat it with extra caution. If you have received something suspicious that is not yet listed, use our <Link href="/check" className="text-primary hover:underline">scam checker tool to analyse it and contribute to the database</Link>.
                    </p>
                </section>

                {/* How to Use This Report Data */}
                <section className="bg-white p-6 rounded-xl border border-slate-200 mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <TrendingUp className="w-6 h-6 text-blue-500" />
                        <h2 className="text-xl font-bold text-slate-900">Practical Ways to Use This Real-Time Scam Data</h2>
                    </div>
                    <ul className="text-slate-600 space-y-2">
                        <li>• <strong>Verify incoming calls:</strong> Received a call from an unknown number? Search this list to see if others have reported it as fraudulent.</li>
                        <li>• <strong>Check links before clicking:</strong> Before visiting a URL in a text or email, check here to see if it has been flagged as malicious.</li>
                        <li>• <strong>Identify active campaigns:</strong> Browse recent reports to understand what scam patterns are circulating right now.</li>
                        <li>• <strong>Contribute your experience:</strong> If you received a scam attempt, <Link href="/check" className="text-primary hover:underline">analyse and report it to help protect others</Link>.</li>
                    </ul>
                </section>

                {/* Report category navigation */}
                <nav
                    aria-label="Browse community reports by category"
                    className="bg-white border border-slate-200 rounded-xl p-6 mb-8"
                >
                    <h2 className="text-xl font-bold text-slate-900 mb-4">
                        Browse community scam reports by category
                    </h2>
                    <p className="text-slate-600 mb-5 text-sm">
                        Pick a category to filter the reports feed, or jump straight to the latest and trending fraud campaigns.
                    </p>
                    <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 list-none p-0">
                        <li>
                            <Link
                                href="/reports/websites"
                                className="flex items-start gap-3 p-4 rounded-lg border border-slate-200 hover:border-blue-400 transition-colors h-full"
                            >
                                <Globe className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                <span>
                                    <span className="block font-semibold text-slate-900">
                                        Reported scam websites and phishing URLs
                                    </span>
                                    <span className="block text-xs text-slate-500 mt-1">
                                        Fake stores, lookalike domains, malicious redirects
                                    </span>
                                </span>
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/reports/phone-numbers"
                                className="flex items-start gap-3 p-4 rounded-lg border border-slate-200 hover:border-blue-400 transition-colors h-full"
                            >
                                <Phone className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                <span>
                                    <span className="block font-semibold text-slate-900">
                                        Reported scam phone numbers and SMS senders
                                    </span>
                                    <span className="block text-xs text-slate-500 mt-1">
                                        Fake delivery texts, bank impersonation, robocalls
                                    </span>
                                </span>
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/reports/emails"
                                className="flex items-start gap-3 p-4 rounded-lg border border-slate-200 hover:border-blue-400 transition-colors h-full"
                            >
                                <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                <span>
                                    <span className="block font-semibold text-slate-900">
                                        Reported scam email addresses and phishing senders
                                    </span>
                                    <span className="block text-xs text-slate-500 mt-1">
                                        Phishing, fake invoices, business email compromise
                                    </span>
                                </span>
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/reports/crypto-wallets"
                                className="flex items-start gap-3 p-4 rounded-lg border border-slate-200 hover:border-blue-400 transition-colors h-full"
                            >
                                <Coins className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                <span>
                                    <span className="block font-semibold text-slate-900">
                                        Reported scam crypto wallets and DeFi addresses
                                    </span>
                                    <span className="block text-xs text-slate-500 mt-1">
                                        Rug pulls, fake giveaways, pig-butchering investment fraud
                                    </span>
                                </span>
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/reports/latest"
                                className="flex items-start gap-3 p-4 rounded-lg border border-slate-200 hover:border-blue-400 transition-colors h-full"
                            >
                                <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                <span>
                                    <span className="block font-semibold text-slate-900">
                                        Latest scam reports across all categories
                                    </span>
                                    <span className="block text-xs text-slate-500 mt-1">
                                        Fresh fraud attempts flagged in the last few days
                                    </span>
                                </span>
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/reports/trending"
                                className="flex items-start gap-3 p-4 rounded-lg border border-slate-200 hover:border-blue-400 transition-colors h-full"
                            >
                                <Flame className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                <span>
                                    <span className="block font-semibold text-slate-900">
                                        Trending scam reports and active campaigns
                                    </span>
                                    <span className="block text-xs text-slate-500 mt-1">
                                        Repeat-offender numbers, surging phishing waves
                                    </span>
                                </span>
                            </Link>
                        </li>
                    </ul>
                </nav>

                {/* Cross-linking CTAs */}
                <div className="grid md:grid-cols-2 gap-4 mb-8">
                    <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4">
                        <ShieldCheck className="w-10 h-10 text-primary flex-shrink-0" />
                        <div className="flex-1">
                            <h3 className="font-semibold text-slate-900 mb-1">Received something suspicious?</h3>
                            <p className="text-sm text-slate-600 mb-3">Paste it in our checker for instant fraud risk assessment.</p>
                            <Button asChild size="sm" variant="default">
                                <Link href="/check">Analyse a suspicious message or link</Link>
                            </Button>
                        </div>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4">
                        <BookOpen className="w-10 h-10 text-amber-500 flex-shrink-0" />
                        <div className="flex-1">
                            <h3 className="font-semibold text-slate-900 mb-1">Learn to identify scam patterns</h3>
                            <p className="text-sm text-slate-600 mb-3">Read our guides with real examples and protection advice.</p>
                            <Button asChild size="sm" variant="outline">
                                <Link href="/guides">Browse scam identification guides</Link>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Recent Reports */}
                <h2 className="text-xl font-bold text-slate-900 mb-4">Most Recent Fraud Reports from the Community</h2>
                {error ? (
                    <div className="p-12 text-center bg-white rounded-lg border border-dashed text-slate-500">
                        Report database is temporarily unavailable. Please check back later.
                    </div>
                ) : reports.length === 0 ? (
                    <div className="p-12 text-center bg-white rounded-lg border border-dashed text-slate-500">
                        No reports yet. Be the first to <Link href="/check" className="text-primary hover:underline">report a suspicious message or link</Link>!
                    </div>
                ) : (
                    <div className="space-y-4">
                        {reports.map(r => (
                            <Card key={r.id} className="bg-white hover:border-red-200 transition-colors shadow-sm">
                                <CardContent className="p-5">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="px-2 py-0.5 rounded text-xs font-bold uppercase bg-slate-100 text-slate-600">
                                                    {r.type}
                                                </span>
                                                <span className="text-xs text-slate-400">
                                                    {new Date(r.created_at).toLocaleDateString()} at {new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                <span className="text-xs text-slate-300">
                                                    From {r.country}
                                                </span>
                                            </div>
                                            <div className="font-mono text-sm md:text-base text-slate-800 break-all mb-2">
                                                {maskValue(r.type, r.value_raw)}
                                            </div>
                                            {r.notes && (
                                                <p className="text-sm text-slate-600 italic border-l-2 border-slate-200 pl-3">
                                                    {/* Defence-in-depth: scrub on the read path
                                                        so any legacy row with unscrubbed notes
                                                        is still masked at render time. */}
                                                    &quot;{redactSensitive(r.notes)}&quot;
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Reports-specific FAQ + matching FAQPage JSON-LD. */}
            <PageFAQ
                faqs={REPORTS_FAQS}
                title="Scam reports — Frequently Asked Questions"
            />
        </div>
    );
}
