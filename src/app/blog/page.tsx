import Link from 'next/link';
import { getAllPosts, BLOG_CATEGORIES } from '@/lib/posts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { ArrowRight, Newspaper, ShieldCheck } from 'lucide-react';
import { GuideCtaLink } from '@/components/TrackedLinks';

export const metadata: Metadata = pageMetadata({
    title: "Blog – Latest Scam Alerts & Safety Advice | Scam Checker",
    description: "Stay informed with the latest scam alerts, fraud trends, and safety tips. Updated regularly to help you recognise and avoid new threats.",
    canonical: "https://scamchecker.app/blog",
});

export default function BlogIndexPage() {
    const posts = getAllPosts();

    return (
        <div className="bg-slate-50 min-h-screen">
            <div className="container mx-auto px-4 py-12 max-w-5xl">
                <header className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 text-primary mb-4">
                        <Newspaper className="w-6 h-6" />
                        <span className="text-sm font-semibold uppercase tracking-wider">
                            Scam Checker Blog
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-slate-900 leading-tight">
                        Latest Scam Alerts &amp; Safety Advice
                    </h1>
                    <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                        Stay ahead of scammers with timely alerts, trend analyses, and
                        practical advice to protect yourself online.
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
                            <h2 className="font-bold text-2xl text-slate-900 mb-2">
                                Received something suspicious?
                            </h2>
                            <p className="text-slate-600 text-lg">
                                Paste it into our free scam checker for an instant analysis.
                            </p>
                        </div>
                    </div>
                    <Button
                        asChild
                        size="lg"
                        className="flex-shrink-0 relative z-10 bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6 h-auto"
                    >
                        <GuideCtaLink
                            href="/check"
                            ctaLocation="blog_index_hero"
                            className="gap-2"
                        >
                            Check a suspicious message with our scam checker
                            <ArrowRight className="w-5 h-5" />
                        </GuideCtaLink>
                    </Button>
                </div>

                {/* Posts */}
                {posts.length === 0 ? (
                    <div className="text-center py-16 text-slate-500">
                        <p className="text-lg">No posts yet. Check back soon!</p>
                    </div>
                ) : (
                    <section>
                        <section
                            aria-label="Browse scam alerts by category"
                            className="mb-16"
                        >
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">
                                Browse scam alerts by category
                            </h2>
                            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 list-none p-0">
                                {BLOG_CATEGORIES.map((c) => (
                                    <li key={c.slug}>
                                        <Link
                                            href={`/blog/${c.slug}`}
                                            className="block h-full rounded-xl border border-slate-200 bg-white p-5 hover:border-blue-500 hover:shadow-md transition-all"
                                        >
                                            <h3 className="font-bold text-slate-900 mb-1">
                                                {c.title}
                                            </h3>
                                            <p className="text-sm text-slate-600">
                                                {c.description}
                                            </p>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </section>

                        <div className="flex items-center gap-3 mb-8">
                            <Newspaper className="w-7 h-7 text-slate-700" />
                            <h2 className="text-3xl font-bold text-slate-900">
                                All Posts
                            </h2>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            {posts.map((post) => (
                                <Link
                                    href={`/blog/${post.slug}`}
                                    key={post.slug}
                                    className="hover:no-underline block h-full"
                                >
                                    <Card className="h-full border-slate-200 hover:border-blue-500 hover:shadow-md transition-all flex flex-col">
                                        <CardHeader>
                                            <div className="flex items-center gap-2 mb-2">
                                                <time
                                                    dateTime={post.frontmatter.date}
                                                    className="text-xs font-medium text-slate-500"
                                                >
                                                    {new Date(
                                                        post.frontmatter.date,
                                                    ).toLocaleDateString('en-AU', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric',
                                                    })}
                                                </time>
                                            </div>
                                            <CardTitle className="text-xl text-slate-900 leading-tight">
                                                {post.frontmatter.title}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="flex-1">
                                            <p className="text-slate-600 text-sm mb-4">
                                                {post.frontmatter.summary}
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {post.frontmatter.tags.map((tag) => (
                                                    <span
                                                        key={tag}
                                                        className="inline-block bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </CardContent>
                                        <div className="px-6 pb-6 pt-0 mt-auto">
                                            <span className="text-sm font-medium text-blue-600 flex items-center gap-1">
                                                Read the full scam alert{' '}
                                                <ArrowRight className="w-4 h-4" aria-hidden="true" />
                                            </span>
                                        </div>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* Hub navigation */}
                <nav
                    aria-label="Scam Checker hub navigation"
                    className="mt-16 rounded-2xl border border-slate-200 bg-white p-6"
                >
                    <h2 className="text-xl font-bold text-slate-900 mb-3">
                        Continue exploring Scam Checker
                    </h2>
                    <ul className="grid sm:grid-cols-2 gap-2 text-sm list-none p-0">
                        <li>
                            <Link href="/check" className="text-blue-700 hover:underline">
                                Check if a message, email or link is a scam
                            </Link>
                        </li>
                        <li>
                            <Link href="/guides" className="text-blue-700 hover:underline">
                                Browse scam identification guides
                            </Link>
                        </li>
                        <li>
                            <Link href="/reports" className="text-blue-700 hover:underline">
                                View community-reported scam reports
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/have-i-been-scammed"
                                className="text-red-600 font-semibold hover:underline"
                            >
                                Have I been scammed? Damage-control checklist
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
                                How our scam detection technology works
                            </Link>
                        </li>
                    </ul>
                </nav>

                {/* Footer CTA */}
                <div className="bg-slate-900 rounded-3xl p-12 text-center text-white mt-16">
                    <h2 className="text-3xl font-bold mb-6">Stay Ahead of Scammers</h2>
                    <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
                        Scams evolve daily. Bookmark this page and check back for the
                        latest alerts.
                    </p>
                    <div className="flex justify-center gap-4 flex-wrap">
                        <Button
                            asChild
                            size="lg"
                            className="bg-white text-slate-900 hover:bg-slate-100"
                        >
                            <GuideCtaLink href="/check" ctaLocation="blog_index_footer">
                                Run a free scam check now
                            </GuideCtaLink>
                        </Button>
                        <Button
                            asChild
                            size="lg"
                            variant="outline"
                            className="border-slate-700 text-white hover:bg-slate-800 hover:text-white"
                        >
                            <GuideCtaLink
                                href="/guides"
                                ctaLocation="blog_index_footer_guides"
                            >
                                Read scam identification guides
                            </GuideCtaLink>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
