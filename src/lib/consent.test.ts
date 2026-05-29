import { describe, it, expect, beforeEach, vi } from 'vitest';

/**
 * Consent helper tests. We mock `document.cookie` so the helper logic
 * runs in Node without touching a real browser cookie jar.
 */

function setupDocument() {
    let store = '';
    const fakeDocument = {
        get cookie() {
            return store;
        },
        set cookie(v: string) {
            // Browsers MERGE writes into the cookie jar. We emulate the
            // single-cookie subset we need: when the same key is set
            // again, replace it.
            const head = v.split(';')[0];
            const [key] = head.split('=');
            const parts = store ? store.split('; ').filter((p) => !p.startsWith(`${key}=`)) : [];
            const maxAgeMatch = v.match(/Max-Age=(\d+)/);
            if (maxAgeMatch && parseInt(maxAgeMatch[1], 10) === 0) {
                // delete
                store = parts.join('; ');
            } else {
                parts.push(head);
                store = parts.join('; ');
            }
        },
    };
    (globalThis as { document?: unknown }).document = fakeDocument;
    return fakeDocument;
}

beforeEach(() => {
    setupDocument();
    // window.location used by writeConsent to decide Secure flag.
    (globalThis as { window?: unknown }).window = {
        location: { protocol: 'http:' },
        dispatchEvent: vi.fn(),
    };
});

describe('consent helpers', () => {
    it('returns null when no cookie is set', async () => {
        const { readConsent } = await import('./consent');
        expect(readConsent()).toBeNull();
    });

    it('writeConsent persists a decision that readConsent can recover', async () => {
        const { writeConsent, readConsent } = await import('./consent');
        const state = writeConsent('granted');
        expect(state.decision).toBe('granted');
        const round = readConsent();
        expect(round?.decision).toBe('granted');
        expect(round?.version).toBe(1);
    });

    it('writeConsent("denied") records a denial, NOT just an absence', async () => {
        const { writeConsent, readConsent, consentGranted } = await import('./consent');
        writeConsent('denied');
        const round = readConsent();
        expect(round?.decision).toBe('denied');
        expect(consentGranted(round)).toBe(false);
    });

    it('clearConsent removes the cookie so the banner re-prompts', async () => {
        const { writeConsent, clearConsent, readConsent } = await import('./consent');
        writeConsent('granted');
        clearConsent();
        expect(readConsent()).toBeNull();
    });

    it('parses a legacy bare-string cookie value forward-compatibly', async () => {
        // Simulate a cookie set by an older client that stored the bare
        // word "granted" instead of the JSON envelope.
        document.cookie = 'sc_consent=granted; Max-Age=3600; Path=/';
        const { readConsent } = await import('./consent');
        expect(readConsent()?.decision).toBe('granted');
    });
});
