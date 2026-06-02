/**
 * Blog slug policy.
 *
 * URL policy (see docs/url-policy.md):
 *   - Evergreen guides:  /guides/{short-topic-slug}      (no date, no hash)
 *   - Tool pages:        /{primary-keyword}
 *   - Country pages:     /{keyword}-{country}
 *   - Report hubs:       /reports/{entity-type}
 *   - Fresh alerts:      /blog/{date}-{topical-slug}      (date kept; alerts are
 *                        genuinely time-sensitive — but NO opaque hash suffix)
 *
 * Previously auto-generated alert filenames appended a random 6-hex-char hash
 * (`...-662152.mdx`) purely to avoid filename collisions. That produced ugly,
 * opaque URLs. We now build a clean, readable slug and only append a short
 * numeric disambiguator (`-2`, `-3`) on an actual collision.
 */

/** Lower-case, hyphenated slug from arbitrary text. */
export function slugifyTitle(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

/**
 * Build a clean, collision-safe blog slug: `${date}-${short-title-slug}`, with
 * a numeric suffix appended ONLY when that slug already exists.
 *
 * @param date          ISO date prefix (YYYY-MM-DD) — kept because alerts are
 *                      time-sensitive.
 * @param title         Post title.
 * @param existingSlugs Slugs already on disk (without the `.mdx` extension).
 */
export function buildCleanBlogSlug(
    date: string,
    title: string,
    existingSlugs: Iterable<string>,
): string {
    const existing = new Set(existingSlugs);
    // Cap the title portion so the full path stays a sensible length.
    const short = slugifyTitle(title).slice(0, 60).replace(/-+$/, '');
    const base = `${date}-${short}`;
    if (!existing.has(base)) return base;
    let n = 2;
    while (existing.has(`${base}-${n}`)) n += 1;
    return `${base}-${n}`;
}
