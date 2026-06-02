import { describe, it, expect } from 'vitest';
import { slugifyTitle, buildCleanBlogSlug } from './blogSlug';

describe('slugifyTitle', () => {
    it('lower-cases and hyphenates, trimming edges', () => {
        expect(slugifyTitle('Fake Check Bounce Time: What You Need!')).toBe(
            'fake-check-bounce-time-what-you-need',
        );
    });
});

describe('buildCleanBlogSlug', () => {
    it('produces a clean date+title slug with NO opaque hash', () => {
        const slug = buildCleanBlogSlug('2026-06-02', 'Most Common Job Scam in 2026', []);
        expect(slug).toBe('2026-06-02-most-common-job-scam-in-2026');
        // No 6-hex-char suffix like the old "-662152" format.
        expect(/-[0-9a-f]{6}$/.test(slug)).toBe(false);
    });

    it('appends a numeric disambiguator only on collision', () => {
        const existing = ['2026-06-02-bank-text-scam'];
        expect(buildCleanBlogSlug('2026-06-02', 'Bank Text Scam', existing)).toBe(
            '2026-06-02-bank-text-scam-2',
        );
        const existing2 = ['2026-06-02-bank-text-scam', '2026-06-02-bank-text-scam-2'];
        expect(buildCleanBlogSlug('2026-06-02', 'Bank Text Scam', existing2)).toBe(
            '2026-06-02-bank-text-scam-3',
        );
    });

    it('caps the title portion length', () => {
        const long = 'A'.repeat(120);
        const slug = buildCleanBlogSlug('2026-06-02', long, []);
        // date (10) + '-' + up to 60 title chars
        expect(slug.length).toBeLessThanOrEqual(10 + 1 + 60);
    });
});
