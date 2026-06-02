/**
 * Grouped community reports + vote tallies.  SERVER-SIDE (Prisma).
 * ──────────────────────────────────────────────────────────────────────────
 * Reports are grouped by their normalised value so that eight separate reports
 * of "example-scam.com" collapse into one card that says "Reported by 8
 * people". Each group carries its helpful / seen-too vote tallies.
 *
 * All raw values are masked with the canonical /reports masker before leaving
 * the server, so reporter input is never echoed back.
 */

import { prisma } from './db';
import { maskReportValue } from './redact';

export const VOTE_TYPES = ['HELPFUL', 'SEEN_TOO'] as const;
export type VoteType = (typeof VOTE_TYPES)[number];

export interface GroupedReport {
    type: string;
    /** Grouping key (Report.value_normalised) — also the vote key. */
    groupKey: string;
    /** Masked, display-safe representative value. */
    maskedValue: string;
    /** How many people reported this value. */
    count: number;
    lastReportedAt: string;
    country: string | null;
    helpfulCount: number;
    seenCount: number;
}

export interface VoteTally {
    helpful: number;
    seen: number;
}

/**
 * Fetch helpful / seen-too tallies for a set of normalised values in one query.
 * Returns a map keyed by value_normalised. Never throws — a DB hiccup yields an
 * empty map so callers degrade to zero counts.
 */
export async function getVoteTallies(keys: string[]): Promise<Map<string, VoteTally>> {
    const out = new Map<string, VoteTally>();
    const unique = Array.from(new Set(keys.filter(Boolean)));
    if (unique.length === 0) return out;
    try {
        const rows = await prisma.reportVote.groupBy({
            by: ['value_normalised', 'vote_type'],
            where: { value_normalised: { in: unique } },
            _count: { _all: true },
        });
        for (const r of rows) {
            const tally = out.get(r.value_normalised) ?? { helpful: 0, seen: 0 };
            if (r.vote_type === 'HELPFUL') tally.helpful = r._count._all;
            else if (r.vote_type === 'SEEN_TOO') tally.seen = r._count._all;
            out.set(r.value_normalised, tally);
        }
    } catch {
        // Missing table / DB error → no tallies; callers show zero.
    }
    return out;
}

export type ReportSort = 'latest' | 'top' | 'helpful';

/**
 * Return community reports grouped by (type, value_normalised), with reported
 * counts, last-reported date and vote tallies. We pull a bounded window of
 * recent rows and group in memory — the report table is small and this keeps
 * the representative masked value + country without N extra queries.
 */
export async function getGroupedReports(
    opts: { sort?: ReportSort; limit?: number; windowSize?: number } = {},
): Promise<GroupedReport[]> {
    const { sort = 'latest', limit = 100, windowSize = 1000 } = opts;

    let rows: { type: string; value_raw: string; value_normalised: string; country: string; created_at: Date }[] = [];
    try {
        rows = await prisma.report.findMany({
            orderBy: { created_at: 'desc' },
            take: windowSize,
            select: { type: true, value_raw: true, value_normalised: true, country: true, created_at: true },
        });
    } catch {
        return [];
    }

    // Group by type + normalised value. Rows are newest-first, so the first
    // time we see a key it gives us the representative (latest) raw value.
    const groups = new Map<string, GroupedReport>();
    for (const r of rows) {
        const key = `${r.type}::${r.value_normalised}`;
        const existing = groups.get(key);
        if (existing) {
            existing.count += 1;
        } else {
            groups.set(key, {
                type: r.type,
                groupKey: r.value_normalised,
                maskedValue: maskReportValue(r.type, r.value_raw),
                count: 1,
                lastReportedAt: r.created_at.toISOString(),
                country: r.country || null,
                helpfulCount: 0,
                seenCount: 0,
            });
        }
    }

    const list = Array.from(groups.values());

    // Attach vote tallies.
    const tallies = await getVoteTallies(list.map((g) => g.groupKey));
    for (const g of list) {
        const t = tallies.get(g.groupKey);
        if (t) {
            g.helpfulCount = t.helpful;
            g.seenCount = t.seen;
        }
    }

    list.sort((a, b) => {
        if (sort === 'top') return b.count - a.count || b.lastReportedAt.localeCompare(a.lastReportedAt);
        if (sort === 'helpful') return b.helpfulCount - a.helpfulCount || b.count - a.count;
        return b.lastReportedAt.localeCompare(a.lastReportedAt); // latest
    });

    return list.slice(0, limit);
}
