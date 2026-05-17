'use client';

import Link from 'next/link';
import {
    trackGuideCtaClicked,
    trackOutboundReportLinkClicked,
    trackHaveIBeenScammedStarted,
    type OutboundDestinationType,
} from '@/lib/analytics';

function currentPath(): string | undefined {
    return typeof window !== 'undefined' ? window.location.pathname : undefined;
}

interface GuideCtaLinkProps extends React.ComponentPropsWithoutRef<typeof Link> {
    ctaLocation: string;
}

/**
 * Internal CTA link that fires guide_cta_clicked once per click.
 * Use whenever a button/link drives a user from a guide-like page to the
 * checker or other primary tool.
 */
export function GuideCtaLink({ ctaLocation, onClick, ...rest }: GuideCtaLinkProps) {
    const handleClick: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
        const destination = typeof rest.href === 'string' ? rest.href : '';
        trackGuideCtaClicked({
            page_path: currentPath(),
            cta_location: ctaLocation,
            destination_path: destination,
        });
        // If the click is going to /have-i-been-scammed, also emit the start event.
        if (destination === '/have-i-been-scammed') {
            trackHaveIBeenScammedStarted({
                page_path: currentPath(),
                event_source: 'cta',
                cta_location: ctaLocation,
            });
        }
        onClick?.(e);
    };

    return <Link {...rest} onClick={handleClick} />;
}

interface OutboundReportLinkProps
    extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    destinationType: OutboundDestinationType;
    countrySelected?: string;
}

/**
 * External link to an official reporting/government/platform domain.
 * Fires outbound_report_link_clicked once per click. The href itself is
 * never sent to GA — only the destination_type bucket.
 */
export function OutboundReportLink({
    destinationType,
    countrySelected,
    onClick,
    ...rest
}: OutboundReportLinkProps) {
    const handleClick: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
        trackOutboundReportLinkClicked({
            page_path: currentPath(),
            destination_type: destinationType,
            country_selected: countrySelected,
        });
        onClick?.(e);
    };

    return <a {...rest} onClick={handleClick} />;
}
