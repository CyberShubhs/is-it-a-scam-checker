import Tesseract from 'tesseract.js';
import * as mammoth from 'mammoth';
import type { DocumentMetadata } from './documentScan';

/**
 * Client-side file scanning.
 *
 * IMPORTANT PRIVACY MODEL: all parsing here runs in the user's browser. The
 * file bytes are read into memory, scanned transiently, and discarded — they
 * are NEVER uploaded to our servers or written to disk. Only the *signals* we
 * derive (and the extracted entities) are sent to the server for community-
 * report matching / IP reputation.
 *
 * The UI frames this as "scanning a document for risk signals". Text
 * extraction / OCR is the internal mechanism, not the headline product, and
 * the raw text is only shown inside an opt-in "Technical details" panel.
 */

export interface ExtractedData {
    text: string;
    error?: string;
}

/** Rich result of a transient file scan. */
export interface FileScanData {
    text: string;
    error?: string;
    fileType: 'pdf' | 'docx' | 'txt' | 'image';
    metadata?: DocumentMetadata;
    /** URLs from PDF link annotations (may not appear in the visible text). */
    embeddedLinks?: string[];
    /** URLs decoded from QR codes in the image / first PDF pages. */
    qrUrls?: string[];
    /** OCR confidence 0-100 (images only). */
    ocrConfidence?: number | null;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB — matches the uploader's limit.
// Guard against a pathological OCR / PDF that produces megabytes of text:
// truncate so downstream regex scanning stays fast and memory stays bounded.
const MAX_TEXT_LEN = 100_000;
// QR scanning of a PDF only looks at the first couple of pages to bound cost.
const MAX_QR_PDF_PAGES = 2;

function clampText(text: string): string {
    return text.length > MAX_TEXT_LEN ? text.slice(0, MAX_TEXT_LEN) : text;
}

// ── QR detection (best-effort, never throws) ────────────────────────────────

/** Run jsQR over a canvas's pixels and return the decoded string, if any. */
async function decodeQrFromImageData(imageData: ImageData): Promise<string | null> {
    try {
        const jsQR = (await import('jsqr')).default;
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        return code?.data ?? null;
    } catch {
        return null;
    }
}

/** Detect a QR code in an uploaded image file. Returns decoded URLs (http/s). */
async function detectQrFromImage(file: File): Promise<string[]> {
    try {
        const bitmap = await createImageBitmap(file);
        const canvas = document.createElement('canvas');
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return [];
        ctx.drawImage(bitmap, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const decoded = await decodeQrFromImageData(imageData);
        return decoded ? [decoded] : [];
    } catch {
        return []; // QR detection is a bonus — failures must not break scanning.
    }
}

// ── Image scanning (OCR + QR) ───────────────────────────────────────────────

export async function scanImageFile(file: File): Promise<FileScanData> {
    if (file.size > MAX_FILE_SIZE) {
        return { text: '', error: 'File size exceeds 5MB limit.', fileType: 'image' };
    }

    // Run OCR and QR detection together — they're independent.
    let text = '';
    let ocrConfidence: number | null = null;
    try {
        const result = await Tesseract.recognize(file, 'eng');
        text = clampText(result.data.text || '');
        ocrConfidence = typeof result.data.confidence === 'number' ? result.data.confidence : null;
    } catch (err) {
        console.error('OCR Error:', err);
        // OCR can fail on odd images; we still return QR results if any.
    }

    const qrUrls = (await detectQrFromImage(file)).filter((u) => /^https?:\/\//i.test(u));

    if (!text && qrUrls.length === 0) {
        return {
            text: '',
            error: 'We could not read any text or QR code from this image. Try a clearer screenshot or paste the text instead.',
            fileType: 'image',
        };
    }

    return { text, fileType: 'image', qrUrls, ocrConfidence };
}

// ── Document scanning (PDF / DOCX / TXT) ────────────────────────────────────

export async function scanDocumentFile(file: File): Promise<FileScanData> {
    if (file.size > MAX_FILE_SIZE) {
        return { text: '', error: 'File size exceeds 5MB limit.', fileType: 'pdf' };
    }
    const extension = file.name.split('.').pop()?.toLowerCase();

    try {
        if (extension === 'txt') {
            const data = await readTextFile(file);
            return { ...data, text: clampText(data.text), fileType: 'txt' };
        }
        if (extension === 'docx') {
            const data = await readDocxFile(file);
            return { ...data, text: clampText(data.text), fileType: 'docx' };
        }
        if (extension === 'pdf') {
            return await readPdfRich(file);
        }
        return { text: '', error: 'Unsupported file type.', fileType: 'pdf' };
    } catch (err) {
        console.error('Extraction Error:', err);
        return { text: '', error: 'We could not scan this file. Please paste the content instead.', fileType: 'pdf' };
    }
}

function readTextFile(file: File): Promise<ExtractedData> {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = (e.target?.result as string) || '';
            // Reject obviously binary content masquerading as .txt (lots of
            // NUL/control bytes) — not something we should scan as text.
            const controlChars = (
                text.slice(0, 2000).match(/[\x00-\x08\x0E-\x1F]/g) || []
            ).length;
            if (controlChars > 50) {
                resolve({ text: '', error: 'This file does not look like readable text.' });
                return;
            }
            resolve({ text });
        };
        reader.onerror = () => resolve({ text: '', error: 'Error reading text file.' });
        reader.readAsText(file);
    });
}

async function readDocxFile(file: File): Promise<ExtractedData> {
    const arrayBuffer = await file.arrayBuffer();
    try {
        const result = await mammoth.extractRawText({ arrayBuffer });
        return { text: result.value };
    } catch {
        return { text: '', error: 'Error processing DOCX file.' };
    }
}

/**
 * Rich PDF scan: visible text, link annotations, document metadata, and a
 * best-effort QR scan of the first couple of pages. Each sub-step is guarded
 * so a failure in one (e.g. annotations) never loses the others.
 */
async function readPdfRich(file: File): Promise<FileScanData> {
    // Dynamic import avoids SSR issues with DOMMatrix/Canvas at build time.
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = '';
    const embeddedLinks: string[] = [];
    const qrUrls: string[] = [];
    const maxPages = Math.min(pdf.numPages, 10);

    for (let i = 1; i <= maxPages; i++) {
        const page = await pdf.getPage(i);

        // Visible text.
        try {
            const textContent = await page.getTextContent();
            const pageText = textContent.items
                .map((item: unknown) => (item as { str?: string }).str ?? '')
                .join(' ');
            fullText += pageText + '\n\n';
        } catch {
            /* skip this page's text */
        }

        // Link annotations (URLs that may be hidden behind "click here").
        try {
            const annotations = await page.getAnnotations();
            for (const a of annotations as Array<{ subtype?: string; url?: string; unsafeUrl?: string }>) {
                const url = a.url || a.unsafeUrl;
                if (a.subtype === 'Link' && url) embeddedLinks.push(url);
            }
        } catch {
            /* annotations unavailable */
        }

        // QR scan of the first couple of pages (cost-bounded).
        if (i <= MAX_QR_PDF_PAGES) {
            try {
                const viewport = page.getViewport({ scale: 2 });
                const canvas = document.createElement('canvas');
                canvas.width = Math.min(viewport.width, 2000);
                canvas.height = Math.min(viewport.height, 2000);
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    await page.render({ canvas, canvasContext: ctx, viewport }).promise;
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const decoded = await decodeQrFromImageData(imageData);
                    if (decoded && /^https?:\/\//i.test(decoded)) qrUrls.push(decoded);
                }
            } catch {
                /* QR scan is best-effort */
            }
        }
    }

    // Metadata from the PDF info dictionary.
    let metadata: DocumentMetadata = { pageCount: pdf.numPages };
    try {
        const meta = await pdf.getMetadata();
        const info = (meta?.info ?? {}) as Record<string, unknown>;
        metadata = {
            title: (info.Title as string) ?? null,
            author: (info.Author as string) ?? null,
            creator: (info.Creator as string) ?? null,
            creationDate: (info.CreationDate as string) ?? null,
            pageCount: pdf.numPages,
        };
    } catch {
        /* metadata unavailable */
    }

    return {
        text: clampText(fullText),
        fileType: 'pdf',
        metadata,
        embeddedLinks: Array.from(new Set(embeddedLinks)),
        qrUrls: Array.from(new Set(qrUrls)),
    };
}

// ── Backwards-compatible thin wrappers (kept for any existing callers) ──────

export async function extractTextFromImage(file: File): Promise<ExtractedData> {
    const r = await scanImageFile(file);
    return { text: r.text, error: r.error };
}

export async function extractTextFromFile(file: File): Promise<ExtractedData> {
    const r = await scanDocumentFile(file);
    return { text: r.text, error: r.error };
}
