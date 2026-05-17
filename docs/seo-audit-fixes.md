# SEO audit fixes

Tracks the SEO issues from the most recent audit and how we addressed them.

## Issues fixed

### 1. Empty / generic anchor text on internal links

CTAs that used "Check Now", "Check Message Now", or "Read more" have been
rewritten to descriptive anchor text such as:

- "Check a suspicious message with our scam checker"
- "Check a message, email, or link with our scam checker"
- "Run a free scam check now"
- "Have I been scammed damage-control checklist"

External "Report Online" / "Report Fraud" style buttons now carry an
`aria-label` describing the destination (`{action} – opens {agency} in a new
tab`) so screen readers and crawlers both get explicit context.

### 2. Pages with only one incoming internal link

Each blog post (`src/app/blog/[slug]/page.tsx`) now links to:

- `/check`
- `/have-i-been-scammed`
- `/reports`
- `/guides`
- Up to 4 related posts via `getRelatedPosts`
- `/guides/what-to-do-if-youve-been-scammed`

The `/guides` and `/blog` index pages are full hubs — they link to every
guide and the 10 most recent blog posts, plus to all primary tool routes.

### 3. Semantic HTML

- Blog posts wrap their body in `<article>` with `<header>` / `<section>` /
  `<aside>` siblings for intro CTA, mid-content CTA, related posts, and end
  CTA.
- Footer link groups already use `<nav aria-label="Footer ...">` with
  `<ul>/<li>` lists; preserved.
- Each page has exactly one `<h1>`, with `<h2>` for major sections and
  `<h3>` only nested inside an `<h2>`.

## Internal linking rules

When adding new content:

1. Every guide and blog post **must** include at least one CTA linking to
   `/check`.
2. Every blog post **must** include at least one CTA linking to
   `/have-i-been-scammed` and one to `/reports`.
3. Recovery / damage articles should link to
   `/guides/what-to-do-if-youve-been-scammed`.
4. CTAs that fire analytics use `<GuideCtaLink>` from
   `src/components/TrackedLinks.tsx`; external official report links use
   `<OutboundReportLink>`.

## Anchor text rules

- No empty `<Link>` or `<a>` elements. If a link is icon-only, it must have
  an `aria-label`.
- Use descriptive anchor text — describe what the user gets after clicking,
  not the click itself. Prefer "Check a suspicious message with our scam
  checker" over "Click here" or "Check Now".

## Blog related-link rules

The `getRelatedPosts(currentSlug, 4)` helper in `src/lib/posts.ts` returns up
to 4 posts sharing tags with the current one, falling back to the newest
posts. Every blog post renders this block as `<aside aria-label="Related
scam alert articles">`.

## `/llms.txt`

`public/llms.txt` is served at `https://scamchecker.app/llms.txt` because
files in `public/` are served from the site root in Next.js. It declares the
site purpose, primary pages, owner, focus areas, and privacy stance, and
points crawlers/agents at the sitemap.

## Trust signals

Owner information lives in:

- The Organization JSON-LD in `src/app/layout.tsx` (`sameAs`, `founder`).
- Article JSON-LD on every blog post (author).
- The `/about` page.
- The site footer with a link to `https://shubhamsingla.tech`.
