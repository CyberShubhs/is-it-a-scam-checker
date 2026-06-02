'use client';

import React, { useMemo, useState } from 'react';
import { Search, Clock, Flame, TrendingUp, ThumbsUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ReportVoteButtons } from './ReportVoteButtons';
import { ReportModal } from './ReportModal';
import type { GroupedReport } from '@/lib/reportGroups';

interface ReportsExplorerProps {
    groups: GroupedReport[];
}

type SortKey = 'latest' | 'top' | 'helpful';
type TypeFilter = 'all' | 'url' | 'phone' | 'email' | 'ip';

function timeAgo(iso: string): string {
    const then = new Date(iso).getTime();
    if (Number.isNaN(then)) return '';
    const days = Math.floor((Date.now() - then) / (1000 * 60 * 60 * 24));
    if (days <= 0) return 'today';
    if (days === 1) return 'yesterday';
    if (days < 30) return `${days} days ago`;
    const months = Math.floor(days / 30);
    return months === 1 ? '1 month ago' : `${months} months ago`;
}

/** Map a stored report type onto the coarse filter buckets. */
function typeBucket(type: string): TypeFilter {
    const t = type.toLowerCase();
    if (t === 'ip') return 'ip';
    if (t === 'email') return 'email';
    if (t === 'phone' || t === 'sms' || t === 'whatsapp') return 'phone';
    return 'url';
}

/**
 * Interactive grouped-reports browser for /reports: search, filter by type,
 * and sort by Latest / Top reported / Most helpful. Each grouped card shows the
 * reported count, helpful votes, and the vote + "report same scam" controls.
 */
export function ReportsExplorer({ groups }: ReportsExplorerProps) {
    const [query, setQuery] = useState('');
    const [sort, setSort] = useState<SortKey>('latest');
    const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
    const [reportOpen, setReportOpen] = useState(false);

    const visible = useMemo(() => {
        const q = query.trim().toLowerCase();
        const filtered = groups.filter((g) => {
            if (typeFilter !== 'all' && typeBucket(g.type) !== typeFilter) return false;
            if (q && !g.maskedValue.toLowerCase().includes(q) && !g.type.toLowerCase().includes(q)) return false;
            return true;
        });
        const sorted = [...filtered];
        sorted.sort((a, b) => {
            if (sort === 'top') return b.count - a.count || b.lastReportedAt.localeCompare(a.lastReportedAt);
            if (sort === 'helpful') return b.helpfulCount - a.helpfulCount || b.count - a.count;
            return b.lastReportedAt.localeCompare(a.lastReportedAt);
        });
        return sorted;
    }, [groups, query, sort, typeFilter]);

    const sortTabs: { key: SortKey; label: string; icon: React.ReactNode }[] = [
        { key: 'latest', label: 'Latest', icon: <Clock className="w-4 h-4" /> },
        { key: 'top', label: 'Top reported', icon: <Flame className="w-4 h-4" /> },
        { key: 'helpful', label: 'Most helpful', icon: <ThumbsUp className="w-4 h-4" /> },
    ];
    const typeTabs: { key: TypeFilter; label: string }[] = [
        { key: 'all', label: 'All' },
        { key: 'url', label: 'Websites' },
        { key: 'phone', label: 'Phone' },
        { key: 'email', label: 'Email' },
        { key: 'ip', label: 'IP' },
    ];

    return (
        <div className="space-y-5">
            {/* Search + filters */}
            <div className="space-y-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Search reported websites, phone numbers, emails or IPs…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="h-11 pl-9"
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    {sortTabs.map((t) => (
                        <Button
                            key={t.key}
                            size="sm"
                            variant={sort === t.key ? 'default' : 'outline'}
                            onClick={() => setSort(t.key)}
                            className="gap-1.5"
                        >
                            {t.icon}
                            {t.label}
                        </Button>
                    ))}
                    <span className="w-px bg-slate-200 mx-1" aria-hidden />
                    {typeTabs.map((t) => (
                        <Button
                            key={t.key}
                            size="sm"
                            variant={typeFilter === t.key ? 'secondary' : 'ghost'}
                            onClick={() => setTypeFilter(t.key)}
                        >
                            {t.label}
                        </Button>
                    ))}
                </div>
            </div>

            <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                Showing {visible.length} grouped {visible.length === 1 ? 'report' : 'reports'}. Repeated
                reports of the same value are combined into one card.
            </p>

            {/* Grouped cards */}
            {visible.length === 0 ? (
                <div className="p-10 text-center bg-white rounded-lg border border-dashed text-slate-500">
                    No matching reports. Try a different search or filter.
                </div>
            ) : (
                <div className="space-y-3">
                    {visible.map((g) => (
                        <div
                            key={`${g.type}:${g.groupKey}`}
                            className="bg-white border border-slate-200 rounded-xl p-4 hover:border-red-200 transition-colors"
                        >
                            <div className="flex items-start justify-between gap-3 flex-wrap">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <span className="px-2 py-0.5 rounded text-xs font-bold uppercase bg-slate-100 text-slate-600">
                                            {g.type}
                                        </span>
                                        {g.country && <span className="text-xs text-slate-400">From {g.country}</span>}
                                        <span className="text-xs text-slate-400 flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> Last reported {timeAgo(g.lastReportedAt)}
                                        </span>
                                    </div>
                                    <div className="font-mono text-sm md:text-base text-slate-800 break-all">
                                        {g.maskedValue}
                                    </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <div className="text-lg font-bold text-red-600 leading-tight">{g.count}</div>
                                    <div className="text-[11px] text-slate-500">
                                        {g.count === 1 ? 'report' : 'reports'}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
                                <ReportVoteButtons
                                    groupKey={g.groupKey}
                                    helpfulCount={g.helpfulCount}
                                    seenCount={g.seenCount}
                                />
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setReportOpen(true)}
                                    className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                    Report same scam
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <ReportModal isOpen={reportOpen} onClose={() => setReportOpen(false)} />
        </div>
    );
}
