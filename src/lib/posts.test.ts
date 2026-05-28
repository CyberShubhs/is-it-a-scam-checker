import { describe, it, expect } from 'vitest';
import { buildBlogPostingJsonLd, getAllPosts, type Post } from './posts';

function fixture(overrides: Partial<Post['frontmatter']> = {}): Post {
    return {
        slug: 'test-slug-fixture',
        content: 'body',
        frontmatter: {
            title: 'Test Title for JSON-LD assertion',
            date: '2026-05-23',
            summary: 'A short summary that the schema description field will mirror.',
            tags: ['scam-alert', 'phishing'],
            sources: [
                'https://www.scamwatch.gov.au/something-real',
                'https://www.ftc.gov/other-real',
            ],
            ...overrides,
        },
    };
}

describe('buildBlogPostingJsonLd', () => {
    it('returns a BlogPosting node with the canonical fields', () => {
        const node = buildBlogPostingJsonLd(fixture());
        expect(node['@type']).toBe('BlogPosting');
        expect(node['@context']).toBe('https://schema.org');
        expect(node.headline).toBe('Test Title for JSON-LD assertion');
        expect(node.url).toBe('https://scamchecker.app/blog/test-slug-fixture');
        expect(node.isAccessibleForFree).toBe(true);
        expect(node.inLanguage).toBe('en');
    });

    it('emits author and publisher with logo', () => {
        const node = buildBlogPostingJsonLd(fixture());
        // Default author is now Shubham Singla (the real reviewer of every
        // shipped post) so the Person JSON-LD attaches to a real human
        // entity instead of an anonymous "team" label.
        expect(node.author).toMatchObject({
            '@type': 'Person',
            name: 'Shubham Singla',
            url: 'https://scamchecker.app/author/shubham-singla',
        });
        expect(node.publisher).toMatchObject({
            '@type': 'Organization',
            name: 'Scam Checker',
        });
        const publisher = node.publisher as { logo?: { url?: string } };
        expect(publisher.logo?.url).toBe('https://scamchecker.app/icon.png');
    });

    it('maps the legacy "The Scam Checker Team" byline to Shubham Singla', () => {
        const node = buildBlogPostingJsonLd(
            fixture({ author: 'The Scam Checker Team' }),
        );
        expect((node.author as { name: string; url: string }).name).toBe(
            'Shubham Singla',
        );
        expect((node.author as { name: string; url: string }).url).toBe(
            'https://scamchecker.app/author/shubham-singla',
        );
    });

    it('emits citation from the sources array', () => {
        const node = buildBlogPostingJsonLd(fixture());
        expect(node.citation).toEqual([
            'https://www.scamwatch.gov.au/something-real',
            'https://www.ftc.gov/other-real',
        ]);
    });

    it('skips citation when no http sources are present', () => {
        const node = buildBlogPostingJsonLd(fixture({ sources: [] }));
        expect(node.citation).toBeUndefined();
    });

    it('honours the optional author and reviewer frontmatter', () => {
        const node = buildBlogPostingJsonLd(
            fixture({ author: 'Custom Author', reviewer: 'Shubham Singla' }),
        );
        expect((node.author as { name: string }).name).toBe('Custom Author');
        expect(node.reviewedBy).toMatchObject({
            '@type': 'Person',
            name: 'Shubham Singla',
        });
    });

    it('uses updated/lastReviewed for dateModified when present', () => {
        const node = buildBlogPostingJsonLd(
            fixture({ date: '2026-01-01', updated: '2026-05-23' }),
        );
        expect(node.datePublished).toBe('2026-01-01');
        expect(node.dateModified).toBe('2026-05-23');
    });

    it('emits articleSection from category when set, else first tag', () => {
        const fromCategory = buildBlogPostingJsonLd(fixture({ category: 'job-scams' }));
        expect(fromCategory.articleSection).toBe('job-scams');
        const fromTag = buildBlogPostingJsonLd(fixture({ tags: ['phishing', 'sms'] }));
        expect(fromTag.articleSection).toBe('phishing');
    });
});

describe('every published post produces a valid BlogPosting', () => {
    const posts = getAllPosts();
    for (const post of posts) {
        it(`renders BlogPosting for ${post.slug}`, () => {
            const node = buildBlogPostingJsonLd(post);
            expect(node['@type']).toBe('BlogPosting');
            expect(node.headline).toBeTruthy();
            expect(node.url).toContain(post.slug);
            expect(node.author).toBeTruthy();
            expect(node.publisher).toBeTruthy();
        });
    }
});
