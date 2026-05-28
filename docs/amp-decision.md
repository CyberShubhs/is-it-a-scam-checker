# AMP feasibility decision — 2026-05-27

**Status:** AMP is NOT being shipped on scamchecker.app at this time. No AMP routes exist. `rel="amphtml"` is intentionally absent from every canonical page.

## Why GSC says "No AMP pages found"

Google Search Console reports zero AMP pages because the site has never published any. The report is correct.

## Why AMP was not implemented

1. **AMP is not a ranking factor.** Google removed the AMP carousel boost in 2021 and the Top Stories AMP-only requirement in 2024. Core Web Vitals + useful content win on speed-and-quality signals; AMP adds no SEO benefit on top.
2. **The Next.js App Router does not support AMP.** Next.js 13 deprecated AMP. The current codebase (Next.js 16, App Router only) has no `useAmp`, no `pages/` directory, and no AMP plugin path. Building AMP versions would mean either:
   - Maintaining a parallel hand-written AMP HTML pipeline alongside the App Router, OR
   - Downgrading to Pages Router (huge regression).
   Both options ship significant risk for zero SEO upside.
3. **Tool / checker pages are NOT AMP-compatible.** `/check`, `/check-scam-email`, `/check-scam-text`, `/check-scam-link`, `/have-i-been-scammed`, `/reports` rely on:
   - Custom client-side JS for the scam analyser, the PDF/image text extractor, the assessment flow, the analytics events.
   - File upload + tesseract.js + pdfjs-dist.
   AMP forbids author-supplied JS. AMP versions of these pages would either be broken or not deliver the product.
4. **Article/blog pages are already fast.** Blog posts are statically generated (MDX, server-rendered HTML), use `next/font`, do not load client JS for the article body, and ship critical content in server-rendered HTML. Lighthouse mobile performance on `/blog/[slug]` already meets the speed bar AMP was designed to enforce.
5. **Risk of broken AMP outweighs the gain.** The SEO brief explicitly says "If AMP implementation is not compatible with the current Next.js setup without heavy risk: do not ship broken AMP." A half-working AMP pipeline would surface invalid AMP errors in Search Console — worse than the current "no AMP" state.

## What we improved instead (speed alternatives)

These are the meaningful speed and quality wins that AMP would have been trying to deliver, all already in place:

- **Server-rendered article bodies.** Blog content ships in initial HTML — no client-side fetch needed.
- **`next/font` (Inter) with `latin` subset.** One variable font, no FOIT.
- **No client JS in blog post bodies.** The FAQ accordion on high-intent pages now uses native `<details>` / `<summary>` (no React state, no JS), see `src/components/PageFAQ.tsx`.
- **Self-hosted analytics through `@vercel/analytics` only.** No tag manager, no third-party bloat.
- **`X-Robots-Tag: noindex, nofollow` on `/_next/static/*`** so hashed chunk URLs stop polluting GSC.
- **FAQPage JSON-LD on all high-intent pages.** Drives rich-result eligibility — historically a bigger CTR win than AMP delivered.

## When to revisit

Revisit AMP only if all three become true:
1. AMP becomes a Google ranking input again.
2. Next.js ships first-class App Router AMP support.
3. Our tool pages can detect non-tool routes and ship a static-only AMP shadow without compromising the checker UX.

Until then, GSC will keep reporting "no AMP pages" and that is the correct state.

## Operational note

- No `rel="amphtml"` is emitted anywhere in the codebase. Greppable: `git grep -n amphtml src public next.config.ts` returns nothing.
- No `/amp/*` routes exist. The sitemap (`src/app/sitemap.ts`) lists no AMP URLs.
- No AMP-related sitemap, ping, or invalidation jobs are scheduled.
