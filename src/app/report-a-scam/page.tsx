import { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = pageMetadata({
    title: "Report a Scam: How to Report Fraud & Phishing",
    description: "How to report a scam — to Scam Checker, your bank, and the official authorities in your country, with steps for the most common scam types.",
    canonical: "https://scamchecker.app/report-a-scam",
});

export default function ReportAScamHub() {
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
                            Report a scam
                        </li>
                    </ol>
                </nav>

                <header className="mb-10">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 leading-tight">
                        Report a scam — to Scam Checker, your bank, and the official authorities
                    </h1>
                    <p className="text-lg text-slate-600 leading-relaxed">
                        Reporting a scam matters even when you have not lost money. Each report contributes to the public record of active fraud campaigns, helps law enforcement understand what is circulating, and lets carriers and platforms shut down infrastructure faster. This page explains where to report, in what order, and what information to include.
                    </p>
                </header>

                <section className="bg-white border border-slate-200 rounded-xl p-6 mb-10">
                    <p className="text-slate-700 mb-4 leading-relaxed">
                        There are two parallel things to do when you receive a scam: the urgent personal actions (changing passwords, contacting your bank, freezing accounts) and the reporting actions. The urgent actions come first — never delay calling your bank to file a scam report somewhere else. But once the immediate damage is contained, reporting is what makes the difference between this scam stopping with you and continuing to hit thousands more people.
                    </p>
                    <p className="text-slate-700 mb-4 leading-relaxed">
                        For Scam Checker specifically, reporting takes one minute. Paste the suspicious phone number, URL, or email sender into our checker — there is a &quot;report this as a scam&quot; button on the result. Your contribution lands in the community reports feed, anonymised, and joins the live data that other people see when they check the same number or link. It also feeds the trending and category pages so we can see which scams are surging.
                    </p>
                    <p className="text-slate-700 leading-relaxed">
                        Beyond Scam Checker, every country has at least one official body that wants to hear about fraud. We maintain a directory at the{' '}
                        <Link
                            href="/global-scam-reporting"
                            className="text-blue-700 font-semibold hover:underline"
                        >
                            global scam reporting directory
                        </Link>
                        , covering Scamwatch, the FTC, Action Fraud, the CAFC and dozens of national equivalents. The reporting flow below tells you which of those to contact first based on your situation.
                    </p>
                </section>

                <h2 className="text-2xl font-bold text-slate-900 mb-6">
                    Reporting flow — what to do, in what order
                </h2>
                <ol className="space-y-4 mb-10 list-decimal list-inside marker:font-bold marker:text-slate-900">
                    <li className="bg-white border border-slate-200 rounded-xl p-5">
                        <span className="font-semibold text-slate-900">If money has moved or you shared a password — contact your bank first.</span>
                        <p className="text-slate-600 text-sm mt-2">
                            Card payments can sometimes be reversed. Bank transfers can occasionally be recalled if reported within minutes. Use the number printed on the back of your card or in your banking app, never a number from the scam message. After this, follow the full{' '}
                            <Link
                                href="/have-i-been-scammed"
                                className="text-red-600 font-semibold hover:underline"
                            >
                                damage-control checklist for scam victims
                            </Link>
                            .
                        </p>
                    </li>
                    <li className="bg-white border border-slate-200 rounded-xl p-5">
                        <span className="font-semibold text-slate-900">Report the specific message or sender to Scam Checker.</span>
                        <p className="text-slate-600 text-sm mt-2">
                            Paste the suspicious content into{' '}
                            <Link href="/check" className="text-blue-700 font-medium hover:underline">
                                the free scam checker
                            </Link>{' '}
                            and use the &quot;report this as a scam&quot; button after the analysis. Your report joins the{' '}
                            <Link
                                href="/reports/latest"
                                className="text-blue-700 font-medium hover:underline"
                            >
                                community reports feed
                            </Link>{' '}
                            and helps the next person who searches for the same number, link, or sender.
                        </p>
                    </li>
                    <li className="bg-white border border-slate-200 rounded-xl p-5">
                        <span className="font-semibold text-slate-900">Report to your country&apos;s official anti-fraud body.</span>
                        <p className="text-slate-600 text-sm mt-2">
                            The{' '}
                            <Link
                                href="/global-scam-reporting"
                                className="text-blue-700 font-medium hover:underline"
                            >
                                global scam reporting directory
                            </Link>{' '}
                            lists the right destination by country — Scamwatch (Australia), the FTC ReportFraud portal (USA), Action Fraud (UK), the CAFC (Canada), and dozens more.
                        </p>
                    </li>
                    <li className="bg-white border border-slate-200 rounded-xl p-5">
                        <span className="font-semibold text-slate-900">Report to the platform that delivered the scam.</span>
                        <p className="text-slate-600 text-sm mt-2">
                            For SMS, forward the message to your carrier&apos;s spam reporting shortcode. For email, use the &quot;report phishing&quot; option in your mail client. For social or marketplace scams, use the platform&apos;s built-in report feature — that is what gets accounts removed.
                        </p>
                    </li>
                </ol>

                <h2 className="text-2xl font-bold text-slate-900 mb-6">
                    Reporting by scam type
                </h2>
                <ul className="grid md:grid-cols-2 gap-4 list-none p-0 mb-10">
                    <li>
                        <Link
                            href="/reports/websites"
                            className="block h-full p-5 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all"
                        >
                            <h3 className="font-semibold text-lg text-slate-900 mb-2">
                                Report a scam website or phishing URL
                            </h3>
                            <p className="text-sm text-slate-600">
                                Adds the URL to our community feed and shows what other suspicious websites have been flagged recently.
                            </p>
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/reports/phone-numbers"
                            className="block h-full p-5 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all"
                        >
                            <h3 className="font-semibold text-lg text-slate-900 mb-2">
                                Report a scam phone number or SMS sender
                            </h3>
                            <p className="text-sm text-slate-600">
                                Use this for fake delivery texts, bank impersonation calls, robocalls, and one-ring callback fraud.
                            </p>
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/reports/emails"
                            className="block h-full p-5 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all"
                        >
                            <h3 className="font-semibold text-lg text-slate-900 mb-2">
                                Report a phishing email or fake invoice sender
                            </h3>
                            <p className="text-sm text-slate-600">
                                Includes business email compromise and fake login-page links. Forward the original to your mail provider too.
                            </p>
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/reports/crypto-wallets"
                            className="block h-full p-5 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all"
                        >
                            <h3 className="font-semibold text-lg text-slate-900 mb-2">
                                Report a scam crypto wallet or DeFi platform
                            </h3>
                            <p className="text-sm text-slate-600">
                                Helpful for rug pulls, fake giveaways, romance-investment fraud, and pig-butchering platforms.
                            </p>
                        </Link>
                    </li>
                </ul>

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
                                Check whether a message is a scam before reporting it
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
                            <Link href="/scam-guides" className="text-blue-700 hover:underline">
                                Read step-by-step scam identification guides
                            </Link>
                        </li>
                        <li>
                            <Link href="/scam-types" className="text-blue-700 hover:underline">
                                Browse scam types by category
                            </Link>
                        </li>
                        <li>
                            <Link href="/latest-scams" className="text-blue-700 hover:underline">
                                Read the latest scam alerts and fraud news
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/global-scam-reporting"
                                className="text-blue-700 hover:underline"
                            >
                                Find the official anti-fraud body in your country
                            </Link>
                        </li>
                    </ul>
                </aside>

                <div className="bg-slate-900 rounded-3xl p-12 text-center text-white">
                    <h2 className="text-2xl md:text-3xl font-bold mb-4">
                        Report a scam in 60 seconds
                    </h2>
                    <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
                        Paste the message into the checker. Hit &quot;report this as a scam&quot; on the result. Your report goes live in the community feed.
                    </p>
                    <Button
                        asChild
                        size="lg"
                        className="bg-white text-slate-900 hover:bg-slate-100"
                    >
                        <Link href="/check">
                            Open the scam checker and report a scam
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
