import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    // Content-Security-Policy. The auto-blog generator and the page templates
    // emit JSON-LD via `dangerouslySetInnerHTML`, so we keep `'unsafe-inline'`
    // for script-src and style-src (Tailwind's inline runtime needs it too).
    // We pin everything else: scripts only from self + Google Tag Manager
    // (which only loads after consent), images from self + Vercel-hosted OG
    // assets, fonts from self + the Inter subset Next ships, frame-ancestors
    // 'none' so the page can't be embedded for clickjacking.
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://www.google-analytics.com https://vercel.live",
      "font-src 'self' data:",
      "connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://vitals.vercel-insights.com",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "upgrade-insecure-requests",
    ].join('; ');

    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          // HSTS — 2 years, includeSubDomains, preload-ready. The
          // production domain serves HTTPS exclusively, Vercel handles
          // certs and renewals.
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Permissions-Policy',
            value:
              'camera=(), microphone=(), geolocation=(), payment=(), usb=(), accelerometer=(), gyroscope=(), magnetometer=(), midi=(), browsing-topics=()',
          },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
          { key: 'Content-Security-Policy', value: csp },
        ],
      },
      // Build assets are not pages. Google was indexing stale hashed chunk
      // URLs (with ?dpl=... query params) as "Crawled - currently not
      // indexed" / 404 noise. We don't block them in robots.txt — Google
      // needs JS and CSS to render — but they shouldn't be treated as
      // indexable documents.
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow',
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // Legacy guide URLs surfaced as 404s in Google Search Console
      // (export dated 2026-05-22). Mapped to the closest current resource
      // so existing backlinks and recrawls don't keep returning 404.
      {
        source: '/guides/check-scam-invoices-pdf',
        destination: '/guides/email-phishing-examples',
        permanent: true,
      },
      {
        source: '/guides/is-this-a-scam-message',
        destination: '/check',
        permanent: true,
      },
      {
        source: '/guides/ato-scams-australia',
        destination: '/guides/ato-scam-text-email',
        permanent: true,
      },
      // Consolidate the byte-identical Scam Watch roundup duplicate to the
      // canonical shorter slug.
      {
        source: '/blog/2026-02-22-scam-watch-roundup-general-advice-to-sta-691b7f',
        destination: '/blog/2026-02-22-scam-watch-roundup-general-advice',
        permanent: true,
      },
      // Thin / unsourced / generated blog posts under 500 words. Each one
      // is mapped to the closest stronger cluster hub, guide, or tool page.
      // The source MDX files have been removed so they no longer populate
      // the sitemap. See SEO/reports/2026-05-22-235309-AEST-gsc-82-url-triage.md
      // for the full rationale per URL.
      {
        source: '/blog/2026-04-14-australia-loses-5m-to-new-ato-refund-scam-8b29d8',
        destination: '/guides/ato-scam-text-email',
        permanent: true,
      },
      {
        source: '/blog/2026-04-14-crypto-app-scam-australians-lose-30m-to-fake-tradi-3b0eb0',
        destination: '/crypto-scam-checker',
        permanent: true,
      },
      {
        source: '/blog/2026-04-14-job-seeker-scam-alert-1-5m-lost-09b290',
        destination: '/guides/job-scams',
        permanent: true,
      },
      {
        source: '/blog/2026-04-14-student-loan-scam-alert-3-5m-lost-32637a',
        destination: '/check',
        permanent: true,
      },
      {
        source: '/blog/2026-04-15-data-breach-hits-300-000-check-your-info-now-1de6c9',
        destination: '/have-i-been-scammed',
        permanent: true,
      },
      {
        source: '/blog/2026-04-15-tax-season-scam-costs-10m-61797d',
        destination: '/check',
        permanent: true,
      },
      {
        source: '/blog/2026-04-16-crypto-payment-scam-alert-1-2m-lost-89175f',
        destination: '/crypto-scam-checker',
        permanent: true,
      },
      {
        source: '/blog/2026-04-16-data-breach-exposes-1-5m-users-0263c6',
        destination: '/have-i-been-scammed',
        permanent: true,
      },
      {
        source: '/blog/2026-04-17-fbi-warns-of-10m-romance-scam-062bfa',
        destination: '/check',
        permanent: true,
      },
      {
        source: '/blog/2026-04-18-1-5m-exposed-cyber-breach-alert-f548b1',
        destination: '/have-i-been-scammed',
        permanent: true,
      },
      {
        source: '/blog/2026-04-19-new-bank-text-scam-hits-10-000-3da7dd',
        destination: '/guides/bank-impersonation-scams',
        permanent: true,
      },
      {
        source: '/blog/2026-04-20-nigeria-s-n20m-text-scam-hits-8-000-443ce4',
        destination: '/guides/scam-text-message-examples',
        permanent: true,
      },
      {
        source: '/blog/2026-04-21-fbi-warns-of-15m-social-security-scam-980b96',
        destination: '/blog/2026-04-17-ssa-scam-alert-imposters-steal-millions-from-us-se-e809ce',
        permanent: true,
      },
      {
        source: '/blog/2026-04-22-tax-season-scam-alert-15m-lost-694527',
        destination: '/check',
        permanent: true,
      },
      {
        source: '/blog/2026-04-23-2-5m-hit-by-latest-phishing-scam-ee86c5',
        destination: '/guides/email-phishing-examples',
        permanent: true,
      },
      {
        source: '/blog/2026-04-24-elderly-lose-8m-to-scam-calls-f3e54b',
        destination: '/scam-phone-number-checker',
        permanent: true,
      },
      {
        source: '/blog/2026-04-27-dating-app-scam-10m-lost-in-6-months-9c58e2',
        destination: '/check',
        permanent: true,
      },
      {
        source: '/blog/2026-04-27-employment-scam-costs-4m-ed6311',
        destination: '/guides/job-scams',
        permanent: true,
      },
      {
        source: '/blog/2026-04-29-4-500-uk-seniors-lose-1-2m-to-pension-scam-03b54a',
        destination: '/check',
        permanent: true,
      },
      {
        source: '/blog/2026-04-29-new-phishing-tactic-steals-6m-37f8b1',
        destination: '/guides/email-phishing-examples',
        permanent: true,
      },
      {
        source: '/blog/2026-05-05-may-2026-13-000-uk-citizens-lose-8-5m-928998',
        destination: '/check',
        permanent: true,
      },
      {
        source: '/blog/2026-05-05-nz-3-6m-lost-to-fake-bill-scam-de1bfd',
        destination: '/check',
        permanent: true,
      },
      {
        source: '/blog/2026-05-07-data-breach-8-million-affected-346733',
        destination: '/have-i-been-scammed',
        permanent: true,
      },
      {
        source: '/blog/2026-05-11-elderly-lose-10m-to-fake-tech-support-64672d',
        destination: '/scam-phone-number-checker',
        permanent: true,
      },
      {
        source: '/blog/2026-05-15-2-5m-lost-to-new-invoice-scam-0e7ed7',
        destination: '/guides/email-phishing-examples',
        permanent: true,
      },
      {
        source: '/blog/2026-05-18-10m-lost-to-fake-job-scams-4c6c3d',
        destination: '/guides/job-scams',
        permanent: true,
      },

      // ── Pillar-URL aliases ────────────────────────────────────────────
      // Map the canonical pillar slugs requested in the SEO brief to the
      // existing comprehensive coverage on the site. We deliberately do
      // NOT create thin duplicate pillar pages: each destination is an
      // existing page that already has the H1 / 700-1200-word coverage
      // and the internal linking the brief calls for. Permanent (308)
      // so search engines collapse the slugs into the canonical URL.
      {
        source: '/phishing-scams',
        destination: '/guides/email-phishing-examples',
        permanent: true,
      },
      {
        source: '/email-scams',
        destination: '/check-scam-email',
        permanent: true,
      },
      {
        source: '/sms-scams',
        destination: '/check-scam-text',
        permanent: true,
      },
      {
        source: '/whatsapp-scams',
        destination: '/check-scam-text',
        permanent: true,
      },
      {
        source: '/website-scams',
        destination: '/scam-website-checker',
        permanent: true,
      },
      {
        source: '/crypto-scams',
        destination: '/crypto-scam-checker',
        permanent: true,
      },
      {
        source: '/job-scams',
        destination: '/guides/job-scams',
        permanent: true,
      },
      {
        source: '/marketplace-scams',
        destination: '/blog/marketplace-scams',
        permanent: true,
      },
      {
        source: '/what-to-do-after-being-scammed',
        destination: '/have-i-been-scammed',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
