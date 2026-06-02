
import { getGuideBySlug, guides, getRelatedGuides, guidePrimaryTool } from '@/lib/guides';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen } from 'lucide-react';

interface Props {
    params: { slug: string };
}

export async function generateStaticParams() {
    return guides.map((guide) => ({
        slug: guide.slug,
    }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const guide = getGuideBySlug(slug);
    if (!guide) return { title: 'Not Found' };

    return pageMetadata({
        // Bare title (no " | Scam Checker" suffix) keeps the SERP title under
        // 60 chars; `seoTitle` shortens the few long ones. og:title keeps the
        // full descriptive headline (also the visible H1).
        title: guide.seoTitle || guide.title,
        description: guide.metaDescription || guide.excerpt,
        canonical: `https://scamchecker.app/guides/${guide.slug}`,
        type: 'article',
        ogTitle: guide.title,
        publishedTime: guide.date,
    });
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const guide = getGuideBySlug(slug);

    if (!guide) {
        notFound();
    }

    const relatedGuides = getRelatedGuides(slug);

    return (
        <div className="bg-slate-50 min-h-screen">
            <article className="container mx-auto px-4 py-12 max-w-3xl">
                <Link href="/guides" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Guides
                </Link>

                <h1 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900">{guide.title}</h1>
                <p className="text-slate-500 mb-8">Updated {new Date(guide.date).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'Article',
                            headline: guide.title,
                            description: guide.metaDescription || guide.excerpt,
                            datePublished: guide.date,
                            dateModified: guide.date,
                            author: {
                                '@type': 'Person',
                                name: 'Shubham Singla',
                                url: 'https://shubhamsingla.tech'
                            },
                            publisher: {
                                '@type': 'Organization',
                                name: 'Scam Checker',
                                logo: {
                                    '@type': 'ImageObject',
                                    url: 'https://scamchecker.app/icon.png'
                                }
                            },
                            mainEntityOfPage: {
                                '@type': 'WebPage',
                                '@id': `https://scamchecker.app/guides/${guide.slug}`
                            }
                        })
                    }}
                />
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
                                    item: 'https://scamchecker.app'
                                },
                                {
                                    '@type': 'ListItem',
                                    position: 2,
                                    name: 'Guides',
                                    item: 'https://scamchecker.app/guides'
                                },
                                {
                                    '@type': 'ListItem',
                                    position: 3,
                                    name: guide.title,
                                    item: `https://scamchecker.app/guides/${guide.slug}`
                                }
                            ]
                        })
                    }}
                />

                <div
                    className="prose prose-slate max-w-none mb-12 
                        prose-headings:text-slate-900 
                        prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-10 prose-h2:mb-4
                        prose-h3:text-xl prose-h3:font-semibold prose-h3:mt-6 prose-h3:mb-3
                        prose-p:text-slate-700 prose-p:leading-relaxed
                        prose-ul:my-4 prose-li:text-slate-700
                        prose-ol:my-4
                        prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
                    dangerouslySetInnerHTML={{ __html: guide.content }}
                />

                {/* Related Guides */}
                {relatedGuides.length > 0 && (
                    <div className="border-t border-slate-200 pt-10 mb-12">
                        <div className="flex items-center gap-2 mb-6">
                            <BookOpen className="w-5 h-5 text-primary" />
                            <h2 className="text-xl font-bold text-slate-900">Related Guides</h2>
                        </div>
                        <div className="grid gap-4">
                            {relatedGuides.map((related) => (
                                <Link
                                    key={related.slug}
                                    href={`/guides/${related.slug}`}
                                    className="block p-4 bg-white border border-slate-200 rounded-lg hover:border-primary/50 hover:shadow-md transition-all"
                                >
                                    <h3 className="font-semibold text-slate-900 mb-1">{related.title}</h3>
                                    <p className="text-sm text-slate-600">{related.excerpt}</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Bottom CTA — routes to the checker most relevant to THIS
                    guide's topic (money-cluster tightening), plus a link to the
                    community report database. */}
                <div className="bg-gradient-to-r from-primary/10 to-emerald-50 p-8 rounded-xl text-center border border-primary/20">
                    <h3 className="text-xl font-bold mb-3 text-slate-900">Suspicious about something you received?</h3>
                    <p className="mb-6 text-slate-600">Don&apos;t guess. Check it instantly with our free tool.</p>
                    <Button asChild size="lg">
                        <Link href={guidePrimaryTool(guide.slug).href}>{guidePrimaryTool(guide.slug).label}</Link>
                    </Button>
                    <p className="mt-4 text-sm text-slate-500">
                        Or search the{' '}
                        <Link href="/reports" className="text-primary hover:underline">community scam reports</Link>{' '}
                        and the <Link href="/scam-report-lookup" className="text-primary hover:underline">report lookup</Link>.
                    </p>
                </div>
            </article>
        </div>
    );
}
