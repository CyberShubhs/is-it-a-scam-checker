/**
 * Central SEO route registry — STABLE last-modified dates.
 *
 * Why this exists: src/app/sitemap.ts previously used `new Date()` for every
 * static / hub / report / tool / blog-category route. That stamped every page
 * as "modified today" on each deploy, which trains Google to distrust our
 * <lastmod> signal (real edits become indistinguishable from redeploys).
 *
 * Instead, each route gets a hard-coded `lastModified` date here that is only
 * bumped when the page's CONTENT meaningfully changes — never automatically.
 * Guides and blog posts are NOT listed here: they already derive a stable
 * timestamp from their own frontmatter/data (`date` / `updated`).
 *
 * When you ship a real content change to one of these routes, update its date
 * below in the same commit.
 */

/** Fallback when a route isn't explicitly listed (keeps <lastmod> stable). */
export const SEO_DEFAULT_LAST_MODIFIED = '2026-05-29';

/**
 * Route path → ISO date (YYYY-MM-DD) of last meaningful content change.
 * Keys are pathnames exactly as they appear in the sitemap ('' = home).
 */
export const ROUTE_LAST_MODIFIED: Record<string, string> = {
    // Home + primary checker — refreshed in the 2026-06 SEO sprint.
    '': '2026-06-02',
    '/check': '2026-06-02',

    // Priority tool pages (metadata refreshed in the 2026-06 sprint).
    '/scam-website-checker': '2026-06-02',
    '/scam-phone-number-checker': '2026-06-02',
    '/crypto-scam-checker': '2026-06-02',

    // Other tool / checker pages.
    '/check-scam-text': '2026-05-29',
    '/check-scam-email': '2026-05-29',
    '/check-scam-link': '2026-05-29',
    '/scam-checker-australia': '2026-05-29',
    '/scam-website-checker-uk': '2026-05-29',

    // IP reputation + report lookup (added 2026-06).
    '/check-scam-ip': '2026-06-01',
    '/scam-report-lookup': '2026-06-01',

    // Weekly scam-alerts email landing page.
    '/weekly-scam-alerts': '2026-06-11',

    // Conversion / recovery surfaces.
    '/have-i-been-scammed': '2026-05-29',
    '/i-got-a-scam-message': '2026-05-29',
    '/global-scam-reporting': '2026-05-29',
    '/reports': '2026-06-02', // grouped reports + voting shipped 2026-06
    '/guides': '2026-05-29',
    '/blog': '2026-05-29',

    // Trust / policy pages.
    '/about': '2026-05-29',
    '/author/shubham-singla': '2026-05-29',
    '/how-it-works': '2026-05-29',
    '/contact': '2026-06-02', // contact page rebuilt in the 2026-06 sprint
    '/privacy': '2026-05-29',
    '/terms': '2026-05-29',
    '/disclaimer': '2026-05-29',
    '/cookies': '2026-05-29',
    '/security': '2026-05-29',
    '/data-removal': '2026-05-29',
    '/responsible-disclosure': '2026-05-29',

    // Topical hubs.
    '/scam-types': '2026-05-29',
    '/scam-examples': '2026-05-29',
    '/scam-guides': '2026-05-29',
    '/scam-tools': '2026-05-29',
    '/latest-scams': '2026-05-29',
    '/report-a-scam': '2026-05-29',

    // Report category hubs (live data; <changefreq> conveys freshness, not lastmod).
    '/reports/websites': '2026-05-30',
    '/reports/phone-numbers': '2026-05-30',
    '/reports/emails': '2026-05-30',
    '/reports/crypto-wallets': '2026-05-30',
    '/reports/latest': '2026-05-30',
    '/reports/trending': '2026-05-30',
};

/**
 * Resolve a stable `lastModified` Date for a sitemap route. Unknown routes get
 * the shared default so a forgotten entry still produces a stable (not
 * deploy-time) timestamp.
 */
export function lastModifiedFor(path: string): Date {
    return new Date(ROUTE_LAST_MODIFIED[path] ?? SEO_DEFAULT_LAST_MODIFIED);
}
