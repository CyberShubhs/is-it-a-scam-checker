/**
 * Document / PDF / image risk analysis.
 *
 * Takes the content we extracted from a file — visible text (incl. OCR),
 * embedded links/annotations, decoded QR destinations and file metadata — and
 * turns it into *document signals*: the concrete, scam-relevant things a file
 * contains (payment demands, crypto wallets, gift-card asks, credential
 * harvesting, urgency, suspicious file names, embedded entities).
 *
 * This is the engine behind the "Document signals" section. It is pure and
 * isomorphic so it runs in the browser scanner and in unit tests. The raw
 * extracted text never leaves this analysis except inside the opt-in
 * "Technical details" panel — we surface signals, not a text dump.
 */

import { extractEntities, ExtractedEntities } from './entities';
import type { ScanSignal } from './scamScorer';

export interface DocumentMetadata {
    title?: string | null;
    author?: string | null;
    creator?: string | null;
    /** Producer/creation date string straight from the PDF info dictionary. */
    creationDate?: string | null;
    pageCount?: number | null;
}

export interface DocumentScanInput {
    fileName: string;
    fileType: 'pdf' | 'docx' | 'txt' | 'image';
    /** Visible/OCR text extracted from the file. */
    text: string;
    /** Links pulled from PDF annotations that may not appear in the text. */
    embeddedLinks?: string[];
    /** URLs decoded from QR codes found in the file/image. */
    qrUrls?: string[];
    metadata?: DocumentMetadata;
    /** OCR confidence (0-100) for images, when the engine provides it. */
    ocrConfidence?: number | null;
}

export interface DocumentScanResult {
    /** File/document-category signals to fold into the overall score. */
    signals: ScanSignal[];
    /** Every URL/IP/email/phone found across text + links + QR. */
    entities: ExtractedEntities;
    metadata: DocumentMetadata;
    /** True if the file name itself is a scam tell (double extension, lure words). */
    suspiciousFileName: boolean;
    /** URLs decoded from QR codes (already merged into entities). */
    qrUrls: string[];
    /** Human-friendly list of what we scanned, for the "What was scanned" UI. */
    scannedItems: string[];
}

// ── Document signal patterns ────────────────────────────────────────────────
// Each pattern is framed as a *document* signal (group: 'document'). They
// overlap intentionally with the message scorer but are reported separately so
// a user sees "this DOCUMENT asks for payment", not just generic text flags.
const DOC_PATTERNS: {
    id: string;
    label: string;
    points: number;
    pattern: RegExp;
    explanation: string;
}[] = [
    {
        id: 'doc_payment_language',
        label: 'Payment / invoice language',
        points: 25,
        pattern:
            /\b(invoice|amount due|outstanding balance|pay(?:ment)? (?:now|due|required)|overdue|remittance|wire transfer)\b/i,
        explanation:
            'The document pushes for a payment. Fake-invoice and payment-redirection scams rely on documents that look official.',
    },
    {
        id: 'doc_bank_details',
        label: 'Bank / payment account details',
        points: 30,
        pattern:
            /\b(bsb|iban|swift|sort code|account (?:number|no\.?)|routing number|pay ?id|bpay)\b/i,
        explanation:
            'Bank or payment account details inside an unsolicited document are a classic invoice-redirection tactic. Verify the account through a trusted channel before paying.',
    },
    {
        id: 'doc_crypto_wallet',
        label: 'Cryptocurrency wallet address',
        points: 40,
        // BTC (legacy + bech32) and ETH-style addresses.
        pattern: /\b(bc1[a-z0-9]{20,}|0x[a-fA-F0-9]{40}|[13][a-km-zA-HJ-NP-Z1-9]{25,34})\b/,
        explanation:
            'A crypto wallet address means the requested payment is irreversible and untraceable — a strong scam indicator.',
    },
    {
        id: 'doc_gift_card',
        label: 'Gift card / voucher request',
        points: 40,
        pattern:
            /\b(gift card|itunes card|google play card|steam card|voucher code|prepaid card)\b/i,
        explanation:
            'Legitimate businesses and agencies never ask to be paid in gift cards. This is almost always a scam.',
    },
    {
        id: 'doc_credentials',
        label: 'Login / verification request',
        points: 30,
        pattern:
            /\b(verify your (?:account|identity)|confirm your (?:password|login|details)|sign in to (?:confirm|verify)|update your payment|reset your password|one[- ]?time (?:code|password)|otp)\b/i,
        explanation:
            'The document asks you to log in or verify details. Phishing documents funnel you to fake login pages.',
    },
    {
        id: 'doc_urgency',
        label: 'Urgency / threat language',
        points: 20,
        pattern:
            /\b(urgent|immediately|within 24 hours|final notice|account (?:suspended|locked|closed)|legal action|failure to (?:pay|respond))\b/i,
        explanation:
            'Pressure and deadlines are engineered to make you act before you think. Treat urgent documents with extra suspicion.',
    },
];

/**
 * Detect a scam-shaped file name: a money/lure keyword combined with a
 * deceptive double extension (invoice.pdf.exe) or a generic auto-name that
 * masquerades as an official document.
 */
export function isSuspiciousFileName(fileName: string): boolean {
    const name = fileName.toLowerCase();
    // Double extension hiding an executable/script (e.g. receipt.pdf.exe).
    if (/\.(pdf|docx?|jpe?g|png)\.(exe|scr|js|vbs|bat|cmd|com|zip|html?)$/i.test(name)) {
        return true;
    }
    const lureWords =
        /(invoice|payment|receipt|refund|urgent|overdue|statement|remittance|delivery|parcel|tax|fine|penalty)/i;
    return lureWords.test(name);
}

/**
 * Analyse extracted document content into document signals + entities.
 * Never throws; missing optional fields are treated as empty.
 */
export function analyzeDocument(input: DocumentScanInput): DocumentScanResult {
    const text = input.text || '';
    const embeddedLinks = input.embeddedLinks ?? [];
    const qrUrls = input.qrUrls ?? [];
    const metadata = input.metadata ?? {};

    // Entities are extracted from the union of visible text + embedded links +
    // QR destinations so a link that only exists as a PDF annotation or inside
    // a QR code still gets analysed and matched against community reports.
    const combinedForEntities = [text, embeddedLinks.join(' '), qrUrls.join(' ')].join('\n');
    const entities = extractEntities(combinedForEntities);

    const signals: ScanSignal[] = [];

    // Document-category text patterns.
    for (const p of DOC_PATTERNS) {
        const match = (text + ' ' + embeddedLinks.join(' ')).match(p.pattern);
        if (match) {
            signals.push({
                id: p.id,
                label: p.label,
                points: p.points,
                explanation: p.explanation,
                matchedText: match[0],
                group: 'document',
            });
        }
    }

    // Suspicious file name.
    const suspiciousFileName = isSuspiciousFileName(input.fileName);
    if (suspiciousFileName) {
        signals.push({
            id: 'doc_suspicious_filename',
            label: 'Suspicious file name',
            points: 15,
            explanation:
                'The file name uses lure words or a deceptive double extension often seen in malicious attachments.',
            matchedText: input.fileName,
            group: 'document',
        });
    }

    // QR codes that decode to a link are worth calling out explicitly.
    if (qrUrls.length > 0) {
        signals.push({
            id: 'doc_qr_link',
            label: 'QR code link detected',
            points: 20,
            explanation:
                'This file contains a QR code that points to a website. "Quishing" hides malicious links inside QR codes — the destination has been analysed below.',
            matchedText: qrUrls[0],
            group: 'document',
        });
    }

    // Build the honest "What was scanned" list.
    const scannedItems: string[] = ['Visible text'];
    if (embeddedLinks.length > 0 || entities.urls.length > 0) scannedItems.push('Embedded links');
    if (qrUrls.length > 0) scannedItems.push('QR codes');
    if (metadata.title || metadata.author || metadata.creator || metadata.creationDate) {
        scannedItems.push('Document metadata');
    }
    if (entities.emails.length > 0) scannedItems.push('Email addresses');
    if (entities.phones.length > 0) scannedItems.push('Phone numbers');
    if (entities.ips.length > 0) scannedItems.push('IP addresses');

    return {
        signals,
        entities,
        metadata,
        suspiciousFileName,
        qrUrls,
        scannedItems,
    };
}
