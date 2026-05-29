# Engineering compliance checklist

**Status: requires legal review before commercial scale.** This document
captures the engineering posture we maintain. It does not certify the
site as "compliant" with any specific regulation. Treat it as a working
record that a legal reviewer can use to scope a formal compliance
assessment.

Last reviewed: 2026-05-29.

---

## EU / UK GDPR-style privacy rights

| Item | Status | Notes |
|---|---|---|
| Lawful basis documented per data category | ✅ | See `docs/privacy-data-map.md` ("Why" column). |
| Public privacy notice | ✅ | `/privacy` covers what is and isn't collected, retention, processors, contact. |
| Right of access (Art 15) | 🟡 | `/data-removal` collects requests; manual fulfilment by operator. |
| Right to rectification (Art 16) | 🟡 | Same flow as access. |
| Right to erasure (Art 17) | 🟡 | Same flow. Indefinite retention on reports is the open item — see TODO below. |
| Right to restrict processing (Art 18) | 🟡 | Operator-driven flag on a row is possible; not yet exposed. |
| Right to portability (Art 20) | ✅ | Reports tied to a value can be exported on request. |
| Right to object (Art 21) | ✅ | Cookie consent withdrawal + report removal. |
| Right not to be subject to automated decisions (Art 22) | ✅ | Tool is informational; no profiling, no scoring. |
| Cookie + telemetry consent | ✅ | Banner is opt-in for analytics, defaults to denied, Reject == Accept ergonomics. |
| Data processor list | ✅ | `/privacy` §5 + `docs/privacy-data-map.md`. |
| Cross-border data transfer notice | 🟡 | Vercel + Google data centres may sit outside EU; the privacy notice flags this; SCCs would be needed for commercial scale. |
| DPO / EU representative | ❌ | Not required at current volume. Re-evaluate at commercial scale. |
| Data breach response process | 🟡 | See "Breach response" below — informal at current scale. |
| Children policy (Art 8) | ✅ | `/privacy` §9, `/data-removal`. |

## ePrivacy / cookie consent

| Item | Status | Notes |
|---|---|---|
| Banner shown to all visitors | ✅ | `<CookieConsentBanner>` mounted in the root layout. |
| Reject as easy as Accept | ✅ | Side-by-side buttons, equal size and visual weight. |
| No pre-ticked consent | ✅ | Both options are explicit. |
| Non-essential analytics off until consent | ✅ | `<GoogleAnalytics>` only renders scripts after consent state == granted. |
| Manage / withdraw consent | ✅ | "Withdraw and re-ask" inside the banner; `/cookies` documents the cookie. |
| Consent record kept | ✅ | `sc_consent` cookie carries decision + version + ISO date. |
| Strictly necessary cookies named | ✅ | `/cookies` lists them. |

## Australian Privacy Principles (APP) posture

| Item | Status | Notes |
|---|---|---|
| Open and transparent management of personal information (APP 1) | ✅ | `/privacy`, `/cookies`, `/security`. |
| Anonymity / pseudonymity (APP 2) | ✅ | No account required. |
| Collection of solicited personal information (APP 3) | ✅ | Only the minimum needed for reports + rate-limit. |
| Dealing with unsolicited info (APP 4) | ✅ | Sensitive patterns are scrubbed by `src/lib/redact.ts` on POST. |
| Notification of collection (APP 5) | ✅ | Notes warning on the report modal + Privacy page. |
| Use or disclosure (APP 6) | ✅ | No secondary use; no disclosure beyond listed processors. |
| Direct marketing (APP 7) | ✅ | We don't run any. |
| Cross-border disclosure (APP 8) | 🟡 | Flagged in `/privacy`; requires SCC-level controls before commercial scale. |
| Government identifiers (APP 9) | ✅ | We don't adopt government identifiers; the scrubber redacts SSN / TFN / Medicare patterns from notes. |
| Quality (APP 10) | ✅ | `/data-removal` correction flow. |
| Security (APP 11) | ✅ | Salted IP hash; redaction; security headers; coordinated disclosure. |
| Access / correction (APP 12 + 13) | ✅ | `/data-removal`. |

## California (CCPA / CPRA) basics

| Item | Status | Notes |
|---|---|---|
| Notice at collection | ✅ | `/privacy`. |
| Right to know / access | ✅ | `/data-removal`. |
| Right to delete | ✅ | `/data-removal`. |
| Right to correct | ✅ | `/data-removal`. |
| Right to opt-out of sale / sharing | ✅ | We don't sell or share for cross-context behavioural advertising. |
| Right to limit use of sensitive PI | ✅ | We don't collect category-1 sensitive PI (SSN, driver's licence, etc.); the scrubber redacts these if accidentally pasted. |
| Children under 16 opt-in | ✅ | Site is not directed to children; data is removed on request. |
| Recognised "Global Privacy Control" header | 🟡 | Not yet honoured. TODO: treat `Sec-GPC: 1` request header as a denied-consent signal. |

## User-generated content & moderation risks

| Item | Status | Notes |
|---|---|---|
| Submission length limits | ✅ | 500-char value, 1000-char notes (server-enforced). |
| Type allowlist | ✅ | `ALLOWED_TYPES` in `/api/report`. |
| Rate limit | ✅ | 10/hour per salted IP hash. |
| Honeypot | ✅ | `website_check` field. |
| Sensitive data scrubber | ✅ | `src/lib/redact.ts`, applied before write AND at display. |
| Public masking | ✅ | Emails, phones, URLs masked via `maskReportValue`. |
| Removal flow | ✅ | `/data-removal`. |
| Moderation: defamation / harassment | 🟡 | Operator-only manual review at current volume. |
| HTML injection | ✅ | All report fields rendered as plain text. |
| XSS | ✅ | React escapes by default; no `dangerouslySetInnerHTML` on user data. |

## Breach response (engineering posture)

1. **Detect** — Vercel logs, GitHub Action failure alerts, manual audit
   via `npm run audit:blog-sources`. No SIEM at current scale.
2. **Contain** — temporary disable of `/api/report` POST via redeploy with
   route disabled if a write-path issue is suspected.
3. **Assess scope** — query Prisma for affected rows / time-window. Pull
   Vercel access logs.
4. **Notify** — operator emails affected reporters (where the value
   matches a contactable address), publishes a short notice via the
   homepage banner. Notifies relevant authorities per applicable
   regional thresholds (GDPR Art 33 = 72h notification to supervisory
   authority where high-risk; APP eligible data breach scheme; CCPA
   security-breach disclosure).
5. **Document** — write a public post-mortem; update this checklist.

At current volume this is best-effort. Commercial scale-up requires a
written incident-response plan + retainer with a privacy counsel.

## Retention policy

| Surface | Today | Recommendation |
|---|---|---|
| Reports | Indefinite | 24-month rolling auto-purge or anonymisation. Tracked as engineering TODO. |
| Consent cookie | 6 months | Keep. |
| GA cookies | 13 months | Keep (GA4 default). |
| Vercel platform logs | Plan default | Keep. |

## Deletion workflow

1. Reporter / data subject emails `privacy@scamchecker.app` via
   `/data-removal`.
2. Operator searches Postgres by `value_normalised` or `id`.
3. Row is deleted or fields are nulled, depending on the request.
4. Confirmation reply to the requester within 30 days.

## Children / minors policy

- Site is not directed to children under 13 (16 in some EU/UK contexts).
- Submission form warns submitters not to include personal data; the
  scrubber removes common identifiers if pasted.
- Removal of a child's data is honoured on receipt without requiring
  further proof.

## Third-party processor list (concise)

| Processor | Purpose | Region | Notes |
|---|---|---|---|
| Vercel | Hosting, edge, request logs, Vercel Analytics | US + global | SCC posture documented as TODO. |
| Google LLC | Google Analytics 4 (consent-gated) | US + global | Anonymise IP, no ad personalisation, no Google signals. |
| GitHub | Source hosting, Actions runner for auto-blog cron | US | No user data. |
| Google Gemini | LLM provider for auto-blog (GitHub Action only) | US + global | Receives only the FindQuestions topic + curated source IDs. |
| Groq | LLM fallback provider for auto-blog (GitHub Action only) | US | Same as above. |
| Prisma + Postgres | Persistent storage | Per database provider | Only masked + hashed data. |

## Outstanding engineering TODOs

- [ ] 24-month rolling retention / anonymisation on `Report` table.
- [ ] Honour `Sec-GPC: 1` request header as a denied consent signal.
- [ ] Add an admin-only moderation page so accepted removal requests can
      be actioned via UI instead of by hand.
- [ ] Add a `/api/report` `DELETE` (operator-only) so deletion requests
      can be audited.
- [ ] Add a written incident-response runbook (not just this checklist).
- [ ] Consider an SCC-level data-transfer addendum if/when commercial.

## Disclaimer

This checklist is an engineering working document. It does not
constitute legal advice. Regional regulators differ on materiality,
notification thresholds, and lawful bases. Before any commercial
launch or material change in data practice, get sign-off from a
privacy lawyer in the relevant jurisdiction(s).
