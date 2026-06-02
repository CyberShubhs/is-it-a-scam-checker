import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the Prisma client so the matcher can be tested without a live database.
const count = vi.fn();
const findMany = vi.fn();
const voteGroupBy = vi.fn();
vi.mock('./db', () => ({
    prisma: {
        report: { count: (...a: unknown[]) => count(...a), findMany: (...a: unknown[]) => findMany(...a) },
        reportVote: { groupBy: (...a: unknown[]) => voteGroupBy(...a) },
    },
}));

import { matchCommunityReports } from './reportMatching';

beforeEach(() => {
    count.mockReset();
    findMany.mockReset();
    voteGroupBy.mockReset();
    voteGroupBy.mockResolvedValue([]); // no votes by default
});

describe('matchCommunityReports', () => {
    it('finds a reported domain and summarises counts + risk contribution', async () => {
        // Promise.all order per item: [count(total), count(30d), findMany(examples)].
        count.mockResolvedValueOnce(7).mockResolvedValueOnce(4);
        findMany.mockResolvedValueOnce([
            { type: 'url', value_raw: 'https://fake-bank.co/login', created_at: new Date() },
        ]);

        const matches = await matchCommunityReports([{ type: 'url', value: 'https://login.fake-bank.co/x' }]);

        expect(matches).toHaveLength(1);
        expect(matches[0].entityType).toBe('domain');
        expect(matches[0].value).toBe('fake-bank.co');
        expect(matches[0].count).toBe(7);
        expect(matches[0].count30d).toBe(4);
        // 4 reports in 30 days → +30 contribution band.
        expect(matches[0].riskContribution).toBe(30);
        // Grouping key is the registrable domain (also the vote key).
        expect(matches[0].groupKey).toBe('fake-bank.co');

        // The query must OR the precise columns with the legacy value_normalised.
        const where = count.mock.calls[0][0].where;
        const keys = where.OR.flatMap((c: Record<string, unknown>) => Object.keys(c));
        expect(keys).toContain('registrable_domain');
        expect(keys).toContain('hostname');
        expect(keys).toContain('value_normalised');
    });

    it('finds a reported phone number by normalised digits', async () => {
        count.mockResolvedValueOnce(2).mockResolvedValueOnce(2);
        findMany.mockResolvedValueOnce([
            { type: 'phone', value_raw: '+61400123456', created_at: new Date() },
        ]);

        const matches = await matchCommunityReports([{ type: 'phone', value: '+61 400 123 456' }]);

        expect(matches).toHaveLength(1);
        expect(matches[0].entityType).toBe('phone');
        expect(matches[0].count).toBe(2);
        expect(matches[0].riskContribution).toBe(15); // 1-2 in 30 days → +15

        const where = count.mock.calls[0][0].where;
        const keys = where.OR.flatMap((c: Record<string, unknown>) => Object.keys(c));
        expect(keys).toContain('phone_normalised');
        expect(keys).toContain('value_normalised');
    });

    it('returns no matches when nothing is reported (drives the "no reports" message)', async () => {
        count.mockResolvedValue(0);
        findMany.mockResolvedValue([]);

        const matches = await matchCommunityReports([{ type: 'email', value: 'unknown@nowhere.example' }]);
        expect(matches).toEqual([]);
    });

    it('attaches helpful / seen-too vote tallies to a match', async () => {
        count.mockResolvedValueOnce(5).mockResolvedValueOnce(5);
        findMany.mockResolvedValueOnce([
            { type: 'url', value_raw: 'https://scam.example/x', created_at: new Date() },
        ]);
        voteGroupBy.mockResolvedValueOnce([
            { value_normalised: 'scam.example', vote_type: 'HELPFUL', _count: { _all: 3 } },
            { value_normalised: 'scam.example', vote_type: 'SEEN_TOO', _count: { _all: 9 } },
        ]);

        const matches = await matchCommunityReports([{ type: 'url', value: 'https://scam.example/x' }]);
        expect(matches[0].helpfulCount).toBe(3);
        expect(matches[0].seenCount).toBe(9);
    });
});
