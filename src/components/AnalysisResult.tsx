import React from 'react';
import { ScamAnalysisResult } from '@/lib/scamScorer';
import { CheckCircle, AlertTriangle, AlertOctagon, Copy, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { trackResultCopied, mapRiskLevel } from '@/lib/analytics';

import { ReportModal } from './ReportModal';

interface AnalysisResultProps {
    result: ScamAnalysisResult | null;
    input?: string; // Original input text
}

export function AnalysisResultDisplay({ result, input }: AnalysisResultProps) {
    const [copied, setCopied] = React.useState(false);
    const [isReportOpen, setIsReportOpen] = React.useState(false);

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

    const handleCopy = () => {
        if (copied) return;
        const text = `Scam Check Result: ${result.riskLevel} Risk.\n\nSummary: ${result.summary}\n\nSignals Detected:\n${result.signals.map(s => `- ${s.label}: ${s.explanation}`).join('\n')}\n\nCheck more at: isitscam.shubhamsingla.tech`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        trackResultCopied({
            check_type: 'unknown',
            risk_level: mapRiskLevel(result.riskLevel),
            page_path:
                typeof window !== 'undefined' ? window.location.pathname : undefined,
        });
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Card className={cn("mt-6 border-2 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4", getRiskColor(result.riskLevel).split(' ')[2])}>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className={cn("p-2 rounded-full ring-2 ring-offset-2", getRiskColor(result.riskLevel))}>
                            {getIcon(result.riskLevel)}
                        </span>
                        <div>
                            <CardTitle className="text-xl">
                                Risk Level: <span className={cn(getRiskColor(result.riskLevel).split(' ')[0])}>{result.riskLevel}</span>
                            </CardTitle>
                            <CardDescription className="text-xs mt-1">
                                Score: {result.score} / 100
                            </CardDescription>
                        </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? 'Copied' : 'Copy Result'}
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    <div className="bg-white/50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-1 text-sm text-foreground/80">Analysis Summary:</h4>
                        <p className="text-lg font-medium text-slate-800 leading-snug">
                            {result.summary}
                        </p>
                    </div>

                    {result.signals.length > 0 && (
                        <div>
                            <h4 className="font-semibold mb-3 text-sm text-foreground/80">Detected Signals:</h4>
                            <div className="grid gap-3">
                                {result.signals.map((signal, i) => (
                                    <div key={i} className="flex gap-3 items-start p-3 rounded-md border bg-white/60">
                                        <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded select-none">
                                            +{signal.points}
                                        </span>
                                        <div>
                                            <p className="font-semibold text-sm text-slate-900">{signal.label}</p>
                                            <p className="text-sm text-slate-600 mt-1">{signal.explanation}</p>
                                            {signal.matchedText && (
                                                <div className="mt-2 text-xs bg-red-50 text-red-800 p-2 rounded border border-red-100 font-mono break-all">
                                                    Matched: "{signal.matchedText}"
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {result.riskLevel === 'Low' && result.signals.length === 0 && (
                        <div className="text-center p-4 text-slate-500 italic text-sm">
                            No specific threat patterns were found, but this does not guarantee safety.
                        </div>
                    )}

                    <div className="border-t pt-4 mt-2">
                        <Button
                            variant="secondary"
                            className="w-full gap-2 text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 h-10"
                            onClick={() => setIsReportOpen(true)}
                        >
                            <AlertTriangle className="w-4 h-4" />
                            Report this as a Scam
                        </Button>
                        <p className="text-center text-xs text-muted-foreground mt-2">
                            Help the community by adding this to our scam database.
                            <br />We verify reports anonymously.
                        </p>
                    </div>

                    <ReportModal
                        isOpen={isReportOpen}
                        onClose={() => setIsReportOpen(false)}
                        initialValue={input}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
