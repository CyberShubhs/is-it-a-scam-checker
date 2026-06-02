/**
 * Document-scanner presentation constants.
 *
 * These drive the "serious security scanner" UX: a staged progress animation
 * and the rule that we NEVER dump raw extracted text on the user by default.
 * They live in a pure module (no React) so the behaviour — e.g. "technical
 * details start collapsed", "raw text is hidden" — can be asserted in unit
 * tests, not just eyeballed in the browser.
 */

export interface ScanStage {
    id: string;
    /** User-facing status line shown while this stage runs. */
    label: string;
}

/**
 * The ordered stages the scanner animates through. Wording is deliberately
 * framed as *scanning / risk analysis*, never "extracting text" — internally
 * we still OCR/parse, but that is an implementation detail, not the product.
 */
export const SCAN_STAGES: readonly ScanStage[] = [
    { id: 'prepare', label: 'Preparing file securely' },
    { id: 'visible-text', label: 'Scanning visible content' },
    { id: 'links', label: 'Checking links and QR codes' },
    { id: 'metadata', label: 'Checking document signals' },
    { id: 'reports', label: 'Checking community reports' },
    { id: 'risk', label: 'Analysing risk' },
    { id: 'advice', label: 'Preparing safety advice' },
] as const;

/**
 * Raw extracted/OCR text is NEVER shown by default — only inside the
 * collapsed "Technical details" section if the user opts in. This guards
 * against the tool feeling like a text extractor and avoids re-displaying
 * sensitive pasted content.
 */
export const DEFAULT_SHOW_RAW_TEXT = false;

/** The "Technical details" disclosure starts collapsed. */
export const DEFAULT_TECHNICAL_DETAILS_OPEN = false;

/**
 * Careful, honest framing for what the scanner actually did. We never claim
 * to have read a file perfectly — OCR and PDF parsing are lossy.
 */
export const SCAN_COVERAGE_NOTE =
    'Scanned the visible and detectable content in this file. Some content in images or unusual layouts may not be fully readable.';

/** Privacy reassurance shown on the scanner. */
export const SCAN_PRIVACY_NOTE =
    'Files are scanned for risk signals in your browser and are not uploaded or stored.';
