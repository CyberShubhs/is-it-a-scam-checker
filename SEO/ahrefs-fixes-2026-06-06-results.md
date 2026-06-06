# Ahrefs crawl fixes — 06 June 2026 exports

Source exports (UTF-16 TSV) parsed from iCloud Downloads:
`pages-to-submit-to-in`, `structured-data-has-s`, `meta-description-chan`,
`meta-description-too`, `title-tag-changed` (all dated 2026-06-06).

Health score was already 99; remaining work was small and targeted.

## 1. Broken internal link (404) — FIXED
- 404 URL: `https://scamchecker.app/guides/hi-mum-scam-explained`
- First found at: `https://scamchecker.app/check-scam-text`
- Fix: updated the "Hi Mum/Dad" scam link in `src/app/check-scam-text/page.tsx`
  to the existing relevant guide `/guides/whatsapp-scams-examples`
  (confirmed slug exists in `src/lib/guides.ts`).
- Verified: repo-wide grep shows no remaining `hi-mum-scam-explained` references
  in source; `npm run test:links` passes.

## 2. Structured data validation errors (7 blog posts) — FIXED
Affected URLs (all job-scams posts dated 28–31 May 2026):
- /blog/2026-05-31-most-common-job-scam-in-2026-the-evolving-task-pay-662152
- /blog/2026-05-30-can-you-get-your-money-back-after-falling-for-a-jo-f2f4a8
- /blog/2026-05-31-understanding-a-legitimate-job-interview-process-c6eee0
- /blog/2026-05-30-fake-check-bounce-time-what-you-need-to-know-6b1945
- /blog/2026-05-28-what-information-do-scammers-need-for-identity-the-75523a
- /blog/2026-05-29-legitimate-jobs-never-ask-for-money-why-scammers-d-6f4826
- /blog/2026-05-29-what-to-do-when-a-recruiter-asks-for-money-upfront-828d90

Root cause: the shared `buildBlogPostingJsonLd` builder in `src/lib/posts.ts`
emitted a `reviewedBy` property on the **BlogPosting** node whenever a post had
a `reviewer` frontmatter field. These 7 posts are the only ones with a
`reviewer` field, which is exactly why only they failed. Per schema.org,
`reviewedBy` is valid **only on `WebPage`** (and subtypes) — not on
`CreativeWork`/`Article`/`BlogPosting` — so the validator flagged it as an
out-of-domain property. (Verified against https://schema.org/reviewedBy.)
`articleSection` was a red herring: it is a valid `Article` property inherited
by `BlogPosting`.

Fix: moved the reviewer signal off `BlogPosting.reviewedBy` and onto the
`mainEntityOfPage` **WebPage** node, where `reviewedBy` is valid. This keeps
the E-E-A-T reviewer in the structured data and consistent with the visible
"Reviewed by …" byline on the article. No fake ratings, aggregateRating,
review counts, or invented credentials were added.

- Updated unit test in `src/lib/posts.test.ts` to assert the reviewer now lives
  on `mainEntityOfPage.reviewedBy` and is absent from the BlogPosting node.
- Verified in prerendered HTML for an affected post:
  `BlogPosting.reviewedBy` is absent; `mainEntityOfPage.reviewedBy` =
  `{ "@type": "Person", "name": "Shubham Singla" }`.

## 3. Meta description too short — FIXED
- URL: `https://scamchecker.app/blog/crypto-scams` (was 98 chars → too short)
- Fix: expanded the `crypto-scams` category description in `src/lib/posts.ts`
  (used directly as the meta description by
  `src/app/blog/crypto-scams/page.tsx`).
- New description (152 chars, verified in rendered HTML):
  "Wallet drainers, fake exchanges, pig-butchering investment rings, and other
  crypto-flavoured fraud — how these scams work and how to protect your funds."
- Natural, non-spammy, within the 130–155 char target.

## "Changed" notices — reviewed, intentionally left alone
`title-tag-changed` (83 rows) and `meta-description-chan` (35 rows) are Ahrefs
change notices from the recent SEO cleanup, not problems. Scanned both for
accidental regressions (blank titles, titles > 60 chars, blank/too-short/
too-long meta). Findings:
- No blank or over-60-char titles.
- Six descriptions in the changed report measure 111–118 chars, but none are in
  Ahrefs' "too short" report (only crypto-scams at 98 was flagged) and all read
  naturally. Left unchanged per instructions — do not rewrite titles/meta just
  because they appear in a "changed" report.

## 4. Pages to submit to IndexNow (113 rows) — NOT IMPLEMENTED (optional)
The project has **no existing IndexNow key or process** (repo-wide grep for
"indexnow" returns nothing; no key file under `public/`). Per instructions,
IndexNow was not added. This remains optional low-priority housekeeping; if the
owner wants it, it would mean adding an IndexNow key file under `public/` and a
submit step in the deploy/sitemap pipeline.

## Verification (all run after the fixes)
- `npm run test:links` ✅
- `npm run test:seo` ✅ (114 sitemap routes)
- `npm run test:blog-sources` ✅ (53 posts; 1 non-blocking registry warning, pre-existing)
- `npm run test:blog-quality` ✅ (53 posts)
- `npx vitest run src/lib/posts.test.ts` ✅ (61 tests)
- `npm run type-check` ✅
- `npm run lint` ✅ (0 errors; 19 pre-existing warnings, none in edited files)
- `npm run build` ✅
- Rendered-HTML spot checks ✅ (BlogPosting JSON-LD, crypto-scams meta)

## Files changed
- `src/app/check-scam-text/page.tsx` — broken guide link → whatsapp-scams-examples
- `src/lib/posts.ts` — `reviewedBy` moved to WebPage node; crypto-scams description expanded
- `src/lib/posts.test.ts` — test updated for the new valid reviewer location
