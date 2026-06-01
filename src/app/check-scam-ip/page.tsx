import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { IpChecker } from '@/components/IpChecker';
import { TrustSection } from '@/components/TrustSection';

export const metadata: Metadata = pageMetadata({
    title: 'Suspicious IP Address Checker: Free IP Reputation Scam Check',
    description:
        'Check any IP address for a scam or abuse reputation. Our free IP reputation checker uses AbuseIPDB to flag IPs linked to phishing, fraud and attacks.',
    canonical: 'https://scamchecker.app/check-scam-ip',
});

const TOOL_JSON_LD = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    '@id': 'https://scamchecker.app/check-scam-ip#tool',
    name: 'Suspicious IP Address Checker',
    url: 'https://scamchecker.app/check-scam-ip',
    description:
        'Look up an IPv4 or IPv6 address and see its AbuseIPDB reputation — confidence score, recent report count, country and network. Flags IPs associated with phishing, fraud and abuse.',
    applicationCategory: 'SecurityApplication',
    operatingSystem: 'Web',
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    inLanguage: 'en',
};

export default function CheckScamIpPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(TOOL_JSON_LD) }} />

            <section className="bg-slate-50 py-12 md:py-20">
                <div className="container mx-auto px-4">
                    <div className="flex justify-center items-center gap-2 mb-6 text-sm text-slate-500">
                        <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-slate-900 font-medium">IP Reputation Checker</span>
                    </div>

                    <div className="text-center max-w-2xl mx-auto mb-8">
                        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-6">
                            Suspicious IP Address Checker
                        </h1>
                        <p className="text-lg md:text-xl text-slate-600 mb-4">
                            Enter an IP address to check its reputation. We query AbuseIPDB — a database of
                            community-reported abusive IPs — and show whether the address has been linked to
                            phishing, fraud, spam or attacks.
                        </p>
                        <p className="text-md text-slate-500">
                            Found an IP in a suspicious email header, a server log, or a scam message? Check it
                            here, then run the full message through the{' '}
                            <Link href="/check" className="text-primary underline">scam checker</Link>.
                        </p>
                    </div>

                    <div className="max-w-2xl mx-auto">
                        <IpChecker />
                    </div>
                </div>
            </section>

            <TrustSection />

            <section className="py-16 bg-white">
                <div className="container mx-auto px-4 max-w-4xl">
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">
                        What an IP reputation check actually tells you
                    </h2>
                    <p className="text-slate-700 leading-relaxed mb-4">
                        Every device on the internet has an IP address. When a server sends phishing emails,
                        hosts a fake login page, or runs automated attacks, the people on the receiving end can
                        report that IP to abuse databases. AbuseIPDB aggregates those reports into a single
                        <strong> confidence score from 0 to 100</strong> — the higher the number, the more
                        recent abuse the wider community has flagged from that address.
                    </p>
                    <p className="text-slate-700 leading-relaxed mb-8">
                        A high score is a strong signal that an IP is dangerous. A score of zero is{' '}
                        <em>not</em> a clean bill of health: brand-new scam infrastructure often has no reports
                        yet, and attackers rotate addresses constantly. Treat a clean result as &quot;nothing
                        reported recently&quot;, not &quot;safe&quot;.
                    </p>

                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">
                        How to read the confidence score
                    </h2>
                    <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-8">
                        <li><strong>80–100:</strong> High risk. The IP has heavy, recent abuse reports. Do not trust anything coming from it.</li>
                        <li><strong>50–79:</strong> Elevated risk. A meaningful number of reports — treat with strong suspicion.</li>
                        <li><strong>20–49:</strong> Medium risk. Some reports exist; verify before trusting.</li>
                        <li><strong>1–19:</strong> Low but non-zero. A few reports — worth noting alongside other red flags.</li>
                        <li><strong>0 with reports shown:</strong> Read the report count and date rather than only the score.</li>
                    </ul>

                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">
                        When should you check an IP address?
                    </h2>
                    <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-8">
                        <li><strong>Suspicious email headers.</strong> A phishing email&apos;s &quot;Received:&quot; headers reveal the sending server&apos;s IP. A flagged IP confirms your suspicion.</li>
                        <li><strong>Scam messages that include a raw IP link</strong> like <code>http://45.33.32.156/login</code> instead of a domain — a classic phishing tell.</li>
                        <li><strong>Server or firewall logs</strong> showing repeated login attempts from an unfamiliar address.</li>
                        <li><strong>A &quot;login from a new device&quot; alert</strong> listing an IP you don&apos;t recognise.</li>
                    </ul>

                    <div className="grid md:grid-cols-2 gap-4 my-8">
                        <Link href="/check" className="block p-5 rounded-xl bg-slate-50 border border-slate-200 hover:border-primary hover:shadow-md transition-all">
                            <h3 className="font-semibold text-slate-900 mb-1">Got the whole message or email?</h3>
                            <p className="text-slate-600 text-sm">The full scam checker extracts IPs, links and phone numbers automatically and checks each one.</p>
                        </Link>
                        <Link href="/scam-report-lookup" className="block p-5 rounded-xl bg-slate-50 border border-slate-200 hover:border-primary hover:shadow-md transition-all">
                            <h3 className="font-semibold text-slate-900 mb-1">Look up a number, site or email</h3>
                            <p className="text-slate-600 text-sm">Search the community scam report database for a specific phone, domain, email or IP.</p>
                        </Link>
                    </div>

                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">Frequently asked questions</h2>
                    <div className="space-y-4 my-6">
                        <details className="bg-white border border-slate-200 rounded-lg p-4">
                            <summary className="font-semibold cursor-pointer">Does this check IPv6 addresses too?</summary>
                            <p className="mt-2 text-slate-600">Yes. Both IPv4 (e.g. <code>45.33.32.156</code>) and IPv6 (e.g. <code>2001:4860:4860::8888</code>) are supported. Private and reserved addresses (like <code>192.168.x.x</code> or <code>127.0.0.1</code>) are not sent for an external check because they are not publicly routable.</p>
                        </details>
                        <details className="bg-white border border-slate-200 rounded-lg p-4">
                            <summary className="font-semibold cursor-pointer">Is a clean result proof the IP is safe?</summary>
                            <p className="mt-2 text-slate-600">No. It means no recent abuse has been reported. New scam servers and rotated addresses often have no reports yet. Always combine this with the other red flags in the message.</p>
                        </details>
                        <details className="bg-white border border-slate-200 rounded-lg p-4">
                            <summary className="font-semibold cursor-pointer">Is the lookup private?</summary>
                            <p className="mt-2 text-slate-600">The IP you enter is sent to our server to query AbuseIPDB. We do not store the IPs you check. The rest of the scanner analyses content in your browser.</p>
                        </details>
                    </div>

                    <p className="text-slate-700 leading-relaxed">
                        Next steps: run the full message through the{' '}
                        <Link href="/check" className="text-primary underline">scam checker</Link>, check a link with the{' '}
                        <Link href="/check-scam-link" className="text-primary underline">URL scam checker</Link>, browse the{' '}
                        <Link href="/reports" className="text-primary underline">community scam reports</Link>, or — if you already acted —
                        open the <Link href="/have-i-been-scammed" className="text-primary underline">have I been scammed checklist</Link>.
                    </p>
                </div>
            </section>
        </div>
    );
}
