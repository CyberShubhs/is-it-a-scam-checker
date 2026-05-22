import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { ScamChecker } from '@/components/ScamChecker';
import { TrustSection } from '@/components/TrustSection';

export const metadata: Metadata = {
    title: 'Free Crypto Scam Checker: Spot Wallet Drainers, Fake Exchanges & Investment Groups',
    description: 'Paste a crypto site URL, exchange link, Telegram invite, or wallet address message. Free crypto scam checker — flags wallet drainers, fake exchanges and investment fraud.',
    alternates: {
        canonical: 'https://scamchecker.app/crypto-scam-checker',
    },
    openGraph: {
        title: 'Free Crypto Scam Checker: Spot Wallet Drainers, Fake Exchanges & Investment Groups',
        description: 'Paste a crypto site URL, exchange link, Telegram invite, or wallet address message. Free crypto scam checker — flags wallet drainers, fake exchanges and investment fraud.',
        url: 'https://scamchecker.app/crypto-scam-checker',
    },
};

export default function CryptoScamCheckerPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <section className="bg-slate-50 py-12 md:py-20">
                <div className="container mx-auto px-4 text-center">
                    <div className="flex justify-center items-center gap-2 mb-6 text-sm text-slate-500">
                        <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-slate-900 font-medium">Crypto Scam Checker</span>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-6">
                        Free Crypto Scam Checker
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 mb-6 max-w-2xl mx-auto">
                        Paste a suspicious crypto exchange URL, Telegram or WhatsApp invite, wallet-connect prompt, or DM about an &quot;investment opportunity&quot;. The checker flags the patterns used by wallet drainers, fake exchanges, pig-butchering rings, and fake staking apps.
                    </p>

                    <ScamChecker defaultTab="url" />

                    <p className="text-sm text-slate-500 mt-6 max-w-lg mx-auto leading-relaxed">
                        <strong>Privacy:</strong> Analysis runs in your browser. We do not store URLs or messages.
                    </p>
                </div>
            </section>

            <TrustSection />

            <section className="py-16 bg-white">
                <div className="container mx-auto px-4 max-w-4xl">
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">
                        The crypto scams this checker is built for
                    </h2>
                    <ul className="list-disc pl-6 space-y-3 text-slate-700 mb-8">
                        <li><strong>Wallet drainers.</strong> A site that asks you to &quot;verify&quot; or &quot;claim&quot; an airdrop by connecting your wallet, then pulls out every token it has approval to touch.</li>
                        <li><strong>Fake exchanges.</strong> Slick clones of Binance, Coinbase, Kraken, OKX. The dashboard shows your &quot;balance&quot; growing. Withdrawals are blocked behind a fake &quot;tax&quot; or &quot;verification fee&quot;.</li>
                        <li><strong>Investment groups (&quot;pig butchering&quot;).</strong> Telegram/WhatsApp/dating-app contact, build rapport, walk you through a fake trading platform, take everything when you try to withdraw.</li>
                        <li><strong>Fake staking and cloud mining.</strong> Guaranteed daily returns, branded landing page, no verifiable on-chain activity.</li>
                        <li><strong>Seed-phrase / private-key harvesting.</strong> &quot;Validate your wallet&quot;, &quot;recover stuck transaction&quot;, fake support DM. If they ask for a 12/24-word phrase, it is theft.</li>
                        <li><strong>Recovery scams.</strong> After a previous crypto loss, strangers offer to &quot;hack the scammer back&quot; or &quot;recover your funds&quot; for an upfront fee. Always fraud.</li>
                    </ul>

                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">
                        How to verify a crypto site or message is legit
                    </h2>
                    <ol className="list-decimal pl-6 space-y-3 text-slate-700 mb-8">
                        <li>Run the URL through the checker above.</li>
                        <li>Check the domain on the real exchange&apos;s official site. Coinbase, Binance, Kraken etc. publish their canonical domain in their docs.</li>
                        <li>If a group invite or DM offers &quot;guaranteed returns&quot; or &quot;VIP signals&quot;, leave the group. Real funds do not promise yield.</li>
                        <li>Never sign a wallet-connect prompt you did not initiate. Read what the transaction is actually asking permission for.</li>
                        <li>Never share your seed phrase, private key, or password. Not with support, not with a friend, not with us. There is no situation where a legitimate party needs it.</li>
                        <li>If you sent crypto already, open the <Link href="/have-i-been-scammed" className="text-primary underline">damage-control checklist</Link> within the first hour.</li>
                    </ol>

                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">
                        Red flags in crypto messages
                    </h2>
                    <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-8">
                        <li>&quot;Guaranteed&quot;, &quot;risk-free&quot;, &quot;insured&quot; returns of any kind.</li>
                        <li>Urgency on a deposit deadline (&quot;close in 24h&quot;, &quot;last 5 spots in the VIP group&quot;).</li>
                        <li>Withdrawals blocked behind a &quot;tax&quot; or &quot;activation fee&quot; — real exchanges deduct on-chain or in-app, never via a separate top-up.</li>
                        <li>A &quot;mentor&quot; who screenshots huge gains and offers to set up your account.</li>
                        <li>A relationship that moves from a dating app to WhatsApp to a trading dashboard in days.</li>
                        <li>An &quot;airdrop&quot; that requires you to connect your wallet and approve a transaction first.</li>
                    </ul>

                    <div className="grid md:grid-cols-2 gap-4 my-8">
                        <Link
                            href="/reports/crypto-wallets"
                            className="block p-5 rounded-xl bg-slate-50 border border-slate-200 hover:border-primary hover:shadow-md transition-all"
                        >
                            <h3 className="font-semibold text-slate-900 mb-1">Check community-reported crypto wallets</h3>
                            <p className="text-slate-600 text-sm">See wallet addresses other users have flagged as scams.</p>
                        </Link>
                        <Link
                            href="/blog/crypto-scams"
                            className="block p-5 rounded-xl bg-slate-50 border border-slate-200 hover:border-primary hover:shadow-md transition-all"
                        >
                            <h3 className="font-semibold text-slate-900 mb-1">Read crypto scam alerts on the blog</h3>
                            <p className="text-slate-600 text-sm">Real recent campaigns, named platforms, and what to look out for.</p>
                        </Link>
                    </div>

                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">Frequently asked questions</h2>
                    <div className="space-y-4 my-6">
                        <details className="bg-white border border-slate-200 rounded-lg p-4">
                            <summary className="font-semibold cursor-pointer">Is this crypto scam checker free?</summary>
                            <p className="mt-2 text-slate-600">Yes. No sign-up. No limits. Nothing is stored — the analysis runs in your browser.</p>
                        </details>
                        <details className="bg-white border border-slate-200 rounded-lg p-4">
                            <summary className="font-semibold cursor-pointer">Can I check a wallet address?</summary>
                            <p className="mt-2 text-slate-600">
                                The text checker will scan messages that contain a wallet address for scam patterns (urgency, fake support, guaranteed returns). For an on-chain reputation check, use a blockchain explorer alongside our{' '}
                                <Link href="/reports/crypto-wallets" className="text-primary underline">community wallet report database</Link>.
                            </p>
                        </details>
                        <details className="bg-white border border-slate-200 rounded-lg p-4">
                            <summary className="font-semibold cursor-pointer">Can I recover crypto I&apos;ve already sent to a scammer?</summary>
                            <p className="mt-2 text-slate-600">
                                Almost never. Crypto transactions are final and the destination wallet is usually emptied within minutes. The most important step is refusing to engage with &quot;recovery agents&quot; who promise to retrieve your funds for a fee — they are a second scam targeting victims of the first.
                            </p>
                        </details>
                        <details className="bg-white border border-slate-200 rounded-lg p-4">
                            <summary className="font-semibold cursor-pointer">What is &quot;pig butchering&quot;?</summary>
                            <p className="mt-2 text-slate-600">
                                A long-con romance/investment hybrid. The scammer builds rapport over weeks (the &quot;fattening&quot;), then walks the victim through a fake trading platform showing big paper gains. When the victim tries to withdraw, withdrawals are blocked behind fees. The platform disappears (the &quot;butchering&quot;).
                            </p>
                        </details>
                    </div>

                    <p className="text-slate-700 leading-relaxed">
                        Run a broader check with the <Link href="/check" className="text-primary underline">general scam checker</Link>{' '}
                        or paste a crypto site URL into the <Link href="/check-scam-link" className="text-primary underline">link checker</Link>.
                        If you already sent funds, open the <Link href="/have-i-been-scammed" className="text-primary underline">damage-control checklist</Link>{' '}
                        and review <Link href="/reports" className="text-primary underline">community scam reports</Link>.
                    </p>
                </div>
            </section>
        </div>
    );
}
