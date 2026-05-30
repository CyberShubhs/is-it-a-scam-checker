import { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { guides } from '@/lib/guides';

export const metadata: Metadata = pageMetadata({
    title: "Scam Identification Guides: Protect Yourself from Fraud",
    description: "Plain-English guides to identifying scams — fake websites, phishing emails, SMS fraud, marketplace cons and bank impersonation — for non-technical readers.",
    canonical: "https://scamchecker.app/scam-guides",
});

export default function ScamGuidesHub() {
    const recovery = guides.find(
        (g) => g.slug === 'what-to-do-if-youve-been-scammed',
    );

    const orderedSlugs = [
        'is-this-website-legit',
        'how-to-spot-a-fake-link',
        'scam-text-message-examples',
        'email-phishing-examples',
        'whatsapp-scams-examples',
        'bank-impersonation-scams',
        'facebook-marketplace-scams',
        'payid-scams-australia',
    ];
    const ordered = orderedSlugs
        .map((s) => guides.find((g) => g.slug === s))
        .filter((g): g is NonNullable<typeof g> => Boolean(g));
    const otherGuides = guides.filter(
        (g) =>
            g.slug !== 'what-to-do-if-youve-been-scammed' &&
            !orderedSlugs.includes(g.slug),
    );

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
                            Scam identification guides
                        </li>
                    </ol>
                </nav>

                <header className="mb-10">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 leading-tight">
                        Scam identification guides — step-by-step protection from online fraud
                    </h1>
                    <p className="text-lg text-slate-600 leading-relaxed">
                        These guides are written for the moment <em>after</em> something suspicious has landed in front of you. Each one walks through a specific scam family — fake online stores, phishing emails, SMS fraud, marketplace cons, bank impersonation — and shows what the scam looks like, how it works, and what to do if you have already engaged.
                    </p>
                </header>

                <section className="bg-white border border-slate-200 rounded-xl p-6 mb-10">
                    <p className="text-slate-700 mb-4 leading-relaxed">
                        We focus on plain English. No technical prerequisites, no security jargon. Each guide opens with a quick verdict (what this scam usually is and who it targets), shows real examples of the messages or websites involved, lists the red flags in order of reliability, and ends with a recovery checklist for anyone who has already clicked, replied, or paid.
                    </p>
                    <p className="text-slate-700 mb-4 leading-relaxed">
                        If you have just received something suspicious and want a quick verdict before reading,{' '}
                        <Link href="/check" className="text-blue-700 font-semibold hover:underline">
                            paste it into the free scam checker
                        </Link>{' '}
                        — the analysis takes a few seconds and will flag the same red flags the guides describe in detail. The guides are useful afterward, when you want to understand <em>why</em> something looked off, or when you want to spot the same pattern faster next time.
                    </p>
                    <p className="text-slate-700 leading-relaxed">
                        Already been scammed? Start with the recovery checklist below — every other guide can wait until you have stabilised the immediate damage.
                    </p>
                </section>

                {recovery && (
                    <section className="mb-10">
                        <Link
                            href={`/guides/${recovery.slug}`}
                            className="block bg-red-50 border-2 border-red-200 hover:border-red-400 rounded-xl p-6 transition-colors"
                        >
                            <span className="inline-block text-xs font-bold uppercase tracking-wide text-red-700 mb-2">
                                Emergency recovery
                            </span>
                            <h2 className="text-2xl font-bold text-red-900 mb-2">
                                {recovery.title}
                            </h2>
                            <p className="text-red-800">
                                {recovery.excerpt} If you have clicked a link, sent money, or shared a password,
                                start here immediately.
                            </p>
                        </Link>
                    </section>
                )}

                <section aria-label="Core scam guides" className="mb-10">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">
                        Core scam identification guides
                    </h2>
                    <ul className="grid md:grid-cols-2 gap-4 list-none p-0">
                        {ordered.map((g) => (
                            <li key={g.slug}>
                                <Link
                                    href={`/guides/${g.slug}`}
                                    className="block h-full p-5 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all"
                                >
                                    <h3 className="font-semibold text-lg text-slate-900 mb-2 leading-snug">
                                        {g.title}
                                    </h3>
                                    <p className="text-sm text-slate-600">{g.excerpt}</p>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </section>

                {otherGuides.length > 0 && (
                    <section aria-label="More guides" className="mb-10">
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">
                            More scam identification guides
                        </h2>
                        <ul className="grid md:grid-cols-2 gap-4 list-none p-0">
                            {otherGuides.map((g) => (
                                <li key={g.slug}>
                                    <Link
                                        href={`/guides/${g.slug}`}
                                        className="block h-full p-5 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all"
                                    >
                                        <h3 className="font-semibold text-lg text-slate-900 mb-2 leading-snug">
                                            {g.title}
                                        </h3>
                                        <p className="text-sm text-slate-600">{g.excerpt}</p>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                <aside
                    aria-label="Companion resources"
                    className="bg-white border border-slate-200 rounded-xl p-6 mb-10"
                >
                    <h2 className="text-xl font-bold text-slate-900 mb-4">
                        Companion resources
                    </h2>
                    <ul className="grid sm:grid-cols-2 gap-2 list-disc pl-5 text-sm">
                        <li>
                            <Link href="/scam-types" className="text-blue-700 hover:underline">
                                Browse scam types by category
                            </Link>
                        </li>
                        <li>
                            <Link href="/scam-examples" className="text-blue-700 hover:underline">
                                See real scam message examples with red flags annotated
                            </Link>
                        </li>
                        <li>
                            <Link href="/scam-tools" className="text-blue-700 hover:underline">
                                Browse all free scam-checking tools
                            </Link>
                        </li>
                        <li>
                            <Link href="/latest-scams" className="text-blue-700 hover:underline">
                                Read the latest scam alerts and fraud news
                            </Link>
                        </li>
                        <li>
                            <Link href="/reports" className="text-blue-700 hover:underline">
                                View community-reported scam phone numbers, URLs, and emails
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
                        Need an instant verdict?
                    </h2>
                    <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
                        The free scam checker analyses any message, email, or link in seconds. Read the guides afterward to understand the result.
                    </p>
                    <Button
                        asChild
                        size="lg"
                        className="bg-white text-slate-900 hover:bg-slate-100"
                    >
                        <Link href="/check">
                            Run a free scam check now
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
