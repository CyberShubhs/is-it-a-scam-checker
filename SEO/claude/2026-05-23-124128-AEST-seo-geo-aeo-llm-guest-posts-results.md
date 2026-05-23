# SEO / GEO / AEO / LLM / Guest Posts Pass — Results

Date: 2026-05-23 12:41:28 AEST (work completed by 13:05 AEST same day)
Project: `/Users/shubham/Projects/is-it-a-scam-checker`
Live site: `https://scamchecker.app`
Source instructions: `SEO/claude/2026-05-23-124128-AEST-seo-geo-aeo-llm-guest-posts-instructions.md`

## 1. Summary

This pass tightened five surfaces without adding bulk content:

1. **Auto-blog pipeline** — schema-ready frontmatter, generator JSON contract, deterministic validator extensions, source-reachability gate, and a CI workflow that runs every gate before commit.
2. **Blog page schema** — `BlogPosting` JSON-LD with `author`, `publisher`, `mainEntityOfPage`, `isAccessibleForFree`, `citation`, `keywords`, `articleSection`, `reviewedBy`. Twitter card metadata. Tested across every existing post.
3. **Site-wide structured data** — combined `Organization` + `WebSite` graph at the layout level; per-tool-page `WebApplication` schema on `/check`, `/scam-website-checker`, `/scam-phone-number-checker`, `/crypto-scam-checker`, `/scam-checker-australia`, `/scam-website-checker-uk`.
4. **`/llms.txt`** — rewritten to follow the Answer.AI proposal: H1, blockquote summary, notes, curated H2 sections with deep links. Robots-style directives removed. Hygiene tests enforce the shape.
5. **Guest post / digital PR plan** — full editorial-first plan written to `SEO/outreach/2026-05-23-guest-post-digital-pr-plan.md`.

One real malformed-source-URL bug was found in an existing auto-published post (`www.www.ftc.gov`) and fixed in-place. The new `scripts/check-blog-sources.mjs` deterministic gate would have rejected this post had it existed earlier — and now does, for every future generation.

**All required validation gates pass.** A `--soft --network` audit of the legacy corpus surfaced 137 dead source URLs in pre-existing auto-generated posts — these are documented but not fixed in this pass (the instruction file explicitly said not to do bulk content edits).

## 2. What changed

Files added:

- `src/lib/posts.test.ts` — 53-test suite covering `buildBlogPostingJsonLd` shape + every existing post produces a valid `BlogPosting` node.
- `scripts/check-blog-sources.mjs` — static + network source-URL validator with `--network`, `--soft`, `--changed-only` modes.
- `SEO/outreach/2026-05-23-guest-post-digital-pr-plan.md` — editorial-first PR plan (this pass's Task 6 deliverable).

Files modified:

- `.github/workflows/auto-blog.yml` — runs `npm run type-check && lint && test && test:links && test:seo && test:blog-quality && test:blog-sources` plus a `--changed-only --network` probe of the freshly generated MDX before committing. The commit step is gated on every check passing.
- `package.json` — added `test:blog-sources` script.
- `public/llms.txt` — rewritten to Answer.AI proposal format.
- `scripts/check-seo-hygiene.mjs` — now enforces (a) blog template wires `buildBlogPostingJsonLd`, (b) `posts.ts` builder emits `BlogPosting`/`publisher`/`mainEntityOfPage`/`citation`/`isAccessibleForFree`, (c) `/llms.txt` has H1+blockquote, required H2 sections, required links, no robots directives, no placeholders.
- `src/app/blog/[slug]/page.tsx` — replaced inline Article JSON-LD with `buildBlogPostingJsonLd(post)`; added Twitter card metadata; added `modifiedTime`, `authors`, `tags` to OpenGraph.
- `src/app/layout.tsx` — single `@graph` JSON-LD payload containing `Organization` + `WebSite` site-wide.
- `src/app/page.tsx` — removed the misleading `SearchAction` (no `/?q=` surface exists); replaced with a `WebApplication` node for the home checker; FAQ JSON-LD untouched.
- `src/app/scam-website-checker/page.tsx`, `src/app/scam-phone-number-checker/page.tsx`, `src/app/crypto-scam-checker/page.tsx`, `src/app/scam-checker-australia/page.tsx`, `src/app/scam-website-checker-uk/page.tsx` — added inline `WebApplication` JSON-LD that matches the visible tool description.
- `src/lib/posts.ts` — extended `PostFrontmatter` with the optional schema-ready fields (`updated`, `category`, `primaryKeyword`, `searchIntent`, `audience`, `region`, `author`, `reviewer`, `lastReviewed`); exported `buildBlogPostingJsonLd`.
- `src/lib/post-quality.ts` — added malformed-host detection (`www.www.`, double dots, whitespace in host), duplicate-source detection, source-relevance check (every source host must be referenced in the body), and `claimSupport`-based ungrounded-claim detection.
- `src/lib/post-quality.test.ts` — expanded from 13 to 19 tests; covers each new gate.
- `scripts/generate-scam-post.ts` — JSON contract now requires `primaryKeyword`, `searchIntent`, `audience`, `region`, `category`, and a `claimSupport` array; prompt now demands answer-first opening, single primary keyword, claim-by-claim source notes, and clean source hosts; MDX writer emits the new optional frontmatter and a `claimSupport:` YAML block.
- `content/blog/2026-05-21-ftc-warns-fake-government-grant-scam-targets-ameri-16d99e.mdx` — dropped two malformed `https://www.www.ftc.gov/...` source URLs; the post still cites valid `consumer.ftc.gov/...` sources.

## 3. What was intentionally not changed

- **Existing blog post content** — Task 5 (AEO audit) confirmed every required high-intent page already has answer-first content above the fold (the tool widget itself, the interactive assessment, or a direct-answer paragraph). No new "Quick answer" boilerplate added — would have produced repetition without user value.
- **Legacy AI-generated posts with dead source URLs** — the `--soft --network` audit found 137 dead source URLs across the pre-existing corpus. Per the hard constraint "Do not add a bulk set of new keyword pages" and the broader instruction not to do bulk content rewrites, these were left in place. The pipeline now prevents new ones via the CI `--changed-only --network` probe; a follow-up pass can rewrite or redirect the legacy posts.
- **GitHub Actions cron schedule** — Vercel platform hints recommended migrating to `vercel.json` crons. Not applicable: the workflow needs `git commit && git push` access to the repo and uses GitHub Secrets. Vercel Cron Jobs only hit Vercel-hosted endpoints. Documented as out of scope.
- **PR-based auto-blog mode** — see §5. Recommended (since fraud content is YMYL-adjacent) but not implemented in this pass to keep scope focused. The full gate set runs before commit, which is the next-best safeguard.
- **`FAQPage` schema on every blog** — explicitly avoided per the instruction file. Google deprecated FAQ rich results for most sites on May 7, 2026. The homepage retains its existing `FAQPage` graph because the FAQ is visible and substantial on that page.
- **Meta keywords** — not added. Google does not use them; pages already carry tag-based `keywords` inside the `BlogPosting` JSON-LD (which is appropriate).
- **`SearchAction` on the homepage `WebSite`** — *removed*. There is no `/?q=…` search surface, so the previous `SearchAction` was a content-mismatch. Schema must match visible content.

## 4. SEO/GEO/AEO findings

**Crawl & indexability** — clean. Previous pass's permanent redirects, `X-Robots-Tag` on `/_next/static`, and sitemap hygiene still hold (enforced by `npm run test:seo`).

**Structured data**
- Site-wide: combined `Organization` + `WebSite` graph in `layout.tsx`. No `SearchAction` (no matching UI).
- Home: `FAQPage` (visible Q&A) + `WebApplication` for the `/check` tool. No duplicate `WebSite` after the layout consolidation.
- Tool pages: `WebApplication` per page, with accurate `description`, `applicationCategory: SecurityApplication`, `operatingSystem: Web`, `isAccessibleForFree: true`, `offers.price: 0`. Australia/UK pages use the right currency and `inLanguage`.
- Blog: every post emits `BlogPosting` with `author`, `publisher`, `mainEntityOfPage`, `isAccessibleForFree`, `inLanguage`, `keywords`, `articleSection`, `citation` (from `sources`), `reviewedBy` when frontmatter sets `reviewer`. Tested across all 46 posts.
- Breadcrumbs: kept on the blog post template.

**Metadata** — every blog post page now also emits Twitter card metadata + OpenGraph `modifiedTime`, `authors`, `tags`. Canonical URLs unchanged.

**GEO (AI search/retrieval)** — `/llms.txt` rewritten to the Answer.AI proposal: H1, blockquote summary, notes, curated H2 sections (Primary Tools / Emergency Help / Scam Guides / Scam Reporting / Blog and Scam Alerts / About and Trust / Optional) each with deep links to canonical URLs. Robots-style directives removed. A hygiene test enforces the shape. Per Google's published guidance, this file is not a guaranteed ranking factor — it's a courtesy map for LLMs and agents.

**AEO (answer engines)** — audit complete:

| Page | Answer-first surface | Action |
|---|---|---|
| `/check` | H1 + 1-sentence purpose + ScamChecker widget above the fold | none |
| `/scam-website-checker` | H1 + paste-instruction + ScamChecker `defaultTab=url` | none |
| `/scam-phone-number-checker` | H1 + explicit "We do not run live carrier lookup or caller-ID verification" disclosure + ScamChecker | none — already meets "What this checker can and cannot verify" |
| `/crypto-scam-checker` | H1 + answer-first paste instructions + ScamChecker | none |
| `/scam-checker-australia` | H1 + AU-specific use cases + ScamChecker | none |
| `/scam-website-checker-uk` | H1 + UK-specific use cases + ScamChecker | none |
| `/have-i-been-scammed` | H1 + 3-question interactive assessment above the fold | none |
| `/guides/job-scams` | H1 + CTA card + Quick Verdict box + body opens with a direct answer | none |

No new "Quick answer" boilerplate added — it would have produced repetition. The audit decision and reasoning are documented here rather than as page edits.

**E-E-A-T (YMYL)** — schema now carries `author`, `publisher`, `reviewer`, and `lastReviewed`. The generator is required to emit `author: 'The Scam Checker Team'` and `reviewer: 'Shubham Singla'` going forward. The guest-post plan (§8) builds external authority signals.

## 5. Automated blog pipeline changes

The pipeline now looks like this:

```
GitHub Actions cron (06:00 UTC / 18:00 UTC)
  → npm ci
  → npx tsx scripts/generate-scam-post.ts
      → AI emits JSON with new schema-ready fields + claimSupport
      → validateGeneratedPostQuality (rejects malformed hosts, duplicate sources,
        unreferenced sources, ungrounded claims, missing headings, etc.)
      → existing dedupe (slug + title + summary + cluster + entities)
      → MDX written with optional frontmatter (updated, category, primaryKeyword,
        searchIntent, audience, region, author, reviewer, lastReviewed)
        and a claimSupport: YAML block
  → Pre-check: was a post actually generated?
  → Validate: type-check, lint, test --run, test:links, test:seo,
    test:blog-quality, test:blog-sources (static),
    test:blog-sources --network --changed-only (the new file only),
    build
  → If any gate fails, the workflow stops and does not commit.
  → If every gate passes, commit + push.
```

New deterministic gates added to `src/lib/post-quality.ts`:

- Malformed source hosts (`www.www.`, leading dot, double-dot, whitespace, hyphenated host typos).
- Duplicate source URLs inside one post.
- Source relevance: every source host must be referenced in the body (full URL or hostname mention).
- `claimSupport` audit: every dollar amount / large number in the body must appear in a `claimSupport` entry whose source is in the post's `sources` list.
- Title length 45–70 chars.
- Summary length 130–165 chars.
- 7 required H2 headings.
- ≥ 2 distinct internal links + ≥ 1 cluster-specific internal link.
- Internal/external URL repetition cap at 5.

New deterministic gates in `scripts/check-blog-sources.mjs`:

- Static: valid http(s), well-formed host, non-placeholder, non-duplicate.
- Network (CI / on-demand): `HEAD → GET-on-403/405/501`, 404/DNS = hard fail, 403 from known bot-blocking publishers = warning only.

**PR-mode recommendation:** keep `direct-to-main` for now, because the pre-commit gate set is comprehensive. *Suggested* future migration: move auto-blog to PR mode + auto-merge-on-green so a human can spot-check the answer-first opening + claim support before publish, since fraud content is YMYL-adjacent. Implementing PR mode well needs auto-merge config and label rules; deliberately deferred to keep this pass focused.

**Legacy 404 backlog (informational):** a one-time `--soft --network` audit found 137 dead source URLs in the existing corpus. Recommended follow-up: a separate dated pass that either (a) replaces dead source URLs with currently-reachable equivalents from the same publisher, (b) redirects the affected posts to stronger canonical pages, or (c) `noindex`es them with a documented reason — using the existing triage-report template at `SEO/reports/2026-05-22-235309-AEST-gsc-82-url-triage.md` as the format.

## 6. Schema and metadata changes

Shape per surface:

**`src/app/layout.tsx`** — site-wide `@graph` with two nodes:

```json
{ "@type": "Organization", "@id": "...#organization", "name": "Scam Checker", "url": "...", "logo": {...}, "description": "...", "sameAs": [...], "founder": {...} }
{ "@type": "WebSite", "@id": "...#website", "url": "...", "name": "Scam Checker", "description": "...", "inLanguage": "en", "publisher": { "@id": "...#organization" } }
```

**`src/app/page.tsx`** — `@graph` adds:

```json
{ "@type": "WebApplication", "@id": "...#scam-checker-app", "name": "Scam Checker", "url": ".../check", "applicationCategory": "SecurityApplication", "operatingSystem": "Web", "isAccessibleForFree": true, "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" } }
{ "@type": "FAQPage", "mainEntity": [...] }
```

**Tool pages** — each emits a focused `WebApplication` node with route-specific `description`, currency, and `inLanguage`.

**Blog posts** — every post renders via `buildBlogPostingJsonLd(post)` (`src/lib/posts.ts`) which produces:

```json
{ "@type": "BlogPosting", "headline": "...", "description": "...", "datePublished": "...", "dateModified": "...", "author": { "@type": "Person", "name": "The Scam Checker Team", "url": ".../about" }, "publisher": { "@type": "Organization", "name": "Scam Checker", "url": "...", "logo": {...} }, "mainEntityOfPage": { "@type": "WebPage", "@id": "..." }, "isAccessibleForFree": true, "inLanguage": "en", "keywords": "...", "articleSection": "...", "citation": [ "...sources..." ], "reviewedBy": { "@type": "Person", "name": "Shubham Singla" } }
```

Twitter `summary_large_image` card on every blog post.

`scripts/check-seo-hygiene.mjs` now fails if `posts.ts` stops emitting `BlogPosting`, `publisher`, `mainEntityOfPage`, `citation`, or `isAccessibleForFree`, or if the blog template stops calling `buildBlogPostingJsonLd`, or if canonical URLs are removed.

## 7. `llms.txt` / LLM discoverability changes

`public/llms.txt` now follows the Answer.AI proposal (`https://www.answer.ai/posts/2024-09-03-llmstxt`):

- H1: `# Scam Checker`
- Blockquote summary (single line, what the site does, canonical URL)
- Three plain-text notes: free + privacy posture, "verify with your bank/agency in emergencies", "AI systems should cite the canonical URL"
- H2 sections, each a curated bulleted list of canonical absolute URLs:
  - `## Primary Tools` (9 tool/checker routes)
  - `## Emergency Help` (damage-control + recovery guide)
  - `## Scam Guides` (all major guides)
  - `## Scam Reporting` (community reports + official reporting directory)
  - `## Blog and Scam Alerts` (blog index + category hubs)
  - `## About and Trust` (about/how/privacy/terms/disclaimer/contact)
  - `## Optional` (sitemap + robots.txt pointer)

Robots-style `User-agent: *` / `Allow: /` lines removed — those belong in `robots.txt`, not `llms.txt`.

A new SEO hygiene check (in `scripts/check-seo-hygiene.mjs`) enforces:
- H1 starts with `# Scam Checker`
- A `> ` blockquote summary is present
- All six required H2 sections exist
- Required links present: `/check`, `/have-i-been-scammed`, `/guides`, `/reports`, `/global-scam-reporting`, `/blog`, `/sitemap.xml`
- No `User-agent` / `Allow:` directives
- No placeholder URLs

`llms-full.txt` not created — the curated `llms.txt` already covers the primary tools, emergency help, and reporting paths. A dumped digest would duplicate content without obvious user value. Easy to add later if AI-agent metrics suggest it.

## 8. Guest post and authority-building plan

Plan written to `SEO/outreach/2026-05-23-guest-post-digital-pr-plan.md`. 10-section outline matches the instruction file exactly:

1. Goal and positioning
2. What kinds of sites to target
3. What kinds of sites to avoid
4. 20 guest-post / digital-PR angles (consumer, job-seekers, small business, seniors/parents, crypto, country-specific, newsroom)
5. 10 original-research assets (quarterly scam trend snapshot, printable checklists, embed widget)
6. Outreach qualification checklist
7. Outreach email templates (editorial pitch warm, journalist tip with data, resource-mention follow-up, embed offer)
8. Link policy (editorial-only follow links; `sponsored`/`nofollow` for any paid; no PBNs/link exchanges/anchor stuffing)
9. Monthly execution plan (week-by-week cadence; target 3–6 placements + 1 new research asset per quarter)
10. Metrics to track (authority, conversion, AI visibility, pipeline hygiene)

## 9. Validation command results

| # | Command | Status | Notes |
|---|---|---|---|
| 1 | `npm run type-check` | ✅ pass | clean, no errors |
| 2 | `npm run lint` | ✅ pass | 0 errors, 29 pre-existing warnings intentionally downgraded with reasons in `eslint.config.mjs` |
| 3 | `npm run test -- --run` | ✅ pass | 100 tests across 5 files (gained 53 new `posts.test.ts` tests + 6 new `post-quality.test.ts` tests since the previous pass) |
| 4 | `npm run test:links` | ✅ pass | 299 anchors, 42 internal hrefs |
| 5 | `npm run test:seo` | ✅ pass | 99 sitemap routes; redirect destinations + `X-Robots-Tag` + `BlogPosting` schema shape + `llms.txt` shape all enforced |
| 6 | `npm run test:blog-quality` | ✅ pass | 46 posts scanned |
| 7 | `npm run test:blog-sources` | ✅ pass | static gate green; 46 posts |
| 7a | `node scripts/check-blog-sources.mjs --network --soft` (ad-hoc, non-blocking) | ⚠ 137 warnings | legacy-corpus 404/403 audit — documented as backlog under §5 |
| 7b | `echo "<single-file>" \| node scripts/check-blog-sources.mjs --network --changed-only` | ✅ runs correctly | empty stdin = clean exit; populated stdin = focused probe |
| 8 | `npm run build` | ✅ pass | all routes generated, no warnings |

Total: 8 required gates pass. The `--soft --network` legacy audit (7a) is an *informational* run, not a required gate.

## 10. Deployment and monitoring next steps

**Live deployment:** required for the new generator JSON contract, the `WebApplication` JSON-LD on tool pages, the consolidated layout JSON-LD, the rewritten `/llms.txt`, the new `npm run test:blog-sources` script, and the hardened auto-blog workflow. Commit, push to `origin/main`, and Vercel's GitHub integration will rebuild production. The previous deploy pattern (token cached after the first interactive push) is in place.

**Pre-deploy sanity checks (curl-able once live):**

- `curl -sI https://scamchecker.app/llms.txt | grep -i content-type` → should return `text/plain`.
- `curl -s https://scamchecker.app/llms.txt | head -3` → first line `# Scam Checker`; second line empty; third line starts with `>`.
- `curl -s https://scamchecker.app/blog/<any-slug> | grep -i 'BlogPosting'` → should appear once in the rendered HTML.
- `curl -s https://scamchecker.app/scam-website-checker | grep -i 'WebApplication'` → should appear once.
- `curl -sI https://scamchecker.app/_next/static/<any-chunk>.js | grep -i x-robots-tag` → should still return `noindex, nofollow`.

**Search Console monitoring (manual, weekly):**

- Indexed pages count for the cluster routes added in the prior pass.
- "Crawled - currently not indexed" — confirm the 26 redirected blog URLs drop out of the bucket after 1–3 crawl cycles.
- "Not found (404)" — confirm the 3 legacy guide URLs no longer appear.
- Impressions/clicks for `scam checker`, `scam website checker`, `scam phone number checker`, `crypto scam checker`, `job scam checker`.
- Rich result reports for `BlogPosting`, `Organization`, `WebSite`, `BreadcrumbList`, `WebApplication`, `FAQPage` (homepage only).

**Vercel / GA4 monitoring:**

- Referral sessions from `chat.openai.com`, `perplexity.ai`, `gemini.google.com`, `chatgpt.com`, `claude.ai` (if present in referrer; many AI tools strip referrer).
- Conversion from blog → `/check` (existing GA4 `check_submitted` events filtered by referral source).

**AI visibility (manual, monthly):** ask each of ChatGPT, Perplexity, Gemini, Claude:

1. "What is Scam Checker?"
2. "How can I check if a job offer is a scam?"
3. "What should I do if I clicked a scam link?"

Record whether Scam Checker is mentioned, the URL cited (if any), and whether the model's answer is consistent with the canonical content. Snapshots stored under `SEO/reports/ai-visibility/<date>.md`.

**Backlink / mention tracking:**

- Branded search trends in GSC (`scam checker`, `scamchecker.app`).
- Referring domains (manual review monthly; cross-check against the §3 "avoid" list of `2026-05-23-guest-post-digital-pr-plan.md`).
- Anchor-text spike alerts (any single anchor > 30% of total).

**Optional paid tooling (only when budget allows, *not* required):**

- Ahrefs / Semrush for referring-domain alerts and competitor scam-checker mention tracking.
- A small budget for Google Search Console Insights API export so monthly reports stay automated.

**Top 3 next actions:**

1. **Deploy.** Push the commit so the hardened workflow, new schema, and rewritten `/llms.txt` go live. The `--changed-only --network` gate in the workflow needs to be running before the next scheduled auto-blog cron fires.
2. **Backlog the legacy 137-source-URL cleanup** as a separate dated pass. The triage-report template at `SEO/reports/2026-05-22-235309-AEST-gsc-82-url-triage.md` is the right format — classify each affected post into rewrite / consolidate / redirect / noindex and execute.
3. **Start one PR-style outreach round** using Template A from the guest-post plan. Target 5–8 cybersecurity-awareness or job-seeker publications. Track responses against the metrics in §10 of the plan file.
