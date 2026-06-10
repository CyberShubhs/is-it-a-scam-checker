import { Metadata } from 'next';
import Link from 'next/link';
import { Mail, ShieldCheck, Bell, Eye } from 'lucide-react';
import { pageMetadata } from '@/lib/seo';
import { PageFAQ } from '@/components/PageFAQ';
import type { FaqEntry } from '@/lib/faqs';
import { NewsletterSignup, NewsletterConfirmBanner } from '@/components/NewsletterSignup';

export const metadata: Metadata = pageMetadata({
    title: 'Weekly Scam Alerts: New Scams to Watch For | Scam Checker',
    description:
        'Get one short, free email a week covering the newest scams people are reporting — fake texts, websites, job offers and more. Double opt-in, unsubscribe anytime.',
    path: '/weekly-scam-alerts',
});

const ALERT_FAQS: FaqEntry[] = [
    {
        question: 'What does the weekly scam alerts email include?',
        answer:
            'One short email each week summarising the scams people are reporting right now — fake delivery texts, lookalike shopping sites, job and task scams, phone impersonation and crypto fraud — with plain-English advice on what to do if one reaches you.',
    },
    {
        question: 'Is the scam alerts email free?',
        answer:
            'Yes. The weekly email is completely free, with no trial, card details, or account required. You confirm your address once and can unsubscribe with one click in any email.',
    },
    {
        question: 'What do you do with my email address?',
        answer:
            'Nothing beyond sending the alerts. We only store your address after you click the confirmation link (double opt-in), we never sell or share it, and unsubscribing removes you from the list. Your address is never connected to anything you check with our scam tools.',
    },
    {
        question: 'How is this different from the scam checker tools?',
        answer:
            'The checker tools help when you already have a suspicious message, link, or file in front of you. The weekly email is the early-warning side: it tells you what to watch for before a scam reaches you or your family.',
    },
];

export default function WeeklyScamAlertsPage() {
    return (
        <div className="min-h-screen bg-white">
            <section className="py-12 md:py-16 bg-gradient-to-b from-slate-50 to-white">
                <div className="container mx-auto px-4 max-w-3xl">
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                        Weekly scam alerts, straight to your inbox
                    </h1>
                    <p className="text-lg text-slate-600 mb-8">
                        Scams change every week — the fake toll-road text becomes a fake
                        parcel text, the fake job offer becomes a fake task app. Our free
                        weekly email tells you what&#39;s circulating right now, drawn from
                        community reports and the scam patterns our checker sees, so you
                        can warn your family before it reaches them.
                    </p>
                    <NewsletterConfirmBanner />
                    <NewsletterSignup ctaLocation="weekly_alerts_page" />
                </div>
            </section>

            <section className="py-12" aria-label="What you get each week">
                <div className="container mx-auto px-4 max-w-3xl">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">
                        What&#39;s in each email
                    </h2>
                    <ul className="space-y-4 text-slate-700">
                        <li className="flex gap-3">
                            <Bell className="w-5 h-5 text-primary mt-0.5 shrink-0" aria-hidden="true" />
                            <span>
                                <strong>This week&#39;s scams:</strong> the campaigns people are
                                actually reporting — the same data behind our{' '}
                                <Link href="/reports" className="text-primary underline hover:no-underline">
                                    community scam reports
                                </Link>{' '}
                                and{' '}
                                <Link href="/latest-scams" className="text-primary underline hover:no-underline">
                                    latest scam alerts
                                </Link>
                                .
                            </span>
                        </li>
                        <li className="flex gap-3">
                            <Eye className="w-5 h-5 text-primary mt-0.5 shrink-0" aria-hidden="true" />
                            <span>
                                <strong>How to spot it:</strong> the exact wording, sender
                                patterns and red flags, like the examples in our{' '}
                                <Link href="/guides" className="text-primary underline hover:no-underline">
                                    scam identification guides
                                </Link>
                                .
                            </span>
                        </li>
                        <li className="flex gap-3">
                            <ShieldCheck className="w-5 h-5 text-primary mt-0.5 shrink-0" aria-hidden="true" />
                            <span>
                                <strong>What to do:</strong> one clear next step — usually
                                checking the message with our{' '}
                                <Link href="/check" className="text-primary underline hover:no-underline">
                                    free scam checker
                                </Link>{' '}
                                and reporting it so others are warned too.
                            </span>
                        </li>
                        <li className="flex gap-3">
                            <Mail className="w-5 h-5 text-primary mt-0.5 shrink-0" aria-hidden="true" />
                            <span>
                                <strong>Nothing else:</strong> no daily noise, no ads, no
                                &quot;premium upgrade&quot; pressure. One useful email a week.
                            </span>
                        </li>
                    </ul>
                </div>
            </section>

            <section className="py-12 bg-slate-50" aria-label="Privacy promise">
                <div className="container mx-auto px-4 max-w-3xl">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">
                        Privacy-first, like everything we build
                    </h2>
                    <p className="text-slate-700 mb-3">
                        We use double opt-in: nothing is stored until you click the
                        confirmation link we email you. Your address is used only to send
                        the weekly alerts — it is never sold, shared, or linked to anything
                        you check with our tools. Every email includes a one-click
                        unsubscribe.
                    </p>
                    <p className="text-slate-700">
                        Read more in our{' '}
                        <Link href="/privacy" className="text-primary underline hover:no-underline">
                            privacy policy
                        </Link>{' '}
                        or learn{' '}
                        <Link href="/how-it-works" className="text-primary underline hover:no-underline">
                            how our scam detection works
                        </Link>
                        .
                    </p>
                </div>
            </section>

            <PageFAQ faqs={ALERT_FAQS} title="Weekly scam alerts — FAQ" />
        </div>
    );
}
