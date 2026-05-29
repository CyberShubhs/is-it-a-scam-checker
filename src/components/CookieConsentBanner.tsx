'use client';

import { useState, useSyncExternalStore, useEffect } from 'react';
import Link from 'next/link';
import {
    CONSENT_COOKIE,
    writeConsent,
    clearConsent,
    subscribeConsent,
    getClientConsentSnapshot,
    getServerConsentSnapshot,
} from '@/lib/consent';

/**
 * Privacy-first cookie consent banner.
 *
 * Behaviour:
 *  - Mounted on every page via the root layout.
 *  - Reads consent state via `useSyncExternalStore` so server renders
 *    treat the visitor as "no consent" (the privacy-safe default) and
 *    the client picks up the real cookie after hydration without
 *    triggering a setState-in-effect cascade.
 *  - "Accept" and "Reject" are visually equal — same size, same
 *    contrast, side-by-side. Neither is pre-ticked.
 *  - Reject persists a `denied` decision so we don't re-prompt every
 *    page load.
 *  - Once a decision exists, the banner is hidden but the
 *    "Manage preferences" footer link can re-open it.
 *
 * The banner does NOT load any third-party scripts itself; it only
 * persists the decision. The GA wrapper in
 * `src/components/GoogleAnalytics.tsx` reads the same store and only
 * mounts when the decision is "granted".
 */
export function CookieConsentBanner() {
    const consent = useSyncExternalStore(
        subscribeConsent,
        getClientConsentSnapshot,
        getServerConsentSnapshot,
    );

    // `open` is local UI state that lets the footer "Manage preferences"
    // link re-open the banner after a decision exists. The default open
    // value is derived from consent: if no consent record exists, open.
    const [forceOpen, setForceOpen] = useState(false);

    useEffect(() => {
        function onManage() {
            setForceOpen(true);
        }
        window.addEventListener('sc:open-consent', onManage);
        return () => window.removeEventListener('sc:open-consent', onManage);
    }, []);

    const open = forceOpen || !consent;

    function accept() {
        writeConsent('granted');
        setForceOpen(false);
    }
    function reject() {
        writeConsent('denied');
        setForceOpen(false);
    }
    function withdraw() {
        clearConsent();
        setForceOpen(true);
    }

    if (!open) return null;

    return (
        <div
            role="dialog"
            aria-modal="false"
            aria-label="Cookie consent"
            className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4 sm:px-6 sm:pb-6"
        >
            <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white shadow-lg p-5 sm:p-6">
                <p className="text-sm text-slate-700 leading-relaxed mb-4">
                    Scam Checker is privacy-first. We use a small{' '}
                    <code className="text-xs">{CONSENT_COOKIE}</code> cookie to
                    remember this choice, and (only if you accept) Google
                    Analytics to count aggregate page views. We never send the
                    contents of your pasted messages, URLs, files, or report
                    notes to analytics. See our{' '}
                    <Link href="/cookies" className="underline">
                        cookie policy
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="underline">
                        privacy policy
                    </Link>
                    .
                </p>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <button
                        type="button"
                        onClick={reject}
                        className="flex-1 inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                        Reject non-essential
                    </button>
                    <button
                        type="button"
                        onClick={accept}
                        className="flex-1 inline-flex items-center justify-center rounded-md border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                        Accept analytics
                    </button>
                </div>
                {consent && (
                    <p className="mt-3 text-xs text-slate-500">
                        Current decision:{' '}
                        <strong>
                            {consent.decision === 'granted' ? 'Accepted' : 'Rejected'}
                        </strong>{' '}
                        on{' '}
                        {new Date(consent.grantedAt).toLocaleDateString()}.
                        {' '}
                        <button
                            type="button"
                            onClick={withdraw}
                            className="underline"
                        >
                            Withdraw and re-ask
                        </button>
                        .
                    </p>
                )}
            </div>
        </div>
    );
}

/** Helper a footer link can call. Avoids importing the banner state. */
export function openConsentBanner(): void {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('sc:open-consent'));
    }
}
