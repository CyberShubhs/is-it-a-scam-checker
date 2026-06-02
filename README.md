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
| `GEMINI_API_KEY` | Optional | Server only (CI) | Auto-blog generation |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Optional | Client | Google Analytics 4 |

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

The repo includes a fully automatic blog publishing system that generates original, SEO-optimised scam alert posts using **Google Gemini AI** and commits them directly to `main`.

### How It Works

1. A **GitHub Action** (`.github/workflows/auto-blog.yml`) runs twice daily (6AM + 6PM UTC) and on manual dispatch.
2. It calls **Gemini AI** (with model fallback: 2.5 Flash → 2.0 Flash → 2.0 Flash Lite) to research current scam/cybersecurity threats and write an original blog post.
3. The script strips AI-sounding language using a blocklist of 150+ known chatbot phrases.
4. Duplicate topics are detected and skipped to keep content fresh.
5. Posts are committed directly to `main` and **Vercel auto-deploys** — fully hands-off.

### Setup

1. Get a free Gemini API key at [aistudio.google.com](https://aistudio.google.com/apikey)
2. Add it as a GitHub repository secret named `GEMINI_API_KEY`
3. In repo Settings → Actions → General → set "Read and write permissions"

### Local Testing

```bash
# Generate a draft post locally (requires GEMINI_API_KEY env var)
GEMINI_API_KEY=your-key npm run generate-blog

# Run dev server and visit http://localhost:3000/blog
npm run dev

# Build to verify no errors
npm run build
```

### Post Structure

Every post uses MDX with required frontmatter (`title`, `date`, `summary`, `tags`, `sources`) and follows a journalistic structure: opening hook, how the scam works, who is targeted, red flags, action steps, reporting links, and a closing CTA.

### Safety Guardrails

- Posts include a mandatory disclaimer: *"This post is for informational purposes only and does not constitute legal or financial advice."*
- A lint check rejects posts containing dangerous phrases outside of clearly labelled warning contexts.
- AI-sounding phrases are automatically stripped from generated content.
- Duplicate topics are detected and skipped.


