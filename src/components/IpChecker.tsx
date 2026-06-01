'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { IpReputation } from './IpReputation';
import type { IpReputationResult } from '@/lib/threat-intel/types';
import { Globe2 } from 'lucide-react';

/**
 * Interactive "Suspicious IP Address Checker".
 *
 * Posts the IP to the server-side /api/ip-reputation endpoint (which holds the
 * AbuseIPDB key) and renders the typed result. Validation, private-range
 * refusal and graceful degradation all happen server-side; this component just
 * presents the outcome.
 */
export function IpChecker() {
    const [ip, setIp] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<IpReputationResult | null>(null);

    const check = async () => {
        if (!ip.trim() || loading) return;
        setLoading(true);
        setResult(null);
        try {
            const res = await fetch('/api/ip-reputation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ip: ip.trim() }),
            });
            const data = (await res.json()) as IpReputationResult;
            setResult(data);
        } catch {
            setResult({
                status: 'error',
                ip: ip.trim(),
                riskLevel: 'Unknown',
                riskContribution: 0,
                message: 'IP reputation check is temporarily unavailable. Please try again later.',
                cached: false,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="border-2 shadow-lg">
            <CardContent className="p-6 space-y-4">
                <label className="text-sm font-medium flex items-center gap-2">
                    <Globe2 className="w-4 h-4 text-primary" /> Enter an IP address (IPv4 or IPv6)
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                        placeholder="e.g. 45.33.32.156"
                        value={ip}
                        onChange={(e) => setIp(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && check()}
                        className="h-12 text-lg"
                    />
                    <Button onClick={check} disabled={!ip.trim() || loading} className="h-12 px-8 text-base font-semibold">
                        {loading ? 'Checking…' : 'Check IP'}
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                    The lookup runs on our server using AbuseIPDB. Private and reserved addresses are not
                    checked externally. A clean result means no recent reports — not a guarantee of safety.
                </p>

                {result && (
                    <div className="pt-2">
                        <IpReputation results={[result]} />
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
