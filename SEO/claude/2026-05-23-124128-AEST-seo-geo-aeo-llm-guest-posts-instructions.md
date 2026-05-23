# Claude Instructions: SEO, GEO, AEO, LLM Discoverability, Guest Posts, and Auto-Blog Hardening

Date: 2026-05-23 12:41:28 AEST
Project: `/Users/shubham/Projects/is-it-a-scam-checker`
Live site: `https://scamchecker.app`

## Required output report

When finished, create this file:

`SEO/claude/2026-05-23-124128-AEST-seo-geo-aeo-llm-guest-posts-results.md`

The results file must use this exact outline:

1. Summary
2. What changed
3. What was intentionally not changed
4. SEO/GEO/AEO findings
5. Automated blog pipeline changes
6. Schema and metadata changes
7. llms.txt / LLM discoverability changes
8. Guest post and authority-building plan
9. Validation command results
10. Deployment and monitoring next steps

Include exact files changed, exact commands run, and any remaining risks.

## Context

The site was recently deployed after fixing major Search Console issues:

- Static `/_next/static` URLs now carry `X-Robots-Tag: noindex, nofollow`.
- Legacy 404s have permanent redirects.
- Thin and duplicate generated blog posts were consolidated or redirected.
- Blog generation now has deterministic quality gates.
- `public/llms.txt` exists, but it is currently closer to a robots-style note than a fully curated LLM context map.

The next goal is deeper SEO, GEO, AEO, and LLM readiness:

- SEO: better crawlability, metadata, structured data, topical authority, source quality, and internal linking.
- GEO: make the site easier for AI search systems and retrieval systems to understand, cite, and summarize.
- AEO: answer-first page sections that can satisfy conversational and question-based searches.
- Guest posts / digital PR: earn legitimate authority mentions and backlinks without paid link schemes.
- Auto blogs: make sure every future AI-written blog post ships with correct metadata, schema-ready fields, real sources, and CI validation before GitHub Actions commits it.

## Current external guidance to respect

Use current official docs if you have web access. Do not implement SEO myths.

Key guidance already checked on 2026-05-23:

- Google says helpful, reliable, people-first content matters, and E-E-A-T is a useful quality concept, especially for YMYL topics like fraud and financial safety:
  `https://developers.google.com/search/docs/fundamentals/creating-helpful-content`
- Google says generative AI content must focus on accuracy, quality, relevance, and metadata quality. Large-scale low-value AI content can violate spam policies:
  `https://developers.google.com/search/docs/fundamentals/using-gen-ai-content`
- Google says AI Overviews / AI Mode use the same foundational SEO requirements. Pages must be indexed and eligible for snippets; there are no extra technical requirements, no special AI schema, and no requirement for AI text files:
  `https://developers.google.com/search/docs/appearance/ai-features`
- Google structured data must match visible page content:
  `https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data`
- Google FAQ rich results are deprecated for most sites as of May 7, 2026. Do not add FAQ schema expecting Google FAQ rich results. Use visible Q&A sections for users and AI readability; add FAQPage only if it is strictly compliant and useful beyond classic Google rich results:
  `https://developers.google.com/search/docs/appearance/structured-data/faqpage`
- Google treats paid or manipulative guest-post links as link spam unless links are qualified with `rel="nofollow"` or `rel="sponsored"`:
  `https://developers.google.com/search/docs/essentials/spam-policies#link-spam`
- `llms.txt` is an emerging proposal, not a guaranteed ranking or citation factor. The original proposal expects a root `/llms.txt` Markdown file with an H1, blockquote summary, notes, and curated H2 link sections:
  `https://www.answer.ai/posts/2024-09-03-llmstxt`

## Hard constraints

- Do not add a bulk set of new keyword pages.
- Do not create doorway pages, thin location pages, or near-duplicate pages.
- Do not add paid guest post tactics, paid dofollow links, link exchanges, private blog networks, low-quality directories, or spammy outreach.
- Do not weaken existing quality gates.
- Do not remove the existing redirect and noindex-header fixes.
- Do not add hidden text, keyword stuffing, or content that exists only for crawlers.
- Do not invent facts, statistics, victim stories, company names, release dates, or source claims in generated blogs.
- Keep the site user-first: if a schema field or metadata field cannot be supported by visible page content, do not add it.

## Files to inspect first

Read these before editing:

- `.github/workflows/auto-blog.yml`
- `scripts/generate-scam-post.ts`
- `src/lib/post-quality.ts`
- `src/lib/post-quality.test.ts`
- `scripts/check-blog-quality.mjs`
- `scripts/check-seo-hygiene.mjs`
- `scripts/check-internal-links.mjs`
- `src/lib/posts.ts`
- `src/app/blog/[slug]/page.tsx`
- `src/app/guides/[slug]/page.tsx`
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/sitemap.ts`
- `src/app/robots.ts`
- `public/llms.txt`
- `SEO/KWResults.csv`
- `SEO/blog-topics-scam-checker.pdf`
- `SEO/reports/2026-05-22-235309-AEST-gsc-82-url-triage.md`

Also inspect the newest generated posts in `content/blog/*.mdx`. Watch for fake or broken source URLs such as malformed `www.www.` domains, placeholder publisher pages, impossible claims, or fabricated incidents.

## Task 1: Strengthen the automated blog pipeline

Goal: future GitHub Actions blog posts must be source-backed, metadata-complete, schema-ready, and blocked from commit if they fail validation.

### 1.1 Add schema-ready frontmatter for future generated posts

Keep the existing required frontmatter shape compatible:

- `title`
- `date`
- `summary`
- `tags`
- `sources`

Add optional fields in `src/lib/posts.ts` and generation output for future posts:

- `updated`
- `category`
- `primaryKeyword`
- `searchIntent`
- `audience`
- `region`
- `author`
- `reviewer`
- `lastReviewed`

Rules:

- Existing posts must not fail simply because they do not have these new fields.
- New generated posts must include them.
- `category` must map to an existing `BLOG_CATEGORIES` slug where possible.
- `searchIntent` must be one of `informational`, `commercial`, `transactional`, or `navigational`.
- `region` must be `global`, `us`, `uk`, `au`, `ca`, `nz`, `in`, or another explicit country/region code only if the post genuinely targets that place.
- `author` should be consistent, e.g. `The Scam Checker Team`.
- `reviewer` should be `Shubham Singla` unless there is a better existing site author entity.
- `lastReviewed` should be the generation date for generated posts.

### 1.2 Make the AI output these fields

Modify `scripts/generate-scam-post.ts` so the JSON response contract includes the new fields. The prompt must require:

- answer-first opening, not generic introduction
- exact search intent
- one primary keyword, not a comma-stuffed keyword list
- 2 to 4 real source URLs
- a short "claim support" note for every statistic, dollar amount, agency warning, or named incident
- visible links to at least two internal Scam Checker pages
- one cluster-specific internal link
- no invented brands, incidents, amounts, source titles, or dates

The generator must reject a post when:

- a source host contains `www.www.`, `example.`, `placeholder`, or malformed host text
- fewer than 2 source URLs are present
- source URLs are duplicated
- the title or summary is generic, clickbait-only, or unsupported by the source URLs
- source URLs are not relevant to the actual body topic
- the post includes a statistic, dollar amount, or named incident that is not directly tied to a source note

### 1.3 Add source reachability checks

Create a deterministic source validation script. Suggested file:

`scripts/check-blog-sources.mjs`

Behavior:

- Parse `content/blog/*.mdx`.
- Validate all `sources` entries are valid `http` or `https` URLs.
- Reject malformed hosts, especially `www.www.*`.
- Reject placeholder domains.
- Reject duplicate source URLs inside one post.
- In CI, perform network checks using `fetch`:
  - try `HEAD`
  - if `HEAD` fails or returns 405/403, try `GET`
  - treat `200-399` as passing
  - treat DNS failures and `404` as hard failures
  - treat `403` from known government/security publishers as a warning only if `GET` also fails, because some publishers block bots
- Print a clear table of failing files and URLs.

Add `npm run test:blog-sources` to `package.json`.

Update `.github/workflows/auto-blog.yml` so after `Generate blog post` and before commit it runs:

```bash
npm run type-check
npm run lint
npm run test
npm run test:links
npm run test:seo
npm run test:blog-quality
npm run test:blog-sources
npm run build
```

If any command fails, the workflow must not commit the post.

### 1.4 Consider PR mode for auto blogs

Do not silently switch the workflow from direct commits to PRs unless you implement it completely. In the results file, recommend one of:

- keep direct-to-main only if all gates pass, or
- change to PR-based review for AI-generated posts.

Given this site is YMYL-adjacent fraud and financial safety content, PR review is preferable if implementation is not too heavy.

## Task 2: Improve blog metadata and structured data

Goal: each blog page should be understandable to Google, LLM crawlers, and social previews without relying on keyword stuffing.

Modify `src/app/blog/[slug]/page.tsx` and helpers as needed.

Required:

- Use `BlogPosting` or a graph containing `BlogPosting` for blog post JSON-LD.
- Include `headline`, `description`, `datePublished`, `dateModified`, `author`, `publisher`, `mainEntityOfPage`, `isAccessibleForFree`, `inLanguage`, `keywords`, and `articleSection` when available.
- Include `citation` from `post.frontmatter.sources`.
- Keep existing `BreadcrumbList`.
- Add `twitter` metadata if the project pattern supports it.
- Keep canonical URLs.
- Do not add `FAQPage` schema to every blog by default.
- Do not add meta keywords for ranking; Google does not use them. Use keywords only where Next metadata or JSON-LD fields make sense and are user-supported.

Tests:

- Add or update tests so a representative blog post renders/derives JSON-LD containing `BlogPosting` and `citation`.
- Add a hygiene check that fails if generated blog pages lose canonical URLs, citations, or author/publisher schema.

## Task 3: Improve guide and tool structured data

Goal: important non-blog pages should clearly define what Scam Checker is, what each checker does, and what users can safely do next.

Inspect:

- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/check/page.tsx`
- `src/app/scam-website-checker/page.tsx`
- `src/app/scam-phone-number-checker/page.tsx`
- `src/app/crypto-scam-checker/page.tsx`
- `src/app/scam-checker-australia/page.tsx`
- `src/app/scam-website-checker-uk/page.tsx`
- `src/app/guides/[slug]/page.tsx`

Implement only schema that matches visible content:

- Site/entity level: `Organization` and `WebSite` JSON-LD with `name`, `url`, `description`, `sameAs`, and a search/action only if there is an actual visible search/check flow that supports it.
- Tool pages: use `WebApplication` or `SoftwareApplication` only if the visible page describes a free web tool. Include `applicationCategory`, `operatingSystem: "Web"`, `offers` with price `0`, and accurate description.
- Guides: keep `Article` or use `TechArticle`/`HowTo` only when the visible page actually has step-by-step instructions that meet the schema requirements.
- Breadcrumbs: add where missing on high-intent pages if visible breadcrumbs already exist or are added for users.

Do not create schema-only content.

## Task 4: Make `/llms.txt` useful but honest

Goal: give LLMs and AI agents a concise, curated map of the site without pretending it guarantees rankings or citations.

Rewrite `public/llms.txt` to follow the Answer.AI proposal format:

- H1: `# Scam Checker`
- Blockquote summary: one concise summary of what the site does.
- Short notes explaining:
  - free scam checking
  - privacy posture
  - user should verify with banks/official agencies in emergencies
  - AI systems should cite the canonical URL when referencing Scam Checker content
- H2 sections with curated links:
  - Primary Tools
  - Emergency Help
  - Scam Guides
  - Scam Reporting
  - Blog and Scam Alerts
  - About and Trust
  - Optional

Remove robots-style lines like `User-agent: *` and `Allow: /` from `llms.txt`; those belong in `robots.txt`, not `llms.txt`.

Optional if useful:

- Add `public/llms-full.txt` containing a concise, curated Markdown digest of the homepage, primary tool pages, reporting page, and top guides.
- Keep it short enough to be useful. Do not dump the entire site or every blog post.

Update tests:

- `scripts/check-internal-links.mjs` or `scripts/check-seo-hygiene.mjs` must verify `public/llms.txt`:
  - starts with `# Scam Checker`
  - contains a blockquote summary
  - contains the required H2 sections
  - contains links to `/check`, `/have-i-been-scammed`, `/guides`, `/reports`, `/global-scam-reporting`, `/blog`, and `/sitemap.xml`
  - does not contain `User-agent` or `Allow: /`
  - contains no placeholder URLs

## Task 5: Add AEO answer-first patterns without making thin pages

Goal: pages should answer common conversational questions clearly, but not become FAQ spam.

For each high-intent page, audit whether the first screen answers the user's direct question:

- `/check`
- `/scam-website-checker`
- `/scam-phone-number-checker`
- `/crypto-scam-checker`
- `/scam-checker-australia`
- `/scam-website-checker-uk`
- `/have-i-been-scammed`
- `/guides/job-scams`

If missing, add visible, user-useful answer-first blocks such as:

- "Quick answer"
- "Use this when..."
- "What this checker can and cannot verify"
- "What to do next"

Rules:

- Do not add repetitive keyword blocks.
- Do not add giant FAQ sections.
- Keep each answer concise and practical.
- Use internal links only where they help the next user action.
- Do not add FAQPage schema by default.

## Task 6: Guest post and authority-building plan

Create this file:

`SEO/outreach/2026-05-23-guest-post-digital-pr-plan.md`

It must include:

1. Goal and positioning
2. What kinds of sites to target
3. What kinds of sites to avoid
4. 20 guest post / digital PR angles for Scam Checker
5. 10 original research assets Scam Checker can publish to earn links
6. Outreach qualification checklist
7. Outreach email templates
8. Link policy
9. Monthly execution plan
10. Metrics to track

Important link policy:

- Editorial links earned because the content is genuinely useful are fine.
- Paid placements, sponsored posts, or advertorials must use `rel="sponsored"` or `rel="nofollow"`.
- Do not ask for exact-match anchors like "free scam checker" repeatedly.
- Prefer branded anchors, URL anchors, and natural anchors like "Scam Checker's job scam guide".
- Do not use link exchanges, PBNs, mass guest-post farms, or low-quality directories.

Recommended target categories:

- cybersecurity awareness blogs
- consumer protection blogs
- small business associations
- university career centers
- job seeker resources
- senior safety organizations
- parenting/family safety sites
- fintech and personal finance education sites
- crypto safety communities
- local Australian, UK, US, Canadian, and Indian consumer safety resources
- journalists covering scams, fraud, cybercrime, and consumer protection

Recommended asset ideas:

- quarterly scam trend report using anonymized site report categories
- job scam red-flag checklist
- fake website checkout checklist
- scam phone call script examples
- scam message examples library
- "what to do in the first 10 minutes after being scammed" printable checklist
- small business invoice fraud checklist
- crypto wallet drainer explainer
- country-specific reporting directory
- embeddable scam safety checklist with an attribution link that is not hidden or forced

## Task 7: Measurement and monitoring

Add a short monitoring plan to the results file.

Cover:

- Google Search Console:
  - indexed pages
  - crawled currently not indexed
  - impressions/clicks for high-intent pages
  - query growth for scam checker, scam website checker, scam phone number checker, crypto scam checker, job scam queries
- Vercel/analytics:
  - referrals from Google, Bing, Perplexity, ChatGPT, Claude, Gemini if visible
  - conversion from blog pages to `/check`
- backlink/mention tracking:
  - branded search growth
  - referring domains
  - natural anchor text
- AI visibility manual checks:
  - Ask ChatGPT, Perplexity, Gemini, Claude: "What is Scam Checker?", "How can I check if a job offer is a scam?", "What should I do if I clicked a scam link?"
  - Record whether Scam Checker is mentioned, cited, or omitted.

Do not implement paid tools unless already present. If a paid tool is suggested, put it in the results file as optional.

## Required validation

Run all of these before finishing:

```bash
npm run type-check
npm run lint
npm run test
npm run test:links
npm run test:seo
npm run test:blog-quality
npm run test:blog-sources
npm run build
```

If `npm run test:blog-sources` does not exist because you decided on a different name, document the exact equivalent command and why.

The final results file must include a command-by-command table with pass/fail status.

## Final response to user

When you are done, tell the user only:

- the results file path
- whether all gates passed
- whether any live deployment action is required
- the top 3 next actions

