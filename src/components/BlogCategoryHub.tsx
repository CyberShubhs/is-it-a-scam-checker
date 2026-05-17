import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Newspaper, ShieldCheck } from 'lucide-react';
import { BLOG_CATEGORIES, getPostsForCategory, type BlogCategory } from '@/lib/posts';
import { GuideCtaLink } from './TrackedLinks';

export function BlogCategoryHub({ category }: { category: BlogCategory }) {
    const posts = getPostsForCategory(category.slug);

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
                        <li>
                            <Link href="/blog" className="hover:text-slate-900">
                                Scam alerts blog
                            </Link>
                        </li>
                        <li aria-hidden="true">/</li>
                        <li className="text-slate-700" aria-current="page">
                            {category.title}
                        </li>
                    </ol>
                </nav>

                <header className="mb-12">
                    <div className="inline-flex items-center gap-2 text-primary mb-3">
                        <Newspaper className="w-5 h-5" />
                        <span className="text-sm font-semibold uppercase tracking-wider">
                            Category hub
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-slate-900 leading-tight">
                        {category.title}
                    </h1>
                    <p className="text-lg text-slate-600 max-w-3xl">
                        {category.description}
                    </p>
                </header>

                <aside
                    aria-label="Quick scam check"
                    className="bg-white border border-slate-200 rounded-2xl p-6 mb-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                >
                    <div className="flex items-start gap-4">
                        <ShieldCheck className="w-8 h-8 text-blue-600 flex-shrink-0" />
                        <div>
                            <h2 className="font-bold text-xl text-slate-900 mb-1">
                                Spotted something suspicious in this category?
                            </h2>
                            <p className="text-slate-600">
                                Paste the message, email, or link into our free scam
                                checker for an instant risk assessment.
                            </p>
                        </div>
                    </div>
                    <Button asChild size="lg" className="flex-shrink-0">
                        <GuideCtaLink
                            href="/check"
                            ctaLocation={`category_hub_${category.slug}`}
                            className="gap-2"
                        >
                            Run a free scam check
                            <ArrowRight className="w-5 h-5" />
                        </GuideCtaLink>
                    </Button>
                </aside>

                {posts.length === 0 ? (
                    <p className="text-slate-500 italic">
                        No posts in this category yet. Check back soon — we publish new
                        scam alerts most weeks.
                    </p>
                ) : (
                    <section aria-label={`Posts in ${category.title}`}>
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">
                            All posts in this category
                        </h2>
                        <ul className="grid md:grid-cols-2 gap-5 list-none p-0">
                            {posts.map((p) => (
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
                                                    {new Date(
                                                        p.frontmatter.date,
                                                    ).toLocaleDateString('en-AU', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric',
                                                    })}
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
                    </section>
                )}

                <nav
                    aria-label="Other scam categories"
                    className="mt-16 rounded-2xl border border-slate-200 bg-white p-6"
                >
                    <h2 className="text-xl font-bold text-slate-900 mb-3">
                        Browse other scam categories
                    </h2>
                    <ul className="grid sm:grid-cols-2 gap-2 text-sm list-none p-0">
                        {BLOG_CATEGORIES.filter((c) => c.slug !== category.slug).map(
                            (c) => (
                                <li key={c.slug}>
                                    <Link
                                        href={`/blog/${c.slug}`}
                                        className="text-blue-700 hover:underline"
                                    >
                                        {c.title}
                                    </Link>
                                </li>
                            ),
                        )}
                        <li>
                            <Link
                                href="/blog"
                                className="text-blue-700 hover:underline font-medium"
                            >
                                See all latest scam alerts on the blog
                            </Link>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    );
}
