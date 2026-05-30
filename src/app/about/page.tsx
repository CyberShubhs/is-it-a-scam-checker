import { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { ShieldCheck, Lock, UserCheck, Globe } from 'lucide-react';

export const metadata: Metadata = pageMetadata({
    title: "About Scam Checker: Built by Cyber Security Professionals",
    description: "Learn about Scam Checker's mission to democratise cyber defence. Built by security professionals to help you detect fraud instantly.",
    canonical: "https://scamchecker.app/about",
});

export default function AboutPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900 leading-tight">
                Democratising Cyber Defence for Everyone
            </h1>
            <p className="text-xl text-slate-600 mb-12 max-w-2xl leading-relaxed">
                Scam Checker provides professional-grade fraud detection without the complexity. We translate technical threat intelligence into clear, actionable advice for everyday users.
            </p>

            <div className="grid md:grid-cols-2 gap-8 mb-16">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                        <UserCheck className="w-6 h-6 text-blue-600" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-3">Who Built This</h2>
                    <p className="text-slate-600 mb-4">
                        Scam Checker is developed and maintained by{' '}
                        <a
                            href="https://shubhamsingla.tech"
                            className="text-blue-600 hover:underline font-medium"
                            rel="author noopener"
                        >
                            Shubham Singla — shubhamsingla.tech
                        </a>
                        , a Cyber Security professional and Software Engineer. Source
                        is published on{' '}
                        <a
                            href="https://github.com/CyberShubhs"
                            className="text-blue-600 hover:underline font-medium"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            GitHub (@CyberShubhs)
                        </a>
                        .
                    </p>
                    <p className="text-slate-600">
                        With a background in defensive cybersecurity and secure software development, Shubham built this tool to close the gap between enterprise-grade security tools and consumer protection needs. The site is built privacy-first: nothing you paste into the scam checker is uploaded to a server.
                    </p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center mb-4">
                        <Lock className="w-6 h-6 text-emerald-600" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-3">Our Core Philosophy</h2>
                    <ul className="space-y-3 text-slate-600">
                        <li className="flex gap-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                            <span><strong>Privacy First:</strong> Analysis happens in your browser. We never store your personal messages or sell your data.</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                            <span><strong>No Fear-Mongering:</strong> We provide factual risk assessments, not hype.</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                            <span><strong>Radical Accessibility:</strong> Security tools must be free and easy to use to be effective.</span>
                        </li>
                    </ul>
                </div>
            </div>

            <h2 className="text-3xl font-bold mb-6 text-slate-900">Why Trust Our Analysis?</h2>
            <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed mb-12">
                <p>
                    Automated scam detection is complex. Scammers constantly evolve their tactics to bypass filters. We rely on a multi-layered approach grounded in cybersecurity fundamentals:
                </p>
                <ul>
                    <li><strong>Heuristic Analysis:</strong> Identifying patterns in language that indicate urgency, coercion, or authority impersonation (Social Engineering markers).</li>
                    <li><strong>Technical Verification:</strong> checking URLs against known malicious patterns, including punycode attacks, subdomain spoofing, and lookalike domains.</li>
                    <li><strong>Threat Intelligence:</strong> Integrating community reports and known scam database signatures.</li>
                </ul>
                <p>
                    While no tool is 100% perfect, our approach is designed by security professionals to detect the <em>intent</em> behind a message, not just keyword matching.
                </p>
            </div>

            <div className="bg-slate-900 text-slate-300 rounded-2xl p-8 md:p-12 text-center">
                <Globe className="w-12 h-12 mx-auto text-blue-400 mb-6" />
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">A Global Defence Against Fraud</h2>
                <p className="max-w-2xl mx-auto mb-8 text-lg">
                    Fraud is a global industry. Whether you are in New York, London, Mumbai, or Sydney, the tactics used to steal your money are remarkably similar. We are building a global defence layer that protects users everywhere.
                </p>
                <div className="flex flex-wrap justify-center gap-4 text-sm font-medium text-blue-200">
                    <span>• Phishing Detection</span>
                    <span>• Smishing Prevention</span>
                    <span>• Fraud Awareness</span>
                    <span>• Digital Safety</span>
                </div>
            </div>
        </div>
    );
}
