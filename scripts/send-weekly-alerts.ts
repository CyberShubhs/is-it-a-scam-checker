/**
 * Weekly scam-alerts email sender.
 *
 * Usage (always safe by default — does NOT send unless told to):
 *   npx tsx scripts/send-weekly-alerts.ts                 # dry run (default)
 *   npx tsx scripts/send-weekly-alerts.ts --dry-run       # dry run, explicit
 *   npx tsx scripts/send-weekly-alerts.ts --test [email]  # send ONLY to the
 *       admin/test address (arg, else ADMIN_TEST_EMAIL env) via the
 *       transactional API — the segment/audience is never touched
 *   npx tsx scripts/send-weekly-alerts.ts --send          # REAL broadcast to
 *       the confirmed Resend segment/audience (unsubscribed are excluded by
 *       Resend; every email carries a one-click unsubscribe link)
 *
 * Content comes ONLY from published blog frontmatter (title/summary/date).
 * Nothing user-submitted (reports, scans, addresses, numbers, IPs) can reach
 * a campaign. Posts older than 8 days are skipped; with no fresh post the run
 * exits cleanly without sending — a failed blog week never emails stale news.
 *
 * Env: RESEND_API_KEY, RESEND_FROM_EMAIL, RESEND_AUDIENCE_ID
 *      (+ ADMIN_TEST_EMAIL for --test without an argument)
 */

import * as fs from 'fs';
import * as path from 'path';
import matter from 'gray-matter';
import {
    selectRecentPosts,
    buildWeeklyAlertEmail,
    sendWeeklyBroadcast,
    sendAdminTestEmail,
    countAudience,
    type WeeklyPostItem,
} from '../src/lib/email/weeklyAlerts';

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog');

function loadPosts(): WeeklyPostItem[] {
    const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.mdx'));
    const posts: WeeklyPostItem[] = [];
    for (const file of files) {
        const raw = fs.readFileSync(path.join(BLOG_DIR, file), 'utf8');
        const { data } = matter(raw);
        if (typeof data.title !== 'string' || typeof data.summary !== 'string') continue;
        const date = typeof data.updated === 'string' ? data.updated : data.date;
        if (typeof date !== 'string') continue;
        posts.push({
            slug: file.replace(/\.mdx$/, ''),
            title: data.title,
            summary: data.summary,
            date,
        });
    }
    return posts;
}

type Mode = 'dry-run' | 'test' | 'send';

function parseArgs(argv: string[]): { mode: Mode; testEmail?: string } {
    if (argv.includes('--send')) return { mode: 'send' };
    const testIdx = argv.indexOf('--test');
    if (testIdx !== -1) {
        const next = argv[testIdx + 1];
        const testEmail =
            next && !next.startsWith('--') ? next : process.env.ADMIN_TEST_EMAIL;
        return { mode: 'test', testEmail };
    }
    return { mode: 'dry-run' };
}

async function main() {
    const { mode, testEmail } = parseArgs(process.argv.slice(2));
    console.log(`[weekly-alerts] mode: ${mode}`);

    const recent = selectRecentPosts(loadPosts());
    if (recent.length === 0) {
        console.log(
            '[weekly-alerts] skipped: no blog posts published in the last 8 days — nothing to send.',
        );
        return;
    }

    console.log(`[weekly-alerts] selected ${recent.length} post(s):`);
    for (const p of recent) {
        console.log(`  - [${p.date}] ${p.title}  (/blog/${p.slug})`);
    }

    const email = buildWeeklyAlertEmail(recent);
    console.log(`[weekly-alerts] subject: ${email.subject}`);

    if (mode === 'dry-run') {
        const audience = await countAudience();
        if (audience.ok && audience.count) {
            const { subscribed, unsubscribed, hasMore } = audience.count;
            console.log(
                `[weekly-alerts] recipients: ${subscribed} subscribed` +
                    ` (${unsubscribed} unsubscribed are excluded by Resend)` +
                    (hasMore ? ' — first page only, real count is higher' : ''),
            );
        } else {
            console.log(
                `[weekly-alerts] recipients: unavailable (${audience.ok ? 'n/a' : audience.reason}) — set RESEND_* env to count.`,
            );
        }
        console.log('[weekly-alerts] dry run complete — nothing was sent.');
        return;
    }

    if (mode === 'test') {
        if (!testEmail) {
            console.error(
                '[weekly-alerts] failed: --test needs an email argument or ADMIN_TEST_EMAIL env.',
            );
            process.exitCode = 1;
            return;
        }
        const result = await sendAdminTestEmail(email, testEmail);
        if (!result.ok) {
            console.error(`[weekly-alerts] failed: test send (${result.reason}).`);
            process.exitCode = 1;
        }
        return;
    }

    // mode === 'send' — the real broadcast.
    const result = await sendWeeklyBroadcast(email);
    if (!result.ok) {
        console.error(`[weekly-alerts] failed: broadcast (${result.reason}).`);
        process.exitCode = 1;
        return;
    }
    console.log('[weekly-alerts] done.');
}

main().catch((err) => {
    // Never print provider payloads — message only.
    console.error('[weekly-alerts] fatal:', err instanceof Error ? err.message : 'unknown error');
    process.exitCode = 1;
});
