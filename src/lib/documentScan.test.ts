import { describe, it, expect } from 'vitest';
import { analyzeDocument, isSuspiciousFileName } from './documentScan';
import {
    DEFAULT_SHOW_RAW_TEXT,
    DEFAULT_TECHNICAL_DETAILS_OPEN,
    SCAN_STAGES,
} from './scanStages';
import { calculateRiskScore } from './scamScorer';

describe('document scan view defaults', () => {
    it('never shows raw extracted text by default', () => {
        expect(DEFAULT_SHOW_RAW_TEXT).toBe(false);
    });
    it('keeps the technical details panel collapsed by default', () => {
        expect(DEFAULT_TECHNICAL_DETAILS_OPEN).toBe(false);
    });
    it('exposes the staged scanning sequence', () => {
        const ids = SCAN_STAGES.map((s) => s.id);
        expect(ids).toContain('visible-text');
        expect(ids).toContain('links');
        expect(ids).toContain('metadata');
        expect(ids).toContain('reports');
        expect(SCAN_STAGES.length).toBeGreaterThanOrEqual(6);
    });
});

describe('isSuspiciousFileName', () => {
    it('flags deceptive double extensions', () => {
        expect(isSuspiciousFileName('invoice.pdf.exe')).toBe(true);
    });
    it('flags lure keywords in the name', () => {
        expect(isSuspiciousFileName('URGENT-Payment-Overdue.pdf')).toBe(true);
    });
    it('does not flag an ordinary name', () => {
        expect(isSuspiciousFileName('holiday-photos.png')).toBe(false);
    });
});

describe('analyzeDocument', () => {
    it('produces document signals for a fake invoice with bank details', () => {
        const res = analyzeDocument({
            fileName: 'invoice.pdf',
            fileType: 'pdf',
            text: 'INVOICE — amount due $4,300. Pay now to BSB 062-000 account number 12345678. Final notice.',
        });
        const ids = res.signals.map((s) => s.id);
        expect(ids).toContain('doc_payment_language');
        expect(ids).toContain('doc_bank_details');
        expect(res.signals.every((s) => s.group === 'document')).toBe(true);
    });

    it('detects a crypto wallet address as a document signal', () => {
        const res = analyzeDocument({
            fileName: 'refund.pdf',
            fileType: 'pdf',
            text: 'Send 0.5 BTC to bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq to receive your refund.',
        });
        expect(res.signals.map((s) => s.id)).toContain('doc_crypto_wallet');
    });

    it('extracts entities from embedded links and QR destinations', () => {
        const res = analyzeDocument({
            fileName: 'parcel.pdf',
            fileType: 'pdf',
            text: 'Your parcel could not be delivered.',
            embeddedLinks: ['http://auspost-redelivery.xyz/pay'],
            qrUrls: ['http://45.33.32.156/verify'],
        });
        expect(res.entities.urls.some((u) => u.registrableDomain === 'auspost-redelivery.xyz')).toBe(true);
        expect(res.entities.ips.map((i) => i.ip)).toContain('45.33.32.156');
        expect(res.signals.map((s) => s.id)).toContain('doc_qr_link');
        expect(res.scannedItems).toContain('Embedded links');
    });
});

describe('calculateRiskScore with a document context', () => {
    it('includes document signals and an embedded URL raises the score', async () => {
        const benign = await calculateRiskScore('Hello, here is the document you asked for.', {
            source: 'file',
            fileName: 'note.pdf',
            fileType: 'pdf',
        });

        const withBadLink = await calculateRiskScore(
            'Your account is suspended. Verify your identity to avoid closure.',
            {
                source: 'file',
                fileName: 'urgent-invoice.pdf',
                fileType: 'pdf',
                embeddedLinks: ['http://commbank.support-verify.xyz/login'],
            },
        );

        // The malicious embedded link + document signals must outscore the benign file.
        expect(withBadLink.score).toBeGreaterThan(benign.score);
        // Document-category signals are present and grouped.
        expect(withBadLink.signalGroups?.some((g) => g.id === 'document')).toBe(true);
        // Raw text is not part of the structured result surface.
        expect(withBadLink.scannedItems).toContain('Visible text');
    });
});
