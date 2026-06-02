'use client';

import React, { useState } from 'react';
import { ThumbsUp, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReportVoteButtonsProps {
    /** Normalised grouping key (Report.value_normalised). */
    groupKey: string;
    helpfulCount: number;
    seenCount: number;
}

/**
 * "This was helpful" + "I saw this too" voting on a grouped report.
 *
 * Votes post to /api/report-vote, which dedupes per device-hash server-side.
 * We optimistically reflect the server's returned tally and disable a button
 * once used in this session. Counts never go backwards on error.
 */
export function ReportVoteButtons({ groupKey, helpfulCount, seenCount }: ReportVoteButtonsProps) {
    const [counts, setCounts] = useState({ helpful: helpfulCount, seen: seenCount });
    const [voted, setVoted] = useState({ HELPFUL: false, SEEN_TOO: false });
    const [busy, setBusy] = useState(false);

    const vote = async (voteType: 'HELPFUL' | 'SEEN_TOO') => {
        if (busy || voted[voteType]) return;
        setBusy(true);
        // Optimistic bump so the UI feels instant.
        setCounts((c) => ({
            helpful: voteType === 'HELPFUL' ? c.helpful + 1 : c.helpful,
            seen: voteType === 'SEEN_TOO' ? c.seen + 1 : c.seen,
        }));
        setVoted((v) => ({ ...v, [voteType]: true }));
        try {
            const res = await fetch('/api/report-vote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value_normalised: groupKey, vote_type: voteType }),
            });
            if (res.ok) {
                const data = await res.json();
                // Reconcile with the authoritative server tally.
                setCounts({ helpful: data.helpfulCount ?? counts.helpful, seen: data.seenCount ?? counts.seen });
            }
        } catch {
            // Keep the optimistic count; a failed vote shouldn't jar the UI.
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="flex flex-wrap items-center gap-2">
            <button
                type="button"
                onClick={() => vote('HELPFUL')}
                disabled={voted.HELPFUL || busy}
                aria-pressed={voted.HELPFUL}
                className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                    voted.HELPFUL
                        ? 'bg-green-100 text-green-700 border-green-300'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50',
                )}
            >
                <ThumbsUp className="w-3.5 h-3.5" />
                This was helpful
                <span className="font-bold">{counts.helpful}</span>
            </button>
            <button
                type="button"
                onClick={() => vote('SEEN_TOO')}
                disabled={voted.SEEN_TOO || busy}
                aria-pressed={voted.SEEN_TOO}
                className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                    voted.SEEN_TOO
                        ? 'bg-blue-100 text-blue-700 border-blue-300'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50',
                )}
            >
                <Eye className="w-3.5 h-3.5" />
                I saw this too
                <span className="font-bold">{counts.seen}</span>
            </button>
        </div>
    );
}
