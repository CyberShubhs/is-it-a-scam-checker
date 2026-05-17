'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { OutboundReportLink } from './TrackedLinks';
import type { OutboundDestinationType } from '@/lib/analytics';

interface ReportingCardProps {
    title: string;
    description: string;
    link: string;
    action: string;
    subtext?: string;
    destinationType?: OutboundDestinationType;
    country?: string;
}

export function ReportingCard({
    title,
    description,
    link,
    action,
    subtext,
    destinationType = 'government',
    country,
}: ReportingCardProps) {
    return (
        <Card className="h-full border-slate-200 hover:border-blue-500 hover:shadow-md transition-all flex flex-col bg-white">
            <CardHeader>
                <CardTitle className="text-xl text-slate-900">{title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
                <p className="text-slate-600 mb-6 flex-1">{description}</p>
                {subtext && (
                    <p className="text-sm font-medium text-slate-900 mb-4 bg-slate-100 p-2 rounded text-center">
                        {subtext}
                    </p>
                )}
                <Button
                    asChild
                    variant="outline"
                    className="w-full border-slate-300 hover:bg-slate-50 text-slate-700"
                >
                    <OutboundReportLink
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        destinationType={destinationType}
                        countrySelected={country}
                        className="flex items-center justify-center gap-2"
                        aria-label={`${action} – opens ${title} in a new tab`}
                    >
                        {action} <ExternalLink className="w-4 h-4" />
                    </OutboundReportLink>
                </Button>
            </CardContent>
        </Card>
    );
}

interface PlatformCardProps {
    icon: React.ReactNode;
    title: string;
    link: string;
    text: string;
}

export function PlatformCard({ icon, title, link, text }: PlatformCardProps) {
    return (
        <OutboundReportLink
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            destinationType="platform"
            className="block group"
            aria-label={`${text} on ${title} – opens in a new tab`}
        >
            <div className="bg-white p-6 rounded-xl border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all text-center h-full">
                <div className="mb-4 flex justify-center">{icon}</div>
                <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
                <span className="text-sm text-blue-600 font-medium group-hover:underline">
                    {text}
                </span>
            </div>
        </OutboundReportLink>
    );
}
