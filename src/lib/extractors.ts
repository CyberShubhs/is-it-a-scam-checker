import { createWorker, OEM } from 'tesseract.js';
import * as mammoth from 'mammoth';
import type { DocumentMetadata } from './documentScan';

// Self-hosted scanner asset paths (served from public/scan/ — populated by
// scripts/prepare-scan-assets.mjs on install/build). Serving these same-origin
// is what makes the scanner work under the site's strict CSP ('self'); the
// previous CDN URLs were blocked by CSP and the pinned pdfjs version 404'd on
// cdnjs. No third-party CDN is contacted at runtime.
const PDF_WORKER_SRC = '/scan/pdf.worker.min.mjs';
const TESS_WORKER_PATH = '/scan/tesseract/worker.min.js';
const TESS_CORE_PATH = '/scan/tesseract';
const TESS_LANG_PATH = '/scan/tesseract/lang';

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

const IMAGE_EXT_RE = /\.(png|jpe?g|webp|gif|bmp|tiff?)$/i;

/** Loose MIME / extension check so we don't OCR a non-image blob. */
function looksLikeImage(file: File): boolean {
    if (file.type && file.type.startsWith('image/')) return true;
    if (file.type && file.type !== 'application/octet-stream') return false;
    return IMAGE_EXT_RE.test(file.name);
}

/**
 * Preprocess an image to improve OCR accuracy: upscale small screenshots,
 * convert to grayscale and stretch contrast. Returns a canvas Tesseract can
 * read directly. Falls back to the original File if anything goes wrong — the
 * original is always preserved for the preview, since this works on a copy.
 */
async function preprocessImageForOcr(file: File): Promise<HTMLCanvasElement | File> {
    try {
        const bitmap = await createImageBitmap(file);
        const longSide = Math.max(bitmap.width, bitmap.height);
        // OCR is most reliable around 1000-2000px on the long edge. Upscale
        // small screenshots; leave large ones alone (capped to bound memory).
        let scale = 1;
        if (longSide < 1400) scale = Math.min(2.5, 1400 / longSide);
        else if (longSide > 3000) scale = 3000 / longSide;
        const w = Math.max(1, Math.round(bitmap.width * scale));
        const h = Math.max(1, Math.round(bitmap.height * scale));

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return file;
        ctx.drawImage(bitmap, 0, 0, w, h);

        const imageData = ctx.getImageData(0, 0, w, h);
        const d = imageData.data;
        // Grayscale (luma) + mild contrast stretch around mid-grey. This makes
        // text edges crisper for the OCR engine without destroying faint text.
        for (let i = 0; i < d.length; i += 4) {
            const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
            const c = Math.min(255, Math.max(0, (gray - 128) * 1.35 + 128));
            d[i] = d[i + 1] = d[i + 2] = c;
        }
        ctx.putImageData(imageData, 0, 0);
        return canvas;
    } catch {
        return file; // preprocessing is an optimisation, not a requirement
    }
}

/**
 * Run Tesseract OCR with a one-shot worker pinned to our self-hosted assets.
 * `workerBlobURL: false` loads the worker directly from the same-origin URL
 * (CSP-friendly) rather than fetching it and wrapping it in a blob: URL. The
 * worker is always terminated to free its memory.
 */
async function runOcr(image: File | HTMLCanvasElement): Promise<{ text: string; confidence: number | null }> {
    const worker = await createWorker('eng', OEM.LSTM_ONLY, {
        workerPath: TESS_WORKER_PATH,
        corePath: TESS_CORE_PATH,
        langPath: TESS_LANG_PATH,
        workerBlobURL: false,
        gzip: true,
    });
    try {
        const { data } = await worker.recognize(image);
        return {
            text: (data.text || '').trim(),
            confidence: typeof data.confidence === 'number' ? data.confidence : null,
        };
    } finally {
        await worker.terminate();
    }
}

export async function scanImageFile(file: File): Promise<FileScanData> {
    if (file.size > MAX_FILE_SIZE) {
        return { text: '', error: 'File size exceeds 5MB limit.', fileType: 'image' };
    }
    if (!looksLikeImage(file)) {
        return { text: '', error: 'That does not look like a supported image (PNG, JPG, WEBP).', fileType: 'image' };
    }

    // OCR (with preprocessing) and QR detection are independent — a failure in
    // one must not prevent the other. The friendly error is only returned when
    // BOTH genuinely produce nothing.
    let text = '';
    let ocrConfidence: number | null = null;
    try {
        const preprocessed = await preprocessImageForOcr(file);
        const ocr = await runOcr(preprocessed);
        text = clampText(ocr.text);
        ocrConfidence = ocr.confidence;
    } catch (err) {
        console.error('OCR error:', err);
        // OCR genuinely failed (e.g. corrupt image). Fall through to QR + the
        // empty-result handling below — we never crash the scan.
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
    // Self-hosted worker (same-origin → CSP-compliant, and not subject to a CDN
    // having the exact pinned version — cdnjs only ships up to 5.4.149).
    pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_WORKER_SRC;

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
