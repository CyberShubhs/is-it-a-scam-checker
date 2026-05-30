import { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getAllPosts } from '@/lib/posts';

export const metadata: Metadata = pageMetadata({
    title: "Real Scam Examples: SMS, Email, WhatsApp & Crypto",
    description: "A growing library of real scam examples — texts, emails, WhatsApp messages, fake delivery notices, refund scams and crypto fraud — annotated with red flags.",
    canonical: "https://scamchecker.app/scam-examples",
});

export default function ScamExamplesHub() {
    const blogExamples = getAllPosts().slice(0, 8);

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
                            Real scam message examples
                        </li>
                    </ol>
                </nav>

                <header className="mb-10">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 leading-tight">
                        Real scam message examples — see what fraud actually looks like
                    </h1>
                    <p className="text-lg text-slate-600 leading-relaxed">
                        Reading about scams in the abstract is useful, but the real lesson lands when you see the actual message — the way the sender is faked, the wording that creates urgency, the link that looks almost-right. This page collects real examples across SMS, email, WhatsApp, marketplace and crypto scams, with the red flags called out so you start to recognise the pattern by sight.
                    </p>
                </header>

                <section className="bg-white border border-slate-200 rounded-xl p-6 mb-10">
                    <p className="text-slate-700 mb-4 leading-relaxed">
                        The examples below come from two places. First, our deep-dive scam identification guides, each of which walks through real messages of a specific type — fake delivery texts, bank impersonation calls, marketplace overpayment cons, and so on. Second, our blog, which publishes scam alerts as new fraud campaigns are detected in the wild, often with screenshots and the exact wording the scammers used.
                    </p>
                    <p className="text-slate-700 mb-4 leading-relaxed">
                        The goal of this hub is not memorisation. Scams mutate weekly — by the time you have a specific example committed to memory, the fraudsters have moved on. The goal is pattern recognition: understanding the underlying shape (urgency + impersonation + a link or payment request) so that when a fresh variant hits your phone next month, the friction kicks in before you tap anything.
                    </p>
                    <p className="text-slate-700 leading-relaxed">
                        If you have just received something that looks like one of the examples below,{' '}
                        <Link href="/check" className="text-blue-700 font-semibold hover:underline">
                            paste it into the free scam checker
                        </Link>{' '}
                        before you read further. The checker will flag the same red flags you are about to learn to spot — but more importantly, it gives you a moment of pause where the scammer was counting on a fast reaction.
                    </p>
                </section>

                <h2 className="text-2xl font-bold text-slate-900 mb-6">
                    Examples organised by where the scam arrives
                </h2>
                <ul className="grid md:grid-cols-2 gap-4 list-none p-0 mb-10">
                    <li>
                        <Link
                            href="/guides/scam-text-message-examples"
                            className="block h-full p-5 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all"
                        >
                            <h3 className="font-semibold text-lg text-slate-900 mb-2">
                                SMS scam examples — fake delivery, bank, and toll texts
                            </h3>
                            <p className="text-sm text-slate-600">
                                Walk through the parcel-fee, bank-alert, and unpaid-toll texts that dominate the SMS scam landscape, with the exact phrasing fraudsters use.
                            </p>
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/guides/email-phishing-examples"
                            className="block h-full p-5 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all"
                        >
                            <h3 className="font-semibold text-lg text-slate-900 mb-2">
                                Email phishing examples — fake invoices and credential theft
                            </h3>
                            <p className="text-sm text-slate-600">
                                Real phishing emails dissected: invoice scams, account-suspended notices, fake login pages, and the sender tricks that make them look genuine.
                            </p>
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/guides/whatsapp-scams-examples"
                            className="block h-full p-5 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all"
                        >
                            <h3 className="font-semibold text-lg text-slate-900 mb-2">
                                WhatsApp and messaging app scam examples
                            </h3>
                            <p className="text-sm text-slate-600">
                                Family-impersonation pleas (&quot;Mum, this is my new number&quot;), fake job offers, and group-invite investment scams.
                            </p>
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/guides/facebook-marketplace-scams"
                            className="block h-full p-5 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all"
                        >
                            <h3 className="font-semibold text-lg text-slate-900 mb-2">
                                Facebook Marketplace and classifieds scam examples
                            </h3>
                            <p className="text-sm text-slate-600">
                                Buyer- and seller-side fraud — overpayment cons, fake shipping companies, and the &quot;is this still available?&quot; opener.
                            </p>
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/guides/bank-impersonation-scams"
                            className="block h-full p-5 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all"
                        >
                            <h3 className="font-semibold text-lg text-slate-900 mb-2">
                                Bank impersonation examples — calls, texts, and emails
                            </h3>
                            <p className="text-sm text-slate-600">
                                Fraudsters posing as your bank&apos;s fraud team. Includes the &quot;transfer to a safe account&quot; line and how it actually unfolds in a phone call.
                            </p>
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/guides/payid-scams-australia"
                            className="block h-full p-5 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all"
                        >
                            <h3 className="font-semibold text-lg text-slate-900 mb-2">
                                PayID, Zelle and payment-platform scam examples
                            </h3>
                            <p className="text-sm text-slate-600">
                                Overpayment tricks, fake confirmation emails, and the &quot;upgrade your account to receive larger payments&quot; con.
                            </p>
                        </Link>
                    </li>
                </ul>

                {blogExamples.length > 0 && (
                    <section aria-label="Recent scam alert examples" className="mb-10">
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">
                            Recent real-world scam alerts with annotated examples
                        </h2>
                        <p className="text-slate-600 mb-6">
                            Pulled from the latest scam alerts on the blog — each post breaks down a specific active scam campaign, often with the exact wording the fraudsters are using right now.
                        </p>
                        <ul className="grid md:grid-cols-2 gap-4 list-none p-0">
                            {blogExamples.map((p) => (
                                <li key={p.slug}>
                                    <Link
                                        href={`/blog/${p.slug}`}
                                        className="block h-full p-5 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all"
                                    >
                                        <time
                                            dateTime={p.frontmatter.date}
                                            className="text-xs font-medium text-slate-500"
                                        >
                                            {new Date(p.frontmatter.date).toLocaleDateString(
                                                'en-AU',
                                                { day: 'numeric', month: 'long', year: 'numeric' },
                                            )}
                                        </time>
                                        <h3 className="font-semibold text-slate-900 mt-1 mb-2 leading-snug">
                                            {p.frontmatter.title}
                                        </h3>
                                        <p className="text-sm text-slate-600">
                                            {p.frontmatter.summary}
                                        </p>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        <div className="mt-6">
                            <Link
                                href="/latest-scams"
                                className="text-blue-700 font-medium hover:underline"
                            >
                                See every recent scam alert with examples →
                            </Link>
                        </div>
                    </section>
                )}

                <aside
                    aria-label="Other useful pages"
                    className="bg-white border border-slate-200 rounded-xl p-6 mb-10"
                >
                    <h2 className="text-xl font-bold text-slate-900 mb-4">
                        Want to verify a specific message?
                    </h2>
                    <ul className="space-y-2 list-disc pl-5">
                        <li>
                            <Link href="/check" className="text-blue-700 hover:underline">
                                Check whether the message you received is a scam
                            </Link>
                        </li>
                        <li>
                            <Link href="/scam-types" className="text-blue-700 hover:underline">
                                Browse the full list of scam types by category
                            </Link>
                        </li>
                        <li>
                            <Link href="/scam-guides" className="text-blue-700 hover:underline">
                                Read step-by-step scam identification guides
                            </Link>
                        </li>
                        <li>
                            <Link href="/reports" className="text-blue-700 hover:underline">
                                View community-reported scam phone numbers, URLs, and emails
                            </Link>
                        </li>
                        <li>
                            <Link href="/have-i-been-scammed" className="text-red-600 font-semibold hover:underline">
                                Find out if you have been scammed and what to do next
                            </Link>
                        </li>
                    </ul>
                </aside>

                <div className="bg-slate-900 rounded-3xl p-12 text-center text-white">
                    <h2 className="text-2xl md:text-3xl font-bold mb-4">
                        Got a real example to verify?
                    </h2>
                    <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
                        Paste it into the free checker — instant analysis, nothing stored, no sign-up.
                    </p>
                    <Button asChild size="lg" className="bg-white text-slate-900 hover:bg-slate-100">
                        <Link href="/check">
                            Check whether this message is a scam
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
