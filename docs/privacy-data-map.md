# Privacy data map

Internal engineering reference. Lists every place Scam Checker collects,
stores, processes, logs, or transmits user data. The user-facing version
of this map is the Privacy Policy at `/privacy`.

This document is **not legal advice**. Privacy regulations vary by region
and require legal review before any commercial scale-up.

Last reviewed: 2026-05-29.

| Surface | What is collected | Why | Storage | Public? | Retention | Third party? | Deletion |
|---|---|---|---|---|---|---|---|
| Scam checker `<ScamChecker>` paste box (`/check`, `/check-scam-text`, `/check-scam-email`, `/check-scam-link`) | Text / URL / SMS / WhatsApp body. Optional upload: PNG, JPG, PDF | Local risk scoring | **Browser only** — never transmitted to our servers | No | Cleared when tab closes | None | N/A — nothing is stored |
| File upload (image / PDF) | Bytes are parsed locally by `tesseract.js` / `pdfjs-dist` | OCR + text extraction | **Browser only** — files never reach a Vercel function | No | Cleared when tab closes | None | N/A |
| `/api/check-reputation` (POST) | Normalised URL / domain / phone / email *hash key* | Look up community report counts | Server-side Postgres query, **read-only** count | No | Not persisted | None | N/A — only a count is returned |
| `/api/report` (POST) | `type`, `value_raw` (truncated to 500 chars), `value_normalised`, `notes` (truncated to 1000 chars), `country`, SHA-256(`x-forwarded-for + salt`) → `ip_hash`, MD5(`user-agent`) → `user_agent_hash` | Community scam-report database + rate-limit | Postgres `Report` table | The `value` is rendered publicly on `/reports` after masking; raw IP / UA are NEVER persisted | Currently indefinite; see "Retention recommendation" below | None | `/data-removal` form sends an email request |
| `/api/report` (GET, by `/reports/*` pages) | None — public read of the latest reports | List view | Read from Postgres `Report` | Masked output only (`j***@example.com`, `+61 *** *** 123`) | n/a | None | n/a |
| `/contact` form | Currently a static page (no submission endpoint). Direct mailto only. | User-initiated | Goes to the maintainer's inbox via `mailto:` only | No | Inbox retention | Email provider (user's own) | Email reply to delete |
| `/data-removal` (new) | Free-text email — what to remove + contact email | Honour deletion / correction requests | Inbox only | No | Inbox retention | Email provider | Removed once actioned |
| `/responsible-disclosure` (new) | Free-text email — vulnerability details | Coordinated disclosure | Inbox only | No | Inbox retention | Email provider | Removed once actioned |
| Vercel platform logs | Request-level metadata (route, status, region, response time). No request body. | Standard platform observability | Vercel | No | Per Vercel's plan defaults | Vercel | Email Vercel support |
| Google Analytics 4 (`G-4NCNQMQVFB`) | **Allowlisted event params only** — see `src/lib/analytics.ts`. Default GA fields (anonymised IP, country/region, device class). **Never** any pasted text, URL, domain, phone, email, OTP, file name, OCR text, or report notes. | Aggregate product metrics | Google Analytics | No (admin only) | Per GA4 default | Google (LLC / Ireland) | Google's data-controls suite |
| Vercel Analytics (`@vercel/analytics`) | Page-view counter only. No event params. | Edge-level page metrics | Vercel | No | Per Vercel | Vercel | Vercel data controls |
| Auto-blog generator (`scripts/generate-scam-post.ts`) | Calls Gemini API + Groq API with a **prompt and a pre-curated source ID list**. No user data of any kind is forwarded — only the FindQuestions bank question text. Runs only inside the GitHub Action. | Daily content generation | Provider request logs only | No | Provider's logs | Google (Gemini), Groq | n/a — no user data sent |
| Service-side rate limit | `ip_hash` (SHA-256(IP + salt)) | Throttle abusive `/api/report` posters to 10/hour | Postgres `Report.ip_hash` column | No | Indefinite | None | Removed when the related report is deleted |
| Cookies set by us | `sc_consent` (Cookie consent decision: `granted` or `denied`, version, granted-at). No tracking purpose. | Persist consent choice | First-party cookie, lax SameSite | No | 6 months | None | Cleared via browser controls or `/cookies` "Withdraw consent" button |
| Cookies set by GA4 *after consent* | `_ga`, `_ga_<id>` (Google's default analytics cookies) | Distinguish unique visitors | First-party cookie, lax SameSite | No | 13 months (Google's default) | Google | Withdraw via `/cookies` |

---

## What we intentionally do NOT collect or store

- The text of pasted messages, emails, SMS, WhatsApp messages, URLs or
  pasted scam content. Analysis happens in the browser.
- Uploaded images / PDFs (bytes never leave the browser).
- Raw IP addresses on disk — only a salted SHA-256 hash for rate-limit.
- Raw User-Agent strings — only an MD5 hash for opaque rate-limit grouping.
- Names, addresses, accounts, login credentials, OTPs, card numbers, CVVs.
- Newsletter / mailing-list sign-ups (we don't run one).
- Browser fingerprinting / canvas / WebRTC IP leak techniques.
- Cross-site tracking pixels.

---

## Retention recommendations

- **Reports**: introduce a 24-month rolling retention. Older reports
  should either be auto-purged or anonymised (replace `value_raw` with
  the already-masked form and drop `notes`). Tracked as a TODO.
- **Consent cookie**: 6 months, then re-prompt.
- **GA4**: default 14 months. Configured server-side in GA admin.
- **Vercel logs**: Vercel-plan default. No code change needed.

## Third-party processors (concise list)

- **Vercel** (deployment, edge logs, Vercel Analytics). EU/US data centres.
- **Google LLC** (GA4). Loaded only after explicit consent.
- **GitHub** (source hosting + Actions runtime for the auto-blog cron).
- **Google Gemini / Groq** (LLM providers used only by the GitHub Action,
  no user data forwarded).

## User rights

The site does not require accounts. Users can:

- Use the checker entirely client-side — nothing to delete.
- Email `privacy@scamchecker.app` via `/data-removal` to request removal,
  correction, or a copy of any report tied to a value they recognise.
- Withdraw analytics consent via the cookie banner / `/cookies` page.

## How to update this map

Whenever you add a new API route, third-party SDK, cookie, or
analytics event, update both this map and the user-facing Privacy Policy
in `src/app/privacy/page.tsx`. The SEO hygiene check in
`scripts/check-seo-hygiene.mjs` does not (yet) enforce this — treat it as
part of the code-review checklist for any data-touching PR.
