import { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { Search, ShieldAlert, CheckCircle, Zap } from 'lucide-react';

export const metadata: Metadata = pageMetadata({
    title: "How Scam Checker Works: Pattern Detection Explained",
    description: "Understand how our scam detection algorithm analyses messages, emails and links for fraud patterns commonly used in Australia.",
    canonical: "https://scamchecker.app/how-it-works",
});

export default function HowItWorksPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <h1 className="text-4xl font-bold mb-4 text-slate-900 text-center">How Scam Checker Works: Pattern Detection Explained</h1>
            <p className="text-xl text-slate-600 text-center mb-12 max-w-2xl mx-auto">
                Our tool analyses text for patterns commonly used by scammers targeting Australians. Here&apos;s what happens behind the scenes.
            </p>

            <div className="space-y-12">
                <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="bg-blue-100 p-6 rounded-full text-blue-600 flex-shrink-0">
                        <Search className="w-10 h-10" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold mb-2 text-slate-900">1. Analyse Key Patterns</h2>
                        <p className="text-lg text-slate-700">
                            When you paste a URL, email, or text message, our system scans the text for specific &quot;signals&quot;. These include high-pressure language (&quot;act now&quot;), known scam keywords (like &quot;gift card&quot; payments), and attempts to impersonate legitimate organisations like banks, AusPost, or the ATO.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="bg-orange-100 p-6 rounded-full text-orange-600 flex-shrink-0">
                        <ShieldAlert className="w-10 h-10" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold mb-2 text-slate-900">2. Check Red Flag Database</h2>
                        <p className="text-lg text-slate-700">
                            We cross-reference the content against a database of known suspicious patterns. For example, if a message claims to be from &quot;Australia Post&quot; but asks you to pay a fee via a strange link, that&apos;s a massive red flag. We also check technical details like URL structures to spot fake websites.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="bg-green-100 p-6 rounded-full text-green-600 flex-shrink-0">
                        <CheckCircle className="w-10 h-10" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold mb-2 text-slate-900">3. Instant Safety Score</h2>
                        <p className="text-lg text-slate-700">
                            Based on these findings, we give you a simple risk score: <strong>Low</strong>, <strong>Medium</strong>, or <strong>High</strong>. We also explain exactly <em>why</em> we gave that score and provide clear, actionable steps on what to do next (like &quot;block the number&quot; or &quot;contact your bank&quot;).
                        </p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="bg-purple-100 p-6 rounded-full text-purple-600 flex-shrink-0">
                        <Zap className="w-10 h-10" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold mb-2 text-slate-900">4. Browser-Based Processing</h2>
                        <p className="text-lg text-slate-700">
                            The analysis runs in your browser, not on our servers. This means your content stays private. We don&apos;t store what you paste unless you explicitly report it to help others. Even then, data is anonymised before storage.
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-12 bg-slate-100 p-6 rounded-xl">
                <h2 className="text-xl font-bold mb-4 text-slate-900">Important Limitations</h2>
                <p className="text-slate-700">
                    No automated tool is perfect. Scammers constantly evolve their tactics. Our tool may occasionally miss new scam variants (false negatives) or flag legitimate messages as suspicious (false positives). Always verify sensitive requests through official channels — for example, call your bank using the number on your card, not a number from a suspicious message.
                </p>
            </div>
        </div>
    );
}
