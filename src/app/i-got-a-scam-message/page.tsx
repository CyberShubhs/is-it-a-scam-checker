import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import Link from 'next/link';
import { ShieldCheck, AlertTriangle, XCircle, MessageSquare } from 'lucide-react';
import { TrustSection } from '@/components/TrustSection';

export const metadata: Metadata = pageMetadata({
    title: "I Got a Scam Message - What To Do Immediately | Scam Checker",
    description: "Received a suspicious message? Don't panic. Here are the immediate steps to take if you got a scam text, email, or WhatsApp message.",
    canonical: "https://scamchecker.app/i-got-a-scam-message",
});

export default function IGotAScamMessagePage() {
    return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            <section className="py-12 md:py-20">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="text-center mb-12">
                        <span className="inline-block px-4 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold mb-6">
                            Immediate Action Guide
                        </span>
                        <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
                            I Got a Scam Message.<br />What Should I Do?
                        </h1>
                        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
                            Don't panic. Getting a scam message is common. Your risk depends on what you did <em>after</em> receiving it.
                        </p>
                    </div>

                    {/* Triage Grid */}
                    <div className="grid md:grid-cols-2 gap-6 mb-16">
                        {/* Scenario A: Just Received */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 mb-4">"I just opened it, but didn't click anything."</h2>
                            <p className="text-slate-600 mb-6">
                                You are likely safe. Modern phones don't usually get infected just by opening a text.
                            </p>
                            <div className="space-y-3">
                                <div className="flex items-start gap-3 text-sm text-slate-700">
                                    <XCircle className="w-5 h-5 text-green-600 shrink-0" />
                                    <span><strong>Do not reply</strong> (even to say "STOP").</span>
                                </div>
                                <div className="flex items-start gap-3 text-sm text-slate-700">
                                    <XCircle className="w-5 h-5 text-green-600 shrink-0" />
                                    <span><strong>Block the sender</strong> on your phone.</span>
                                </div>
                            </div>
                        </div>

                        {/* Scenario B: Clicked or Replied */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-200 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <AlertTriangle className="w-32 h-32 text-red-600" />
                            </div>
                            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6 relative">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 mb-4">"I clicked a link or replied."</h2>
                            <p className="text-slate-600 mb-6">
                                You may be at risk of identity theft or malware. You need to act fast to secure your accounts.
                            </p>
                            <Link
                                href="/have-i-been-scammed"
                                className="block w-full py-4 px-6 bg-red-600 hover:bg-red-700 text-white font-bold text-center rounded-xl transition-colors shadow-lg shadow-red-200"
                            >
                                Start Risk Assessment
                            </Link>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-8 md:p-12 border border-slate-200">
                        <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">Analyze Your Message</h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            <Link href="/check-scam-text" className="group p-6 rounded-xl border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all">
                                <MessageSquare className="w-8 h-8 text-blue-500 mb-4 group-hover:scale-110 transition-transform" />
                                <h3 className="font-bold text-slate-900 mb-2">Check Text/SMS</h3>
                                <p className="text-sm text-slate-600">Analyze suspicious text messages.</p>
                            </Link>
                            <Link href="/check-scam-email" className="group p-6 rounded-xl border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all">
                                <span className="text-3xl mb-4 block group-hover:scale-110 transition-transform">📧</span>
                                <h3 className="font-bold text-slate-900 mb-2">Check Email</h3>
                                <p className="text-sm text-slate-600">Analyze phishing emails.</p>
                            </Link>
                            <Link href="/check-scam-link" className="group p-6 rounded-xl border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all">
                                <span className="text-3xl mb-4 block group-hover:scale-110 transition-transform">🔗</span>
                                <h3 className="font-bold text-slate-900 mb-2">Check Link</h3>
                                <p className="text-sm text-slate-600">Scan suspicious URLs.</p>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <TrustSection />
        </div>
    );
}
