import { describe, it, expect } from 'vitest';
import {
    validateGeneratedPostQuality,
    countBodyWords,
    type GeneratedPost,
} from './post-quality';

const HEADINGS = [
    '## How This Scam Works',
    '## Who Is Being Targeted',
    '## Red Flags to Watch For',
    '## What to Do Before You Click, Reply, or Pay',
    "## What to Do If You've Already Been Affected",
    '## Where to Report',
    '## Related Scam Checker pages',
];

/** Build a body that satisfies every gate. */
function buildPassingBody(): string {
    const filler = Array.from({ length: 60 })
        .map(
            (_, i) =>
                `Sentence ${i} adds substantive context to the paragraph so the word count exceeds the 800 threshold without using placeholder content.`,
        )
        .join(' ');
    const sections = HEADINGS.map((h) => `${h}\n\n${filler}`).join('\n\n');
    const links = `

Use the [free scam checker](/check) and read the [job scam checker guide](/guides/job-scams) if relevant.
Source: https://www.scamwatch.gov.au/something-real and https://reportfraud.ftc.gov/other-real.
`;
    return sections + links;
}

function buildPassingPost(): { post: GeneratedPost; body: string } {
    return {
        post: {
            title: 'How to Spot a Fake Job Offer Before You Share Documents',
            summary:
                'Quick checklist for verifying a remote job offer before you cash a cheque or share ID — covers task scams, fake recruiters, and onboarding traps.',
            tags: ['job-scams', 'employment-scam', 'remote-job'],
            sources: [
                'https://www.ic3.gov/AnnualReport/Reports/2024_IC3Report.pdf',
                'https://www.ftc.gov/news-events/news/press-releases/2024/ftc-business-imposter-employment-scam-report',
            ],
            body: '',
        },
        body: buildPassingBody(),
    };
}

describe('countBodyWords', () => {
    it('strips fenced code and counts the rest', () => {
        const body = 'one two three\n\n```js\nconst a = 1;\n```\n\nfour five six';
        expect(countBodyWords(body)).toBe(6);
    });

    it('counts plain prose', () => {
        expect(countBodyWords('one two three four')).toBe(4);
    });
});

describe('validateGeneratedPostQuality', () => {
    it('passes a fully compliant post', () => {
        const { post, body } = buildPassingPost();
        const reasons = validateGeneratedPostQuality(post, body, {
            clusterRoutes: ['/guides/job-scams'],
        });
        expect(reasons).toEqual([]);
    });

    it('rejects bodies under 800 words', () => {
        const { post } = buildPassingPost();
        const shortBody = HEADINGS.join('\n\n') + '\n\nshort.';
        const reasons = validateGeneratedPostQuality(post, shortBody);
        expect(reasons.some((r) => r.includes('800'))).toBe(true);
    });

    it('rejects fewer than 2 valid source URLs', () => {
        const { post, body } = buildPassingPost();
        const bad: GeneratedPost = { ...post, sources: ['https://only.one'] };
        const reasons = validateGeneratedPostQuality(bad, body);
        expect(reasons.some((r) => r.includes('source URL'))).toBe(true);
    });

    it('rejects placeholder source URLs', () => {
        const { post, body } = buildPassingPost();
        const bad: GeneratedPost = {
            ...post,
            sources: [...post.sources, 'https://example.com/fake'],
        };
        const reasons = validateGeneratedPostQuality(bad, body);
        expect(reasons.some((r) => r.includes('Placeholder source URL'))).toBe(true);
    });

    it('rejects bodies missing required headings', () => {
        const { post, body } = buildPassingPost();
        const stripped = body.replace('## Where to Report', '## Somewhere');
        const reasons = validateGeneratedPostQuality(post, stripped);
        expect(
            reasons.some((r) => r.includes('Missing required heading: ## Where to Report')),
        ).toBe(true);
    });

    it('rejects posts with fewer than 2 distinct internal links', () => {
        const { post, body } = buildPassingPost();
        const stripped = body
            .replace('/check', 'check-replaced')
            .replace('/guides/job-scams', 'guides-replaced');
        const reasons = validateGeneratedPostQuality(post, stripped);
        expect(reasons.some((r) => r.includes('internal Scam Checker link'))).toBe(true);
    });

    it('rejects posts missing the cluster-specific internal link', () => {
        const { post, body } = buildPassingPost();
        const reasons = validateGeneratedPostQuality(post, body, {
            clusterRoutes: ['/crypto-scam-checker'],
        });
        expect(reasons.some((r) => r.includes('cluster-specific internal link'))).toBe(true);
    });

    it('rejects too-short and too-long titles', () => {
        const { post, body } = buildPassingPost();
        const short = { ...post, title: 'too short' };
        expect(
            validateGeneratedPostQuality(short, body).some((r) => r.includes('Title length')),
        ).toBe(true);

        const long = {
            ...post,
            title: 'X'.repeat(80),
        };
        expect(
            validateGeneratedPostQuality(long, body).some((r) => r.includes('Title length')),
        ).toBe(true);
    });

    it('rejects too-short and too-long summaries', () => {
        const { post, body } = buildPassingPost();
        const short = { ...post, summary: 'one line' };
        expect(
            validateGeneratedPostQuality(short, body).some((r) => r.includes('Summary length')),
        ).toBe(true);

        const long = { ...post, summary: 'X'.repeat(200) };
        expect(
            validateGeneratedPostQuality(long, body).some((r) => r.includes('Summary length')),
        ).toBe(true);
    });

    it('rejects bodies that hammer the same internal route', () => {
        const { post, body } = buildPassingPost();
        const spammed =
            body +
            `\n\n[link](/check) [link](/check) [link](/check) [link](/check) [link](/check) [link](/check)`;
        const reasons = validateGeneratedPostQuality(post, spammed, {
            clusterRoutes: ['/guides/job-scams'],
        });
        expect(reasons.some((r) => r.includes('/check repeated'))).toBe(true);
    });

    it('rejects bodies that hammer the same external URL', () => {
        const { post, body } = buildPassingPost();
        const spammed =
            body +
            `\n\nhttps://www.scamwatch.gov.au/x https://www.scamwatch.gov.au/x https://www.scamwatch.gov.au/x https://www.scamwatch.gov.au/x https://www.scamwatch.gov.au/x https://www.scamwatch.gov.au/x`;
        const reasons = validateGeneratedPostQuality(post, spammed, {
            clusterRoutes: ['/guides/job-scams'],
        });
        expect(reasons.some((r) => r.includes('repeated') && r.includes('scamwatch.gov.au'))).toBe(true);
    });
});
