'use client';

import React from 'react';
import { ScamAnalysisResult } from '@/lib/scamScorer';
import {
    CheckCircle,
    AlertTriangle,
    AlertOctagon,
    Copy,
    Check,
    ChevronDown,
    ListChecks,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { trackResultCopied, mapRiskLevel } from '@/lib/analytics';
import { DEFAULT_TECHNICAL_DETAILS_OPEN } from '@/lib/scanStages';
import { RelatedReports } from './RelatedReports';
import { IpReputation } from './IpReputation';
import { ReportModal } from './ReportModal';
import { NewsletterSignup } from './NewsletterSignup';

interface AnalysisResultProps {
    result: ScamAnalysisResult | null;
    /** Original input text — used to pre-fill the report modal + technical preview. */
    input?: string;
    /** True when the scanned source was a file/image (controls technical panel). */
    isFileScan?: boolean;
}

export function AnalysisResultDisplay({ result, input, isFileScan }: AnalysisResultProps) {
    const [copied, setCopied] = React.useState(false);
    const [isReportOpen, setIsReportOpen] = React.useState(false);
    // Raw extracted text + technical details stay COLLAPSED by default — we
    // surface risk signals, not a text dump. See src/lib/scanStages.ts.
    const [techOpen, setTechOpen] = React.useState(DEFAULT_TECHNICAL_DETAILS_OPEN);

    if (!result) return null;

    const getRiskColor = (level: string) => {
        switch (level) {
            case 'High': return 'text-red-600 bg-red-50 border-red-200';
            case 'Medium': return 'text-orange-600 bg-orange-50 border-orange-200';
            case 'Low': return 'text-green-600 bg-green-50 border-green-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getIcon = (level: string) => {
        switch (level) {
            case 'High': return <AlertOctagon className="w-6 h-6" />;
            case 'Medium': return <AlertTriangle className="w-6 h-6" />;
            case 'Low': return <CheckCircle className="w-6 h-6" />;
            default: return null;
        }
    };

    // Privacy-safe summary for the clipboard — never the raw user input.
    const handleCopy = () => {
        if (copied) return;
        const text =
            result.safeSummary ??
            `Scam Check Result: ${result.riskLevel} Risk.\n\n${result.summary}\n\nCheck more at: scamchecker.app/check`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        trackResultCopied({
            check_type: 'unknown',
            risk_level: mapRiskLevel(result.riskLevel),
            page_path: typeof window !== 'undefined' ? window.location.pathname : undefined,
        });
        setTimeout(() => setCopied(false), 2000);
    };

    const groups = result.signalGroups ?? [];
    const relatedReports = result.relatedReports ?? [];
    const ipReputation = result.ipReputation ?? [];
    const whatToDo = result.whatToDoNext ?? [];
    const entities = result.entities;
    const meta = result.documentMeta;

    // Suggest the most useful value to pre-fill the report modal with.
    const reportInitial =
        entities?.urls[0]?.raw ??
        entities?.emails[0]?.email ??
        entities?.phones[0]?.normalised ??
        entities?.ips[0]?.ip ??
        (isFileScan ? '' : input);

    const hasTechnical =
        isFileScan ||
        !!meta ||
        (entities &&
            (entities.urls.length || entities.ips.length || entities.emails.length || entities.phones.length));

    return (
        <Card className={cn('mt-6 border-2 transition-all duration-300', getRiskColor(result.riskLevel).split(' ')[2])}>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className={cn('p-2 rounded-full ring-2 ring-offset-2', getRiskColor(result.riskLevel))}>
                            {getIcon(result.riskLevel)}
                        </span>
                        <div>
                            <CardTitle className="text-xl">
                                Risk Level: <span className={cn(getRiskColor(result.riskLevel).split(' ')[0])}>{result.riskLevel}</span>
                            </CardTitle>
                            <CardDescription className="text-xs mt-1">
                                Risk score: {result.score} / 100
                            </CardDescription>
                        </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? 'Copied' : 'Copy safe summary'}
                    </Button>
                </div>
            </CardHeader>

            <CardContent>
                <div className="space-y-6">
                    {/* Verdict summary */}
                    <div className="bg-white/50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-1 text-sm text-foreground/80">Analysis summary</h4>
                        <p className="text-lg font-medium text-slate-800 leading-snug">{result.summary}</p>
                        {result.scannedItems && result.scannedItems.length > 0 && (
                            <p className="text-xs text-slate-500 mt-2">
                                Scanned: {result.scannedItems.join(', ')}. Some content in images or
                                unusual layouts may not be fully readable.
                            </p>
                        )}
                    </div>

                    {/* Why this result — grouped signals */}
                    {groups.length > 0 ? (
                        <div>
                            <h4 className="font-semibold mb-3 text-sm text-foreground/80">Why this result</h4>
                            <div className="space-y-4">
                                {groups.map((group) => (
                                    <div key={group.id}>
                                        <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">
                                            {group.title}
                                        </p>
                                        <div className="grid gap-2">
                                            {group.signals.map((signal, i) => (
                                                <div key={i} className="flex gap-3 items-start p-3 rounded-md border bg-white/60">
                                                    <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded select-none">
                                                        +{signal.points}
                                                    </span>
                                                    <div>
                                                        <p className="font-semibold text-sm text-slate-900">{signal.label}</p>
                                                        <p className="text-sm text-slate-600 mt-1">{signal.explanation}</p>
                                                        {signal.matchedText && (
                                                            <div className="mt-2 text-xs bg-red-50 text-red-800 p-2 rounded border border-red-100 font-mono break-all">
                                                                Detected: &quot;{signal.matchedText}&quot;
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        result.riskLevel === 'Low' && (
                            <div className="text-center p-4 text-slate-500 italic text-sm">
                                No specific threat patterns were found, but this does not guarantee safety.
                            </div>
                        )
                    )}

                    {/* External IP reputation */}
                    <IpReputation results={ipReputation} />

                    {/* Related community reports (always rendered) */}
                    <RelatedReports matches={relatedReports} onReport={() => setIsReportOpen(true)} />

                    {/* What to do next */}
                    {whatToDo.length > 0 && (
                        <div className="rounded-lg border bg-white/70 p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <ListChecks className="w-5 h-5 text-primary" />
                                <h4 className="font-semibold text-slate-900">What to do next</h4>
                            </div>
                            <ul className="space-y-2">
                                {whatToDo.map((step, i) => (
                                    <li key={i} className="flex gap-2 text-sm text-slate-700">
                                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                                            {i + 1}
                                        </span>
                                        <span>{step}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Technical details — collapsed by default */}
                    {hasTechnical && (
                        <div className="rounded-lg border bg-white/70">
                            <button
                                type="button"
                                onClick={() => setTechOpen((o) => !o)}
                                className="w-full flex items-center justify-between p-4 text-left"
                                aria-expanded={techOpen}
                            >
                                <span className="font-semibold text-slate-900 text-sm">Technical details</span>
                                <ChevronDown className={cn('w-4 h-4 transition-transform', techOpen && 'rotate-180')} />
                            </button>
                            {techOpen && (
                                <div className="px-4 pb-4 space-y-3 text-sm">
                                    {entities && entities.urls.length > 0 && (
                                        <div>
                                            <p className="font-semibold text-slate-700 text-xs uppercase">Links found</p>
                                            <ul className="mt-1 font-mono text-xs text-slate-600 break-all space-y-0.5">
                                                {entities.urls.map((u, i) => (
                                                    <li key={i}>• {u.raw}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {entities && entities.ips.length > 0 && (
                                        <p className="text-xs text-slate-600">
                                            <span className="font-semibold uppercase">IPs:</span>{' '}
                                            {entities.ips.map((i) => i.ip).join(', ')}
                                        </p>
                                    )}
                                    {entities && (entities.emails.length > 0 || entities.phones.length > 0) && (
                                        <p className="text-xs text-slate-600">
                                            <span className="font-semibold uppercase">Contacts:</span>{' '}
                                            {[...entities.emails.map((e) => e.email), ...entities.phones.map((p) => p.normalised)].join(', ')}
                                        </p>
                                    )}
                                    {meta && (meta.title || meta.author || meta.creator || meta.creationDate) && (
                                        <div>
                                            <p className="font-semibold text-slate-700 text-xs uppercase">Document metadata</p>
                                            <ul className="mt-1 text-xs text-slate-600 space-y-0.5">
                                                {meta.title && <li>Title: {meta.title}</li>}
                                                {meta.author && <li>Author: {meta.author}</li>}
                                                {meta.creator && <li>Creator: {meta.creator}</li>}
                                                {meta.creationDate && <li>Created: {meta.creationDate}</li>}
                                                {typeof meta.pageCount === 'number' && <li>Pages: {meta.pageCount}</li>}
                                            </ul>
                                        </div>
                                    )}
                                    {typeof result.ocrConfidence === 'number' && (
                                        <p className="text-xs text-slate-600">
                                            <span className="font-semibold uppercase">OCR confidence:</span>{' '}
                                            {Math.round(result.ocrConfidence)}%
                                        </p>
                                    )}
                                    {input && (
                                        <div>
                                            <p className="font-semibold text-slate-700 text-xs uppercase">Detected content summary</p>
                                            <pre className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap break-words text-xs text-slate-500 bg-slate-50 p-2 rounded border">
                                                {input.slice(0, 2000)}
                                                {input.length > 2000 ? '…' : ''}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Privacy note */}
                    <p className="text-center text-xs text-muted-foreground">
                        Files and pasted content are scanned for risk signals and are not stored. We verify
                        community reports anonymously.
                    </p>

                    {/* Weekly alerts signup — shown after every verdict. Only the
                        email goes to our API; the checked content never leaves
                        this component. */}
                    <NewsletterSignup
                        ctaLocation="result_panel"
                        heading="Stay ahead of next week's scams"
                    />

                    <ReportModal
                        isOpen={isReportOpen}
                        onClose={() => setIsReportOpen(false)}
                        initialValue={reportInitial}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
