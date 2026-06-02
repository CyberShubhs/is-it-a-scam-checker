'use client';

import React from 'react';
import { Users, AlertTriangle, Clock, ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReportVoteButtons } from './ReportVoteButtons';
import type { RelatedReportMatch } from '@/lib/scamScorer';

interface RelatedReportsProps {
    matches: RelatedReportMatch[];
    /** Opens the report modal pre-filled with the checked value. */
    onReport: () => void;
}

/** Format an ISO timestamp as a short "x days ago" string. */
function timeAgo(iso?: string | null): string {
    if (!iso) return '';
    const then = new Date(iso).getTime();
    if (Number.isNaN(then)) return '';
    const days = Math.floor((Date.now() - then) / (1000 * 60 * 60 * 24));
    if (days <= 0) return 'today';
    if (days === 1) return 'yesterday';
    if (days < 30) return `${days} days ago`;
    const months = Math.floor(days / 30);
    return months === 1 ? '1 month ago' : `${months} months ago`;
}

/**
 * "Related community reports" — rendered directly under every scan result.
 *
 * Shows the community reports that match the exact URL/domain/IP/email/phone
 * the user checked, with counts, recency and a few masked examples. When
 * nothing matches we say so honestly (a clean record is NOT proof of safety)
 * and still offer the "Report this scam" CTA.
 */
export function RelatedReports({ matches, onReport }: RelatedReportsProps) {
    const hasMatches = matches.length > 0;
    const totalReports = matches.reduce((sum, m) => sum + m.count, 0);

    return (
        <div className="rounded-lg border bg-white/70 p-4">
            <div className="flex items-center gap-2 mb-3">
                <Users className="w-5 h-5 text-primary" />
                <h4 className="font-semibold text-slate-900">Related community reports</h4>
            </div>

            {hasMatches ? (
                <div className="space-y-3">
                    <div className="rounded-md bg-red-50 border border-red-200 p-3">
                        <p className="font-semibold text-red-800 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            Community reports found
                        </p>
                        <p className="text-sm text-red-700 mt-1">
                            Reported {totalReports} time{totalReports === 1 ? '' : 's'} across{' '}
                            {matches.length} matching {matches.length === 1 ? 'entity' : 'entities'}.
                            Treat this with extra caution.
                        </p>
                    </div>

                    {matches.map((m, i) => (
                        <div key={`${m.entityType}-${i}`} className="rounded-md border border-slate-200 p-3">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                                <span className="font-mono text-sm text-slate-800 break-all">
                                    {m.value}
                                </span>
                                <span className="px-2 py-0.5 rounded text-xs font-bold uppercase bg-slate-100 text-slate-600">
                                    {m.entityType}
                                </span>
                            </div>
                            <div className="mt-1 flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                                <span className="font-semibold text-red-600">
                                    Reported by {m.count} {m.count === 1 ? 'person' : 'people'}
                                </span>
                                {m.count30d > 0 && <span>{m.count30d} in the last 30 days</span>}
                                {m.lastReportedAt && (
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> Last reported {timeAgo(m.lastReportedAt)}
                                    </span>
                                )}
                                {m.helpfulCount > 0 && (
                                    <span className="flex items-center gap-1 text-green-700">
                                        <ThumbsUp className="w-3 h-3" /> {m.helpfulCount} found this helpful
                                    </span>
                                )}
                            </div>
                            {m.examples.length > 0 && (
                                <ul className="mt-2 space-y-1">
                                    {m.examples.map((ex, j) => (
                                        <li key={j} className="text-xs text-slate-500 font-mono break-all">
                                            • {ex.value}{' '}
                                            <span className="text-slate-400">({timeAgo(ex.timeAgo)})</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {/* Helpful / "I saw this too" votes on this grouped report. */}
                            <div className="mt-3">
                                <ReportVoteButtons
                                    groupKey={m.groupKey}
                                    helpfulCount={m.helpfulCount}
                                    seenCount={m.seenCount}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-slate-600">
                    No community reports found yet. This does not guarantee it is safe — new scams
                    appear before anyone reports them.
                </p>
            )}

            <Button
                variant="secondary"
                onClick={onReport}
                className="mt-4 w-full gap-2 text-red-700 bg-red-50 hover:bg-red-100 border border-red-200"
            >
                <AlertTriangle className="w-4 h-4" />
                Report this scam
            </Button>
        </div>
    );
}
