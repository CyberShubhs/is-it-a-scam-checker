'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { trackContactFormSubmitted } from '@/lib/analytics';

const CATEGORIES: { value: string; label: string }[] = [
    { value: 'support', label: 'Support / general question' },
    { value: 'report-scam', label: 'Report a scam' },
    { value: 'press', label: 'Press / media' },
    { value: 'editorial', label: 'Corrections / editorial' },
    { value: 'security', label: 'Security / responsible disclosure' },
    { value: 'data-removal', label: 'Data removal / privacy' },
    { value: 'other', label: 'Other' },
];

/**
 * Real, working contact form. Posts to /api/contact (validated, rate-limited,
 * honeypot-protected, stored server-side). Fires a privacy-safe analytics event
 * on success — only the category, never the message content.
 */
export function ContactForm() {
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [error, setError] = useState<string | null>(null);
    const [category, setCategory] = useState('support');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (status === 'submitting') return;
        setError(null);

        const form = e.currentTarget;
        const data = new FormData(form);
        const payload = {
            name: String(data.get('name') || ''),
            email: String(data.get('email') || ''),
            message: String(data.get('message') || ''),
            category: String(data.get('category') || 'support'),
            company: String(data.get('company') || ''), // honeypot
        };

        // Light client-side validation for instant feedback (server re-validates).
        if (!payload.name.trim()) return setError('Please enter your name.');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) return setError('Please enter a valid email address.');
        if (payload.message.trim().length < 10) return setError('Please enter a message (at least 10 characters).');

        setStatus('submitting');
        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (res.ok) {
                setStatus('success');
                trackContactFormSubmitted({
                    page_path: typeof window !== 'undefined' ? window.location.pathname : undefined,
                    content_type: payload.category, // category enum only — never the message
                    cta_location: 'contact_page_form',
                });
                form.reset();
            } else {
                const body = await res.json().catch(() => ({}));
                setError(body.error || 'Something went wrong. Please try again.');
                setStatus('error');
            }
        } catch {
            setError('Network error. Please try again or email us directly.');
            setStatus('error');
        }
    };

    if (status === 'success') {
        return (
            <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
                <p className="text-green-700 font-bold text-lg mb-1">Message sent</p>
                <p className="text-slate-600 text-sm">
                    Thanks for getting in touch — we&apos;ve received your message and will reply by email.
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <label htmlFor="category" className="text-sm font-medium">What is this about?</label>
                <select
                    id="category"
                    name="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full border rounded-md h-10 px-3 bg-white text-sm"
                >
                    {CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                </select>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">Name</label>
                    <Input id="name" name="name" placeholder="Your name" required maxLength={120} />
                </div>
                <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">Email</label>
                    <Input id="email" name="email" type="email" placeholder="your@email.com" required maxLength={200} />
                </div>
            </div>

            <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium">Message</label>
                <Textarea id="message" name="message" placeholder="How can we help?" className="min-h-[140px]" required maxLength={4000} />
                <p className="text-xs text-muted-foreground">
                    Please don&apos;t paste passwords, card numbers or one-time codes. To <em>check</em> a
                    suspicious message, use the <a href="/check" className="underline">scam checker</a> instead.
                </p>
            </div>

            {/* Honeypot — hidden from real users; bots fill it and get silently dropped. */}
            <div aria-hidden className="absolute left-[-9999px] top-[-9999px]" style={{ position: 'absolute', left: '-9999px' }}>
                <label htmlFor="company">Company (leave blank)</label>
                <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
            </div>

            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">{error}</p>}

            <Button type="submit" className="w-full" disabled={status === 'submitting'}>
                {status === 'submitting' ? 'Sending…' : 'Send message'}
            </Button>
        </form>
    );
}
