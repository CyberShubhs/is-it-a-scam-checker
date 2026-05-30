import { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAllPosts } from '@/lib/posts';

export const metadata: Metadata = pageMetadata({
    title: "Latest Scams: Active Fraud Campaigns and New Scam Alerts",
    description: "A live feed of the latest scam alerts — new phishing campaigns, surging SMS fraud, fresh impersonation tactics, and emerging crypto and investment scams.",
    canonical: "https://scamchecker.app/latest-scams",
});

export default function LatestScamsHub() {
    const posts = getAllPosts();
    const top = posts.slice(0, 12);

    return (
        <div className="bg-slate-50 min-h-screen">
            <div className="container mx-auto px-4 py-12 max-w-5xl">
                <nav aria-label="Breadcrumb" className="mb-6 text-sm">
                    <ol className="flex items-center gap-2 text-slate-500">
                        <li>
                            <Link href="/" className="hover:text-slate-900">
                                Scam Checker home
                            </Link>
                        </li>
                        <li aria-hidden="true">/</li>
                        <li className="text-slate-700" aria-current="page">
                            Latest scams
                        </li>
                    </ol>
                </nav>

                <header className="mb-10">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 leading-tight">
                        Latest scams — active fraud campaigns and fresh alerts
                    </h1>
                    <p className="text-lg text-slate-600 leading-relaxed">
                        Online fraud is not a single, static target. New scam campaigns surface every week, often around real-world triggers — tax season, a public data breach, a major delivery wave, a price spike in crypto. This page is the always-on summary of which scams are active right now and how each one operates.
                    </p>
                </header>

                <section className="bg-white border border-slate-200 rounded-xl p-6 mb-10">
                    <p className="text-slate-700 mb-4 leading-relaxed">
                        The articles below come from our scam alert blog, which publishes new posts as fresh fraud campaigns are detected. Each post is a focused breakdown: what the scam looks like, who is being targeted, the exact red flags to watch for, and the recovery steps if you have already engaged. Sources are linked at the bottom of every post.
                    </p>
                    <p className="text-slate-700 mb-4 leading-relaxed">
                        If you want the live data side instead — actual reported numbers, URLs and email senders — that lives in the{' '}
                        <Link
                            href="/reports"
                            className="text-blue-700 font-semibold hover:underline"
                        >
                            community scam reports section
                        </Link>
                        . The two pair well: read the alert here to understand the campaign, then cross-check the specific number or link you received in the reports feed.
                    </p>
                    <p className="text-slate-700 leading-relaxed">
                        Just received something suspicious that might match one of these campaigns?{' '}
                        <Link href="/check" className="text-blue-700 font-semibold hover:underline">
                            Run it through the free scam checker
                        </Link>{' '}
                        — the analysis takes seconds and gives you an instant verdict before you read further.
                    </p>
                </section>

                {top.length > 0 ? (
                    <section aria-label="Latest scam alerts" className="mb-10">
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">
                            Latest scam alerts and fraud news
                        </h2>
                        <ul className="grid md:grid-cols-2 gap-5 list-none p-0">
                            {top.map((p) => (
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
                                                        {
                                                            day: 'numeric',
                                                            month: 'long',
                                                            year: 'numeric',
                                                        },
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
                                                {p.frontmatter.tags?.length > 0 && (
                                                    <div className="flex flex-wrap gap-1.5 mt-3">
                                                        {p.frontmatter.tags
                                                            .slice(0, 3)
                                                            .map((tag) => (
                                                                <span
                                                                    key={tag}
                                                                    className="inline-block bg-blue-50 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full"
                                                                >
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        <div className="mt-6">
                            <Link
                                href="/blog"
                                className="text-blue-700 font-medium hover:underline"
                            >
                                Read every scam alert on the full blog →
                            </Link>
                        </div>
                    </section>
                ) : (
                    <section className="mb-10 bg-white border border-slate-200 rounded-xl p-6 text-slate-600">
                        New scam alerts will appear here as soon as they are published.{' '}
                        <Link href="/check" className="text-blue-700 hover:underline">
                            In the meantime, run a free scam check
                        </Link>{' '}
                        on anything suspicious you have received.
                    </section>
                )}

                <aside
                    aria-label="Continue exploring"
                    className="bg-white border border-slate-200 rounded-xl p-6 mb-10"
                >
                    <h2 className="text-xl font-bold text-slate-900 mb-4">
                        Useful next steps
                    </h2>
                    <ul className="grid sm:grid-cols-2 gap-2 list-disc pl-5 text-sm">
                        <li>
                            <Link href="/check" className="text-blue-700 hover:underline">
                                Check whether the message you received is a scam
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/have-i-been-scammed"
                                className="text-red-600 font-semibold hover:underline"
                            >
                                Find out if you have been scammed and what to do next
                            </Link>
                        </li>
                        <li>
                            <Link href="/reports/trending" className="text-blue-700 hover:underline">
                                View trending community scam reports
                            </Link>
                        </li>
                        <li>
                            <Link href="/scam-types" className="text-blue-700 hover:underline">
                                Browse scam types by category
                            </Link>
                        </li>
                        <li>
                            <Link href="/scam-examples" className="text-blue-700 hover:underline">
                                See real scam message examples and red flags
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
                </aside>

                <div className="bg-slate-900 rounded-3xl p-12 text-center text-white">
                    <h2 className="text-2xl md:text-3xl font-bold mb-4">
                        Verify a suspicious message in seconds
                    </h2>
                    <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
                        Whatever fresh scam is making the rounds, the free checker analyses your specific message instantly.
                    </p>
                    <Button
                        asChild
                        size="lg"
                        className="bg-white text-slate-900 hover:bg-slate-100"
                    >
                        <Link href="/check">
                            Check whether this message is a scam
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
