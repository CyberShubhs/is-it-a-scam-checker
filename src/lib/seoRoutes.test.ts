import { describe, it, expect } from 'vitest';
import { lastModifiedFor, ROUTE_LAST_MODIFIED, SEO_DEFAULT_LAST_MODIFIED } from './seoRoutes';

describe('seoRoutes registry', () => {
    it('returns a valid, stable Date for a known route', () => {
        const d = lastModifiedFor('/check');
        expect(d).toBeInstanceOf(Date);
        expect(Number.isNaN(d.getTime())).toBe(false);
        // Deterministic — same input, same output (not deploy-time).
        expect(lastModifiedFor('/check').getTime()).toBe(d.getTime());
    });

    it('falls back to the shared default for unknown routes', () => {
        expect(lastModifiedFor('/totally-unknown-route').getTime()).toBe(
            new Date(SEO_DEFAULT_LAST_MODIFIED).getTime(),
        );
    });

    it('only contains parseable ISO dates', () => {
        for (const [route, date] of Object.entries(ROUTE_LAST_MODIFIED)) {
            expect(/^\d{4}-\d{2}-\d{2}$/.test(date), `${route} → ${date}`).toBe(true);
            expect(Number.isNaN(new Date(date).getTime()), `${route} → ${date}`).toBe(false);
        }
    });

    it('home route is mapped (priority page must have a stable date)', () => {
        expect(ROUTE_LAST_MODIFIED['']).toBeDefined();
    });
});
