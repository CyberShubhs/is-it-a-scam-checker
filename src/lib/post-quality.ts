/**
 * Deterministic quality gate for auto-generated blog posts.
 *
 * Used both by `scripts/generate-scam-post.ts` (rejects bad posts before they
 * land on disk) and by `scripts/check-blog-quality.mjs` (rejects bad posts
 * already on disk so CI fails until they're fixed or removed).
 */

/**
 * One claim → source note. The generator must emit one entry for every
 * statistic, dollar amount, agency warning, or named incident in the body,
 * each tied to the source URL that supports it.
 */
export interface ClaimSupport {
    /** Exact phrase or sentence from the body that makes the factual claim. */
    claim: string;
    /** URL from the `sources` array that backs this claim (legacy). */
    source?: string;
    /** Registry source ID that backs this claim (preferred). */
    sourceId?: string;
}

export interface GeneratedPost {
    title: string;
    summary: string;
    tags: string[];
    sources: string[];
    body: string;

    /** Optional schema-ready fields the generator now produces. */
    updated?: string;
    category?: string;
    primaryKeyword?: string;
    /** 3-6 closely related search phrases (weekly long-form posts). */
    secondaryKeywords?: string[];
    searchIntent?: 'informational' | 'commercial' | 'transactional' | 'navigational';
    audience?: string;
    region?: string;
    author?: string;
    reviewer?: string;
    lastReviewed?: string;
    /** Per-claim support notes. */
    claimSupport?: ClaimSupport[];
    /** When sourced from the FindQuestions bank, the question's stable ID. */
    questionId?: string;
    /**
     * Registry source IDs the AI was told to use. This is the canonical
     * citation surface now — the legacy `sources` (URL strings) field is
     * still accepted to keep older fixtures parseable, but the generator
     * always resolves `sourceIds` first and uses URLs for `sources`.
     */
    sourceIds?: string[];
}

/**
 * The exact H2 headings every auto-generated post must contain. The match is
 * case-insensitive and tolerates leading whitespace and trailing punctuation.
 */
export const REQUIRED_HEADINGS = [
    '## How This Scam Works',
    '## Who Is Being Targeted',
    '## Red Flags to Watch For',
    '## What to Do Before You Click, Reply, or Pay',
    "## What to Do If You've Already Been Affected",
    '## Where to Report',
    // Weekly long-form posts must answer real follow-up questions.
    '## Frequently Asked Questions',
    '## Related Scam Checker pages',
] as const;

/**
 * Internal Scam Checker routes the generator can link to. A post must contain
 * at least two of these and at least one cluster-specific link.
 */
/**
 * Primary checker (tool) routes. A compliant post must link to at least one of
 * these — that's the "clear scam-check CTA" the quality gate enforces. The
 * recovery checklist counts because it's the right CTA for "already affected"
 * readers.
 */
/**
 * Filler openers that mark a weak, generic AI intro. If any appears in the
 * post's introduction (before the first H2), the post is rejected. Lower-case.
 */
export const GENERIC_INTRO_PATTERNS = [
    "in today's digital age",
    "in today's digital landscape",
    "in today's digital world",
    'in this article',
    'in this blog post',
    'in the world of',
    'in an increasingly digital',
    'with the rise of',
    'scams are on the rise',
    'we have all been there',
    "we've all been there",
    'have you ever wondered',
] as const;

export const PRIMARY_CHECKER_ROUTES = [
    '/check',
    '/check-scam-text',
    '/check-scam-email',
    '/check-scam-link',
    '/check-scam-ip',
    '/scam-website-checker',
    '/scam-phone-number-checker',
    '/crypto-scam-checker',
    '/scam-report-lookup',
    '/have-i-been-scammed',
] as const;

export const KNOWN_INTERNAL_ROUTES = [
    '/check',
    '/check-scam-text',
    '/check-scam-email',
    '/check-scam-link',
    '/scam-website-checker',
    '/scam-phone-number-checker',
    '/crypto-scam-checker',
    '/scam-checker-australia',
    '/scam-website-checker-uk',
    '/have-i-been-scammed',
    '/reports',
    '/reports/websites',
    '/reports/phone-numbers',
    '/reports/emails',
    '/reports/crypto-wallets',
    '/global-scam-reporting',
    '/guides/job-scams',
    '/guides/is-this-website-legit',
    '/guides/how-to-spot-a-fake-link',
    '/guides/email-phishing-examples',
    '/guides/scam-text-message-examples',
    '/guides/whatsapp-scams-examples',
    '/guides/bank-impersonation-scams',
    '/guides/ato-scam-text-email',
    '/guides/payid-scams-australia',
    '/guides/facebook-marketplace-scams',
    '/guides/parcel-delivery-scams-australia',
    '/guides/what-to-do-if-youve-been-scammed',
    '/blog/job-scams',
    '/blog/scam-alerts',
    '/blog/phishing',
    '/blog/fake-websites',
    '/blog/crypto-scams',
    '/blog/text-message-scams',
];

/** Obviously-fake placeholder URLs the generator should never emit. */
const PLACEHOLDER_SOURCE_PATTERNS = [
    'example.com',
    'example.org',
    'example.net',
    'yourdomain',
    'placeholder',
    'lorem',
    'foo.bar',
    'xxxxx',
];

/**
 * Patterns that indicate a malformed URL host. Hit during a real auto-blog
 * post (2026-05-21 government-grant) where the AI emitted `www.www.ftc.gov`.
 */
const MALFORMED_HOST_PATTERNS: RegExp[] = [
    /^https?:\/\/www\.www\./i, // double www
    /^https?:\/\/\.+/i, // leading dots
    /^https?:\/\/[^/]*\s/, // whitespace in host
    /^https?:\/\/[^/]*--+\./, // double-dash in subdomain (typosquat-ish)
    /^https?:\/\/[^/]*\.\./, // double dot
];

/** Heuristic patterns that look like a statistic or named-incident claim. */
const CLAIM_PATTERNS: RegExp[] = [
    /[$£€¥₹]\s?\d[\d.,]*\s?(million|billion|m|bn|k|thousand)?/gi, // money
    /\b\d{1,3}(,\d{3})+\b/g, // big numbers with commas
    /\b\d+(\.\d+)?\s?(million|billion|thousand)\b/gi, // "4.5 million"
    /\bover\s+\d+\b/gi, // "over 4,000"
];

function hostnameOf(url: string): string {
    try {
        return new URL(url).hostname.toLowerCase();
    } catch {
        return '';
    }
}

/** Count meaningful words in a markdown body. */
export function countBodyWords(body: string): number {
    return body
        .replace(/```[\s\S]*?```/g, ' ') // strip fenced code
        .replace(/`[^`]*`/g, ' ') // strip inline code
        .replace(/!\[[^\]]*\]\([^)]+\)/g, ' ') // strip image markdown
        .replace(/\[[^\]]*\]\([^)]+\)/g, ' ') // strip link markdown (counts the visible text via the next replace)
        .replace(/[#>*_\-`~]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length > 0).length;
}

export interface ValidationOptions {
    /** Cluster the post was assigned to. If provided, at least one of these routes must appear in the body. */
    clusterRoutes?: readonly string[];
    /** Lower this for tests that exercise the validator without a 800-word body. */
    minWordCount?: number;
}

/**
 * Returns an array of human-readable failure reasons. An empty array means
 * the post passes every gate.
 *
 * Gates (per the SEO follow-up instructions):
 *   - body word count >= 800
 *   - at least 3 valid http(s) source URLs (no placeholders)
 *   - all REQUIRED_HEADINGS present (incl. an FAQ section)
 *   - at least 5 internal Scam Checker links
 *   - at least 1 link to a primary checker page (a clear scam-check CTA)
 *   - at least 1 cluster-specific internal link if a cluster is given
 *   - an FAQ with at least 5 questions
 *   - a strong, non-generic intro (no AI filler openers)
 *   - at least 3 concrete numbered action steps
 *   - title length 45..60 chars   (matches the rendered <title> ≤60 gate)
 *   - summary length 130..160 chars (matches the meta-description ≤160 gate)
 *   - no obvious placeholder source URLs
 *   - no single URL or internal route repeated more than 5 times (visual spam)
 *
 * These thresholds are the WEEKLY long-form bar (1,500+ words, 5 links, FAQ).
 * They gate only freshly generated posts; the corpus baseline in
 * scripts/check-blog-quality.mjs stays laxer so existing posts aren't
 * retroactively failed.
 */
export function validateGeneratedPostQuality(
    post: GeneratedPost,
    body: string,
    options: ValidationOptions = {},
): string[] {
    const reasons: string[] = [];
    // Weekly flagship floor. Target is 1,800-2,800 (see the generator prompt);
    // 1,500 is the hard minimum-useful-depth gate, with margin below target.
    const minWordCount = options.minWordCount ?? 1500;

    // Word count
    const wc = countBodyWords(body);
    if (wc < minWordCount) {
        reasons.push(`Body is ${wc} words; needs at least ${minWordCount}.`);
    }

    // Sources — must be valid http(s), well-formed host, non-placeholder,
    // and non-duplicate. Hit on real auto-published posts (e.g. 2026-05-21
    // government-grant) emitting `www.www.ftc.gov`.
    const validSources = (post.sources || []).filter(
        (s) => typeof s === 'string' && /^https?:\/\//i.test(s.trim()),
    );
    if (validSources.length < 3) {
        reasons.push(`Only ${validSources.length} valid source URL(s); needs at least 3.`);
    }
    const seenSources = new Set<string>();
    for (const src of post.sources || []) {
        const trimmed = (src || '').trim();
        const lower = trimmed.toLowerCase();
        for (const bad of PLACEHOLDER_SOURCE_PATTERNS) {
            if (lower.includes(bad)) {
                reasons.push(`Placeholder source URL detected: ${src}`);
                break;
            }
        }
        for (const re of MALFORMED_HOST_PATTERNS) {
            if (re.test(trimmed)) {
                reasons.push(`Malformed source host (likely a generator typo): ${src}`);
                break;
            }
        }
        const host = hostnameOf(trimmed);
        if (host.startsWith('www.www.')) {
            // Double-safety in case the regex above misses an edge case.
            reasons.push(`Malformed source host (double www): ${src}`);
        }
        if (seenSources.has(lower)) {
            reasons.push(`Duplicate source URL: ${src}`);
        }
        seenSources.add(lower);
    }

    // Source relevance — every source host must appear referenced somewhere
    // in the body (raw URL OR hostname mention) so a post can't cite an
    // unrelated authority page just to look credible.
    if (validSources.length >= 2) {
        const bodyLowerForRel = body.toLowerCase();
        for (const src of validSources) {
            const host = hostnameOf(src).replace(/^www\./, '');
            if (!host) continue;
            const base = host.split('.').slice(-2).join('.'); // e.g. ftc.gov
            const referenced =
                bodyLowerForRel.includes(host) ||
                bodyLowerForRel.includes(base) ||
                bodyLowerForRel.includes(src.toLowerCase());
            if (!referenced) {
                reasons.push(
                    `Source ${src} is never referenced in the body — likely an unrelated authority cite.`,
                );
            }
        }
    }

    // Ungrounded claims — every dollar amount / big number in the body must
    // be backed by a claimSupport entry whose source is one of the cited
    // URLs. Skipped when claimSupport is absent (back-compat for old posts).
    if (Array.isArray(post.claimSupport)) {
        const claimSet = new Set(post.claimSupport.map((c) => c.claim.toLowerCase()));
        // claimSupport entries may reference either a raw URL (legacy
        // posts) OR a registry sourceId (new posts). We only check the URL
        // form here; sourceId references are validated separately by the
        // source-registry layer before write-time.
        const claimSourceHosts = new Set(
            post.claimSupport
                .filter((c) => typeof c.source === 'string')
                .map((c) => hostnameOf(c.source as string).replace(/^www\./, ''))
                .filter(Boolean),
        );
        const validSourceHosts = new Set(
            validSources.map((s) => hostnameOf(s).replace(/^www\./, '')),
        );
        // Every claimSupport source URL must be in the post's source list.
        for (const host of claimSourceHosts) {
            if (!validSourceHosts.has(host)) {
                reasons.push(
                    `claimSupport references host ${host} which is not in the sources list.`,
                );
            }
        }
        // Every detectable statistic must have a claimSupport entry that
        // contains it (substring match — generous on purpose).
        const detectedClaims = new Set<string>();
        for (const re of CLAIM_PATTERNS) {
            for (const m of body.matchAll(re)) {
                detectedClaims.add(m[0].toLowerCase());
            }
        }
        for (const detected of detectedClaims) {
            const supported = [...claimSet].some((c) => c.includes(detected));
            if (!supported) {
                reasons.push(
                    `Claim "${detected}" appears in the body but is not in claimSupport.`,
                );
            }
        }
    }

    // Required headings
    const bodyLower = body.toLowerCase();
    for (const heading of REQUIRED_HEADINGS) {
        if (!bodyLower.includes(heading.toLowerCase())) {
            reasons.push(`Missing required heading: ${heading}`);
        }
    }

    // Internal links (count occurrences in markdown link form: ](/path))
    const internalLinkMatches = body.match(/\]\(\/[a-zA-Z0-9_\-/]*/g) || [];
    const internalRouteHits = new Set<string>();
    const internalRouteCounts = new Map<string, number>();
    for (const raw of internalLinkMatches) {
        const route = raw.slice(2); // strip "]("
        internalRouteHits.add(route);
        internalRouteCounts.set(route, (internalRouteCounts.get(route) ?? 0) + 1);
    }
    if (internalRouteHits.size < 5) {
        reasons.push(
            `Only ${internalRouteHits.size} distinct internal Scam Checker link(s); needs at least 5.`,
        );
    }

    // Clear scam-check CTA — the post must point readers at a checker tool, not
    // just other articles. (A recovery checklist counts as a CTA too.)
    const hasCheckerCta = [...internalRouteHits].some((hit) =>
        PRIMARY_CHECKER_ROUTES.some((route) => hit === route || hit.startsWith(route + '/')),
    );
    if (!hasCheckerCta) {
        reasons.push(
            `No scam-check CTA: link to at least one checker page (e.g. ${PRIMARY_CHECKER_ROUTES.slice(0, 3).join(', ')}).`,
        );
    }

    // Cluster-specific internal link
    if (options.clusterRoutes && options.clusterRoutes.length > 0) {
        const hasCluster = options.clusterRoutes.some((route) =>
            [...internalRouteHits].some(
                (hit) => hit === route || hit.startsWith(route + '/') || hit.startsWith(route + '?') || hit.startsWith(route + '#'),
            ),
        );
        if (!hasCluster) {
            reasons.push(
                `No cluster-specific internal link. Expected one of: ${options.clusterRoutes.join(', ')}`,
            );
        }
    }

    // Title length — capped at 60 so the rendered <title> never trips the
    // ">60 chars" rendered-SEO gate (which previously let 63-char titles ship).
    const titleLen = (post.title || '').length;
    if (titleLen < 45 || titleLen > 60) {
        reasons.push(`Title length ${titleLen} chars; must be 45-60.`);
    }

    // Summary length — capped at 160 to match the meta-description ≤160 gate
    // (which previously let a 163-char description ship).
    const summaryLen = (post.summary || '').length;
    if (summaryLen < 130 || summaryLen > 160) {
        reasons.push(`Summary length ${summaryLen} chars; must be 130-160.`);
    }

    // FAQ depth — the "## Frequently Asked Questions" heading is already
    // required above; here we confirm it actually contains questions. We count
    // question marks across the body (real FAQs have ≥5; prose rarely does).
    const questionCount = (body.match(/\?/g) || []).length;
    if (questionCount < 5) {
        reasons.push(`FAQ too thin: found ${questionCount} question(s); need an FAQ with at least 5.`);
    }

    // Weak / generic intro — reject the AI filler openers that signal a thin
    // post. We only scan the intro (before the first H2 heading).
    const intro = body.split(/\n##\s/)[0].toLowerCase();
    for (const phrase of GENERIC_INTRO_PATTERNS) {
        if (intro.includes(phrase)) {
            reasons.push(`Weak/generic intro: opens with filler phrase "${phrase}".`);
            break;
        }
    }

    // Concrete user action steps — a useful post tells people what to do. Require
    // at least 3 numbered list items (the "what to do" / verification steps).
    const numberedSteps = (body.match(/^\s*\d+\.\s+\S/gm) || []).length;
    if (numberedSteps < 3) {
        reasons.push(`Only ${numberedSteps} numbered action step(s); need at least 3 concrete steps.`);
    }

    // Repetitive linking — same internal route used > 5 times = visual spam.
    for (const [route, count] of internalRouteCounts.entries()) {
        if (count > 5) {
            reasons.push(`Internal route ${route} repeated ${count} times; cap is 5.`);
        }
    }

    // Repetitive source URL usage in body
    const urlMatches = body.match(/https?:\/\/[^\s)\]]+/g) || [];
    const urlCounts = new Map<string, number>();
    for (const u of urlMatches) {
        const cleaned = u.replace(/[.,;:!?)]+$/, '');
        urlCounts.set(cleaned, (urlCounts.get(cleaned) ?? 0) + 1);
    }
    for (const [url, count] of urlCounts.entries()) {
        if (count > 5) {
            reasons.push(`External URL ${url} repeated ${count} times in body; cap is 5.`);
        }
    }

    return reasons;
}
