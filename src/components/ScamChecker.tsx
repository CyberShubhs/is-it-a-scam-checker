'use client';

import React, { useState, useRef, useEffect } from 'react';
import { calculateRiskScore, ScamAnalysisResult } from '@/lib/scamScorer';
import { AnalysisResultDisplay } from './AnalysisResult';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FileUploader } from './FileUploader';
import { ScannerProgress } from './ScannerProgress';
import { scanImageFile, scanDocumentFile } from '@/lib/extractors';
import { checkIp } from '@/lib/entities';
import { SCAN_STAGES } from '@/lib/scanStages';
import {
    trackCheckSubmitted,
    trackCheckCompleted,
    mapRiskLevel,
    mapResultBucket,
    type CheckType as AnalyticsCheckType,
} from '@/lib/analytics';

import { Globe, Mail, MessageSquare, Image as ImageIcon, FileText, Clipboard, X, Network } from 'lucide-react';

type TabType = 'url' | 'email' | 'text' | 'ip' | 'image' | 'file';
type FileKind = 'pdf' | 'docx' | 'txt' | 'image';

function toAnalyticsCheckType(tab: TabType): AnalyticsCheckType {
    if (tab === 'text') return 'sms';
    if (tab === 'file') return 'pdf';
    if (tab === 'ip') return 'url';
    return tab;
}

function fileKindFromName(name: string, isImageTab: boolean): FileKind {
    if (isImageTab) return 'image';
    const ext = name.split('.').pop()?.toLowerCase();
    if (ext === 'docx') return 'docx';
    if (ext === 'txt') return 'txt';
    return 'pdf';
}

interface ScamCheckerProps {
    defaultTab?: TabType;
}

export function ScamChecker({ defaultTab = 'url' }: ScamCheckerProps) {
    const [activeTab, setActiveTab] = useState<TabType>(defaultTab);
    const [input, setInput] = useState('');
    const [result, setResult] = useState<ScamAnalysisResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [extractionError, setExtractionError] = useState<string | null>(null);

    // ── File-scan UI state ────────────────────────────────────────────────
    // The extracted text for a file scan is kept separately from `input` so we
    // never echo it into a visible textarea — it only feeds the scorer and the
    // collapsed "Technical details" panel.
    const [fileText, setFileText] = useState<string>('');
    const [scanning, setScanning] = useState<{ name: string; kind: FileKind; previewUrl: string | null } | null>(null);
    const [scanStage, setScanStage] = useState(0);
    const stageTimer = useRef<ReturnType<typeof setInterval> | null>(null);

    const isFileScan = activeTab === 'image' || activeTab === 'file';

    // Clean up any interval/object-URL on unmount.
    useEffect(() => {
        return () => {
            if (stageTimer.current) clearInterval(stageTimer.current);
        };
    }, []);

    // ── Text / URL / email / IP check ─────────────────────────────────────
    const handleCheck = () => {
        if (!input.trim() || loading) return;

        // For the IP tab, validate locally first so we can reject malformed and
        // private/reserved addresses with a clear message (the server also
        // refuses private IPs, but failing fast here is better UX).
        if (activeTab === 'ip') {
            const verdict = checkIp(input.trim());
            if (!verdict.ok) {
                setResult(null);
                setExtractionError(
                    verdict.reason === 'private'
                        ? 'That is a private or reserved IP address, so it cannot be checked for an external reputation.'
                        : 'Please enter a valid public IPv4 or IPv6 address.',
                );
                return;
            }
            setExtractionError(null);
        }

        const checkType = toAnalyticsCheckType(activeTab);
        const pagePath = typeof window !== 'undefined' ? window.location.pathname : undefined;

        trackCheckSubmitted({
            check_type: checkType,
            page_path: pagePath,
            has_url: activeTab === 'url',
            has_attachment: false,
            event_source: 'scam_checker_form',
        });

        setLoading(true);
        // Brief delay for a "scanning" feel before the analysis.
        setTimeout(async () => {
            const source =
                activeTab === 'url' ? 'url' : activeTab === 'email' ? 'email' : 'text';
            const res = await calculateRiskScore(input.trim(), { source });
            setResult(res);
            setFileText('');
            setLoading(false);
            trackCheckCompleted({
                check_type: checkType,
                risk_level: mapRiskLevel(res.riskLevel),
                result_bucket: mapResultBucket(res.riskLevel),
                page_path: pagePath,
            });
        }, 400);
    };

    const handleClear = () => {
        setInput('');
        setResult(null);
        setExtractionError(null);
        setFileText('');
    };

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (text) setInput(text);
        } catch (err) {
            console.error('Failed to read clipboard', err);
        }
    };

    const handleTabChange = (tab: TabType) => {
        setActiveTab(tab);
        setResult(null);
        setInput('');
        setFileText('');
        setExtractionError(null);
    };

    // ── File / image scan ─────────────────────────────────────────────────
    const handleFileSelect = async (file: File) => {
        setExtractionError(null);
        setResult(null);
        setFileText('');

        const kind = fileKindFromName(file.name, activeTab === 'image');
        const previewUrl = activeTab === 'image' ? URL.createObjectURL(file) : null;
        const checkType = toAnalyticsCheckType(activeTab);
        const pagePath = typeof window !== 'undefined' ? window.location.pathname : undefined;

        trackCheckSubmitted({
            check_type: checkType,
            page_path: pagePath,
            has_url: false,
            has_attachment: true,
            event_source: 'scam_checker_form',
        });

        // Start the staged scanner animation. The stages advance on a timer
        // while the real (client-side) parsing runs; we hold at the penultimate
        // stage until the work actually finishes, so progress never "lies".
        setScanning({ name: file.name, kind, previewUrl });
        setScanStage(0);
        if (stageTimer.current) clearInterval(stageTimer.current);
        stageTimer.current = setInterval(() => {
            setScanStage((s) => Math.min(s + 1, SCAN_STAGES.length - 2));
        }, 650);

        const finish = () => {
            if (stageTimer.current) {
                clearInterval(stageTimer.current);
                stageTimer.current = null;
            }
            if (previewUrl) URL.revokeObjectURL(previewUrl);
            setScanning(null);
        };

        try {
            const scan = activeTab === 'image' ? await scanImageFile(file) : await scanDocumentFile(file);

            // Hard failure with nothing usable extracted.
            if (scan.error && !scan.text && (!scan.qrUrls || scan.qrUrls.length === 0)) {
                finish();
                setExtractionError(scan.error);
                return;
            }

            // Move to the final stage, then run the analysis.
            setScanStage(SCAN_STAGES.length - 1);
            const res = await calculateRiskScore(scan.text, {
                source: activeTab === 'image' ? 'image' : 'file',
                fileName: file.name,
                fileType: scan.fileType,
                embeddedLinks: scan.embeddedLinks,
                qrUrls: scan.qrUrls,
                metadata: scan.metadata,
                ocrConfidence: scan.ocrConfidence,
            });

            finish();
            setFileText(scan.text);
            setResult(res);
            trackCheckCompleted({
                check_type: checkType,
                risk_level: mapRiskLevel(res.riskLevel),
                result_bucket: mapResultBucket(res.riskLevel),
                page_path: pagePath,
            });
        } catch (err) {
            console.error('File scan error:', err);
            finish();
            setExtractionError('We could not scan this file. Please paste the content instead.');
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto space-y-6">
            <Card className="border-2 shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Scam Checker</CardTitle>
                    <CardDescription className="text-center">
                        Paste content, upload a screenshot, or drop a document to scan it for scam signals.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-center mb-6 overflow-x-auto pb-2">
                        <div className="inline-flex rounded-lg border p-1 bg-muted/20 whitespace-nowrap">
                            <Button variant={activeTab === 'url' ? 'default' : 'ghost'} size="sm" onClick={() => handleTabChange('url')} className="gap-2">
                                <Globe className="w-4 h-4" /> Website URL
                            </Button>
                            <Button variant={activeTab === 'email' ? 'default' : 'ghost'} size="sm" onClick={() => handleTabChange('email')} className="gap-2">
                                <Mail className="w-4 h-4" /> Email
                            </Button>
                            <Button variant={activeTab === 'text' ? 'default' : 'ghost'} size="sm" onClick={() => handleTabChange('text')} className="gap-2">
                                <MessageSquare className="w-4 h-4" /> SMS / Text
                            </Button>
                            <Button variant={activeTab === 'ip' ? 'default' : 'ghost'} size="sm" onClick={() => handleTabChange('ip')} className="gap-2">
                                <Network className="w-4 h-4" /> IP Address
                            </Button>
                            <Button variant={activeTab === 'image' ? 'default' : 'ghost'} size="sm" onClick={() => handleTabChange('image')} className="gap-2">
                                <ImageIcon className="w-4 h-4" /> Image
                            </Button>
                            <Button variant={activeTab === 'file' ? 'default' : 'ghost'} size="sm" onClick={() => handleTabChange('file')} className="gap-2">
                                <FileText className="w-4 h-4" /> File (PDF/Doc)
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* URL input */}
                        {activeTab === 'url' && (
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-medium">Paste the Website Link / URL</label>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="sm" onClick={handlePaste} className="h-7 text-xs gap-1">
                                            <Clipboard className="w-3 h-3" /> Paste
                                        </Button>
                                        {input && (
                                            <Button variant="ghost" size="sm" onClick={() => setInput('')} className="h-7 text-xs gap-1 text-red-500 hover:text-red-600">
                                                <X className="w-3 h-3" /> Clear
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                <Input
                                    placeholder="e.g. http://example-bank-login.com"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    className="h-12 text-lg"
                                />
                            </div>
                        )}

                        {/* IP address input */}
                        {activeTab === 'ip' && (
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-medium">Enter an IP address (IPv4 or IPv6)</label>
                                    {input && (
                                        <Button variant="ghost" size="sm" onClick={() => setInput('')} className="h-7 text-xs gap-1 text-red-500 hover:text-red-600">
                                            <X className="w-3 h-3" /> Clear
                                        </Button>
                                    )}
                                </div>
                                <Input
                                    placeholder="e.g. 45.33.32.156"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
                                    className="h-12 text-lg"
                                />
                                <p className="text-xs text-muted-foreground">
                                    We check the IP against community reports and, when enabled, AbuseIPDB&apos;s
                                    abuse reputation. Private and reserved addresses are not checked externally.
                                </p>
                                {extractionError && activeTab === 'ip' && (
                                    <p className="text-sm text-red-500 font-medium bg-red-50 p-2 rounded">{extractionError}</p>
                                )}
                            </div>
                        )}

                        {/* File / image: uploader → scanner animation → result */}
                        {isFileScan && !result && !scanning && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Scan {activeTab === 'image' ? 'a Screenshot' : 'a Document'}
                                </label>
                                <FileUploader
                                    accept={activeTab === 'image'
                                        ? { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] }
                                        : { 'application/pdf': ['.pdf'], 'text/plain': ['.txt'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] }}
                                    label={activeTab === 'image' ? 'Scan a Screenshot (PNG, JPG)' : 'Scan a Document (PDF, DOCX, TXT)'}
                                    onFileSelect={handleFileSelect}
                                    isLoading={false}
                                />
                                <p className="text-xs text-muted-foreground text-center">
                                    Files are scanned in your browser for risk signals and are never uploaded or stored.
                                </p>
                                {extractionError && (
                                    <p className="text-sm text-red-500 font-medium bg-red-50 p-2 rounded">{extractionError}</p>
                                )}
                            </div>
                        )}

                        {/* Active scanning animation */}
                        {isFileScan && scanning && (
                            <ScannerProgress
                                fileName={scanning.name}
                                fileType={scanning.kind}
                                previewUrl={scanning.previewUrl}
                                stageIndex={scanStage}
                            />
                        )}

                        {/* Email / text body */}
                        {(activeTab === 'email' || activeTab === 'text') && (
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-medium">
                                        Paste the {activeTab === 'email' ? 'Email' : 'Message'} Content
                                    </label>
                                    <div className="flex gap-2 items-center">
                                        <Button variant="ghost" size="sm" onClick={handlePaste} className="h-7 text-xs gap-1">
                                            <Clipboard className="w-3 h-3" /> Paste
                                        </Button>
                                        {input && (
                                            <Button variant="ghost" size="sm" onClick={() => setInput('')} className="h-7 text-xs gap-1 text-red-500 hover:text-red-600">
                                                <X className="w-3 h-3" /> Clear
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                <Textarea
                                    placeholder={activeTab === 'email' ? 'Paste the full email body here...' : 'Paste the message content here...'}
                                    className="min-h-[200px] resize-y text-base p-4"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                />
                            </div>
                        )}

                        {/* Action buttons for text-based tabs */}
                        {!isFileScan && (
                            <div className="flex gap-4 pt-4">
                                <Button className="flex-1 h-12 text-lg font-semibold" onClick={handleCheck} disabled={!input.trim() || loading}>
                                    {loading ? 'Scanning…' : 'Check Now'}
                                </Button>
                                {result && (
                                    <Button variant="outline" onClick={handleClear} className="h-12 px-6">Reset</Button>
                                )}
                            </div>
                        )}

                        {/* Reset for file scans */}
                        {isFileScan && result && (
                            <div className="pt-2">
                                <Button variant="outline" onClick={handleClear} className="w-full">
                                    Scan a different file
                                </Button>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <AnalysisResultDisplay result={result} input={isFileScan ? fileText : input} isFileScan={isFileScan} />
        </div>
    );
}
