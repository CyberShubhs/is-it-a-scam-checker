
'use client';

import React, { useState } from 'react';
import { calculateRiskScore, ScamAnalysisResult } from '@/lib/scamScorer';
import { AnalysisResultDisplay } from './AnalysisResult';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FileUploader } from './FileUploader';
import { extractTextFromImage, extractTextFromFile } from '@/lib/extractors';
import {
    trackCheckSubmitted,
    trackCheckCompleted,
    mapRiskLevel,
    mapResultBucket,
    type CheckType as AnalyticsCheckType,
} from '@/lib/analytics';

import { Globe, Mail, MessageSquare, Image as ImageIcon, FileText, Clipboard, X } from 'lucide-react';

type TabType = 'url' | 'email' | 'text' | 'image' | 'file';

function toAnalyticsCheckType(tab: TabType): AnalyticsCheckType {
    if (tab === 'text') return 'sms';
    if (tab === 'file') return 'pdf';
    return tab;
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

    const handleCheck = () => {
        if (!input.trim() || loading) return;

        const checkType = toAnalyticsCheckType(activeTab);
        const pagePath =
            typeof window !== 'undefined' ? window.location.pathname : undefined;

        trackCheckSubmitted({
            check_type: checkType,
            page_path: pagePath,
            has_url: activeTab === 'url',
            has_attachment: activeTab === 'image' || activeTab === 'file',
            event_source: 'scam_checker_form',
        });

        setLoading(true);
        // Simulate a brief delay for "scanning" feel
        setTimeout(async () => {
            const res = await calculateRiskScore(input);
            setResult(res);
            setLoading(false);

            trackCheckCompleted({
                check_type: checkType,
                risk_level: mapRiskLevel(res.riskLevel),
                result_bucket: mapResultBucket(res.riskLevel),
                page_path: pagePath,
            });
        }, 600);
    };

    const handleClear = () => {
        setInput('');
        setResult(null);
        setExtractionError(null);
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
        setExtractionError(null);
    };

    const handleFileSelect = async (file: File) => {
        setLoading(true);
        setExtractionError(null);
        setResult(null);

        let res;
        if (activeTab === 'image') {
            res = await extractTextFromImage(file);
        } else {
            res = await extractTextFromFile(file);
        }

        setLoading(false);

        if (res.error) {
            setExtractionError(res.error);
        } else if (res.text) {
            setInput(res.text);
        } else {
            setExtractionError("No text found in this file.");
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto space-y-6">
            <Card className="border-2 shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Scam Checker</CardTitle>
                    <CardDescription className="text-center">
                        Paste content, upload an image, or drop a file to check for scam signals.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-center mb-6 overflow-x-auto pb-2">
                        <div className="inline-flex rounded-lg border p-1 bg-muted/20 whitespace-nowrap">
                            <Button
                                variant={activeTab === 'url' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => handleTabChange('url')}
                                className="gap-2"
                            >
                                <Globe className="w-4 h-4" />
                                Website URL
                            </Button>
                            <Button
                                variant={activeTab === 'email' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => handleTabChange('email')}
                                className="gap-2"
                            >
                                <Mail className="w-4 h-4" />
                                Email
                            </Button>
                            <Button
                                variant={activeTab === 'text' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => handleTabChange('text')}
                                className="gap-2"
                            >
                                <MessageSquare className="w-4 h-4" />
                                SMS / Text
                            </Button>
                            <Button
                                variant={activeTab === 'image' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => handleTabChange('image')}
                                className="gap-2"
                            >
                                <ImageIcon className="w-4 h-4" />
                                Image
                            </Button>
                            <Button
                                variant={activeTab === 'file' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => handleTabChange('file')}
                                className="gap-2"
                            >
                                <FileText className="w-4 h-4" />
                                File (PDF/Doc)
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-4">
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
                                <div className="relative">
                                    <Input
                                        placeholder="e.g. http://example-bank-login.com"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        className="h-12 text-lg pr-12"
                                    />
                                </div>
                            </div>
                        )}

                        {(activeTab === 'image' || activeTab === 'file') && !input && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Upload {activeTab === 'image' ? 'Screenshot' : 'Document'}
                                </label>
                                <FileUploader
                                    accept={activeTab === 'image'
                                        ? { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] }
                                        : { 'application/pdf': ['.pdf'], 'text/plain': ['.txt'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] }
                                    }
                                    label={activeTab === 'image' ? 'Upload Screenshot (PNG, JPG)' : 'Upload Document (PDF, DOCX)'}
                                    onFileSelect={handleFileSelect}
                                    isLoading={loading && !input}
                                />
                                <p className="text-xs text-muted-foreground text-center">
                                    Files are processed securely in your browser. Nothing is uploaded to our servers.
                                </p>
                            </div>
                        )}

                        {(activeTab === 'email' || activeTab === 'text' || !!input) && (activeTab !== 'url') && (
                            <div className="space-y-2 animate-in fade-in zoom-in-95 duration-300">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-medium">
                                        {activeTab === 'image' || activeTab === 'file'
                                            ? 'Extracted Text (Edit if needed)'
                                            : `Paste the ${activeTab === 'email' ? 'Email' : 'Message'} Content`}
                                    </label>
                                    <div className="flex gap-2 items-center">
                                        {(activeTab === 'image' || activeTab === 'file') && (
                                            <Button variant="ghost" size="sm" onClick={() => setInput('')} className="h-6 text-xs text-muted-foreground">
                                                Upload Different File
                                            </Button>
                                        )}
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
                                    placeholder={activeTab === 'email' ? "Paste the full email body here..." : "Paste the message content here..."}
                                    className="min-h-[200px] resize-y text-base p-4"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                />
                                {extractionError && (
                                    <p className="text-sm text-red-500 font-medium bg-red-50 p-2 rounded">
                                        {extractionError}
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="flex gap-4 pt-4">
                            <Button
                                className="flex-1 h-12 text-lg font-semibold"
                                onClick={handleCheck}
                                disabled={!input.trim() || loading}
                            >
                                {loading && input ? 'Analyzing...' : loading ? 'Reading File...' : 'Check Now'}
                            </Button>
                            {result && (
                                <Button variant="outline" onClick={handleClear} className="h-12 px-6">
                                    Reset
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <AnalysisResultDisplay result={result} input={input} />
        </div>
    );
}
