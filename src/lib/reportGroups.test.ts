import { describe, it, expect, vi, beforeEach } from 'vitest';

const reportFindMany = vi.fn();
const voteGroupBy = vi.fn();
vi.mock('./db', () => ({
    prisma: {
        report: { findMany: (...a: unknown[]) => reportFindMany(...a) },
        reportVote: { groupBy: (...a: unknown[]) => voteGroupBy(...a) },
    },
}));

import { getGroupedReports, getVoteTallies } from './reportGroups';

beforeEach(() => {
    reportFindMany.mockReset();
    voteGroupBy.mockReset();
    voteGroupBy.mockResolvedValue([]);
});

describe('getGroupedReports', () => {
    it('groups repeated reports of the same value into one "Reported by N people" card', async () => {
        const now = new Date();
        reportFindMany.mockResolvedValueOnce([
            { type: 'url', value_raw: 'https://scam.example/a', value_normalised: 'scam.example', country: 'AU', created_at: now },
            { type: 'url', value_raw: 'https://scam.example/b', value_normalised: 'scam.example', country: 'AU', created_at: now },
            { type: 'url', value_raw: 'https://scam.example/c', value_normalised: 'scam.example', country: 'US', created_at: now },
            { type: 'phone', value_raw: '+61400000000', value_normalised: '61400000000', country: 'AU', created_at: now },
        ]);
        voteGroupBy.mockResolvedValueOnce([
            { value_normalised: 'scam.example', vote_type: 'HELPFUL', _count: { _all: 2 } },
        ]);

        const groups = await getGroupedReports({ sort: 'top' });
        expect(groups[0].groupKey).toBe('scam.example');
        expect(groups[0].count).toBe(3); // three reports collapsed into one
        expect(groups[0].helpfulCount).toBe(2);
        // A different value stays a separate group.
        expect(groups.find((g) => g.type === 'phone')?.count).toBe(1);
    });

    it('returns [] when the report query fails', async () => {
        reportFindMany.mockRejectedValueOnce(new Error('db down'));
        expect(await getGroupedReports()).toEqual([]);
    });
});

describe('getVoteTallies', () => {
    it('maps HELPFUL / SEEN_TOO group counts per value', async () => {
        voteGroupBy.mockResolvedValueOnce([
            { value_normalised: 'a.com', vote_type: 'HELPFUL', _count: { _all: 4 } },
            { value_normalised: 'a.com', vote_type: 'SEEN_TOO', _count: { _all: 7 } },
        ]);
        const tallies = await getVoteTallies(['a.com', 'b.com']);
        expect(tallies.get('a.com')).toEqual({ helpful: 4, seen: 7 });
        expect(tallies.get('b.com')).toBeUndefined();
    });

    it('returns an empty map on DB error', async () => {
        voteGroupBy.mockRejectedValueOnce(new Error('nope'));
        const tallies = await getVoteTallies(['x']);
        expect(tallies.size).toBe(0);
    });
});
