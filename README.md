# Is It a Scam? - Scam Detection Tool

This project is a modern, privacy-first tool designed to help users identify potential scams in URLs, Emails, Text Messages, and now **Images/Screenshots** and **Documents (PDF/DOCX)**.

## 🚀 Features

- **Multi-Channel Detection**: Check Website URLs, Emails, SMS/Texts.
- **Document & Image Scanner**: Upload a screenshot, PDF, DOCX or TXT and watch it
  get *scanned* (staged scanner animation) for risk signals — embedded links, QR
  codes, payment/bank details, crypto wallets, gift-card asks, credential
  harvesting, urgency language and document metadata. Raw extracted text is never
  shown by default; it lives in an opt-in "Technical details" panel.
- **QR Code Detection**: Decodes QR codes in images and the first pages of PDFs and
  runs the destination URL through the URL risk engine ("quishing" detection).
- **IP Reputation (AbuseIPDB)**: An **IP Address** tab in the scanner (and the
  [`/check-scam-ip`](https://scamchecker.app/check-scam-ip) page) checks any public
  IP server-side against AbuseIPDB and surfaces an "External IP reputation" signal.
  IPs found inside scanned messages/files are checked automatically too.
- **Community Report Enrichment + Voting**: Every result shows a "Related community
  reports" card — matching reports for the exact URL/domain/IP/email/phone, with
  counts ("Reported by N people"), recency, masked examples and **helpful / "I saw
  this too" votes**. The [`/reports`](https://scamchecker.app/reports) page groups
  duplicate reports and supports search, type filters and Latest / Top / Most
  helpful sorting; [`/scam-report-lookup`](https://scamchecker.app/scam-report-lookup)
  searches a single entity.
- **Advanced Scoring**: Weighted, grouped signals ("Why this result"), risk-specific
  "What to do next" advice, and a privacy-safe copyable summary.
- **Privacy First**: All file/OCR/PDF parsing happens **in your browser**. Files are
  never uploaded or stored. Only extracted entities (domains/IPs/emails/phones) are
  sent to the server for report matching + IP reputation.
- **Self-hosted scanner runtime (CSP-safe)**: The pdf.js worker, Tesseract OCR
  worker/core (WASM) and English language data are copied from `node_modules` into
  `public/scan/` at install/build time (`scripts/prepare-scan-assets.mjs`) and served
  same-origin. This is required because the site's strict Content-Security-Policy
  (`default-src 'self'`) blocks third-party CDN workers — and cdnjs doesn't host the
  pinned pdf.js version. The `public/scan/` folder is git-ignored and regenerated.
- **Hardened APIs**: Rate limiting, item caps, strict IP validation, and graceful
  degradation on every server route.
- **SEO Optimized**: Programmatic guides, structured data, and crawlable tool pages.

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript
- **Database**: PostgreSQL via Prisma (community reports + threat-intel cache)
- **Text Extraction**: Tesseract.js (OCR), PDF.js, Mammoth.js, jsQR (QR codes)
- **Threat Intel**: AbuseIPDB API v2 (server-side, cached)
- **Testing**: Vitest

## 🔑 Environment Variables

| Variable | Required? | Exposure | Purpose |
| --- | --- | --- | --- |
| `DATABASE_URL` | Yes (for reports) | Server only | Postgres connection for community reports + threat-intel cache |
| `ABUSEIPDB_API_KEY` | Optional | **Server only** | Enables AbuseIPDB IP-reputation checks |
| `IP_SALT` | Recommended | Server only | Salt for hashing IPs used in rate limiting |
| `RESEND_API_KEY` | Optional | **Server only** | Resend API key — enables contact-form email notifications |
| `RESEND_FROM_EMAIL` | With Resend | Server only | Verified sender, e.g. `Scam Checker <contact@mail.scamchecker.app>` |
| `CONTACT_TO_EMAIL` | With Resend | Server only | Where admin contact notifications are delivered |
| `CONTACT_CC_EMAIL` | Optional | Server only | CC for admin notifications |
| `CONTACT_SEND_CONFIRMATION_EMAIL` | Optional | Server only | `true` to also email a confirmation to the submitter |
| `CONTACT_WEBHOOK_URL` | Optional | Server only | Forward each enquiry to a webhook (Slack/Make/etc.) |
| `GEMINI_API_KEY` | Optional | Server only (CI) | Auto-blog generation |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Optional | Client | Google Analytics 4 |

### Contact form email (Resend)

The contact form **always saves submissions to the database** (`ContactMessage`).
Email notifications are an optional layer on top — if Resend isn't configured (or
fails), the submission is still stored and the user still sees success.

1. Verify a sending domain in Resend. `mail.scamchecker.app` is the verified domain.
2. **On Vercel** — Project → **Settings** → **Environment Variables** → **Add New**:
   - `RESEND_API_KEY` (no `NEXT_PUBLIC_` prefix — it is a secret)
   - `RESEND_FROM_EMAIL` = `Scam Checker <contact@mail.scamchecker.app>`
   - `CONTACT_TO_EMAIL` = the inbox that should receive enquiries
   - (optional) `CONTACT_CC_EMAIL`, `CONTACT_SEND_CONFIRMATION_EMAIL=true`
3. **Redeploy** after changing Vercel environment variables — they only take
   effect on a new deployment.

> ⚠️ Never expose `RESEND_API_KEY` (or any contact secret) to the client. They
> are read only inside the `/api/contact` route via `src/lib/email/resend.ts`
> (a server-only module) and never carry a `NEXT_PUBLIC_` prefix.

### Setting `ABUSEIPDB_API_KEY`

The IP-reputation feature is **off by default** and degrades gracefully ("External
IP reputation check is not enabled") until a key is set. To enable it:

1. Create a free key at <https://www.abuseipdb.com/account/api>.
2. **Locally** — add it to `.env` or `.env.local`:
   ```bash
   ABUSEIPDB_API_KEY=your_key_here
   ```
3. **On Vercel** — Project → **Settings** → **Environment Variables** → **Add New**:
   - Name: `ABUSEIPDB_API_KEY` (exactly — no `NEXT_PUBLIC_` prefix)
   - Value: your key
   - Environments: Production (and Preview if desired)
   - Redeploy so the change takes effect.

> ⚠️ Never expose this key to the client. It must stay server-side (no
> `NEXT_PUBLIC_` prefix). All AbuseIPDB calls run inside server route handlers.

## 🏃‍♂️ Getting Started

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/is-it-a-scam-checker.git
    cd is-it-a-scam-checker
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

4.  **Open in browser:**
    Navigate to [http://localhost:3000](http://localhost:3000).

## 🧪 Running Tests

Run unit tests for the detection logic:
```bash
npm test
```

## 📦 Deployment

This project is optimized for deployment on Vercel.

1.  Push your code to GitHub.
2.  Import the project in Vercel.
3.  Add environment variables (see [Environment Variables](#-environment-variables)):
    `DATABASE_URL` for community reports, and `ABUSEIPDB_API_KEY` to enable IP
    reputation checks. The core browser-side scanner works without any keys.
4.  Deploy.

## 🛡️ Privacy Note

We take privacy seriously.
- **Client-Side Processing**: All file analysis (OCR, PDF reading) is done in the user's browser via Web Workers.
- **No Persistence**: Nothing you upload is saved to a database.

## 📝 AI-Powered Blog System

The repo includes a fully automatic blog publishing system that generates **one
high-quality, long-form SEO article per week** using **Google Gemini AI** and
commits it directly to `main`.

### How It Works

1. A **GitHub Action** (`.github/workflows/auto-blog.yml`) runs **once a week** —
   `cron: '0 22 * * 0'` (Sunday 22:00 UTC = **Monday morning Australia/Sydney**,
   ~08:00 AEST / ~09:00 AEDT) — plus manual dispatch.
2. It calls **Gemini** (primary) with model fallback
   `gemini-2.5-pro → gemini-2.5-flash → gemini-2.0-flash`. **Groq** is used only
   as a fallback if Gemini fails *and* `GROQ_API_KEY` is set. The log prints which
   provider produced the post (name only, never keys).
3. The script strips AI-sounding language and runs a strict deterministic quality
   gate (see below). If the draft fails, it is **not published** and the exact
   reasons are logged.
4. Duplicate topics/angles are detected and skipped to keep content fresh.
5. Passing posts are committed to `main` and **Vercel auto-deploys**.

### Environment variables (GitHub Actions secrets/vars)

| Name | Kind | Purpose |
| --- | --- | --- |
| `GEMINI_API_KEY` | secret | **Required.** Primary provider. Free key at [aistudio.google.com](https://aistudio.google.com/apikey). |
| `GEMINI_MODEL` | var (optional) | Overrides the primary model. Defaults to `gemini-2.5-pro`. |
| `GROQ_API_KEY` | secret (optional) | Fallback provider, used only if Gemini fails. |

In repo Settings → Actions → General, set "Read and write permissions".

### Manual run + dry run

Use **Actions → Auto Blog Post → Run workflow**. Tick **`dry_run`** to generate
and fully validate a draft **without writing or committing** anything (the
generator honours the `DRY_RUN` env var and produces no file). Locally:

```bash
# Generate a post (writes a file on success)
GEMINI_API_KEY=your-key npm run generate-blog

# Dry run — generate + validate, write nothing
GEMINI_API_KEY=your-key DRY_RUN=true npm run generate-blog
```

### Quality gate (enforced before publishing)

A draft is **rejected** (not published) if it is missing any of: **≥1,500 words**
(target 1,800–2,800), **≥3 credible registry sources**, all required sections
including a **Frequently Asked Questions** block with **≥5 questions**,
**≥5 internal links**, a **checker-tool CTA**, a cluster-specific link,
**≥3 numbered action steps**, a **non-generic intro** (AI filler openers are
blocked), a **unique title ≤60 chars**, and a **meta description ≤160 chars**.
No unsourced statistics (every number must map to a cited source). Failures are
logged with exact reasons.

> This is the *weekly long-form bar* in `src/lib/post-quality.ts`. The
> corpus baseline in `scripts/check-blog-quality.mjs` stays laxer (≥500 words)
> so existing posts are not retroactively failed.

### Post structure

Each post uses MDX frontmatter (`title`, `date`, `summary`, `tags`, `sources`,
plus `primaryKeyword` / `secondaryKeywords`) and the User-QA structure: quick
answer, who's targeted, red flags, a realistic example, how to check safely,
what to do (before / if affected), where to report, FAQ, related Scam Checker
tools, and sources.

### Safety guardrails

- Mandatory disclaimer on every post.
- AI-sounding phrases are stripped from generated content.
- Duplicate topics are detected and skipped.


