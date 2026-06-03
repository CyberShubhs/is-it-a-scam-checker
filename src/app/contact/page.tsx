import { Metadata } from 'next';
import Link from 'next/link';
import { pageMetadata } from '@/lib/seo';
import { Card, CardContent } from '@/components/ui/card';
import { ContactForm } from '@/components/ContactForm';
import { ShieldAlert, FileText, Newspaper, Lock, Trash2, LifeBuoy } from 'lucide-react';

export const metadata: Metadata = pageMetadata({
    title: 'Contact the Scam Checker Team: Support & Editorial',
    description: 'Contact the Scam Checker team for support, scam reports, press, corrections, security disclosure or data removal. Real working contact options.',
    canonical: 'https://scamchecker.app/contact',
});

// Specialised routes that handle specific enquiry types better than the form.
const ROUTES = [
    {
        icon: ShieldAlert,
        title: 'Report a scam',
        body: 'Add a scam to the community database (phone, website, email or IP).',
        href: '/check',
        cta: 'Open the scam checker',
    },
    {
        icon: Lock,
        title: 'Security / responsible disclosure',
        body: 'Found a vulnerability? Follow our coordinated disclosure process.',
        href: '/responsible-disclosure',
        cta: 'Responsible disclosure',
    },
    {
        icon: Trash2,
        title: 'Data removal / privacy',
        body: 'Request removal of a report or ask a privacy question.',
        href: '/data-removal',
        cta: 'Data removal',
    },
    {
        icon: Newspaper,
        title: 'Reporting bodies',
        body: 'Need to report fraud officially? Find your country’s authority.',
        href: '/global-scam-reporting',
        cta: 'Global scam reporting',
    },
];

export default function ContactPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-3xl">
            <h1 className="text-4xl font-bold mb-4 text-slate-900 text-center">Contact the Scam Checker Team</h1>
            <p className="text-lg text-slate-600 text-center mb-10 max-w-2xl mx-auto">
                Questions, feedback, corrections, or a scam to report? Send us a message and we&apos;ll reply
                by email. Pick the category that fits so it reaches the right place.
            </p>

            <section className="mb-12">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 mb-2">
                            <LifeBuoy className="w-5 h-5 text-primary" />
                            <h2 className="text-xl font-semibold text-slate-900">Send us a message</h2>
                        </div>
                        <p className="text-sm text-slate-600 mb-5">
                            Use this form for support, press, corrections, privacy requests, or general enquiries.
                        </p>
                        <ContactForm />
                    </CardContent>
                </Card>
            </section>

            <section>
                <h2 className="text-xl font-semibold mb-2 text-slate-900 text-center">Faster routes for specific needs</h2>
                <p className="text-slate-600 text-center text-sm mb-6">
                    Some enquiries are handled best through a dedicated page:
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                    {ROUTES.map((r) => (
                        <div key={r.href} className="border border-slate-200 rounded-xl p-5 bg-white">
                            <div className="flex items-center gap-2 mb-2">
                                <r.icon className="w-5 h-5 text-primary flex-shrink-0" />
                                <h3 className="font-semibold text-slate-900">{r.title}</h3>
                            </div>
                            <p className="text-sm text-slate-600 mb-3">{r.body}</p>
                            <Link href={r.href} className="text-primary text-sm font-medium hover:underline inline-flex items-center gap-1">
                                {r.cta} <FileText className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    ))}
                </div>
            </section>

            <p className="text-center text-sm text-slate-500 mt-10">
                Prefer to read first? Visit the <Link href="/guides" className="text-primary hover:underline">scam guides</Link>,
                browse <Link href="/reports" className="text-primary hover:underline">community reports</Link>, or learn
                <Link href="/how-it-works" className="text-primary hover:underline"> how the checker works</Link>.
            </p>
        </div>
    );
}
