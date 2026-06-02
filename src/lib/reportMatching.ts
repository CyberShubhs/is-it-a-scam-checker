/**
 * Community-report matching.  SERVER-SIDE (uses Prisma).
 * ──────────────────────────────────────────────────────────────────────────
 * Given the entities a user is checking (a URL/domain, an IP, an email, a
 * phone), find the community reports that match and summarise them into the
 * `RelatedReportMatch` shape the UI renders under the scan result.
 *
 * Matching is deliberately tolerant of the schema's history. Reports written
 * before the 2026-06 entity columns existed only have `value_normalised`
 * populated (registrable domain for URLs, domain for emails, digits for
 * phones). New reports also fill the precise `hostname` / `registrable_domain`
 * / `ip_address` / `email_domain` / `phone_normalised` columns. Every query
 * below ORs the new columns together with the legacy `value_normalised` so
 * BOTH old and new reports surface — we never lose the existing 200+ reports.
 *
 * Examples returned to the client are run through the same masking helper used
 * on the public /reports page, so raw reporter input is never echoed back.
 */

import { Prisma } from '@prisma/client';
import { prisma } from './db';
import { hostnameOf, registrableDomainOf, normalisePhone } from './entities';
import { maskReportValue } from './redact';
import { getVoteTallies } from './reportGroups';
import { communityReportContribution, RelatedReportMatch } from './scamScorer';

export interface IntelItem {
    type: string; // url | domain | website | ip | email | phone | sms
    value: string;
}

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

/** Build the Prisma `OR` clause + display value + grouping key for an entity. */
function buildWhere(
    item: IntelItem,
): { where: Prisma.ReportWhereInput; entityType: string; display: string; groupKey: string } | null {
    const type = item.type.toLowerCase();
    const value = item.value.trim();
    if (!value) return null;

    if (type === 'url' || type === 'domain' || type === 'website' || type === 'link') {
        const host = hostnameOf(value);
        const domain = registrableDomainOf(value);
        if (!host && !domain) return null;
        const or: Prisma.ReportWhereInput[] = [];
        if (host) or.push({ hostname: host });
        if (domain) {
            or.push({ registrable_domain: domain });
            or.push({ value_normalised: domain }); // legacy URL rows
        }
        const key = domain || host || value;
        return { where: { OR: or }, entityType: 'domain', display: key, groupKey: key };
    }

    if (type === 'ip') {
        return {
            where: { OR: [{ ip_address: value }, { value_normalised: value }] },
            entityType: 'ip',
            display: value,
            groupKey: value,
        };
    }

    if (type === 'email') {
        const email = value.toLowerCase();
        const domain = email.split('@')[1] || '';
        const or: Prisma.ReportWhereInput[] = [
            { value_raw: { equals: email, mode: 'insensitive' } }, // exact sender
        ];
        if (domain) {
            or.push({ email_domain: domain });
            or.push({ value_normalised: domain }); // legacy email rows
        }
        return { where: { OR: or }, entityType: 'email', display: domain ? `@${domain}` : email, groupKey: domain || email };
    }

    if (type === 'phone' || type === 'sms' || type === 'whatsapp') {
        const norm = normalisePhone(value);
        const digits = norm.replace(/\D/g, '');
        if (digits.length < 6) return null;
        return {
            where: {
                OR: [
                    { phone_normalised: norm },
                    { phone_normalised: digits },
                    { value_normalised: digits },
                ],
            },
            entityType: 'phone',
            display: maskReportValue('phone', value),
            groupKey: digits,
        };
    }

    return null;
}

/**
 * Match each item against the community reports table and summarise. Each item
 * costs a few cheap indexed equality counts; callers pass only a handful of
 * entities. Never throws — a DB hiccup yields an empty match list so scoring
 * continues.
 */
export async function matchCommunityReports(items: IntelItem[]): Promise<RelatedReportMatch[]> {
    const since = new Date(Date.now() - THIRTY_DAYS_MS);
    const out: RelatedReportMatch[] = [];
    const seen = new Set<string>();

    for (const item of items) {
        const built = buildWhere(item);
        if (!built) continue;

        // De-dupe identical entities (e.g. the same domain seen twice).
        const dedupeKey = `${built.entityType}:${built.display.toLowerCase()}`;
        if (seen.has(dedupeKey)) continue;
        seen.add(dedupeKey);

        try {
            const [count, count30d, examples] = await Promise.all([
                prisma.report.count({ where: built.where }),
                prisma.report.count({
                    where: { AND: [built.where, { created_at: { gt: since } }] },
                }),
                prisma.report.findMany({
                    where: built.where,
                    orderBy: { created_at: 'desc' },
                    take: 3,
                    select: { type: true, value_raw: true, created_at: true },
                }),
            ]);

            if (count === 0) continue;

            out.push({
                entityType: built.entityType,
                value: built.display,
                groupKey: built.groupKey,
                count,
                count30d,
                lastReportedAt: examples[0]?.created_at?.toISOString() ?? null,
                // Mask each example with the canonical /reports masker so raw
                // reporter input is never echoed back to the client.
                examples: examples.map((e) => ({
                    value: maskReportValue(e.type, e.value_raw),
                    type: e.type,
                    timeAgo: e.created_at.toISOString(),
                })),
                riskContribution: communityReportContribution(count30d),
                helpfulCount: 0,
                seenCount: 0,
            });
        } catch {
            // Skip this entity on a DB error; continue with the rest.
        }
    }

    // Attach helpful / seen-too vote tallies for all matched groups in one query.
    const tallies = await getVoteTallies(out.map((m) => m.groupKey));
    for (const m of out) {
        const t = tallies.get(m.groupKey);
        if (t) {
            m.helpfulCount = t.helpful;
            m.seenCount = t.seen;
        }
    }

    return out;
}
