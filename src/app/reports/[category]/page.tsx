import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { Report } from '@prisma/client';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertOctagon, ShieldCheck, BookOpen, ArrowRight } from 'lucide-react';
import { maskReportValue, redactSensitive } from '@/lib/redact';

export const dynamic = 'force-dynamic';

type CategoryConfig = {
    title: string;
    metaTitle: string;
    metaDescription: string;
    h1: string;
    intro: string;
    intro2: string;
    /** prisma `where` filter; null means no filter (e.g. latest/trending) */
    typeFilter: 'URL' | 'PHONE' | 'EMAIL' | 'CRYPTO' | null;
    relatedGuides: { slug: string; label: string }[];
    relatedHubs: { href: string; label: string }[];
};

const CATEGORIES: Record<string, CategoryConfig> = {
    websites: {
        title: 'Reported Scam Websites',
        metaTitle:
            'Reported Scam Websites: Community-Flagged Fake and Phishing URLs',
        metaDescription:
            'Browse websites flagged as scams by the Scam Checker community. See suspicious domains, fake online stores, and phishing URLs reported in real time.',
        h1: 'Reported scam websites and phishing URLs',
        intro: 'Below are websites the community has flagged as suspicious or fraudulent. These include fake online stores, phishing pages designed to steal passwords, lookalike domains imitating banks and parcel carriers, and URLs hidden behind link shorteners that redirect to malware.',
        intro2: 'If you have been sent a link you do not trust, do not click through. Paste the URL into our checker first — it will flag the domain age, lookalike patterns, and known fraud indicators.',
        typeFilter: 'URL',
        relatedGuides: [
            { slug: 'is-this-website-legit', label: 'how to tell if a website is legitimate before you buy' },
            { slug: 'how-to-spot-a-fake-link', label: 'how to spot a fake or malicious link' },
            { slug: 'facebook-marketplace-scams', label: 'marketplace scams on Facebook, eBay and classifieds' },
        ],
        relatedHubs: [
            { href: '/check-scam-link', label: 'check a suspicious link or URL' },
            { href: '/scam-types', label: 'browse scam types by category' },
            { href: '/reports/latest', label: 'see the latest scam reports' },
        ],
    },
    'phone-numbers': {
        title: 'Reported Scam Phone Numbers',
        metaTitle:
            'Reported Scam Phone Numbers: Community-Flagged Fraud Calls and SMS',
        metaDescription:
            'See phone numbers reported for scam calls, fake SMS, and impersonation fraud. Check whether a number that contacted you has already been flagged.',
        h1: 'Reported scam phone numbers and SMS senders',
        intro: 'These phone numbers and SMS senders have been reported by the community for scam calls, fake delivery texts, bank impersonation, and one-ring callback fraud. Numbers are masked to protect privacy while still letting you recognise patterns.',
        intro2: 'Scammers spoof and rotate phone numbers constantly, so a number missing from this list does not mean it is safe. If a call or text feels off, hang up and contact the organisation directly using a number from their official website.',
        typeFilter: 'PHONE',
        relatedGuides: [
            { slug: 'scam-text-message-examples', label: 'common SMS scam patterns and examples' },
            { slug: 'bank-impersonation-scams', label: 'bank impersonation scams via call or text' },
            { slug: 'whatsapp-scams-examples', label: 'WhatsApp and messaging app scams' },
        ],
        relatedHubs: [
            { href: '/check-scam-text', label: 'check a suspicious text message' },
            { href: '/scam-examples', label: 'see real scam message examples' },
            { href: '/reports/trending', label: 'view trending scam reports' },
        ],
    },
    emails: {
        title: 'Reported Scam Email Addresses',
        metaTitle:
            'Reported Scam Email Addresses: Phishing and Impersonation Senders',
        metaDescription:
            'Browse email addresses reported for phishing, fake invoices, and business email compromise. Verify whether a sender has already been flagged as fraudulent.',
        h1: 'Reported scam email addresses and phishing senders',
        intro: 'Phishing emails, fake invoices, fraudulent shipping notices, and tech support scams all rely on impersonation. The senders below have been reported for those tactics. Addresses are partially masked.',
        intro2: 'A familiar logo or display name does not prove an email is genuine — scammers spoof these constantly. Check the actual sender domain, hover over links before clicking, and run anything suspicious through our checker.',
        typeFilter: 'EMAIL',
        relatedGuides: [
            { slug: 'email-phishing-examples', label: 'real email phishing examples and red flags' },
            { slug: 'bank-impersonation-scams', label: 'how scammers pose as your bank in emails' },
            { slug: 'is-this-website-legit', label: 'verifying any link inside an email before clicking' },
        ],
        relatedHubs: [
            { href: '/check-scam-email', label: 'check a suspicious email for phishing signs' },
            { href: '/scam-tools', label: 'all free scam-checking tools' },
            { href: '/reports/latest', label: 'see the latest fraud reports' },
        ],
    },
    'crypto-wallets': {
        title: 'Reported Scam Crypto Wallets',
        metaTitle:
            'Reported Scam Crypto Wallets and DeFi Fraud Addresses',
        metaDescription:
            'Crypto wallets, DeFi contracts, and exchange addresses reported for rug pulls, fake giveaway scams, romance scams, and pig-butchering fraud.',
        h1: 'Reported scam crypto wallets and fraudulent contracts',
        intro: 'Cryptocurrency scams range from fake giveaway tweets and rug-pull tokens to long-running pig-butchering investment fraud. The addresses and platforms reported here have been linked to those tactics by community members and public investigations.',
        intro2: 'Once crypto leaves your wallet, recovery is rarely possible. Before sending funds — especially to a stranger, an "investment platform," or anyone urging fast action — paste the wallet address or platform URL into our checker and read the recovery guide if you suspect you have already sent.',
        typeFilter: 'CRYPTO',
        relatedGuides: [
            { slug: 'payid-scams-australia', label: 'payment platform scams and overpayment tricks' },
            { slug: 'is-this-website-legit', label: 'how to spot a fake crypto investment website' },
            { slug: 'what-to-do-if-youve-been-scammed', label: 'recovery steps if you sent crypto to a scammer' },
        ],
        relatedHubs: [
            { href: '/check', label: 'check a suspicious crypto link or message' },
            { href: '/have-i-been-scammed', label: 'have I been scammed? — damage-control checklist' },
            { href: '/reports/trending', label: 'view trending crypto and finance scams' },
        ],
    },
    latest: {
        title: 'Latest Scam Reports',
        metaTitle: 'Latest Scam Reports: Newest Community-Flagged Fraud Attempts',
        metaDescription:
            'The newest scam reports from the Scam Checker community — fresh phishing URLs, fake numbers, and email senders flagged in the last few days.',
        h1: 'Latest scam reports from the Scam Checker community',
        intro: 'This is the freshest data we have — the most recent suspicious websites, phone numbers, and email senders flagged by the community. Active fraud campaigns rotate through new infrastructure constantly, so this feed is the best way to see what is circulating right now.',
        intro2: 'If a number, sender, or URL that contacted you appears here, treat it with extra caution and verify any request through an official channel you control. Brand-new scams may not yet be in the feed — when in doubt, run the message through the checker.',
        typeFilter: null,
        relatedGuides: [
            { slug: 'scam-text-message-examples', label: 'recognise SMS scams from common patterns' },
            { slug: 'email-phishing-examples', label: 'spot phishing emails by their red flags' },
            { slug: 'how-to-spot-a-fake-link', label: 'identify a fake or malicious link' },
        ],
        relatedHubs: [
            { href: '/check', label: 'check a suspicious message or link now' },
            { href: '/latest-scams', label: 'read the latest scam alert articles' },
            { href: '/scam-types', label: 'understand scam types by category' },
        ],
    },
    trending: {
        title: 'Trending Scam Reports',
        metaTitle: 'Trending Scam Reports: Active Fraud Campaigns to Watch',
        metaDescription:
            'See which scam campaigns are most actively reported right now. Trending phishing URLs, repeat offender phone numbers, and surging email scams.',
        h1: 'Trending scam reports and active fraud campaigns',
        intro: 'A "trending" scam is one that the community is reporting repeatedly in a short window — a sign that the same fraud campaign is hitting many people at once. Tracking trending reports helps you recognise the wave before it reaches you.',
        intro2: 'Trends shift quickly. A scam dominating reports today may be replaced next week by something new. Bookmark this page, check before clicking suspicious links, and read our latest scam alert articles for context on each campaign.',
        typeFilter: null,
        relatedGuides: [
            { slug: 'bank-impersonation-scams', label: 'bank impersonation scams that trend regularly' },
            { slug: 'whatsapp-scams-examples', label: 'WhatsApp and messaging app scam waves' },
            { slug: 'facebook-marketplace-scams', label: 'marketplace scam campaigns to watch' },
        ],
        relatedHubs: [
            { href: '/latest-scams', label: 'read the most recent scam alert posts' },
            { href: '/scam-examples', label: 'see real scam message examples' },
            { href: '/check', label: 'verify a message before you act on it' },
        ],
    },
};

export function generateStaticParams() {
    return Object.keys(CATEGORIES).map((category) => ({ category }));
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ category: string }>;
}): Promise<Metadata> {
    const { category } = await params;
    const cfg = CATEGORIES[category];
    if (!cfg) return { title: 'Not Found' };
    return {
        title: cfg.metaTitle,
        description: cfg.metaDescription,
        alternates: {
            canonical: `https://scamchecker.app/reports/${category}`,
        },
        openGraph: {
            title: cfg.metaTitle,
            description: cfg.metaDescription,
            url: `https://scamchecker.app/reports/${category}`,
        },
    };
}

// Delegates to the shared redactor so /reports, /reports/[category], and the
// /api/report read path never drift apart.
const maskValue = (type: string, val: string) => maskReportValue(type, val);

/**
 * Trending = items reported more than once in the last 14 days, ranked by count.
 * Falls back to recent items if no repeats yet.
 */
async function loadTrending(): Promise<Report[]> {
    const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const all = await prisma.report.findMany({
        where: { created_at: { gte: since } },
        orderBy: { created_at: 'desc' },
        take: 500,
    });

    const counts = new Map<string, { count: number; sample: Report }>();
    for (const r of all) {
        const key = `${r.type}:${r.value_normalised}`;
        const existing = counts.get(key);
        if (existing) existing.count += 1;
        else counts.set(key, { count: 1, sample: r });
    }

    const ranked = Array.from(counts.values()).sort(
        (a, b) => b.count - a.count || b.sample.created_at.getTime() - a.sample.created_at.getTime(),
    );

    const repeats = ranked.filter((x) => x.count > 1).map((x) => x.sample);
    if (repeats.length > 0) return repeats.slice(0, 30);
    return ranked.slice(0, 30).map((x) => x.sample);
}

export default async function ReportsCategoryPage({
    params,
}: {
    params: Promise<{ category: string }>;
}) {
    const { category } = await params;
    const cfg = CATEGORIES[category];
    if (!cfg) notFound();

    let reports: Report[] = [];
    let dbError = false;
    try {
        if (category === 'trending') {
            reports = await loadTrending();
        } else if (cfg.typeFilter) {
            reports = await prisma.report.findMany({
                where: { type: cfg.typeFilter },
                orderBy: { created_at: 'desc' },
                take: 50,
            });
        } else {
            reports = await prisma.report.findMany({
                orderBy: { created_at: 'desc' },
                take: 50,
            });
        }
    } catch {
        dbError = true;
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <nav aria-label="Breadcrumb" className="mb-8 text-sm">
                    <ol className="flex items-center gap-2 text-slate-500 flex-wrap">
                        <li>
                            <Link href="/" className="hover:text-slate-900">
                                Scam Checker home
                            </Link>
                        </li>
                        <li aria-hidden="true">/</li>
                        <li>
                            <Link href="/reports" className="hover:text-slate-900">
                                Community scam reports
                            </Link>
                        </li>
                        <li aria-hidden="true">/</li>
                        <li className="text-slate-700" aria-current="page">
                            {cfg.title}
                        </li>
                    </ol>
                </nav>

                <header className="mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 flex items-center gap-3">
                                <AlertOctagon className="w-8 h-8 text-red-600" />
                                {cfg.h1}
                            </h1>
                        </div>
                        <Button asChild className="bg-red-600 hover:bg-red-700">
                            <Link href="/check">
                                Report a suspicious message or link
                            </Link>
                        </Button>
                    </div>
                </header>

                <section
                    aria-label="What this category covers"
                    className="bg-white p-6 rounded-xl border border-slate-200 mb-8"
                >
                    <p className="text-slate-700 mb-4 leading-relaxed">{cfg.intro}</p>
                    <p className="text-slate-700 leading-relaxed">{cfg.intro2}</p>
                </section>

                <div className="grid md:grid-cols-2 gap-4 mb-8">
                    <aside className="bg-white border border-slate-200 rounded-xl p-5 flex items-start gap-4">
                        <ShieldCheck className="w-9 h-9 text-primary flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <h2 className="font-semibold text-slate-900 mb-1 text-base">
                                Verify a message before you act
                            </h2>
                            <p className="text-sm text-slate-600 mb-3">
                                Paste any suspicious text, email or link into the free checker for an instant risk score.
                            </p>
                            <Button asChild size="sm">
                                <Link href="/check">
                                    Check whether this message is a scam
                                </Link>
                            </Button>
                        </div>
                    </aside>
                    <aside className="bg-white border border-slate-200 rounded-xl p-5 flex items-start gap-4">
                        <BookOpen className="w-9 h-9 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <h2 className="font-semibold text-slate-900 mb-1 text-base">
                                Learn the patterns behind these reports
                            </h2>
                            <p className="text-sm text-slate-600 mb-3">
                                Read related guides covering how this scam type works and how to recognise it next time.
                            </p>
                            <Button asChild size="sm" variant="outline">
                                <Link href="/scam-guides">
                                    Browse scam identification guides
                                </Link>
                            </Button>
                        </div>
                    </aside>
                </div>

                <section aria-label="Recent reports in this category" className="mb-12">
                    <h2 className="text-xl font-bold text-slate-900 mb-4">
                        {category === 'trending'
                            ? 'Most-repeated scam reports in the last 14 days'
                            : `Recent ${cfg.title.toLowerCase()}`}
                    </h2>
                    {dbError ? (
                        <div className="p-12 text-center bg-white rounded-lg border border-dashed text-slate-500">
                            Report database is temporarily unavailable.{' '}
                            <Link href="/reports" className="text-blue-600 hover:underline">
                                Return to all community scam reports
                            </Link>
                            .
                        </div>
                    ) : reports.length === 0 ? (
                        <div className="p-12 text-center bg-white rounded-lg border border-dashed text-slate-500">
                            No reports in this category yet.{' '}
                            <Link href="/check" className="text-blue-600 hover:underline">
                                Be the first to report a scam in this category
                            </Link>
                            , or{' '}
                            <Link href="/reports/latest" className="text-blue-600 hover:underline">
                                see the latest reports across all categories
                            </Link>
                            .
                        </div>
                    ) : (
                        <ul className="space-y-4 list-none p-0">
                            {reports.map((r) => (
                                <li key={r.id}>
                                    <Card className="bg-white shadow-sm">
                                        <CardContent className="p-5">
                                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                <span className="px-2 py-0.5 rounded text-xs font-bold uppercase bg-slate-100 text-slate-600">
                                                    {r.type}
                                                </span>
                                                <span className="text-xs text-slate-400">
                                                    {new Date(r.created_at).toLocaleDateString()}{' '}
                                                    at{' '}
                                                    {new Date(r.created_at).toLocaleTimeString([], {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
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
                                                    {/* Defence-in-depth scrub on read. */}
                                                    &quot;{redactSensitive(r.notes)}&quot;
                                                </p>
                                            )}
                                        </CardContent>
                                    </Card>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <aside
                    aria-label="Related guides and hubs"
                    className="bg-white p-6 rounded-xl border border-slate-200 mb-8"
                >
                    <h2 className="text-lg font-bold text-slate-900 mb-4">
                        Related scam guides for this category
                    </h2>
                    <ul className="space-y-2 list-disc pl-5 mb-6">
                        {cfg.relatedGuides.map((g) => (
                            <li key={g.slug}>
                                <Link
                                    href={`/guides/${g.slug}`}
                                    className="text-blue-700 hover:underline"
                                >
                                    {g.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                    <h2 className="text-lg font-bold text-slate-900 mb-4">
                        Continue exploring Scam Checker
                    </h2>
                    <ul className="space-y-2 list-disc pl-5">
                        {cfg.relatedHubs.map((h) => (
                            <li key={h.href}>
                                <Link href={h.href} className="text-blue-700 hover:underline">
                                    {h.label}
                                </Link>
                            </li>
                        ))}
                        <li>
                            <Link
                                href="/have-i-been-scammed"
                                className="text-red-600 font-semibold hover:underline"
                            >
                                Find out if you have been scammed and what to do next
                            </Link>
                        </li>
                    </ul>
                </aside>

                <nav
                    aria-label="Other report categories"
                    className="bg-slate-900 rounded-3xl p-8 text-white text-center"
                >
                    <h2 className="text-2xl font-bold mb-4">
                        Browse other community scam report categories
                    </h2>
                    <ul className="flex flex-wrap justify-center gap-3 list-none p-0">
                        {Object.entries(CATEGORIES)
                            .filter(([slug]) => slug !== category)
                            .map(([slug, c]) => (
                                <li key={slug}>
                                    <Link
                                        href={`/reports/${slug}`}
                                        className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-sm"
                                    >
                                        {c.title}
                                        <ArrowRight className="w-4 h-4" aria-hidden="true" />
                                    </Link>
                                </li>
                            ))}
                    </ul>
                </nav>
            </div>
        </div>
    );
}
