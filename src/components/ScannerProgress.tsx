'use client';

import React from 'react';
import { FileText, Image as ImageIcon, ShieldCheck, Loader2 } from 'lucide-react';
import { SCAN_STAGES, SCAN_PRIVACY_NOTE } from '@/lib/scanStages';

interface ScannerProgressProps {
    fileName: string;
    fileType: 'pdf' | 'docx' | 'txt' | 'image';
    /** Object URL for an image preview (images only). */
    previewUrl?: string | null;
    /** Index into SCAN_STAGES of the stage currently running. */
    stageIndex: number;
}

/**
 * The animated "scanner" shown while a file is being analysed.
 *
 * It deliberately reads as a security scan — a document/preview card with a
 * sweeping scan-line, an indeterminate progress bar, and the staged status
 * messages from SCAN_STAGES ("Scanning visible text", "Checking embedded
 * links", …). We never claim exact percentages; progress is staged.
 */
export function ScannerProgress({ fileName, fileType, previewUrl, stageIndex }: ScannerProgressProps) {
    const clampedIndex = Math.min(stageIndex, SCAN_STAGES.length - 1);
    const pct = Math.round(((clampedIndex + 1) / SCAN_STAGES.length) * 100);

    return (
        <div className="rounded-xl border-2 border-primary/30 bg-slate-50 p-6">
            <div className="flex flex-col items-center gap-5">
                {/* File preview card with a sweeping scan-line overlay. */}
                <div className="relative w-40 h-52 rounded-lg border border-slate-300 bg-white shadow-sm overflow-hidden">
                    {previewUrl && fileType === 'image' ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={previewUrl}
                            alt="Document being scanned"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-400">
                            {fileType === 'image' ? (
                                <ImageIcon className="w-12 h-12" />
                            ) : (
                                <FileText className="w-12 h-12" />
                            )}
                            <span className="text-[10px] uppercase tracking-wide font-semibold">
                                {fileType}
                            </span>
                        </div>
                    )}
                    {/* Moving scan-line. */}
                    <div className="scam-scanline absolute left-0 right-0 h-0.5 bg-primary shadow-[0_0_8px_2px_hsl(var(--primary))]" />
                    {/* Subtle scan tint. */}
                    <div className="absolute inset-0 bg-primary/5" />
                </div>

                <div className="w-full max-w-sm text-center">
                    <p className="font-semibold text-slate-900 truncate" title={fileName}>
                        {fileName || 'Your file'}
                    </p>

                    {/* Indeterminate progress bar (staged, not fake-precise). */}
                    <div className="scam-progress-bar relative mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200" />

                    {/* Current stage message. */}
                    <div className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-primary">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span aria-live="polite">{SCAN_STAGES[clampedIndex].label}…</span>
                    </div>

                    {/* Completed-stage checklist so it feels like real work. */}
                    <ul className="mt-4 space-y-1 text-left text-xs text-slate-500">
                        {SCAN_STAGES.map((stage, i) => (
                            <li
                                key={stage.id}
                                className={`flex items-center gap-2 ${i <= clampedIndex ? 'text-slate-700' : 'text-slate-300'}`}
                            >
                                {i < clampedIndex ? (
                                    <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                                ) : (
                                    <span className="inline-block w-3.5 h-3.5 rounded-full border border-current" />
                                )}
                                {stage.label}
                            </li>
                        ))}
                    </ul>

                    <p className="mt-4 text-[11px] text-slate-400">{SCAN_PRIVACY_NOTE}</p>
                    <p className="sr-only">Scanning {pct}% complete</p>
                </div>
            </div>
        </div>
    );
}
