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
    '## Frequently Asked Questions',
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
    // Source hostnames must appear in the body so source-relevance passes.
    // Includes 5 distinct internal links, 3 numbered action steps, and 5 FAQ
    // questions so the stricter weekly gate passes.
    const links = `

Use the [free scam checker](/check) and read the [job scam checker guide](/guides/job-scams) if relevant.
You can also [browse community reports](/reports), open the [recovery checklist](/have-i-been-scammed), or find [where to report](/global-scam-reporting).
Source: https://www.scamwatch.gov.au/something-real and https://reportfraud.ftc.gov/other-real.
According to the FBI's IC3 report (ic3.gov) and the FTC's imposter-scam release (ftc.gov), the trend continues.

What to do before you act:
1. Stop and verify the sender independently.
2. Do not send money or share any documents.
3. Run the message through the scam checker.

**Is it safe to reply just to verify?** No — replying confirms your number is active.
**How do I know if a recruiter is real?** Check the company domain and official listings.
**Can I get my money back?** Sometimes, if you act fast and contact your bank.
**Should I report it?** Yes, report it to your local authority.
**What if I already shared my ID?** Follow the recovery checklist immediately.
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
                'https://www.scamwatch.gov.au/something-real',
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

    it('rejects bodies under the weekly minimum word count', () => {
        const { post } = buildPassingPost();
        const shortBody = HEADINGS.join('\n\n') + '\n\nshort.';
        const reasons = validateGeneratedPostQuality(post, shortBody);
        expect(reasons.some((r) => /needs at least 1500/.test(r))).toBe(true);
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

    it('rejects malformed www.www. source hosts', () => {
        const { post, body } = buildPassingPost();
        const bad: GeneratedPost = {
            ...post,
            sources: ['https://www.www.ftc.gov/news', post.sources[1]],
        };
        const reasons = validateGeneratedPostQuality(bad, body, {
            clusterRoutes: ['/guides/job-scams'],
        });
        expect(reasons.some((r) => r.includes('Malformed source host'))).toBe(true);
    });

    it('rejects duplicate source URLs', () => {
        const { post, body } = buildPassingPost();
        const dup: GeneratedPost = {
            ...post,
            sources: [post.sources[0], post.sources[0]],
        };
        const reasons = validateGeneratedPostQuality(dup, body, {
            clusterRoutes: ['/guides/job-scams'],
        });
        expect(reasons.some((r) => r.includes('Duplicate source URL'))).toBe(true);
    });

    it('rejects sources never referenced anywhere in the body', () => {
        const { post, body } = buildPassingPost();
        const unrelated: GeneratedPost = {
            ...post,
            sources: [
                'https://www.bbc.com/news/technology-99999',
                'https://www.reuters.com/world/asia-pacific/foobar-99999',
            ],
        };
        const reasons = validateGeneratedPostQuality(unrelated, body, {
            clusterRoutes: ['/guides/job-scams'],
        });
        expect(reasons.some((r) => r.includes('never referenced in the body'))).toBe(true);
    });

    it('rejects ungrounded claims when claimSupport is present', () => {
        const { post, body } = buildPassingPost();
        const claimedNumber = ' Australians lost $4.5 million to this scam last month. ';
        const bodyWithClaim = body + '\n\n' + claimedNumber;
        const withSupport: GeneratedPost = {
            ...post,
            // claimSupport doesn't cover the $4.5 million claim
            claimSupport: [
                { claim: 'Something else entirely', source: post.sources[0] },
            ],
        };
        const reasons = validateGeneratedPostQuality(withSupport, bodyWithClaim, {
            clusterRoutes: ['/guides/job-scams'],
        });
        expect(reasons.some((r) => r.includes('not in claimSupport'))).toBe(true);
    });

    it('passes a post with claimSupport that covers every claim', () => {
        const { post, body } = buildPassingPost();
        const claimedNumber = 'Australians lost $4.5 million to this scam last month.';
        const bodyWithClaim = body + '\n\n' + claimedNumber;
        const withSupport: GeneratedPost = {
            ...post,
            claimSupport: [
                { claim: claimedNumber, source: post.sources[0] },
            ],
        };
        const reasons = validateGeneratedPostQuality(withSupport, bodyWithClaim, {
            clusterRoutes: ['/guides/job-scams'],
        });
        expect(reasons).toEqual([]);
    });

    it('rejects claimSupport entries that cite sources not in the sources list', () => {
        const { post, body } = buildPassingPost();
        const withSupport: GeneratedPost = {
            ...post,
            claimSupport: [
                { claim: 'something', source: 'https://unrelated.example.com/article' },
            ],
        };
        const reasons = validateGeneratedPostQuality(withSupport, body, {
            clusterRoutes: ['/guides/job-scams'],
        });
        expect(reasons.some((r) => r.includes('not in the sources list'))).toBe(true);
    });
});

describe('validateGeneratedPostQuality — weekly long-form bar', () => {
    it('requires at least 3 sources', () => {
        const { post, body } = buildPassingPost();
        const bad: GeneratedPost = { ...post, sources: post.sources.slice(0, 2) };
        const reasons = validateGeneratedPostQuality(bad, body, { clusterRoutes: ['/guides/job-scams'] });
        expect(reasons.some((r) => /needs at least 3/.test(r))).toBe(true);
    });

    it('requires at least 5 distinct internal links', () => {
        const { post, body } = buildPassingPost();
        // Remove two internal links → 3 distinct remain (< 5).
        const stripped = body
            .replace('/have-i-been-scammed', 'x')
            .replace('/global-scam-reporting', 'x');
        const reasons = validateGeneratedPostQuality(post, stripped, { clusterRoutes: ['/guides/job-scams'] });
        expect(reasons.some((r) => /at least 5/.test(r))).toBe(true);
    });

    it('requires an FAQ with at least 5 questions', () => {
        const { post, body } = buildPassingPost();
        const noQuestions = body.replace(/\?/g, '.');
        const reasons = validateGeneratedPostQuality(post, noQuestions, { clusterRoutes: ['/guides/job-scams'] });
        expect(reasons.some((r) => /FAQ too thin/.test(r))).toBe(true);
    });

    it('rejects a weak/generic AI intro', () => {
        const { post, body } = buildPassingPost();
        const weak = "In today's digital age, scams are everywhere.\n\n" + body;
        const reasons = validateGeneratedPostQuality(post, weak, { clusterRoutes: ['/guides/job-scams'] });
        expect(reasons.some((r) => /Weak\/generic intro/.test(r))).toBe(true);
    });

    it('requires at least 3 concrete numbered action steps', () => {
        const { post, body } = buildPassingPost();
        // Neutralise the numbered list ("1." → "Step").
        const noSteps = body.replace(/^\s*\d+\.\s+/gm, 'Step: ');
        const reasons = validateGeneratedPostQuality(post, noSteps, { clusterRoutes: ['/guides/job-scams'] });
        expect(reasons.some((r) => /numbered action step/.test(r))).toBe(true);
    });
});
