'use client';

import React, { useState, useSyncExternalStore } from 'react';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { trackNewsletterSignupSubmitted } from '@/lib/analytics';

/**
 * Reusable weekly scam-alerts signup form (double opt-in).
 *
 * Variants:
 *  - 'card'   — bordered panel for blog posts, the landing page, and the
 *               post-result placement.
 *  - 'footer' — compact dark-background form for the site footer.
 *
 * Privacy: only the email address is POSTed to our own /api/newsletter
 * endpoint. Analytics receives just the cta_location/page_path enums via
 * trackNewsletterSignupSubmitted — the address never reaches GA.
 */

type SignupState = 'idle' | 'submitting' | 'sent' | 'error';

const CONFIRM_MESSAGES: Record<string, { tone: 'success' | 'error'; text: string }> = {
    subscribed: {
        tone: 'success',
        text: "You're subscribed! The next weekly scam-alerts email will land in your inbox.",
    },
    expired: {
        tone: 'error',
        text: 'That confirmation link has expired. Enter your email below to get a fresh one.',
    },
    invalid: {
        tone: 'error',
        text: "That confirmation link isn't valid. Enter your email below to get a new one.",
    },
    unavailable: {
        tone: 'error',
        text: 'Subscriptions are temporarily unavailable. Please try again later.',
    },
    'rate-limited': {
        tone: 'error',
        text: 'Too many attempts. Please wait a few minutes and try again.',
    },
};

// The query string never changes without a navigation, so the store never
// notifies — a no-op subscription is correct here.
const emptySubscribe = () => () => {};

/**
 * Reads ?subscribed=1 / ?subscribe_error=… set by the confirm endpoint's
 * redirect and shows the outcome. Uses useSyncExternalStore (same pattern as
 * CookieConsentBanner) so the server renders nothing, the client derives the
 * message during render, and the landing page stays fully static — no
 * useSearchParams/Suspense bailout, no setState-in-effect.
 */
export function NewsletterConfirmBanner() {
    const search = useSyncExternalStore(
        emptySubscribe,
        () => window.location.search,
        () => '',
    );

    const params = new URLSearchParams(search);
    let message: { tone: 'success' | 'error'; text: string } | null = null;
    if (params.get('subscribed') === '1') {
        message = CONFIRM_MESSAGES.subscribed;
    } else {
        const error = params.get('subscribe_error');
        if (error && CONFIRM_MESSAGES[error]) message = CONFIRM_MESSAGES[error];
    }

    if (!message) return null;
    return (
        <div
            role="status"
            aria-live="polite"
            className={cn(
                'rounded-lg border-2 p-4 text-sm font-medium mb-6',
                message.tone === 'success'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    : 'border-red-200 bg-red-50 text-red-700',
            )}
        >
            {message.text}
        </div>
    );
}

export interface NewsletterSignupProps {
    /** Where this form lives — becomes the GA `cta_location` param. */
    ctaLocation: string;
    variant?: 'card' | 'footer';
    /** Optional heading override for the card variant. */
    heading?: string;
}

export function NewsletterSignup({
    ctaLocation,
    variant = 'card',
    heading = 'Get the free weekly scam alerts email',
}: NewsletterSignupProps) {
    const [email, setEmail] = useState('');
    const [state, setState] = useState<SignupState>('idle');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (state === 'submitting' || state === 'sent') return;
        setState('submitting');
        setError(null);
        try {
            const res = await fetch('/api/newsletter/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json().catch(() => null);
            if (res.ok && data?.success) {
                setState('sent');
                trackNewsletterSignupSubmitted({
                    cta_location: ctaLocation,
                    page_path:
                        typeof window !== 'undefined' ? window.location.pathname : undefined,
                });
            } else {
                setState('error');
                setError(
                    (data && typeof data.error === 'string' && data.error) ||
                        'Something went wrong. Please try again later.',
                );
            }
        } catch {
            setState('error');
            setError('Something went wrong. Please check your connection and try again.');
        }
    };

    const isFooter = variant === 'footer';

    const form = (
        <>
            <form
                onSubmit={handleSubmit}
                className={cn(
                    'flex flex-col sm:flex-row gap-2',
                    isFooter ? 'max-w-md' : 'max-w-lg',
                )}
            >
                <label htmlFor={`newsletter-email-${ctaLocation}`} className="sr-only">
                    Email address for weekly scam alerts
                </label>
                <Input
                    id={`newsletter-email-${ctaLocation}`}
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={state === 'submitting' || state === 'sent'}
                    className={cn(isFooter && 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500')}
                />
                <Button
                    type="submit"
                    disabled={state === 'submitting' || state === 'sent'}
                    className="whitespace-nowrap"
                >
                    {state === 'submitting' ? 'Sending…' : 'Get weekly alerts'}
                </Button>
            </form>
            {/* aria-live so screen readers announce the confirmation step. */}
            <p
                role="status"
                aria-live="polite"
                className={cn(
                    'mt-2 text-sm',
                    state === 'sent' && 'text-emerald-500 font-medium',
                    state === 'error' && (isFooter ? 'text-red-400' : 'text-red-600'),
                    state !== 'sent' && state !== 'error' && (isFooter ? 'text-slate-400' : 'text-slate-500'),
                )}
            >
                {state === 'sent'
                    ? 'Almost done — check your inbox and click the confirmation link.'
                    : state === 'error'
                      ? error
                      : 'One email a week. No spam, unsubscribe anytime. We only store your email after you confirm.'}
            </p>
        </>
    );

    if (isFooter) {
        return (
            <div>
                <h3 className="text-white font-bold text-base mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4" aria-hidden="true" /> Weekly scam alerts
                </h3>
                <p className="text-sm mb-3">
                    The newest scams to watch for, in one short email every week.
                </p>
                {form}
            </div>
        );
    }

    return (
        <section
            aria-label="Weekly scam alerts email signup"
            className="rounded-xl border-2 border-slate-200 bg-slate-50 p-6"
        >
            <h2 className="text-xl font-bold text-slate-900 mb-1 flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" aria-hidden="true" /> {heading}
            </h2>
            <p className="text-sm text-slate-600 mb-4">
                Each week we summarise the scams people are reporting right now — the
                fake texts, websites, and job offers to watch for — with plain-English
                advice on staying safe.
            </p>
            {form}
        </section>
    );
}
