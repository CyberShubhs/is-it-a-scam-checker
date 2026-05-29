/**
 * Client-side cookie-consent helper.
 *
 * Privacy-first default: until the visitor explicitly clicks "Accept",
 * non-essential analytics MUST NOT load. "Reject" is as easy as
 * "Accept" — they are the same one-click decision, just opposite.
 *
 * Persistence: a first-party cookie `sc_consent` with a 6-month TTL.
 * SameSite=Lax. Secure when the page is served over HTTPS.
 *
 * The cookie's value is a small JSON payload (encoded with
 * encodeURIComponent) so we can record version + decision date as well
 * as the decision itself. Older clients that only see the decision
 * string still parse cleanly.
 */

export type ConsentDecision = 'granted' | 'denied';

export const CONSENT_COOKIE = 'sc_consent';
export const CONSENT_VERSION = 1;
export const CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 30 * 6; // ~6 months

export interface ConsentState {
    decision: ConsentDecision;
    version: number;
    grantedAt: string; // ISO timestamp
}

export function isClient(): boolean {
    return typeof document !== 'undefined';
}

function parseCookieValue(raw: string): ConsentState | null {
    try {
        const decoded = decodeURIComponent(raw);
        // Forward-compat: try JSON first, fall back to a bare decision string.
        if (decoded.startsWith('{')) {
            const obj = JSON.parse(decoded) as Partial<ConsentState>;
            if (obj.decision === 'granted' || obj.decision === 'denied') {
                return {
                    decision: obj.decision,
                    version: obj.version ?? 1,
                    grantedAt: obj.grantedAt ?? new Date().toISOString(),
                };
            }
        }
        if (decoded === 'granted' || decoded === 'denied') {
            return {
                decision: decoded,
                version: 1,
                grantedAt: new Date().toISOString(),
            };
        }
    } catch {
        // ignore — falls through to null
    }
    return null;
}

export function readConsent(): ConsentState | null {
    if (!isClient()) return null;
    const entries = document.cookie.split('; ');
    for (const e of entries) {
        const [k, ...rest] = e.split('=');
        if (k === CONSENT_COOKIE) {
            return parseCookieValue(rest.join('='));
        }
    }
    return null;
}

export function writeConsent(decision: ConsentDecision): ConsentState {
    const state: ConsentState = {
        decision,
        version: CONSENT_VERSION,
        grantedAt: new Date().toISOString(),
    };
    if (isClient()) {
        const value = encodeURIComponent(JSON.stringify(state));
        const secure = window.location.protocol === 'https:' ? '; Secure' : '';
        document.cookie = `${CONSENT_COOKIE}=${value}; Max-Age=${CONSENT_MAX_AGE_SECONDS}; Path=/; SameSite=Lax${secure}`;
        // Invalidate the snapshot cache used by useSyncExternalStore so
        // the next snapshot re-reads document.cookie.
        cachedRaw = null;
        cachedSnapshot = null;
        // Notify in-page subscribers so the GA tag can mount or tear down.
        window.dispatchEvent(
            new CustomEvent<ConsentState>('sc:consent-changed', { detail: state }),
        );
    }
    return state;
}

export function clearConsent(): void {
    if (!isClient()) return;
    document.cookie = `${CONSENT_COOKIE}=; Max-Age=0; Path=/; SameSite=Lax`;
    cachedRaw = null;
    cachedSnapshot = null;
    window.dispatchEvent(
        new CustomEvent('sc:consent-changed', { detail: null }),
    );
}

export function consentGranted(state: ConsentState | null): boolean {
    return !!state && state.decision === 'granted';
}

/**
 * Subscriber + snapshot helpers shaped for React's `useSyncExternalStore`.
 *
 * Both the consent banner and the GA tag subscribe to the same external
 * state (the cookie + a custom event), so it's cleaner to drive them from
 * a single store. This also satisfies the lint rule that flags
 * `setState`-inside-`useEffect` cascades — there are no effects here.
 */
type Subscriber = () => void;

export function subscribeConsent(callback: Subscriber): () => void {
    if (!isClient()) return () => {};
    const handler = () => callback();
    window.addEventListener('sc:consent-changed', handler);
    return () => window.removeEventListener('sc:consent-changed', handler);
}

/**
 * Snapshot for SSR / hydration. Returns null so server renders treat the
 * visitor as no-consent (the privacy-safe default). The client snapshot
 * is read fresh from document.cookie.
 */
export function getServerConsentSnapshot(): ConsentState | null {
    return null;
}

/**
 * Snapshot for client. Returns a STABLE reference between calls when the
 * cookie hasn't changed — useSyncExternalStore requires referential
 * stability or React tears infinitely.
 */
let cachedSnapshot: ConsentState | null = null;
let cachedRaw: string | null = null;
export function getClientConsentSnapshot(): ConsentState | null {
    if (!isClient()) return null;
    const raw = document.cookie;
    if (raw !== cachedRaw) {
        cachedRaw = raw;
        cachedSnapshot = readConsent();
    }
    return cachedSnapshot;
}

/** Reset memoised snapshot. Tests + writeConsent call this. */
export function _resetConsentSnapshotCache(): void {
    cachedRaw = null;
    cachedSnapshot = null;
}
