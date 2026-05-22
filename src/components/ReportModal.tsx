'use client';

import React, { useState, useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { trackReportSubmitted, type ReportType } from '@/lib/analytics';

function mapReportType(value: string): ReportType {
    switch (value) {
        case 'url':
        case 'phone':
        case 'email':
            return value;
        case 'text':
            return 'message';
        default:
            return 'unknown';
    }
}

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialValue?: string;
}

export function ReportModal({ isOpen, onClose, initialValue = '' }: ReportModalProps) {
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [value, setValue] = useState(initialValue);
    const [type, setType] = useState('url');
    const [notes, setNotes] = useState('');

    // Re-seed the input with whatever URL/text triggered the modal each time
    // it's reopened. Calling setState here re-renders the modal once on open
    // — acceptable cost since the alternative (mounting via key) would lose
    // every other modal-local state on every re-render of the parent page.
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (isOpen && initialValue) setValue(initialValue);
    }, [isOpen, initialValue]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (status === 'submitting') return;
        setStatus('submitting');

        try {
            const res = await fetch('/api/report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, value, notes })
            });

            if (res.ok) {
                setStatus('success');
                trackReportSubmitted({
                    report_type: mapReportType(type),
                    page_path:
                        typeof window !== 'undefined'
                            ? window.location.pathname
                            : undefined,
                });
                setTimeout(() => {
                    onClose();
                    setStatus('idle');
                    setNotes('');
                }, 2000);
            } else {
                setStatus('error');
            }
        } catch (e) {
            setStatus('error');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative animate-in zoom-in-95">
                <button onClick={onClose} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                </button>

                <div className="mb-6 flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-full text-red-600">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-bold">Report a Scam</h2>
                </div>

                {status === 'success' ? (
                    <div className="text-center py-8">
                        <p className="text-green-600 font-bold text-lg mb-2">Report Submitted!</p>
                        <p className="text-slate-600">Thank you for helping the community.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">What are you reporting?</label>
                            <select
                                className="w-full border rounded-md h-10 px-3 bg-white"
                                value={type}
                                onChange={e => setType(e.target.value)}
                            >
                                <option value="url">Website / URL</option>
                                <option value="phone">Phone Number</option>
                                <option value="email">Email Address</option>
                                <option value="text">Message Content</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Scammer's Details (Number/Link/Email)</label>
                            <Input
                                required
                                value={value}
                                onChange={e => setValue(e.target.value)}
                                placeholder="e.g. +61 400..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Optional Notes</label>
                            <Textarea
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                placeholder="Briefly describe what happened..."
                                className="min-h-[80px]"
                            />
                        </div>

                        <div className="text-xs text-slate-500">
                            By submitting, you agree that this information is accurate. We do not store your personal details, only the scammer's info.
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                                Cancel
                            </Button>
                            <Button type="submit" className="flex-1" disabled={status === 'submitting'}>
                                {status === 'submitting' ? 'Sending...' : 'Report Scam'}
                            </Button>
                        </div>
                        {status === 'error' && <p className="text-red-500 text-sm text-center">Failed to submit. Please try again.</p>}
                    </form>
                )}
            </div>
        </div>
    );
}
