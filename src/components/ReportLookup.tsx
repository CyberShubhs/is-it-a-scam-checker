'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RelatedReports } from './RelatedReports';
import { IpReputation } from './IpReputation';
import { ReportModal } from './ReportModal';
import type { RelatedReportMatch } from '@/lib/scamScorer';
import type { IpReputationResult } from '@/lib/threat-intel/types';
import { trackReportSearchPerformed, type CheckType } from '@/lib/analytics';
import { Search } from 'lucide-react';

/** Guess the entity type from what the user typed. */
function inferType(value: string): string {
    const v = value.trim();
    if (/^\+?\d[\d\s().-]{6,}$/.test(v)) return 'phone';
    if (/@/.test(v)) return 'email';
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(v) || v.includes(':')) return 'ip';
    return 'url';
}

/**
 * "Scam report lookup" — search the community report database for a specific
 * phone number, URL/domain, email or IP and see whether it has been reported,
 * plus (for IPs) its AbuseIPDB reputation. Reuses the exact same API + result
 * components as the main scanner.
 */
export function ReportLookup() {
    const [value, setValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [matches, setMatches] = useState<RelatedReportMatch[] | null>(null);
    const [ipReputation, setIpReputation] = useState<IpReputationResult[]>([]);
    const [reportOpen, setReportOpen] = useState(false);

    const search = async () => {
        if (!value.trim() || loading) return;
        setLoading(true);
        setMatches(null);
        setIpReputation([]);
        try {
            const type = inferType(value);
            const res = await fetch('/api/check-reputation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: [{ type, value: value.trim() }] }),
            });
            const data = await res.json();
            const found = Array.isArray(data.matches) ? data.matches : [];
            setMatches(found);
            setIpReputation(Array.isArray(data.ipReputation) ? data.ipReputation : []);
            // Privacy-safe: report only the entity type + whether anything was
            // found — never the searched value itself.
            const checkType: CheckType = type === 'url' ? 'url' : type === 'email' ? 'email' : 'unknown';
            trackReportSearchPerformed({
                check_type: checkType,
                result_bucket: found.length > 0 ? 'dangerous' : 'safe',
                page_path: typeof window !== 'undefined' ? window.location.pathname : undefined,
            });
        } catch {
            setMatches([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="border-2 shadow-lg">
            <CardContent className="p-6 space-y-4">
                <label className="text-sm font-medium flex items-center gap-2">
                    <Search className="w-4 h-4 text-primary" /> Look up a phone number, website, email or IP
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                        placeholder="e.g. +61 400 000 000 or suspicious-site.com"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && search()}
                        className="h-12 text-lg"
                    />
                    <Button onClick={search} disabled={!value.trim() || loading} className="h-12 px-8 text-base font-semibold">
                        {loading ? 'Searching…' : 'Search reports'}
                    </Button>
                </div>

                {ipReputation.length > 0 && (
                    <div className="pt-2">
                        <IpReputation results={ipReputation} />
                    </div>
                )}

                {matches !== null && (
                    <div className="pt-2">
                        <RelatedReports matches={matches} onReport={() => setReportOpen(true)} />
                    </div>
                )}

                <ReportModal isOpen={reportOpen} onClose={() => setReportOpen(false)} initialValue={value} />
            </CardContent>
        </Card>
    );
}
