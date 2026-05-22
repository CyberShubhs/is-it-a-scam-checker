import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
    sanitizeParams,
    trackEvent,
    trackCheckSubmitted,
    trackReportSubmitted,
    trackHaveIBeenScammedStarted,
    trackResultCopied,
    trackGuideCtaClicked,
    trackOutboundReportLinkClicked,
    mapRiskLevel,
    mapResultBucket,
    FORBIDDEN_KEYS,
} from './analytics';

declare global {
    var __gtagCalls: unknown[][];
}

beforeEach(() => {
    globalThis.__gtagCalls = [];
    // Stub a gtag-like function on window for Node-side tests where the DOM
    // globals don't exist. Cast through `unknown` so we don't have to satisfy
    // the full Window & typeof globalThis shape just to attach gtag.
    const g = global as unknown as { window?: { gtag?: unknown } };
    g.window = g.window ?? {};
    g.window.gtag = (...args: unknown[]) => {
        globalThis.__gtagCalls.push(args);
    };
});

afterEach(() => {
    const g = global as unknown as { window?: { gtag?: unknown } };
    if (g.window) delete g.window.gtag;
});

describe('sanitizeParams', () => {
    it('keeps allowed keys with truthy values', () => {
        const safe = sanitizeParams({
            check_type: 'url',
            risk_level: 'high',
            has_url: true,
            event_source: 'unit_test',
        });
        expect(safe).toEqual({
            check_type: 'url',
            risk_level: 'high',
            has_url: true,
            event_source: 'unit_test',
        });
    });

    it('drops every forbidden key, even if a caller passes one in', () => {
        const dirty: Record<string, unknown> = {
            check_type: 'url',
        };
        for (const k of FORBIDDEN_KEYS) {
            dirty[k] = 'leak-me-please';
        }
        const safe = sanitizeParams(dirty as Parameters<typeof sanitizeParams>[0]);
        for (const k of FORBIDDEN_KEYS) {
            expect(safe[k]).toBeUndefined();
        }
        // The allowed one is still there.
        expect(safe.check_type).toBe('url');
    });

    it('drops empty / undefined / null values', () => {
        const safe = sanitizeParams({
            check_type: undefined,
            risk_level: '',
            // sanitizeParams now accepts a permissive `object`, so a runtime
            // null here flows through the type checker; the assertion is a
            // runtime-resilience test.
            page_path: null,
        });
        expect(Object.keys(safe)).toHaveLength(0);
    });

    it('drops keys not in the allowlist', () => {
        const safe = sanitizeParams({ totally_random_key: 'x', check_type: 'url' });
        expect(safe).toEqual({ check_type: 'url' });
    });
});

describe('trackEvent + wrappers', () => {
    it('forwards a sanitised event to gtag', () => {
        trackEvent('test_event', { check_type: 'email', risk_level: 'high' });
        expect(globalThis.__gtagCalls).toHaveLength(1);
        const [cmd, name, params] = globalThis.__gtagCalls[0] as [
            string,
            string,
            Record<string, unknown>,
        ];
        expect(cmd).toBe('event');
        expect(name).toBe('test_event');
        expect(params).toEqual({ check_type: 'email', risk_level: 'high' });
    });

    it('check_submitted also emits the channel-specific sibling for url', () => {
        trackCheckSubmitted({
            check_type: 'url',
            page_path: '/check',
            has_url: true,
            has_attachment: false,
            event_source: 'test',
        });
        const names = globalThis.__gtagCalls.map((c) => c[1]);
        expect(names).toContain('check_submitted');
        expect(names).toContain('url_check_submitted');
    });

    it('check_submitted emits sms_check_submitted for whatsapp/text', () => {
        trackCheckSubmitted({ check_type: 'whatsapp' });
        const names = globalThis.__gtagCalls.map((c) => c[1]);
        expect(names).toContain('sms_check_submitted');
    });

    it('typed wrappers never leak forbidden keys', () => {
        trackReportSubmitted({ report_type: 'phone' });
        trackHaveIBeenScammedStarted({ page_path: '/have-i-been-scammed' });
        trackResultCopied({ check_type: 'url', risk_level: 'high' });
        trackGuideCtaClicked({
            page_path: '/blog/foo',
            cta_location: 'mid',
            destination_path: '/check',
        });
        trackOutboundReportLinkClicked({
            page_path: '/global-scam-reporting',
            destination_type: 'government',
            country_selected: 'AU',
        });

        for (const [, , params] of globalThis.__gtagCalls as [
            string,
            string,
            Record<string, unknown>,
        ][]) {
            for (const k of FORBIDDEN_KEYS) {
                expect(params[k]).toBeUndefined();
            }
        }
    });

    it('does nothing when gtag is missing', () => {
        const g = global as unknown as { window?: { gtag?: unknown } };
        if (g.window) delete g.window.gtag;
        expect(() =>
            trackEvent('no_gtag', { check_type: 'url' }),
        ).not.toThrow();
    });
});

describe('mapRiskLevel / mapResultBucket', () => {
    it('maps every known scorer value to a GA bucket', () => {
        expect(mapRiskLevel('High')).toBe('high');
        expect(mapRiskLevel('Medium')).toBe('medium');
        expect(mapRiskLevel('Low')).toBe('low');
        expect(mapRiskLevel(undefined)).toBe('unknown');

        expect(mapResultBucket('High')).toBe('dangerous');
        expect(mapResultBucket('Medium')).toBe('suspicious');
        expect(mapResultBucket('Low')).toBe('safe');
        expect(mapResultBucket('???')).toBe('unknown');
    });
});
