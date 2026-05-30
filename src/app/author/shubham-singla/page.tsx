import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Github, Globe, MessageSquareWarning } from 'lucide-react';
import { getAllPosts } from '@/lib/posts';

// Canonical URL for this author page. Used in both metadata and Person JSON-LD
// so they stay in lockstep — important for E-E-A-T signals to search engines
// and AI assistants that surface authored content.
const AUTHOR_URL = 'https://scamchecker.app/author/shubham-singla';

export const metadata: Metadata = pageMetadata({
    title: "Shubham Singla – Cybersecurity Author | Scam Checker",
    description: "Shubham Singla is a cybersecurity professional and the founder of Scam Checker. Security-first, privacy-focused scam detection and fraud awareness writing.",
    canonical: AUTHOR_URL,
});

export default function AuthorPage() {
    // Show a few of the most recent posts so the author page demonstrates
    // tangible expertise — a key E-E-A-T signal beyond the bio paragraph.
    const recentPosts = getAllPosts().slice(0, 6);

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
                        <li className="text-slate-700" aria-current="page">
                            Author: Shubham Singla
                        </li>
                    </ol>
                </nav>

                {/* Person JSON-LD. This is referenced as the author of every
                    BlogPosting via the canonical Person `@id` so search engines
                    can link articles → author → organisation cleanly. */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'Person',
                            '@id': `${AUTHOR_URL}#person`,
                            name: 'Shubham Singla',
                            url: AUTHOR_URL,
                            mainEntityOfPage: AUTHOR_URL,
                            jobTitle: 'Cybersecurity professional and founder of Scam Checker',
                            description:
                                'Cybersecurity professional. Founder of Scam Checker — a free, privacy-first scam-detection tool. Writes about scams, phishing, and online fraud for everyday people.',
                            sameAs: [
                                'https://shubhamsingla.tech',
                                'https://github.com/CyberShubhs',
                            ],
                            worksFor: {
                                '@type': 'Organization',
                                '@id': 'https://scamchecker.app/#organization',
                                name: 'Scam Checker',
                                url: 'https://scamchecker.app',
                            },
                            knowsAbout: [
                                'Cybersecurity',
                                'Phishing',
                                'Scam detection',
                                'Online fraud',
                                'Privacy',
                                'Social engineering',
                            ],
                        }),
                    }}
                />

                <header className="mb-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-blue-100 text-blue-700 rounded-full p-2">
                            <Shield className="w-6 h-6" aria-hidden="true" />
                        </div>
                        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                            Author profile
                        </p>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
                        Shubham Singla
                    </h1>
                    <p className="text-slate-600 text-lg">
                        Cybersecurity professional and the founder of Scam Checker.
                    </p>
                </header>

                <section aria-label="About Shubham Singla" className="prose prose-slate max-w-none mb-10">
                    <h2>About</h2>
                    <p>
                        I&apos;m Shubham Singla, a cybersecurity professional based on a
                        simple belief: ordinary people deserve the same instinct for
                        spotting scams that security teams build over years. I started{' '}
                        <Link href="/">Scam Checker</Link> as a free,
                        privacy-first tool that runs the same kinds of checks a security
                        analyst would do — without storing your data and without making
                        you sign up.
                    </p>
                    <p>
                        My focus is security-first and privacy-focused content. That
                        means: clear writing, no fear-mongering, no upsells, and no
                        tracking-heavy tooling. When I cover a scam I link to the
                        original source — government advisory, law-enforcement notice or
                        major newsroom — so you can verify it yourself.
                    </p>
                    <h2>Why Scam Checker exists</h2>
                    <p>
                        Most scam-detection sites are either gated behind paywalls or
                        soaked in ads. I wanted something I&apos;d be comfortable sending
                        my own family to use. So{' '}
                        <Link href="/check">our free scam checker</Link> analyses
                        messages, links, emails, screenshots and PDFs entirely in your
                        browser — nothing is uploaded, nothing is stored. The{' '}
                        <Link href="/reports">community reports feed</Link> and{' '}
                        <Link href="/have-i-been-scammed">recovery checklist</Link> give
                        people somewhere practical to go after they&apos;ve been
                        targeted.
                    </p>
                    <h2>Editorial policy</h2>
                    <p>
                        Posts published under my name go through a written checklist
                        before they ship: every statistic and named incident must be
                        tied to a cited source; first-person scenarios are clearly
                        framed as realistic example cases or composite scam experiences
                        (not personal anecdotes unless I say so); and every article
                        links to the relevant checker and at least one related
                        article so you can keep verifying things yourself.
                    </p>
                    <p>
                        Some article drafts may be assisted by automated research
                        workflows and then reviewed for accuracy, clarity and
                        usefulness before they appear on the site.
                    </p>
                </section>

                <section
                    aria-label="External profiles"
                    className="grid sm:grid-cols-2 gap-4 mb-12"
                >
                    <Card className="border-slate-200">
                        <CardHeader className="flex flex-row items-center gap-3">
                            <Globe className="w-5 h-5 text-slate-500" aria-hidden="true" />
                            <CardTitle className="text-base">Personal website</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <a
                                href="https://shubhamsingla.tech"
                                target="_blank"
                                rel="noopener noreferrer me"
                                className="text-blue-700 hover:underline text-sm"
                            >
                                shubhamsingla.tech
                            </a>
                        </CardContent>
                    </Card>
                    <Card className="border-slate-200">
                        <CardHeader className="flex flex-row items-center gap-3">
                            <Github className="w-5 h-5 text-slate-500" aria-hidden="true" />
                            <CardTitle className="text-base">GitHub</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <a
                                href="https://github.com/CyberShubhs"
                                target="_blank"
                                rel="noopener noreferrer me"
                                className="text-blue-700 hover:underline text-sm"
                            >
                                github.com/CyberShubhs
                            </a>
                        </CardContent>
                    </Card>
                </section>

                <section aria-label="Key Scam Checker resources" className="mb-12">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">
                        Key resources on Scam Checker
                    </h2>
                    <ul className="grid sm:grid-cols-2 gap-3 list-none p-0">
                        <li>
                            <Link
                                href="/check"
                                className="block p-4 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40"
                            >
                                <span className="font-semibold text-slate-900">
                                    Run a free scam check
                                </span>
                                <span className="block text-sm text-slate-600">
                                    Analyse a message, email or link in seconds.
                                </span>
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/reports"
                                className="block p-4 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40"
                            >
                                <span className="font-semibold text-slate-900">
                                    Community scam reports
                                </span>
                                <span className="block text-sm text-slate-600">
                                    Recent scams reported by real readers.
                                </span>
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/have-i-been-scammed"
                                className="block p-4 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40"
                            >
                                <span className="font-semibold text-slate-900">
                                    Have I been scammed?
                                </span>
                                <span className="block text-sm text-slate-600">
                                    Step-by-step recovery checklist.
                                </span>
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/guides"
                                className="block p-4 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40"
                            >
                                <span className="font-semibold text-slate-900">
                                    Scam identification guides
                                </span>
                                <span className="block text-sm text-slate-600">
                                    Long-form explainers on common scam patterns.
                                </span>
                            </Link>
                        </li>
                    </ul>
                </section>

                {recentPosts.length > 0 && (
                    <section aria-label="Recent articles" className="mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">
                            Recent articles
                        </h2>
                        <ul className="space-y-3 list-none p-0">
                            {recentPosts.map((p) => (
                                <li key={p.slug}>
                                    <Link
                                        href={`/blog/${p.slug}`}
                                        className="block p-3 rounded-md hover:bg-slate-100"
                                    >
                                        <p className="font-medium text-slate-900">
                                            {p.frontmatter.title}
                                        </p>
                                        <p className="text-sm text-slate-500">
                                            {new Date(p.frontmatter.date).toLocaleDateString('en-AU', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                            })}
                                        </p>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                <aside
                    aria-label="Report a scam to Scam Checker"
                    className="bg-blue-50 border border-blue-200 rounded-xl p-6"
                >
                    <div className="flex items-start gap-3">
                        <MessageSquareWarning
                            className="w-6 h-6 text-blue-700 flex-shrink-0 mt-0.5"
                            aria-hidden="true"
                        />
                        <div>
                            <h2 className="text-lg font-bold text-blue-900 mb-2">
                                Spotted a scam I should cover?
                            </h2>
                            <p className="text-sm text-blue-900 mb-3">
                                Submit it through the community reporting form. Real
                                reader reports drive the topics we publish.
                            </p>
                            <Button asChild size="sm">
                                <Link href="/report-a-scam">Report a scam</Link>
                            </Button>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
