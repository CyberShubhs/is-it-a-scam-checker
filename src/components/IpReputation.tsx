'use client';

import React from 'react';
import { Globe2, AlertOctagon, Info } from 'lucide-react';
import type { IpReputationResult } from '@/lib/threat-intel/types';

interface IpReputationProps {
    results: IpReputationResult[];
}

/** Colour band for the small risk pill. */
function bandClasses(level: IpReputationResult['riskLevel']): string {
    switch (level) {
        case 'High':
            return 'bg-red-100 text-red-700 border-red-200';
        case 'Medium':
            return 'bg-orange-100 text-orange-700 border-orange-200';
        case 'Low':
            return 'bg-green-100 text-green-700 border-green-200';
        default:
            return 'bg-slate-100 text-slate-600 border-slate-200';
    }
}

/**
 * "External IP reputation" — shown when the scanned content contained one or
 * more public IP addresses. Each card surfaces the AbuseIPDB confidence score,
 * report count and network details, or a graceful message when the check is
 * disabled / unavailable. A clean IP is described as "no recent reports", never
 * as "safe".
 */
export function IpReputation({ results }: IpReputationProps) {
    if (!results || results.length === 0) return null;

    return (
        <div className="rounded-lg border bg-white/70 p-4">
            <div className="flex items-center gap-2 mb-3">
                <Globe2 className="w-5 h-5 text-primary" />
                <h4 className="font-semibold text-slate-900">External IP reputation</h4>
            </div>

            <div className="space-y-3">
                {results.map((r, i) => {
                    const score = r.abuseConfidenceScore ?? 0;
                    const isFlagged = r.status === 'ok' && score >= 20;
                    return (
                        <div key={`${r.ip}-${i}`} className="rounded-md border border-slate-200 p-3">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                                <span className="font-mono text-sm text-slate-800">{r.ip || 'IP'}</span>
                                <span
                                    className={`px-2 py-0.5 rounded text-xs font-bold uppercase border ${bandClasses(r.riskLevel)}`}
                                >
                                    {r.riskLevel === 'Unknown' ? 'Not checked' : `${r.riskLevel} risk`}
                                </span>
                            </div>

                            <p className="mt-2 text-sm text-slate-700 flex items-start gap-2">
                                {isFlagged ? (
                                    <AlertOctagon className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                                ) : (
                                    <Info className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                                )}
                                <span>{r.message}</span>
                            </p>

                            {r.status === 'ok' && (
                                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                                    {typeof r.totalReports === 'number' && (
                                        <span>{r.totalReports} report{r.totalReports === 1 ? '' : 's'}</span>
                                    )}
                                    {r.countryCode && <span>Country: {r.countryCode}</span>}
                                    {r.isp && <span>ISP: {r.isp}</span>}
                                    {r.usageType && <span>Type: {r.usageType}</span>}
                                    {r.cached && <span className="text-slate-400">(cached)</span>}
                                </div>
                            )}
                        </div>
                    );
                })}
                <p className="text-[11px] text-slate-400">
                    IP reputation data from AbuseIPDB. A clean result means no recent reports — not a
                    guarantee of safety.
                </p>
            </div>
        </div>
    );
}
