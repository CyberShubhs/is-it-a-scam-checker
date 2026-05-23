import {
    getPostBySlug,
    getAllPosts,
    getRelatedPosts,
    getCategoriesForPost,
    buildBlogPostingJsonLd,
} from '@/lib/posts';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, ShieldCheck, AlertTriangle } from 'lucide-react';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { GuideCtaLink } from '@/components/TrackedLinks';

export async function generateStaticParams() {
    const posts = getAllPosts();
    return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;
    const post = getPostBySlug(slug);
    if (!post) return { title: 'Not Found' };

    const url = `https://scamchecker.app/blog/${slug}`;
    return {
        title: `${post.frontmatter.title} | Scam Checker Blog`,
        description: post.frontmatter.summary,
        alternates: { canonical: url },
        openGraph: {
            title: post.frontmatter.title,
            description: post.frontmatter.summary,
            type: 'article',
            publishedTime: post.frontmatter.date,
            modifiedTime: post.frontmatter.updated || post.frontmatter.lastReviewed,
            authors: [post.frontmatter.author || 'The Scam Checker Team'],
            tags: post.frontmatter.tags,
            url,
        },
        twitter: {
            card: 'summary_large_image',
            title: post.frontmatter.title,
            description: post.frontmatter.summary,
        },
    };
}

export default async function BlogPostPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const post = getPostBySlug(slug);

    if (!post) {
        notFound();
    }

    const related = getRelatedPosts(slug, 3);
    const categories = getCategoriesForPost(slug);

    return (
        <div className="bg-slate-50 min-h-screen">
            <div className="container mx-auto px-4 py-12 max-w-3xl">
                <nav aria-label="Breadcrumb" className="mb-8 text-sm">
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
                        <li className="text-slate-700 truncate" aria-current="page">
                            {post.frontmatter.title}
                        </li>
                    </ol>
                </nav>

                <article>
                    <header className="mb-8">
                        <Link
                            href="/blog"
                            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to all scam alerts and blog posts
                        </Link>

                        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900">
                            {post.frontmatter.title}
                        </h1>
                        <p className="text-slate-500 mb-6">
                            Published{' '}
                            <time dateTime={post.frontmatter.date}>
                                {new Date(post.frontmatter.date).toLocaleDateString('en-AU', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                })}
                            </time>
                        </p>

                        <ul className="flex flex-wrap gap-2 mb-2 list-none p-0">
                            {post.frontmatter.tags.map((tag) => (
                                <li key={tag}>
                                    <span className="inline-block bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
                                        {tag}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </header>

                    {/* BlogPosting JSON-LD — built by buildBlogPostingJsonLd so
                        tests and hygiene checks can introspect the same shape. */}
                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{
                            __html: JSON.stringify(buildBlogPostingJsonLd(post)),
                        }}
                    />

                    {/* Breadcrumb JSON-LD */}
                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{
                            __html: JSON.stringify({
                                '@context': 'https://schema.org',
                                '@type': 'BreadcrumbList',
                                itemListElement: [
                                    {
                                        '@type': 'ListItem',
                                        position: 1,
                                        name: 'Home',
                                        item: 'https://scamchecker.app',
                                    },
                                    {
                                        '@type': 'ListItem',
                                        position: 2,
                                        name: 'Blog',
                                        item: 'https://scamchecker.app/blog',
                                    },
                                    {
                                        '@type': 'ListItem',
                                        position: 3,
                                        name: post.frontmatter.title,
                                        item: `https://scamchecker.app/blog/${slug}`,
                                    },
                                ],
                            }),
                        }}
                    />

                    {/* Intro CTA */}
                    <aside
                        aria-label="Quick scam check"
                        className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-4"
                    >
                        <ShieldCheck className="w-8 h-8 text-blue-600 flex-shrink-0" />
                        <p className="text-slate-700 text-sm leading-relaxed flex-1">
                            Think the message you received might be similar?{' '}
                            <GuideCtaLink
                                href="/check"
                                ctaLocation="blog_intro_cta"
                                className="font-semibold text-blue-700 underline-offset-2 hover:underline"
                            >
                                Use our free scam checker tool to verify it instantly
                            </GuideCtaLink>{' '}
                            before you click anything or reply.
                        </p>
                    </aside>

                    {/* MDX content */}
                    <section
                        aria-label="Article content"
                        className="prose prose-slate max-w-none mb-10
                            prose-headings:text-slate-900
                            prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-10 prose-h2:mb-4
                            prose-h3:text-xl prose-h3:font-semibold prose-h3:mt-6 prose-h3:mb-3
                            prose-p:text-slate-700 prose-p:leading-relaxed
                            prose-ul:my-4 prose-li:text-slate-700
                            prose-ol:my-4
                            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                            prose-blockquote:border-l-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg"
                    >
                        <MDXRemote source={post.content} />
                    </section>

                    {/* Mid-content "Have I been scammed?" CTA */}
                    <aside
                        aria-label="Have I been scammed help"
                        className="bg-red-50 border border-red-200 rounded-xl p-6 mb-10"
                    >
                        <div className="flex items-start gap-4">
                            <AlertTriangle className="w-7 h-7 text-red-600 flex-shrink-0 mt-1" />
                            <div className="flex-1">
                                <h2 className="text-lg font-bold text-red-900 mb-2">
                                    Think you might already have been scammed?
                                </h2>
                                <p className="text-red-800 text-sm mb-4 leading-relaxed">
                                    If you clicked a suspicious link, sent money, or shared
                                    your password, every minute matters. Follow our step-by-step{' '}
                                    <GuideCtaLink
                                        href="/have-i-been-scammed"
                                        ctaLocation="blog_mid_hibs"
                                        className="font-semibold underline underline-offset-2"
                                    >
                                        Have I been scammed damage-control checklist
                                    </GuideCtaLink>{' '}
                                    or read the full{' '}
                                    <GuideCtaLink
                                        href="/guides/what-to-do-if-youve-been-scammed"
                                        ctaLocation="blog_mid_recovery_guide"
                                        className="font-semibold underline underline-offset-2"
                                    >
                                        recovery guide for scam victims
                                    </GuideCtaLink>
                                    .
                                </p>
                                <p className="text-red-800 text-sm leading-relaxed">
                                    Not sure yet?{' '}
                                    <GuideCtaLink
                                        href="/check"
                                        ctaLocation="blog_mid_check"
                                        className="font-semibold underline underline-offset-2"
                                    >
                                        Run the message through our free scam checker
                                    </GuideCtaLink>{' '}
                                    for an instant risk assessment.
                                </p>
                            </div>
                        </div>
                    </aside>

                    {/* Sources */}
                    {post.frontmatter.sources && post.frontmatter.sources.length > 0 && (
                        <section
                            aria-label="External sources"
                            className="border-t border-slate-200 pt-8 mb-12"
                        >
                            <h2 className="text-lg font-bold text-slate-900 mb-4">
                                External sources and references
                            </h2>
                            <ul className="space-y-2">
                                {post.frontmatter.sources.map((source, i) => {
                                    let label = source;
                                    try {
                                        label = `Source ${i + 1}: ${new URL(source).hostname.replace(/^www\./, '')}`;
                                    } catch {
                                        // keep raw URL
                                    }
                                    return (
                                        <li key={i}>
                                            <a
                                                href={source}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-blue-600 hover:underline break-all"
                                            >
                                                {label}
                                            </a>
                                        </li>
                                    );
                                })}
                            </ul>
                        </section>
                    )}

                    {/* End-of-article CTA */}
                    <aside
                        aria-label="Run a scam check"
                        className="bg-gradient-to-r from-primary/10 to-emerald-50 p-8 rounded-xl text-center border border-primary/20 mb-12"
                    >
                        <h2 className="text-xl font-bold mb-3 text-slate-900">
                            Suspicious about a message, email or link you received?
                        </h2>
                        <p className="mb-6 text-slate-600">
                            Don&apos;t guess. Use our free scam checker to verify instantly,
                            or browse our scam identification guides for deeper context.
                        </p>
                        <div className="flex flex-wrap justify-center gap-3">
                            <Button asChild size="lg">
                                <GuideCtaLink href="/check" ctaLocation="blog_end_cta_check">
                                    Check a message, email or link now
                                </GuideCtaLink>
                            </Button>
                            <Button asChild size="lg" variant="outline">
                                <GuideCtaLink href="/guides" ctaLocation="blog_end_cta_guides">
                                    Browse scam identification guides
                                </GuideCtaLink>
                            </Button>
                        </div>
                    </aside>
                </article>

                {/* Related Articles */}
                {related.length > 0 && (
                    <aside
                        aria-label="Related scam alert articles"
                        className="border-t border-slate-200 pt-10"
                    >
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">
                            Related scam alerts and safety articles
                        </h2>
                        <ul className="grid sm:grid-cols-2 gap-5 list-none p-0">
                            {related.map((p) => (
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
                                                <CardTitle className="text-base text-slate-900 leading-snug mt-1">
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

                        {categories.length > 0 && (
                            <nav
                                aria-label="Browse related scam categories"
                                className="mt-8"
                            >
                                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">
                                    Related scam categories
                                </h3>
                                <ul className="flex flex-wrap gap-2 list-none p-0">
                                    {categories.map((c) => (
                                        <li key={c.slug}>
                                            <Link
                                                href={`/blog/${c.slug}`}
                                                className="inline-block bg-slate-100 text-slate-700 text-sm font-medium px-3 py-1.5 rounded-full hover:bg-slate-200"
                                            >
                                                {c.title}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </nav>
                        )}

                        <nav
                            aria-label="More scam resources"
                            className="mt-8 flex flex-wrap gap-3"
                        >
                            <Link
                                href="/blog"
                                className="text-sm text-blue-700 hover:underline font-medium"
                            >
                                Read all latest scam alerts on the blog
                            </Link>
                            <span className="text-slate-300" aria-hidden="true">
                                •
                            </span>
                            <Link
                                href="/guides"
                                className="text-sm text-blue-700 hover:underline font-medium"
                            >
                                Browse scam identification guides
                            </Link>
                            <span className="text-slate-300" aria-hidden="true">
                                •
                            </span>
                            <Link
                                href="/reports"
                                className="text-sm text-blue-700 hover:underline font-medium"
                            >
                                View community-reported scams
                            </Link>
                            <span className="text-slate-300" aria-hidden="true">
                                •
                            </span>
                            <Link
                                href="/check"
                                className="text-sm text-blue-700 hover:underline font-medium"
                            >
                                Run a free scam check now
                            </Link>
                        </nav>
                    </aside>
                )}
            </div>
        </div>
    );
}
