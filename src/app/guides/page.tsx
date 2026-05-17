import Link from 'next/link';
import { guides } from '@/lib/guides';
import { getAllPosts } from '@/lib/posts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Metadata } from 'next';
import { ShieldCheck, ArrowRight, BookOpen, AlertTriangle, Users, Newspaper } from 'lucide-react';
import { GuideCtaLink } from '@/components/TrackedLinks';

export const metadata: Metadata = {
    title: 'Scam Identification Guides: Learn to Spot Phishing, Fraud and Online Threats',
    description: 'Comprehensive guides on identifying scams worldwide. Learn to recognise fake websites, phishing emails, SMS scams, payment fraud, and impersonation tactics with real examples.',
    alternates: {
        canonical: 'https://scamchecker.app/guides',
    },
    openGraph: {
        title: 'Scam Identification Guides: Learn to Spot Phishing, Fraud and Online Threats',
        description: 'Comprehensive guides on identifying scams with real examples and actionable protection advice.',
        url: 'https://scamchecker.app/guides',
    },
};

// Recommended starting guides
const startHereGuides = [
    'scam-text-message-examples',
    'email-phishing-examples',
    'is-this-website-legit',
    'bank-impersonation-scams',
    'how-to-spot-a-fake-link',
];

export default function GuidesIndexPage() {
    // Categorize guides
    const recoveryGuide = guides.find(g => g.slug === 'what-to-do-if-youve-been-scammed');

    const technicalGuides = guides.filter(g =>
        ['is-this-website-legit', 'how-to-spot-a-fake-link'].includes(g.slug)
    );

    const scamTypeGuides = guides.filter(g =>
        !['what-to-do-if-youve-been-scammed', 'is-this-website-legit', 'how-to-spot-a-fake-link'].includes(g.slug)
    );

    // Pull recent blog posts so the guides page acts as a true hub.
    const blogPosts = getAllPosts().slice(0, 10);

    return (
        <div className="bg-slate-50 min-h-screen">
            <div className="container mx-auto px-4 py-12 max-w-5xl">
                <header className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-slate-900 leading-tight">
                        Scam Identification & Prevention Hub
                    </h1>
                    <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                        Expert guides on identifying fraud, recovering from scams, and protecting your identity.
                        Written by security professionals, explained in plain English.
                    </p>
                </header>

                {/* Instant Checker CTA */}
                <div className="bg-white border border-slate-200 rounded-2xl p-8 mb-16 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <ShieldCheck className="w-64 h-64 text-blue-600" />
                    </div>
                    <div className="flex items-start gap-6 relative z-10">
                        <div className="bg-blue-100 p-4 rounded-xl text-blue-600">
                            <ShieldCheck className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="font-bold text-2xl text-slate-900 mb-2">Have a suspicious message?</h2>
                            <p className="text-slate-600 text-lg">Don't guess. Paste it into our AI-powered checker for an instant analysis.</p>
                        </div>
                    </div>
                    <Button asChild size="lg" className="flex-shrink-0 relative z-10 bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6 h-auto">
                        <GuideCtaLink
                            href="/check"
                            ctaLocation="guides_hero"
                            className="gap-2"
                        >
                            Check a suspicious message with our scam checker
                            <ArrowRight className="w-5 h-5" />
                        </GuideCtaLink>
                    </Button>
                </div>

                {/* Recovery Hub */}
                {recoveryGuide && (
                    <section className="mb-16">
                        <div className="flex items-center gap-3 mb-6">
                            <AlertTriangle className="w-8 h-8 text-red-600" />
                            <h2 className="text-3xl font-bold text-slate-900">Emergency Recovery</h2>
                        </div>
                        <Link href={`/guides/${recoveryGuide.slug}`} className="block group">
                            <Card className="border-2 border-red-100 bg-red-50 hover:border-red-300 transition-all cursor-pointer">
                                <CardContent className="p-8 flex flex-col md:flex-row gap-8 items-start md:items-center">
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-bold text-red-900 mb-3 group-hover:underline decoration-red-900/30 underline-offset-4">
                                            {recoveryGuide.title}
                                        </h3>
                                        <p className="text-lg text-slate-700 leading-relaxed">
                                            {recoveryGuide.excerpt} If you've clicked a link, sent money, or shared your password, start here immediately.
                                        </p>
                                    </div>
                                    <Button variant="destructive" size="lg" className="shrink-0 bg-red-600 hover:bg-red-700">
                                        Start Recovery
                                    </Button>
                                </CardContent>
                            </Card>
                        </Link>
                    </section>
                )}

                {/* Technical Analysis Hub */}
                <section className="mb-16">
                    <div className="flex items-center gap-3 mb-6">
                        <BookOpen className="w-8 h-8 text-slate-700" />
                        <h2 className="text-3xl font-bold text-slate-900">Technical Deep Dives</h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        {technicalGuides.map((guide) => (
                            <Link href={`/guides/${guide.slug}`} key={guide.slug} className="hover:no-underline block h-full">
                                <Card className="h-full border-slate-200 hover:border-blue-500 hover:shadow-md transition-all">
                                    <CardHeader>
                                        <CardTitle className="text-xl text-slate-900 leading-tight">
                                            {guide.title}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-slate-600">{guide.excerpt}</p>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Common Scam Types Hub */}
                <section className="mb-16">
                    <div className="flex items-center gap-3 mb-6">
                        <Users className="w-8 h-8 text-slate-700" />
                        <h2 className="text-3xl font-bold text-slate-900">Common Scam Types</h2>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {scamTypeGuides.map((guide) => (
                            <Link href={`/guides/${guide.slug}`} key={guide.slug} className="hover:no-underline block h-full">
                                <Card className="h-full border-slate-200 hover:border-blue-500 hover:shadow-md transition-all flex flex-col">
                                    <CardHeader>
                                        <CardTitle className="text-lg text-slate-900 leading-tight">
                                            {guide.title}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex-1">
                                        <p className="text-slate-600 text-sm">{guide.excerpt}</p>
                                    </CardContent>
                                    <div className="px-6 pb-6 pt-0 mt-auto">
                                        <span className="text-sm font-medium text-blue-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                                            Read Guide <ArrowRight className="w-4 h-4" />
                                        </span>
                                    </div>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Latest scam alerts from the blog */}
                {blogPosts.length > 0 && (
                    <section className="mb-16" aria-label="Latest scam alerts from the blog">
                        <div className="flex items-center gap-3 mb-6">
                            <Newspaper className="w-8 h-8 text-slate-700" />
                            <h2 className="text-3xl font-bold text-slate-900">
                                Latest scam alerts and news
                            </h2>
                        </div>
                        <p className="text-slate-600 mb-6 max-w-3xl">
                            Real scams reported in the last few weeks. Each article breaks down the
                            tactic, who is being targeted, and what to do if you have been hit.
                        </p>
                        <ul className="grid md:grid-cols-2 gap-5 list-none p-0">
                            {blogPosts.map((p) => (
                                <li key={p.slug}>
                                    <Link
                                        href={`/blog/${p.slug}`}
                                        className="hover:no-underline block h-full"
                                    >
                                        <Card className="h-full border-slate-200 hover:border-blue-500 hover:shadow-md transition-all">
                                            <CardHeader>
                                                <time
                                                    dateTime={p.frontmatter.date}
                                                    className="text-xs font-medium text-slate-500"
                                                >
                                                    {new Date(p.frontmatter.date).toLocaleDateString(
                                                        'en-AU',
                                                        { day: 'numeric', month: 'long', year: 'numeric' },
                                                    )}
                                                </time>
                                                <CardTitle className="text-lg text-slate-900 leading-snug mt-1">
                                                    {p.frontmatter.title}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-slate-600 text-sm">
                                                    {p.frontmatter.summary}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        <div className="mt-6">
                            <Link
                                href="/blog"
                                className="inline-flex items-center gap-1 text-blue-700 font-medium hover:underline"
                            >
                                Read every scam alert on the blog
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </section>
                )}

                {/* Hub navigation */}
                <nav
                    aria-label="Scam Checker hub navigation"
                    className="mb-16 rounded-2xl border border-slate-200 bg-white p-6"
                >
                    <h2 className="text-xl font-bold text-slate-900 mb-3">
                        Where to go next on Scam Checker
                    </h2>
                    <ul className="grid sm:grid-cols-2 gap-2 text-sm list-none p-0">
                        <li>
                            <Link href="/check" className="text-blue-700 hover:underline">
                                Check if a website or message is a scam
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/check-scam-text"
                                className="text-blue-700 hover:underline"
                            >
                                Check a suspicious text or SMS message
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/check-scam-email"
                                className="text-blue-700 hover:underline"
                            >
                                Check a suspicious email for phishing signs
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/check-scam-link"
                                className="text-blue-700 hover:underline"
                            >
                                Check a suspicious link or URL before clicking
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/have-i-been-scammed"
                                className="text-red-600 font-semibold hover:underline"
                            >
                                Have I been scammed? — damage-control checklist
                            </Link>
                        </li>
                        <li>
                            <Link href="/reports" className="text-blue-700 hover:underline">
                                View community-reported scams and reports
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/global-scam-reporting"
                                className="text-blue-700 hover:underline"
                            >
                                Report a scam in your country
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/how-it-works"
                                className="text-blue-700 hover:underline"
                            >
                                How our scam detection works
                            </Link>
                        </li>
                        <li>
                            <Link href="/blog" className="text-blue-700 hover:underline">
                                Latest scam alerts and news
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/i-got-a-scam-message"
                                className="text-blue-700 hover:underline"
                            >
                                I got a scam message — what should I do?
                            </Link>
                        </li>
                    </ul>
                </nav>

                {/* Footer CTA */}
                <div className="bg-slate-900 rounded-3xl p-12 text-center text-white">
                    <h2 className="text-3xl font-bold mb-6">Stay Ahead of Scammers</h2>
                    <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
                        Scams evolve daily. Bookmark this page and check back whenever you receive something suspicious.
                    </p>
                    <div className="flex justify-center gap-4 flex-wrap">
                        <Button asChild size="lg" className="bg-white text-slate-900 hover:bg-slate-100">
                            <GuideCtaLink href="/check" ctaLocation="guides_footer">
                                Run a free scam check now
                            </GuideCtaLink>
                        </Button>
                        <Button asChild size="lg" variant="outline" className="border-slate-700 text-white hover:bg-slate-800 hover:text-white">
                            <GuideCtaLink
                                href="/global-scam-reporting"
                                ctaLocation="guides_footer_reporting"
                            >
                                Report a scam in your country
                            </GuideCtaLink>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
