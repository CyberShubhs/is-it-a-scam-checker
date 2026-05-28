"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldAlert, AlertTriangle, Lock, PhoneOff, CreditCard, ArrowRight, CheckCircle2 } from 'lucide-react';
import {
    trackHaveIBeenScammedStarted,
    trackHaveIBeenScammedCompleted,
    type RiskLevel,
    type ResultBucket,
} from '@/lib/analytics';
import { PageFAQ } from '@/components/PageFAQ';
import { HIBS_FAQS } from '@/lib/faqs';

export default function HaveIBeenScammedPage() {
    const [step, setStep] = useState(1);
    const [answers, setAnswers] = useState<Record<string, boolean>>({});
    const startedRef = useRef(false);

    const handleAnswer = (questionId: string, value: boolean) => {
        if (!startedRef.current) {
            startedRef.current = true;
            trackHaveIBeenScammedStarted({
                page_path: '/have-i-been-scammed',
                event_source: 'hibs_assessment',
                cta_location: 'hibs_step_1',
            });
        }
        setAnswers(prev => ({ ...prev, [questionId]: value }));
        setStep(prev => prev + 1);
    };

    const reset = () => {
        setStep(1);
        setAnswers({});
        startedRef.current = false;
    };

    // Render the current assessment step inline. Declaring this as a nested
    // component would reset Results' useEffect/useRef on every parent render
    // and trips react-hooks/components-during-render.
    let stepContent: React.ReactNode;
    if (step === 1) {
        stepContent = (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                    <h2 className="text-xl font-bold mb-2">Did you click a link in a suspicious message or email?</h2>
                    <p className="text-slate-600 mb-6">This includes checking 'tracking' links, verifying accounts, or claiming prizes.</p>
                    <div className="grid grid-cols-2 gap-4">
                        <Button onClick={() => handleAnswer('clicked_link', true)} variant="outline" className="h-24 text-lg border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300">
                            Yes, I clicked
                        </Button>
                        <Button onClick={() => handleAnswer('clicked_link', false)} variant="outline" className="h-24 text-lg border-slate-200 hover:bg-slate-50 hover:border-slate-300">
                            No, I didn't click
                        </Button>
                    </div>
                </div>
            </div>
        );
    } else if (step === 2) {
        stepContent = (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                    <h2 className="text-xl font-bold mb-2">Did you enter any personal information?</h2>
                    <p className="text-slate-600 mb-6">Passwords, email address, phone number, date of birth, or address.</p>
                    <div className="grid grid-cols-2 gap-4">
                        <Button onClick={() => handleAnswer('shared_info', true)} variant="outline" className="h-24 text-lg border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300">
                            Yes, shared details
                        </Button>
                        <Button onClick={() => handleAnswer('shared_info', false)} variant="outline" className="h-24 text-lg border-slate-200 hover:bg-slate-50 hover:border-slate-300">
                            No
                        </Button>
                    </div>
                </div>
            </div>
        );
    } else if (step === 3) {
        stepContent = (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                    <h2 className="text-xl font-bold mb-2">Did you provide financial details or send money?</h2>
                    <p className="text-slate-600 mb-6">Credit card numbers, bank transfers, crypto, or gift card codes.</p>
                    <div className="grid grid-cols-2 gap-4">
                        <Button onClick={() => handleAnswer('sent_money', true)} variant="outline" className="h-24 text-lg border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300">
                            Yes, shared/sent
                        </Button>
                        <Button onClick={() => handleAnswer('sent_money', false)} variant="outline" className="h-24 text-lg border-slate-200 hover:bg-slate-50 hover:border-slate-300">
                            No
                        </Button>
                    </div>
                </div>
            </div>
        );
    } else {
        stepContent = <Results answers={answers} reset={reset} />;
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <div className="container mx-auto px-4 max-w-3xl">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                        <ShieldAlert className="w-8 h-8 text-red-600" />
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">Have I Been Scammed?</h1>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                        Don't panic. Answer 3 quick questions to get a clear verdict and immediate steps to protect yourself.
                    </p>
                </div>

                <Card className="border-0 shadow-lg mb-12">
                    <CardContent className="p-8 md:p-12">
                        {stepContent}
                    </CardContent>
                </Card>

                {/* SEO Content Section targeting common scam-recovery search intents. */}
                <div className="prose prose-slate max-w-none">
                    <h2 className="text-2xl font-bold text-slate-900">What to do if you think you&apos;ve been scammed</h2>
                    <p>
                        If you&apos;re sitting there thinking &quot;<strong>I think I got scammed</strong>&quot; or &quot;<strong>I clicked a scam link</strong>&quot;, you are not alone. It happens to thousands of people every day. The most important thing is to act fast.
                    </p>
                    <p>
                        Whether you <strong>gave your details to a scammer</strong>, replied to a <strong>scam message</strong>, or are just wondering &quot;<strong>was this a scam?</strong>&quot;, the steps you take in the first hour can save your money and identity.
                    </p>
                </div>
            </div>

            {/* Page-specific FAQs + matching FAQPage JSON-LD. */}
            <div className="container mx-auto px-4 max-w-4xl">
                <PageFAQ
                    faqs={HIBS_FAQS}
                    title="Have I been scammed — Frequently Asked Questions"
                />
            </div>
        </div>
    );
}

function severityToAnalytics(
    severity: 'critical' | 'high' | 'medium' | 'low',
): { risk_level: RiskLevel; result_bucket: ResultBucket } {
    switch (severity) {
        case 'critical':
            return { risk_level: 'high', result_bucket: 'dangerous' };
        case 'high':
            return { risk_level: 'high', result_bucket: 'dangerous' };
        case 'medium':
            return { risk_level: 'medium', result_bucket: 'suspicious' };
        case 'low':
        default:
            return { risk_level: 'low', result_bucket: 'safe' };
    }
}

function Results({ answers, reset }: { answers: Record<string, boolean>, reset: () => void }) {
    const severity = answers.sent_money ? 'critical' : answers.shared_info ? 'high' : answers.clicked_link ? 'medium' : 'low';

    const firedRef = useRef(false);
    useEffect(() => {
        if (firedRef.current) return;
        firedRef.current = true;
        const mapped = severityToAnalytics(severity);
        trackHaveIBeenScammedCompleted({
            risk_level: mapped.risk_level,
            result_bucket: mapped.result_bucket,
            page_path: '/have-i-been-scammed',
        });
    }, [severity]);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-8">
            <div className={`p-6 rounded-xl border ${severity === 'critical' ? 'bg-red-50 border-red-200 text-red-900' :
                    severity === 'high' ? 'bg-orange-50 border-orange-200 text-orange-900' :
                        severity === 'medium' ? 'bg-yellow-50 border-yellow-200 text-yellow-900' :
                            'bg-green-50 border-green-200 text-green-900'
                }`}>
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                    {severity === 'critical' ? <><AlertTriangle className="w-6 h-6" /> Critical Action Required</> :
                        severity === 'high' ? <><Lock className="w-6 h-6" /> High Risk - Act Now</> :
                            severity === 'medium' ? <><ShieldAlert className="w-6 h-6" /> Caution Needed</> :
                                <><CheckCircle2 className="w-6 h-6" /> Likely Safe</>}
                </h2>
                <p className="text-lg">
                    {severity === 'critical' ? "You have shared financial details. Immediate action is needed to prevent theft." :
                        severity === 'high' ? "Your personal information is at risk. You need to secure your accounts." :
                            severity === 'medium' ? "Clicking links confirms your number is active, but you may be safe if you entered no data." :
                                "You avoided the trap. No data was shared."}
                </p>
            </div>

            <div className="space-y-6">
                <h3 className="text-xl font-bold text-slate-900">Your Action Plan</h3>

                {answers.sent_money && (
                    <div className="flex gap-4 p-4 border rounded-lg bg-white shadow-sm">
                        <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900">1. Contact Your Bank Immediately</h4>
                            <p className="text-slate-600 text-sm mt-1">
                                Call the fraud number on the back of your card. Tell them "I got scammed" and authorised a payment. Ask to freeze your accounts.
                            </p>
                        </div>
                    </div>
                )}

                {(answers.sent_money || answers.shared_info) && (
                    <div className="flex gap-4 p-4 border rounded-lg bg-white shadow-sm">
                        <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                            <Lock className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900">
                                {answers.sent_money ? "2. Change Your Passwords" : "1. Change Your Passwords"}
                            </h4>
                            <p className="text-slate-600 text-sm mt-1">
                                If you shared a password, change it everywhere. If you logged in via a link, your account is compromised.
                            </p>
                        </div>
                    </div>
                )}

                {answers.clicked_link && !answers.shared_info && !answers.sent_money && (
                    <div className="flex gap-4 p-4 border rounded-lg bg-white shadow-sm">
                        <div className="flex-shrink-0 w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                            <PhoneOff className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900">1. Watch Out for Follow-ups</h4>
                            <p className="text-slate-600 text-sm mt-1">
                                Scammers now know your number works. Expect more calls or texts. Do not reply.
                            </p>
                        </div>
                    </div>
                )}

                {!answers.clicked_link && (
                    <div className="flex gap-4 p-4 border rounded-lg bg-white shadow-sm">
                        <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900">You did the right thing</h4>
                            <p className="text-slate-600 text-sm mt-1">
                                By checking first, you avoided the scam. Stay vigilant.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
                <Button onClick={reset} variant="outline">Start Over</Button>
                <Button asChild className="flex-1 bg-primary">
                    <Link href="/guides/what-to-do-if-youve-been-scammed">
                        Read Full Recovery Guide <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                </Button>
            </div>
        </div>
    );
}
