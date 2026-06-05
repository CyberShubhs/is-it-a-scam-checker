/**
 * FindQuestions bank + used/skipped ledger utilities.
 *
 * Extracted into a library module (separate from the generator CLI) so the
 * pure pick/skip logic is unit-testable without spinning up the AI script.
 * The auto-blog generator imports the same helpers, so test coverage here
 * directly protects production behaviour.
 *
 * Files involved:
 *   - data/findquestions-bank.json   — read-only source of all questions
 *   - data/used-blog-questions.json  — persistent ledger of `used` + `skipped` IDs
 */

import fs from 'node:fs';
import path from 'node:path';

export interface QuestionBankEntry {
    id: string;
    question: string;
    intent: string;
    /**
     * Optional keyword-cluster slug (e.g. 'phone-checker', 'crypto-checker').
     * Routes the post to the right cluster + internal links. Legacy entries
     * omit it and default to the job-scams cluster in the generator.
     */
    cluster?: string;
}

export interface QuestionBankFile {
    source?: string;
    sourceLabel?: string;
    notes?: string;
    cluster?: string;
    questions: QuestionBankEntry[];
}

export interface UsedQuestionEntry {
    id: string;
    slug: string;
    date: string;
}

/**
 * A question deterministically rejected (e.g. duplicate-topic collision) so
 * the pick logic excludes it from future runs.
 */
export interface SkippedQuestionEntry {
    id: string;
    /** Canonical value: "duplicate-topic". Free-text otherwise. */
    reason: string;
    date: string;
    matchedExistingSlug?: string;
    matchedExistingTitle?: string;
}

export interface UsedQuestionsFile {
    used: UsedQuestionEntry[];
    skipped: SkippedQuestionEntry[];
}

/**
 * Resolve the path to data/ at the project root. Allows tests to point at
 * a temp directory.
 */
export function defaultBankPath(root: string = process.cwd()): string {
    return path.join(root, 'data', 'findquestions-bank.json');
}

export function defaultLedgerPath(root: string = process.cwd()): string {
    return path.join(root, 'data', 'used-blog-questions.json');
}

export function loadQuestionBank(bankPath: string = defaultBankPath()): QuestionBankFile | null {
    if (!fs.existsSync(bankPath)) return null;
    try {
        const raw = fs.readFileSync(bankPath, 'utf-8');
        const parsed = JSON.parse(raw) as QuestionBankFile;
        if (!Array.isArray(parsed.questions)) return null;
        return parsed;
    } catch {
        return null;
    }
}

export function loadUsedQuestions(
    ledgerPath: string = defaultLedgerPath(),
): UsedQuestionsFile {
    if (!fs.existsSync(ledgerPath)) {
        return { used: [], skipped: [] };
    }
    try {
        const raw = fs.readFileSync(ledgerPath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (!parsed || !Array.isArray(parsed.used)) {
            return { used: [], skipped: [] };
        }
        // Forward-compat: older ledgers may not have `skipped` yet.
        if (!Array.isArray(parsed.skipped)) {
            parsed.skipped = [];
        }
        return parsed as UsedQuestionsFile;
    } catch {
        return { used: [], skipped: [] };
    }
}

/**
 * IDs that cannot be picked next — union of used and skipped. Exported so
 * tests can assert pick behaviour without touching disk repeatedly.
 */
export function unavailableQuestionIds(ledger: UsedQuestionsFile): Set<string> {
    return new Set<string>([
        ...ledger.used.map((u) => u.id),
        ...(ledger.skipped ?? []).map((s) => s.id),
    ]);
}

export function listRemainingQuestions(
    bankPath: string = defaultBankPath(),
    ledgerPath: string = defaultLedgerPath(),
): QuestionBankEntry[] {
    const bank = loadQuestionBank(bankPath);
    if (!bank) return [];
    const blocked = unavailableQuestionIds(loadUsedQuestions(ledgerPath));
    return bank.questions.filter((q) => !blocked.has(q.id));
}

/**
 * Pick the first unused-and-unskipped question. Deterministic so the
 * publishing order is predictable for a human editor.
 */
export function pickUnusedQuestion(
    bankPath: string = defaultBankPath(),
    ledgerPath: string = defaultLedgerPath(),
): { question: QuestionBankEntry; bank: QuestionBankFile } | null {
    const bank = loadQuestionBank(bankPath);
    if (!bank) return null;
    const blocked = unavailableQuestionIds(loadUsedQuestions(ledgerPath));
    const remaining = bank.questions.filter((q) => !blocked.has(q.id));
    if (remaining.length === 0) return null;
    return { question: remaining[0], bank };
}

function writeLedger(ledger: UsedQuestionsFile, ledgerPath: string): void {
    fs.writeFileSync(ledgerPath, `${JSON.stringify(ledger, null, 2)}\n`, 'utf-8');
}

export function recordUsedQuestion(
    questionId: string,
    slug: string,
    date: string,
    ledgerPath: string = defaultLedgerPath(),
): void {
    const ledger = loadUsedQuestions(ledgerPath);
    ledger.used.push({ id: questionId, slug, date });
    if (!Array.isArray(ledger.skipped)) ledger.skipped = [];
    writeLedger(ledger, ledgerPath);
}

/**
 * Mark a question as permanently skipped with a reason. If the same ID is
 * already in `skipped`, the previous entry is replaced (most recent reason
 * wins) so the ledger doesn't accumulate duplicate skip records.
 */
export function recordSkippedQuestion(
    questionId: string,
    reason: string,
    date: string,
    matched: { slug?: string; title?: string } = {},
    ledgerPath: string = defaultLedgerPath(),
): void {
    const ledger = loadUsedQuestions(ledgerPath);
    if (!Array.isArray(ledger.skipped)) ledger.skipped = [];
    ledger.skipped = ledger.skipped.filter((s) => s.id !== questionId);
    ledger.skipped.push({
        id: questionId,
        reason,
        date,
        matchedExistingSlug: matched.slug,
        matchedExistingTitle: matched.title,
    });
    writeLedger(ledger, ledgerPath);
}
