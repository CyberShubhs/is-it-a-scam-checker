import { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = pageMetadata({
    title: "Scam Types Explained: Phishing, Investment & Romance",
    description: "A categorised tour of common online scams — phishing, impersonation, investment, romance, marketplace and tech-support fraud — each with red flags.",
    canonical: "https://scamchecker.app/scam-types",
});

type ScamType = {
    id: string;
    title: string;
    summary: string;
    redFlags: string[];
    relatedGuide?: { slug: string; label: string };
    relatedReports?: { href: string; label: string };
};

const scamTypes: ScamType[] = [
    {
        id: 'phishing',
        title: 'Phishing scams',
        summary:
            'Phishing is the broad category of scams that try to trick you into handing over passwords, card details, or one-time codes by impersonating an organisation you trust. Most arrive via email or SMS and direct you to a fake login page.',
        redFlags: [
            'Urgency phrasing ("verify within 24 hours")',
            'Sender domain that looks similar but not identical to the real brand',
            'Links that go to a slightly off URL once you hover',
            'Requests for credentials or one-time codes',
        ],
        relatedGuide: {
            slug: 'email-phishing-examples',
            label: 'Real email phishing examples and red flags',
        },
        relatedReports: {
            href: '/reports/emails',
            label: 'Reported scam email senders',
        },
    },
    {
        id: 'impersonation',
        title: 'Impersonation scams',
        summary:
            'A scammer poses as your bank, a delivery company, the tax office, the police, or a tech-company support team. The goal is the same as phishing — credentials, money, or remote access — but the framing is built around authority instead of urgency alone.',
        redFlags: [
            'Calls or texts claiming to be from a bank but asking you to "transfer to a safe account"',
            'Government or tax-office contact via SMS asking for payment',
            'Police or court threats demanding immediate fines',
            'Tech support unprompted asking to install remote-access software',
        ],
        relatedGuide: {
            slug: 'bank-impersonation-scams',
            label: 'How fraudsters pose as your bank',
        },
        relatedReports: {
            href: '/reports/phone-numbers',
            label: 'Reported impersonation phone numbers',
        },
    },
    {
        id: 'investment',
        title: 'Investment and crypto scams',
        summary:
            'Fake trading platforms, "guaranteed return" investments, rug-pull tokens, and pig-butchering long cons. These scams often start on dating apps or social media with a friendly contact who eventually offers an "investment opportunity."',
        redFlags: [
            'Promises of guaranteed or unusually high returns',
            'A new acquaintance steering you toward a specific platform',
            'Pressure to deposit more after a small "successful" withdrawal',
            'Withdrawals blocked behind "tax" or "verification" fees',
        ],
        relatedGuide: {
            slug: 'payid-scams-australia',
            label: 'Payment platform and overpayment scams',
        },
        relatedReports: {
            href: '/reports/crypto-wallets',
            label: 'Reported scam crypto wallets and platforms',
        },
    },
    {
        id: 'romance',
        title: 'Romance scams',
        summary:
            'A long-running emotional con where the scammer builds a relationship over weeks or months on a dating app or social network, then introduces a financial emergency or an investment opportunity. Often overlaps with investment fraud.',
        redFlags: [
            'Refuses video calls or always has a reason the camera "is broken"',
            'Story progression that always ends in a money request',
            'Claims to be working overseas, on an oil rig, or in the military',
            'Pushes communication off the dating app to private messaging quickly',
        ],
    },
    {
        id: 'marketplace',
        title: 'Marketplace and classifieds scams',
        summary:
            'Buyer- and seller-side fraud on Facebook Marketplace, Gumtree, eBay, Craigslist and similar platforms. Includes overpayment scams, fake shipping companies, "send the item before payment clears," and item-never-arrives cons.',
        redFlags: [
            'Buyer offers more than the asking price and asks for a refund of the difference',
            'Seller insists on payment via gift cards, crypto, or bank transfer outside the platform',
            'Fake shipping or escrow service emails confirming a payment',
            'Pressure to "ship today before another buyer commits"',
        ],
        relatedGuide: {
            slug: 'facebook-marketplace-scams',
            label: 'Marketplace scams on Facebook, eBay and classifieds',
        },
    },
    {
        id: 'fake-stores',
        title: 'Fake online stores and clone websites',
        summary:
            'A website that looks like a legitimate retailer — sometimes copied wholesale from the real brand — selling popular items at unrealistic discounts. The store either takes your money and ships nothing, or harvests your card details for resale.',
        redFlags: [
            'Discounts of 70–90% on popular brand-name items',
            'Domain registered very recently but claiming to be "established 2010"',
            'Generic email addresses (gmail.com, outlook.com) for support',
            'Bank transfer or crypto-only payment methods',
        ],
        relatedGuide: {
            slug: 'is-this-website-legit',
            label: 'How to tell if a website is legitimate before you buy',
        },
        relatedReports: {
            href: '/reports/websites',
            label: 'Reported scam websites and phishing URLs',
        },
    },
    {
        id: 'tech-support',
        title: 'Tech support and recovery scams',
        summary:
            'Fake antivirus pop-ups, cold calls claiming to be from Microsoft or Apple, and "recovery agents" who promise to get your money back from a previous scam — usually by stealing more from you.',
        redFlags: [
            'Pop-up that locks your browser and shows a phone number to call',
            'Cold call about a virus or compromised account you cannot verify',
            'Anyone asking you to install AnyDesk, TeamViewer, or QuickAssist',
            '"Recovery agents" charging an upfront fee to retrieve scammed money',
        ],
    },
];

export default function ScamTypesHub() {
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
                            Scam types explained
                        </li>
                    </ol>
                </nav>

                <header className="mb-10">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 leading-tight">
                        Scam types explained: a categorised tour of online fraud
                    </h1>
                    <p className="text-lg text-slate-600 leading-relaxed">
                        Most of the millions of scam attempts that hit inboxes, phones, and dating apps every day are variations on a small number of underlying patterns. This page walks through the most common categories so that the next time something suspicious lands in front of you, you can place it on a map you already know.
                    </p>
                </header>

                <section className="bg-white border border-slate-200 rounded-xl p-6 mb-10">
                    <p className="text-slate-700 mb-4 leading-relaxed">
                        Categories overlap. A romance scammer often pivots into an investment scam. A phishing email is also an impersonation scam. A fake online store may direct you to chat on WhatsApp where social engineering takes over. The boundary between &quot;types&quot; is fuzzy — the value of categorisation is recognising the dominant tactic so you can apply the right defence.
                    </p>
                    <p className="text-slate-700 mb-4 leading-relaxed">
                        Each type below has the same shape: a one-paragraph summary of how the scam works, the most reliable red flags, and links to the deeper guide and the relevant reports feed for that scam family. You do not need to remember any of this in detail. The point is to feel a friction the moment a real example arrives — and to know where to go to verify it.
                    </p>
                    <p className="text-slate-700 leading-relaxed">
                        Already received something suspicious?{' '}
                        <Link href="/check" className="text-blue-700 font-semibold hover:underline">
                            Run it through the free scam checker
                        </Link>{' '}
                        before you read further. The tool will flag the obvious patterns and give you space to think. If you have already clicked, replied or paid, jump to the{' '}
                        <Link href="/have-i-been-scammed" className="text-red-600 font-semibold hover:underline">
                            damage-control checklist for scam victims
                        </Link>
                        .
                    </p>
                </section>

                <section
                    aria-label="Scam types"
                    className="space-y-6 mb-10"
                >
                    {scamTypes.map((t) => (
                        <article
                            key={t.id}
                            id={t.id}
                            className="bg-white border border-slate-200 rounded-xl p-6 scroll-mt-24"
                        >
                            <h2 className="text-2xl font-bold text-slate-900 mb-3">
                                {t.title}
                            </h2>
                            <p className="text-slate-700 mb-4 leading-relaxed">
                                {t.summary}
                            </p>
                            <h3 className="font-semibold text-slate-900 mb-2">
                                Red flags for {t.title.toLowerCase()}
                            </h3>
                            <ul className="list-disc pl-5 space-y-1 text-slate-700 mb-4">
                                {t.redFlags.map((f) => (
                                    <li key={f}>{f}</li>
                                ))}
                            </ul>
                            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                                {t.relatedGuide && (
                                    <Link
                                        href={`/guides/${t.relatedGuide.slug}`}
                                        className="text-blue-700 hover:underline font-medium"
                                    >
                                        Read the full guide: {t.relatedGuide.label}
                                    </Link>
                                )}
                                {t.relatedReports && (
                                    <Link
                                        href={t.relatedReports.href}
                                        className="text-blue-700 hover:underline font-medium"
                                    >
                                        See {t.relatedReports.label.toLowerCase()}
                                    </Link>
                                )}
                                <Link
                                    href="/check"
                                    className="text-blue-700 hover:underline font-medium"
                                >
                                    Check a {t.title.toLowerCase().replace(' scams', '').replace(' scam', '')} message right now
                                </Link>
                            </div>
                        </article>
                    ))}
                </section>

                <aside
                    aria-label="Continue exploring"
                    className="bg-white border border-slate-200 rounded-xl p-6 mb-10"
                >
                    <h2 className="text-xl font-bold text-slate-900 mb-4">
                        Where to go next
                    </h2>
                    <ul className="grid sm:grid-cols-2 gap-2 list-disc pl-5 text-sm">
                        <li>
                            <Link href="/scam-examples" className="text-blue-700 hover:underline">
                                See real scam message examples
                            </Link>
                        </li>
                        <li>
                            <Link href="/scam-guides" className="text-blue-700 hover:underline">
                                Read step-by-step scam identification guides
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
                                View community-reported scam reports
                            </Link>
                        </li>
                        <li>
                            <Link href="/report-a-scam" className="text-blue-700 hover:underline">
                                Report a scam to Scam Checker and official channels
                            </Link>
                        </li>
                    </ul>
                </aside>

                <div className="bg-slate-900 rounded-3xl p-12 text-center text-white">
                    <h2 className="text-2xl md:text-3xl font-bold mb-4">
                        Run a free scam check now
                    </h2>
                    <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
                        Whatever category your suspicious message falls into, the checker handles it in seconds.
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
