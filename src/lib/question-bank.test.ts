import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {
    loadQuestionBank,
    loadUsedQuestions,
    unavailableQuestionIds,
    listRemainingQuestions,
    pickUnusedQuestion,
    recordUsedQuestion,
    recordSkippedQuestion,
} from './question-bank';

/**
 * Tests for the FindQuestions bank + used/skipped ledger.
 *
 * Two layers:
 *   1. Sanity tests against the real on-disk files so the project's
 *      committed state never drifts (no duplicate IDs, every used ID
 *      resolves back to a real bank entry, etc).
 *   2. Behavioural tests against a temp-directory bank + ledger that drive
 *      the pick / skip / record helpers through the exact code paths the
 *      auto-blog GitHub Action uses.
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
    skipped?: { id: string; reason: string; date: string }[];
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

describe('Used-questions ledger (on-disk state)', () => {
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

    it('every skipped ID (if any) resolves to a real question in the bank', () => {
        const bank: QuestionBankFile = JSON.parse(fs.readFileSync(BANK, 'utf-8'));
        const ledger: UsedLedger = JSON.parse(fs.readFileSync(USED, 'utf-8'));
        const bankIds = new Set(bank.questions.map((q) => q.id));
        for (const entry of ledger.skipped ?? []) {
            expect(bankIds.has(entry.id), `skipped id ${entry.id} must exist in bank`).toBe(
                true,
            );
        }
    });

    it('no question appears in both used and skipped at the same time', () => {
        const ledger: UsedLedger = JSON.parse(fs.readFileSync(USED, 'utf-8'));
        const usedIds = new Set(ledger.used.map((e) => e.id));
        for (const entry of ledger.skipped ?? []) {
            expect(usedIds.has(entry.id), `id ${entry.id} is both used and skipped`).toBe(
                false,
            );
        }
    });
});

// ── Behavioural tests against a temp bank + ledger ─────────────────────────
//
// These drive the pick/skip helpers exactly the way the auto-blog action
// drives them, without ever touching the real data/ directory. The temp
// files are torn down after each test.

describe('pick / skip behaviour', () => {
    let tmpDir: string;
    let bankPath: string;
    let ledgerPath: string;

    beforeEach(() => {
        tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'qbank-'));
        bankPath = path.join(tmpDir, 'findquestions-bank.json');
        ledgerPath = path.join(tmpDir, 'used-blog-questions.json');
        // Tiny 4-question bank — enough to test all edge cases.
        fs.writeFileSync(
            bankPath,
            JSON.stringify({
                questions: [
                    { id: 'fq-001', question: 'Q1', intent: 'I1' },
                    { id: 'fq-002', question: 'Q2', intent: 'I2' },
                    { id: 'fq-003', question: 'Q3', intent: 'I3' },
                    { id: 'fq-004', question: 'Q4', intent: 'I4' },
                ],
            }),
        );
        fs.writeFileSync(
            ledgerPath,
            JSON.stringify({ used: [], skipped: [] }),
        );
    });

    afterEach(() => {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    it('returns the first question when nothing is used or skipped', () => {
        const picked = pickUnusedQuestion(bankPath, ledgerPath);
        expect(picked?.question.id).toBe('fq-001');
    });

    it('skips used questions when picking', () => {
        recordUsedQuestion('fq-001', 'slug-1', '2026-05-27', ledgerPath);
        const picked = pickUnusedQuestion(bankPath, ledgerPath);
        expect(picked?.question.id).toBe('fq-002');
    });

    it('skips deterministically-skipped questions when picking', () => {
        // Reproduces the original bug: fq-003 collided with an existing
        // post, the action used to stop. With skipped tracking, the next
        // pick must move on to fq-004.
        recordUsedQuestion('fq-001', 'slug-1', '2026-05-27', ledgerPath);
        recordUsedQuestion('fq-002', 'slug-2', '2026-05-27', ledgerPath);
        recordSkippedQuestion(
            'fq-003',
            'duplicate-topic',
            '2026-05-27',
            { slug: 'existing-slug', title: 'Existing title' },
            ledgerPath,
        );
        const picked = pickUnusedQuestion(bankPath, ledgerPath);
        expect(picked?.question.id).toBe('fq-004');
    });

    it('records duplicate-topic skips with the matched existing post info', () => {
        recordSkippedQuestion(
            'fq-003',
            'duplicate-topic',
            '2026-05-27',
            { slug: 'existing-slug', title: 'Existing title' },
            ledgerPath,
        );
        const ledger = loadUsedQuestions(ledgerPath);
        expect(ledger.skipped).toHaveLength(1);
        expect(ledger.skipped[0]).toMatchObject({
            id: 'fq-003',
            reason: 'duplicate-topic',
            date: '2026-05-27',
            matchedExistingSlug: 'existing-slug',
            matchedExistingTitle: 'Existing title',
        });
    });

    it('does not double-record a skip for the same ID', () => {
        recordSkippedQuestion('fq-003', 'duplicate-topic', '2026-05-27', {}, ledgerPath);
        recordSkippedQuestion('fq-003', 'duplicate-topic', '2026-05-28', {}, ledgerPath);
        const ledger = loadUsedQuestions(ledgerPath);
        expect(ledger.skipped).toHaveLength(1);
        expect(ledger.skipped[0].date).toBe('2026-05-28');
    });

    it('unavailableQuestionIds is the union of used and skipped', () => {
        recordUsedQuestion('fq-001', 's-1', '2026-05-27', ledgerPath);
        recordSkippedQuestion('fq-003', 'duplicate-topic', '2026-05-27', {}, ledgerPath);
        const blocked = unavailableQuestionIds(loadUsedQuestions(ledgerPath));
        expect(blocked).toEqual(new Set(['fq-001', 'fq-003']));
    });

    it('listRemainingQuestions excludes both used and skipped IDs', () => {
        recordUsedQuestion('fq-001', 's-1', '2026-05-27', ledgerPath);
        recordSkippedQuestion('fq-003', 'duplicate-topic', '2026-05-27', {}, ledgerPath);
        const remaining = listRemainingQuestions(bankPath, ledgerPath);
        const ids = remaining.map((q) => q.id);
        expect(ids).toEqual(['fq-002', 'fq-004']);
    });

    it('returns null when every question is used or skipped', () => {
        recordUsedQuestion('fq-001', 's-1', '2026-05-27', ledgerPath);
        recordUsedQuestion('fq-002', 's-2', '2026-05-27', ledgerPath);
        recordSkippedQuestion('fq-003', 'duplicate-topic', '2026-05-27', {}, ledgerPath);
        recordSkippedQuestion('fq-004', 'duplicate-topic', '2026-05-27', {}, ledgerPath);
        expect(pickUnusedQuestion(bankPath, ledgerPath)).toBeNull();
        expect(listRemainingQuestions(bankPath, ledgerPath)).toEqual([]);
    });

    it('simulates the auto-blog retry loop: skip fq-003, advance to fq-004', () => {
        // Used IDs 1+2 from previous runs; this run hits a duplicate on
        // fq-003 and must continue.
        recordUsedQuestion('fq-001', 's-1', '2026-05-26', ledgerPath);
        recordUsedQuestion('fq-002', 's-2', '2026-05-26', ledgerPath);

        // Iteration 1: pick fq-003.
        const first = pickUnusedQuestion(bankPath, ledgerPath);
        expect(first?.question.id).toBe('fq-003');

        // Simulate the duplicate-topic outcome: mark fq-003 as skipped.
        recordSkippedQuestion(
            'fq-003',
            'duplicate-topic',
            '2026-05-27',
            { slug: 'matched-existing-post' },
            ledgerPath,
        );

        // Iteration 2: the loop must now pick fq-004 instead of stopping.
        const second = pickUnusedQuestion(bankPath, ledgerPath);
        expect(second?.question.id).toBe('fq-004');
    });

    it('ledger changes persist on disk even when no post is created', () => {
        // The action commits data/used-blog-questions.json even when the
        // post itself was never published — this is what stops the same
        // collision from blocking tomorrow's run.
        recordSkippedQuestion('fq-003', 'duplicate-topic', '2026-05-27', {}, ledgerPath);

        // Re-read from disk to confirm the write happened.
        const onDisk = JSON.parse(fs.readFileSync(ledgerPath, 'utf-8'));
        expect(onDisk.skipped).toHaveLength(1);
        expect(onDisk.skipped[0].id).toBe('fq-003');
    });

    it('loadQuestionBank returns the parsed bank file', () => {
        const bank = loadQuestionBank(bankPath);
        expect(bank?.questions.map((q) => q.id)).toEqual([
            'fq-001',
            'fq-002',
            'fq-003',
            'fq-004',
        ]);
    });

    it('reading a ledger that omits `skipped` synthesises an empty array', () => {
        // Older ledger format (pre-skipped) must still parse cleanly so an
        // in-flight workflow doesn't break during the schema migration.
        fs.writeFileSync(ledgerPath, JSON.stringify({ used: [] }));
        const ledger = loadUsedQuestions(ledgerPath);
        expect(ledger.skipped).toEqual([]);
    });
});
