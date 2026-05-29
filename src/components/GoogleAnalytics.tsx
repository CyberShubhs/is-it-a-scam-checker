'use client';

import { useSyncExternalStore } from 'react';
import Script from 'next/script';
import { MEASUREMENT_ID, GA_DEBUG } from '@/lib/analytics';
import {
    consentGranted,
    subscribeConsent,
    getClientConsentSnapshot,
    getServerConsentSnapshot,
} from '@/lib/consent';

/**
 * Consent-gated GA4 site tag.
 *
 * The tag is only inserted once the visitor has explicitly granted
 * consent. Reject / no-decision states render nothing — no Google
 * scripts load, no GA cookies are set, and no requests go to
 * googletagmanager.com.
 *
 * State comes from the same `useSyncExternalStore` store the banner
 * uses, so granting consent mounts the tag on the next render without
 * a page reload, and withdrawing it tears the tag down.
 */
export function GoogleAnalytics() {
    const consent = useSyncExternalStore(
        subscribeConsent,
        getClientConsentSnapshot,
        getServerConsentSnapshot,
    );

    const allowed =
        !!MEASUREMENT_ID &&
        (process.env.NODE_ENV === 'production' || GA_DEBUG) &&
        consentGranted(consent);

    if (!allowed) return null;

    return (
        <>
            <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`}
                strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
                {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    window.gtag = gtag;
                    gtag('js', new Date());
                    gtag('config', '${MEASUREMENT_ID}', {
                        send_page_view: true,
                        anonymize_ip: true,
                        allow_ad_personalization_signals: false,
                        allow_google_signals: false,
                        ${GA_DEBUG ? "debug_mode: true," : ''}
                    });
                `}
            </Script>
        </>
    );
}
