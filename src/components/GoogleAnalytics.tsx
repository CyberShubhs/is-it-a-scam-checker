import Script from 'next/script';
import { MEASUREMENT_ID, GA_DEBUG } from '@/lib/analytics';

/**
 * GA4 site tag. Mounted once in the root layout.
 *
 * Only loads in production unless NEXT_PUBLIC_GA_DEBUG=true is set so dev
 * sessions do not pollute production reports.
 */
export function GoogleAnalytics() {
    const enabled =
        !!MEASUREMENT_ID &&
        (process.env.NODE_ENV === 'production' || GA_DEBUG);

    if (!enabled) return null;

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
                        ${GA_DEBUG ? "debug_mode: true," : ''}
                    });
                `}
            </Script>
        </>
    );
}
