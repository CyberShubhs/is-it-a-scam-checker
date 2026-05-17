import { describe, it, expect } from 'vitest';
import { guides, getGuideBySlug, getRelatedGuides } from './guides';

const expectedSlugs = [
    'is-this-website-legit',
    'how-to-spot-a-fake-link',
    'scam-text-message-examples',
    'whatsapp-scams-examples',
    'email-phishing-examples',
    'payid-scams-australia',
    'ato-scam-text-email',
    'bank-impersonation-scams',
    'facebook-marketplace-scams',
    'parcel-delivery-scams-australia',
    'what-to-do-if-youve-been-scammed',
];

describe('Guides', () => {
    it('should include every required guide slug', () => {
        // We assert the required slugs are present rather than pinning to an
        // exact count, so editorial additions don't break the suite.
        const slugs = new Set(guides.map((g) => g.slug));
        for (const expected of expectedSlugs) {
            expect(slugs.has(expected), `missing guide "${expected}"`).toBe(true);
        }
        expect(guides.length).toBeGreaterThanOrEqual(expectedSlugs.length);
    });

    it('should contain all expected slugs', () => {
        const slugs = guides.map(g => g.slug);
        for (const expected of expectedSlugs) {
            expect(slugs).toContain(expected);
        }
    });

    it('each guide should have required fields', () => {
        for (const guide of guides) {
            expect(guide.slug).toBeTruthy();
            expect(guide.title).toBeTruthy();
            expect(guide.excerpt).toBeTruthy();
            expect(guide.metaDescription).toBeTruthy();
            expect(guide.content).toBeTruthy();
            expect(guide.date).toBeTruthy();
            expect(guide.relatedSlugs).toBeInstanceOf(Array);
            expect(guide.relatedSlugs.length).toBeGreaterThanOrEqual(2);
        }
    });

    it('each guide should have a meta description under 165 characters', () => {
        for (const guide of guides) {
            expect(guide.metaDescription.length).toBeLessThanOrEqual(165);
        }
    });

    it('getGuideBySlug should return correct guide', () => {
        const guide = getGuideBySlug('is-this-website-legit');
        expect(guide).toBeDefined();
        expect(guide?.title).toContain('Website Legit');
    });

    it('getGuideBySlug should return undefined for invalid slug', () => {
        const guide = getGuideBySlug('not-a-real-guide');
        expect(guide).toBeUndefined();
    });

    it('each guide should reference valid related guides', () => {
        for (const guide of guides) {
            for (const relatedSlug of guide.relatedSlugs) {
                const relatedGuide = getGuideBySlug(relatedSlug);
                expect(relatedGuide, `Guide "${guide.slug}" references non-existent guide "${relatedSlug}"`).toBeDefined();
            }
        }
    });

    it('getRelatedGuides should return related guides', () => {
        const related = getRelatedGuides('is-this-website-legit');
        expect(related.length).toBeGreaterThan(0);
        expect(related.every(g => g.slug !== 'is-this-website-legit')).toBe(true);
    });

    it('each guide content should include checker CTA', () => {
        for (const guide of guides) {
            expect(guide.content).toContain('href="/check"');
        }
    });
});
