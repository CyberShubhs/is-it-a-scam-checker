# Analytics Events

This document is the source of truth for GA4 event tracking on Scam Checker.
All events are sent client-side via the helpers in `src/lib/analytics.ts`.

## Installation

GA4 is loaded by `src/components/GoogleAnalytics.tsx` which is mounted once in
`src/app/layout.tsx`. The Measurement ID is read from
`NEXT_PUBLIC_GA_MEASUREMENT_ID` (falling back to the existing production ID
`G-4NCNQMQVFB` if unset, so the site keeps tracking if the env var has not been
provisioned yet).

GA4 only loads when `NODE_ENV === 'production'` **or** when
`NEXT_PUBLIC_GA_DEBUG=true`, so dev sessions do not pollute production reports.

### Local debug pipeline

1. Set `NEXT_PUBLIC_GA_DEBUG=true` in `.env.local`.
2. Run `npm run dev` and open the page you want to inspect.
3. In GA4: **Admin → Data display → DebugView**. Your device will appear there
   in near real time.
4. Trigger an event (e.g. submit the scam checker). You should see it appear in
   DebugView and a sanitised `[analytics]` log line in the browser console.

## Privacy contract

`trackEvent` runs every param through `sanitizeParams` before forwarding it to
`gtag`. Only the keys below are forwarded — anything else is silently dropped.

### Allowed parameters

| Key | Type | Notes |
| --- | --- | --- |
| `check_type` | string | `url`, `email`, `sms`, `whatsapp`, `image`, `pdf`, `text`, `unknown` |
| `risk_level` | string | `low`, `medium`, `high`, `unknown` |
| `page_path` | string | First-party path only |
| `page_title` | string | Public page title |
| `cta_location` | string | Short slug describing the CTA position |
| `report_type` | string | `url`, `domain`, `phone`, `email`, `message`, `unknown` |
| `file_type` | string | e.g. `pdf`, `png`, `docx` |
| `content_type` | string | `email`, `sms_or_message` |
| `has_url` | boolean | Whether the check included a URL |
| `has_attachment` | boolean | Whether the check included a file |
| `result_bucket` | string | `safe`, `suspicious`, `dangerous`, `unknown` |
| `country_selected` | string | Only when the user explicitly selects a country |
| `event_source` | string | Short identifier of which component fired the event |
| `plan_name` | string | `free`, `basic`, `pro`, `business`, `unknown` |
| `destination_path` | string | Internal path target of a CTA |
| `destination_type` | string | `government`, `platform`, `bank`, `cybercrime`, `other` |

### Forbidden parameters (will be stripped)

Never call `trackEvent` with any of:

- `raw_text`, `message_body`, `email_body`, `extracted_text`, `report_notes`
- `pasted_url`, `domain`, `phone_number`, `email_address`, `ip_address`,
  `user_name`, `uploaded_file_name`
- `card_details`, `cvv`, `otp`

The `FORBIDDEN_KEYS` constant in `src/lib/analytics.ts` is asserted in
`src/lib/analytics.test.ts`. If a forbidden key ever leaks into a call site,
the test fails.

## Events

### `check_submitted` (primary)

Fires once when the user submits any scam check. Also fans out into the
channel-specific siblings `url_check_submitted`, `email_check_submitted`, and
`sms_check_submitted` so per-channel funnels can be built without custom
dimensions.

Params: `check_type`, `page_path`, `has_url`, `has_attachment`, `event_source`.

Fired from: `src/components/ScamChecker.tsx` `handleCheck`.

### `check_completed` (primary)

Fires once when the scorer produces a result.

Params: `check_type`, `risk_level`, `result_bucket`, `page_path`.

Fired from: `src/components/ScamChecker.tsx` `handleCheck` after the scorer
resolves.

### `have_i_been_scammed_started` (primary)

Fires the first time the user answers a question on the HIBS flow, OR when a
CTA pointing at `/have-i-been-scammed` is clicked.

Params: `page_path`, `event_source`, `cta_location`.

Fired from: `src/app/have-i-been-scammed/page.tsx` and `GuideCtaLink` when
`href === '/have-i-been-scammed'`.

### `have_i_been_scammed_completed` (primary)

Fires once when the HIBS results screen mounts.

Params: `risk_level`, `result_bucket`, `page_path`.

### `report_submitted` (primary)

Fires once when the report API returns 200.

Params: `report_type`, `page_path`, `country_selected` (when known).

Fired from: `src/components/ReportModal.tsx`.

### `result_copied` (secondary)

Fires once per "Copy result" click; debounced for 2 seconds.

Params: `check_type`, `risk_level`, `page_path`.

Fired from: `src/components/AnalysisResult.tsx`.

### `guide_cta_clicked` (secondary)

Fires when a guide/blog page CTA pointing at one of our primary tools is
clicked.

Params: `page_path`, `cta_location`, `destination_path`.

Fired from: `GuideCtaLink` (see `src/components/TrackedLinks.tsx`).

### `outbound_report_link_clicked` (secondary)

Fires when a user clicks an external official reporting link.

Params: `page_path`, `destination_type`, `country_selected` (when known). The
target URL is never sent.

Fired from: `OutboundReportLink`.

### `subscribe_cta_clicked` (primary, optional)

Helper exists; wire it up when a pricing/subscription CTA is introduced.

Params: `plan_name`, `page_path`, `cta_location`.

### `newsletter_signup_submitted` (secondary, optional)

Helper exists; wire it up when a newsletter form is added. **Never** send the
email address.

### `pricing_viewed` (optional)

Helper exists; call it from a pricing page once one is added.

### `analytics_test_event` (dev-only)

`fireAnalyticsTestEvent()` is exported for confirming the DebugView pipeline.
Do not expose it in production UI.

## Marking events as key events in GA4

Claude/agents cannot click into your GA4 account. You must do this manually:

1. **GA4 → Admin → Data display → Events.**
2. Wait until the event appears (events can take up to 24–48 hours to register
   the first time).
3. Toggle **Mark as key event** for each event below:

**Primary key events:**

- `check_submitted`
- `check_completed`
- `report_submitted`
- `have_i_been_scammed_started`
- `have_i_been_scammed_completed`
- `subscribe_cta_clicked`

**Secondary key events:**

- `result_copied`
- `guide_cta_clicked`
- `outbound_report_link_clicked`
- `newsletter_signup_submitted`

If a brand-new event has never fired, use **Create event → Create** to scaffold
it, then mark it. Note: GA4 may need several hours after first firing before
the event shows up.

## Adding a new event

1. Pick a `lower_snake_case` name.
2. Add a typed wrapper to `src/lib/analytics.ts` (or call `trackEvent`
   directly if a wrapper would be overkill).
3. Whitelist any new param keys in the `ALLOWED_KEYS` set, otherwise they will
   be stripped.
4. Document it here.
5. Mention whether it should be a key event in GA4 admin.
