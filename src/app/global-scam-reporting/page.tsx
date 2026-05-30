import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Globe, Shield, Phone, Mail } from 'lucide-react';
import { TrustSection } from '@/components/TrustSection';
import { ReportingCard, PlatformCard } from '@/components/ReportingCards';
import { GuideCtaLink } from '@/components/TrackedLinks';

export const metadata: Metadata = pageMetadata({
    title: "Where to Report Scams Globally (2025 Guide) | Scam Checker",
    description: "Official scam reporting contacts for Australia, USA, UK, Canada, and India. Report fraud to government agencies and stop scammers.",
    canonical: "https://scamchecker.app/global-scam-reporting",
});

export default function GlobalReportingPage() {
    return (
        <div className="bg-slate-50 min-h-screen">
            <section className="py-12 md:py-20 bg-white border-b border-slate-200">
                <div className="container mx-auto px-4 max-w-4xl text-center">
                    <span className="inline-block px-4 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold mb-6">
                        Official Resources
                    </span>
                    <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
                        Where to Report Scams Globally
                    </h1>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                        Reporting fraud helps authorities shut down scam networks and warn others.
                        Find the official reporting channel for your country below.
                    </p>
                </div>
            </section>

            <section className="py-16">
                <div className="container mx-auto px-4 max-w-5xl">

                    {/* Australia */}
                    <div className="mb-12">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="text-4xl">🇦🇺</span>
                            <h2 className="text-3xl font-bold text-slate-900">Australia</h2>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <ReportingCard
                                title="Scamwatch (ACCC)"
                                description="The primary reporting body for all scams in Australia."
                                link="https://www.scamwatch.gov.au/report-a-scam"
                                action="Report Online"
                                destinationType="government"
                                country="AU"
                            />
                            <ReportingCard
                                title="ReportCyber"
                                description="For cybercrimes like hacking, malware, and identity theft."
                                link="https://www.cyber.gov.au/report-and-recover/report"
                                action="Report Cybercrime"
                                destinationType="cybercrime"
                                country="AU"
                            />
                            <ReportingCard
                                title="IDCARE"
                                description="Support case managers for identity theft victims. Free service."
                                link="https://www.idcare.org/"
                                action="Get Support"
                                subtext="Call 1800 595 160"
                                destinationType="other"
                                country="AU"
                            />
                        </div>
                    </div>

                    {/* USA */}
                    <div className="mb-12">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="text-4xl">🇺🇸</span>
                            <h2 className="text-3xl font-bold text-slate-900">United States</h2>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <ReportingCard
                                title="Federal Trade Commission (FTC)"
                                description="Report fraud, scams, and bad business practices."
                                link="https://reportfraud.ftc.gov/"
                                action="Report to FTC"
                                destinationType="government"
                                country="US"
                            />
                            <ReportingCard
                                title="IC3 (FBI)"
                                description="Internet Crime Complaint Center for serious cybercrimes."
                                link="https://www.ic3.gov/"
                                action="File Complaint"
                                destinationType="cybercrime"
                                country="US"
                            />
                        </div>
                    </div>

                    {/* UK */}
                    <div className="mb-12">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="text-4xl">🇬🇧</span>
                            <h2 className="text-3xl font-bold text-slate-900">United Kingdom</h2>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <ReportingCard
                                title="Action Fraud"
                                description="The UK's national reporting centre for fraud and cybercrime."
                                link="https://www.actionfraud.police.uk/"
                                action="Report Fraud"
                                destinationType="government"
                                country="UK"
                            />
                            <ReportingCard
                                title="NCSC"
                                description="Report suspicious emails (phishing) directly."
                                link="https://www.ncsc.gov.uk/collection/phishing-scams"
                                action="Report Phishing"
                                subtext="Forward emails to report@phishing.gov.uk"
                                destinationType="cybercrime"
                                country="UK"
                            />
                        </div>
                    </div>

                    {/* Canada */}
                    <div className="mb-12">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="text-4xl">🇨🇦</span>
                            <h2 className="text-3xl font-bold text-slate-900">Canada</h2>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <ReportingCard
                                title="Canadian Anti-Fraud Centre"
                                description="Collects information on fraud and identity theft."
                                link="https://antifraudcentre-centreantifraude.ca/report-signalez-eng.htm"
                                action="Report Fraud"
                                destinationType="government"
                                country="CA"
                            />
                        </div>
                    </div>

                    {/* Tech Platforms */}
                    <div className="mt-20 pt-12 border-t border-slate-200">
                        <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Report to the Platform</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <PlatformCard
                                icon={<Globe className="w-8 h-8 text-blue-600" />}
                                title="Google"
                                link="https://safebrowsing.google.com/safebrowsing/report_phish/"
                                text="Report Phishing Page"
                            />
                            <PlatformCard
                                icon={<Mail className="w-8 h-8 text-red-600" />}
                                title="Gmail"
                                link="https://support.google.com/mail/answer/8253"
                                text="Report Scam Email"
                            />
                            <PlatformCard
                                icon={<Phone className="w-8 h-8 text-green-600" />}
                                title="WhatsApp"
                                link="https://faq.whatsapp.com/1142481766359885/?cms_platform=web"
                                text="Report a Contact"
                            />
                            <PlatformCard
                                icon={<Shield className="w-8 h-8 text-blue-500" />}
                                title="Facebook"
                                link="https://www.facebook.com/help/fakeaccount"
                                text="Report Fake Profile"
                            />
                        </div>
                    </div>

                    {/* Bottom CTA */}
                    <div className="mt-20 bg-slate-900 rounded-3xl p-12 text-center text-white">
                        <h2 className="text-3xl font-bold mb-6">Not sure if it's a scam yet?</h2>
                        <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
                            Use our free tools to verify a suspicious message or link before you report it.
                        </p>
                        <Button asChild size="lg" className="bg-white text-slate-900 hover:bg-slate-100">
                            <GuideCtaLink
                                href="/check"
                                ctaLocation="global_reporting_bottom"
                            >
                                Check a message, email, or link with our scam checker
                            </GuideCtaLink>
                        </Button>
                    </div>

                </div>
            </section>

            <TrustSection />
        </div>
    );
}

