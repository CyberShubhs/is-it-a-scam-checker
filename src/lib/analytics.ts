/**
 * GA4 client-side analytics utility.
 *
 * Privacy contract:
 *  - Never send pasted user content, URLs, domains, phone numbers, emails,
 *    file names, OCR text, names, OTPs, card details, or notes to GA.
 *  - Only the keys in `ALLOWED_KEYS` are forwarded; anything else is dropped.
 *
 * All event names are lower_snake_case.
 */

export const MEASUREMENT_ID =
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-4NCNQMQVFB';

export const GA_DEBUG = process.env.NEXT_PUBLIC_GA_DEBUG === 'true';

/** Hard-allowlist of params that may reach GA4. */
const ALLOWED_KEYS = new Set<string>([
    'check_type',
    'risk_level',
    'page_path',
    'page_title',
    'cta_location',
    'report_type',
    'file_type',
    'content_type',
    'has_url',
    'has_attachment',
    'result_bucket',
    'country_selected',
    'event_source',
    'plan_name',
    'destination_path',
    'destination_type',
]);

/** Explicit deny-list — used for assertions in tests. */
export const FORBIDDEN_KEYS = [
    'raw_text',
    'message_body',
    'email_body',
    'pasted_url',
    'domain',
    'phone_number',
    'email_address',
    'ip_address',
    'user_name',
    'report_notes',
    'extracted_text',
    'uploaded_file_name',
    'card_details',
    'cvv',
    'otp',
];

export type CheckType = 'url' | 'email' | 'sms' | 'whatsapp' | 'image' | 'pdf' | 'text' | 'unknown';
export type RiskLevel = 'low' | 'medium' | 'high' | 'unknown';
export type ResultBucket = 'safe' | 'suspicious' | 'dangerous' | 'unknown';
export type ReportType = 'url' | 'domain' | 'phone' | 'email' | 'message' | 'unknown';

export type EventParamValue = string | number | boolean | undefined;
export type EventParams = { [key: string]: EventParamValue };

/**
 * Strip any disallowed keys before sending to GA.
 * Exported for testing.
 *
 * Accepts any plain object (so typed param interfaces flow through without
 * needing an index signature) but the return type is always a narrow
 * `EventParams` map.
 */
export function sanitizeParams(params: object = {}): EventParams {
    const safe: EventParams = {};
    for (const [key, value] of Object.entries(params as Record<string, unknown>)) {
        if (!ALLOWED_KEYS.has(key)) continue;
        if (value === undefined || value === null || value === '') continue;
        if (
            typeof value !== 'string' &&
            typeof value !== 'number' &&
            typeof value !== 'boolean'
        ) {
            continue;
        }
        safe[key] = value;
    }
    return safe;
}

type GtagFn = (
    command: 'event' | 'config' | 'set' | 'js',
    target: string | Date,
    params?: Record<string, unknown>,
) => void;

declare global {
    interface Window {
        gtag?: GtagFn;
        dataLayer?: unknown[];
    }
}

function getGtag(): GtagFn | null {
    if (typeof window === 'undefined') return null;
    return window.gtag || null;
}

/** Core event sender. All wrappers must funnel through this. */
export function trackEvent(eventName: string, params: object = {}): void {
    if (typeof window === 'undefined') return;

    const safe = sanitizeParams(params);

    if (GA_DEBUG) {
        // Dev-only logging. Never logs raw user input because we sanitized first.
        console.debug('[analytics]', eventName, safe);
    }

    const gtag = getGtag();
    if (!gtag) return;

    gtag('event', eventName, safe);
}

// ------------------------------------------------------------------
// Typed wrappers — one per business event.
// ------------------------------------------------------------------

export interface CheckSubmittedParams {
    check_type: CheckType;
    page_path?: string;
    has_url?: boolean;
    has_attachment?: boolean;
    event_source?: string;
}

export function trackCheckSubmitted(params: CheckSubmittedParams): void {
    trackEvent('check_submitted', params);

    // Also fire the channel-specific event so users can build per-channel
    // funnels in GA4 without custom dimensions.
    switch (params.check_type) {
        case 'url':
            trackEvent('url_check_submitted', {
                page_path: params.page_path,
                has_url: true,
                event_source: params.event_source,
            });
            break;
        case 'email':
            trackEvent('email_check_submitted', {
                page_path: params.page_path,
                content_type: 'email',
                event_source: params.event_source,
            });
            break;
        case 'sms':
        case 'whatsapp':
        case 'text':
            trackEvent('sms_check_submitted', {
                page_path: params.page_path,
                content_type: 'sms_or_message',
                event_source: params.event_source,
            });
            break;
        default:
            break;
    }
}

/**
 * Fired the moment a user initiates a check (before analysis runs). Pairs with
 * `check_completed` to measure abandonment. Uses the same safe params as
 * `check_submitted` — only the checker type + page, never the content.
 */
export function trackCheckStarted(params: CheckSubmittedParams): void {
    trackEvent('check_started', params);
}

export interface CheckCompletedParams {
    check_type: CheckType;
    risk_level: RiskLevel;
    result_bucket: ResultBucket;
    page_path?: string;
}

export function trackCheckCompleted(params: CheckCompletedParams): void {
    trackEvent('check_completed', params);
}

export interface RiskBandShownParams {
    check_type: CheckType;
    risk_level: RiskLevel;
    result_bucket: ResultBucket;
    page_path?: string;
}

/** Fired when a Low/Medium/High risk band is rendered to the user. */
export function trackRiskBandShown(params: RiskBandShownParams): void {
    trackEvent('risk_band_shown', params);
}

export interface ReportSearchPerformedParams {
    /** What kind of entity was searched (url/phone/email/...) — NOT the value. */
    check_type?: CheckType;
    /** 'dangerous' if matches found, 'safe' if none — never the query itself. */
    result_bucket?: ResultBucket;
    page_path?: string;
}

/** Fired when a user searches the community report database (no query sent). */
export function trackReportSearchPerformed(params: ReportSearchPerformedParams = {}): void {
    trackEvent('report_search_performed', params);
}

export interface ArticleToolCtaClickedParams {
    page_path?: string;
    cta_location: string;
    destination_path: string;
    destination_type?: string;
}

/** Fired when a blog/article CTA into a checker/guide/report tool is clicked. */
export function trackArticleToolCtaClicked(params: ArticleToolCtaClickedParams): void {
    trackEvent('article_tool_cta_clicked', params);
}

export interface ContactFormSubmittedParams {
    page_path?: string;
    cta_location?: string;
    /** The enquiry category (support/press/…) — a safe enum, never the message. */
    content_type?: string;
}

/** Fired when the contact form is successfully submitted (no message content). */
export function trackContactFormSubmitted(params: ContactFormSubmittedParams = {}): void {
    trackEvent('contact_form_submitted', params);
}

export interface ReportSubmittedParams {
    report_type: ReportType;
    page_path?: string;
    country_selected?: string;
}

export function trackReportSubmitted(params: ReportSubmittedParams): void {
    trackEvent('report_submitted', params);
}

export interface HaveIBeenScammedStartedParams {
    page_path?: string;
    event_source?: string;
    cta_location?: string;
}

export function trackHaveIBeenScammedStarted(
    params: HaveIBeenScammedStartedParams = {},
): void {
    trackEvent('have_i_been_scammed_started', params);
}

export interface HaveIBeenScammedCompletedParams {
    risk_level: RiskLevel;
    result_bucket: ResultBucket;
    page_path?: string;
}

export function trackHaveIBeenScammedCompleted(
    params: HaveIBeenScammedCompletedParams,
): void {
    trackEvent('have_i_been_scammed_completed', params);
}

export interface ResultCopiedParams {
    check_type: CheckType;
    risk_level: RiskLevel;
    page_path?: string;
}

export function trackResultCopied(params: ResultCopiedParams): void {
    trackEvent('result_copied', params);
}

export interface GuideCtaClickedParams {
    page_path?: string;
    cta_location: string;
    destination_path: string;
}

export function trackGuideCtaClicked(params: GuideCtaClickedParams): void {
    trackEvent('guide_cta_clicked', params);
}

export type OutboundDestinationType =
    | 'government'
    | 'platform'
    | 'bank'
    | 'cybercrime'
    | 'other';

export interface OutboundReportLinkClickedParams {
    page_path?: string;
    destination_type: OutboundDestinationType;
    country_selected?: string;
}

export function trackOutboundReportLinkClicked(
    params: OutboundReportLinkClickedParams,
): void {
    trackEvent('outbound_report_link_clicked', params);
}

export interface PricingViewedParams {
    page_path?: string;
}

export function trackPricingViewed(params: PricingViewedParams = {}): void {
    trackEvent('pricing_viewed', params);
}

export type PlanName = 'free' | 'basic' | 'pro' | 'business' | 'unknown';

export interface SubscribeCtaClickedParams {
    plan_name: PlanName;
    page_path?: string;
    cta_location: string;
}

export function trackSubscribeCtaClicked(params: SubscribeCtaClickedParams): void {
    trackEvent('subscribe_cta_clicked', params);
}

export interface NewsletterSignupParams {
    page_path?: string;
    cta_location: string;
}

export function trackNewsletterSignupSubmitted(
    params: NewsletterSignupParams,
): void {
    trackEvent('newsletter_signup_submitted', params);
}

/**
 * Dev-only test helper. Sends a harmless event so devs can confirm the GA4
 * DebugView pipeline is working. Do not wire this into production UI.
 */
export function fireAnalyticsTestEvent(): void {
    trackEvent('analytics_test_event', {
        page_path:
            typeof window !== 'undefined' ? window.location.pathname : undefined,
        event_source: 'debug',
    });
}

// ------------------------------------------------------------------
// Helpers used by callers to map app-internal types into GA values.
// ------------------------------------------------------------------

export function mapRiskLevel(
    level: 'High' | 'Medium' | 'Low' | string | null | undefined,
): RiskLevel {
    if (level === 'High') return 'high';
    if (level === 'Medium') return 'medium';
    if (level === 'Low') return 'low';
    return 'unknown';
}

export function mapResultBucket(
    level: 'High' | 'Medium' | 'Low' | string | null | undefined,
): ResultBucket {
    if (level === 'High') return 'dangerous';
    if (level === 'Medium') return 'suspicious';
    if (level === 'Low') return 'safe';
    return 'unknown';
}
