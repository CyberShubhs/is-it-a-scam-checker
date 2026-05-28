import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Sanity tests for the FindQuestions bank + used-questions ledger.
 *
 * These don't import the generator (which is a CLI script and pulls in
 * network code), they just verify the data files are well-formed and that
 * every used-question ID can be resolved back to a real bank entry. That's
 * the failure mode that would silently let the auto-blog action recycle
 * questions if the ledger and bank ever drifted.
 */

interface QuestionBankEntry {
    id: string;
    question: string;
    intent: string;
}

interface QuestionBankFile {
    questions: QuestionBankEntry[];
}

interface UsedLedger {
    used: { id: string; slug: string; date: string }[];
}

const ROOT = path.resolve(__dirname, '..', '..');
const BANK = path.join(ROOT, 'data', 'findquestions-bank.json');
const USED = path.join(ROOT, 'data', 'used-blog-questions.json');

describe('FindQuestions question bank', () => {
    it('exists and parses as JSON', () => {
        expect(fs.existsSync(BANK)).toBe(true);
        const raw = fs.readFileSync(BANK, 'utf-8');
        expect(() => JSON.parse(raw)).not.toThrow();
    });

    it('contains at least 40 questions with unique IDs', () => {
        const bank: QuestionBankFile = JSON.parse(fs.readFileSync(BANK, 'utf-8'));
        expect(bank.questions.length).toBeGreaterThanOrEqual(40);
        const ids = bank.questions.map((q) => q.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it('every entry has non-empty id, question and intent', () => {
        const bank: QuestionBankFile = JSON.parse(fs.readFileSync(BANK, 'utf-8'));
        for (const q of bank.questions) {
            expect(q.id, 'id').toBeTruthy();
            expect(q.question, `question for ${q.id}`).toBeTruthy();
            expect(q.intent, `intent for ${q.id}`).toBeTruthy();
        }
    });
});

describe('Used-questions ledger', () => {
    it('exists and parses as JSON', () => {
        expect(fs.existsSync(USED)).toBe(true);
        const raw = fs.readFileSync(USED, 'utf-8');
        expect(() => JSON.parse(raw)).not.toThrow();
    });

    it('every used ID resolves to a real question in the bank', () => {
        const bank: QuestionBankFile = JSON.parse(fs.readFileSync(BANK, 'utf-8'));
        const ledger: UsedLedger = JSON.parse(fs.readFileSync(USED, 'utf-8'));
        const bankIds = new Set(bank.questions.map((q) => q.id));
        for (const entry of ledger.used) {
            expect(bankIds.has(entry.id), `used id ${entry.id} must exist in bank`).toBe(
                true,
            );
        }
    });

    it('used IDs are unique (no question used twice)', () => {
        const ledger: UsedLedger = JSON.parse(fs.readFileSync(USED, 'utf-8'));
        const ids = ledger.used.map((e) => e.id);
        expect(new Set(ids).size).toBe(ids.length);
    });
});
