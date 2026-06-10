import { MetadataRoute } from 'next'
import { guides } from '@/lib/guides'
import { getAllPosts, BLOG_CATEGORIES } from '@/lib/posts'
import { lastModifiedFor } from '@/lib/seoRoutes'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://scamchecker.app'

    // Guides + blog posts carry their own stable content dates (frontmatter),
    // so they keep deriving lastModified from data — NOT from deploy time.
    const guideUrls = guides.map((guide) => ({
        url: `${baseUrl}/guides/${guide.slug}`,
        lastModified: new Date(guide.date),
        changeFrequency: 'monthly' as const,
        priority: 0.8,
    }))

    const blogUrls = getAllPosts().map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        // Prefer the post's own updated/date so re-deploying doesn't bump it.
        lastModified: new Date(post.frontmatter.updated || post.frontmatter.date),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }))

    // Static / hub / report-category / blog-category routes now pull a STABLE
    // lastModified from the central registry (src/lib/seoRoutes.ts) instead of
    // `new Date()`, which previously marked every page modified on each deploy.
    const reportCategoryRoutes = [
        '/reports/websites',
        '/reports/phone-numbers',
        '/reports/emails',
        '/reports/crypto-wallets',
        '/reports/latest',
        '/reports/trending',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: lastModifiedFor(route),
        changeFrequency: 'daily' as const,
        priority: 0.7,
    }))

    const hubRoutes = [
        '/scam-types',
        '/scam-examples',
        '/scam-guides',
        '/scam-tools',
        '/latest-scams',
        '/report-a-scam',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: lastModifiedFor(route),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }))

    const staticRoutes = [
        '',
        '/about',
        // Author/E-E-A-T profile — indexable and linked sitewide from the
        // footer + every blog byline, so it must appear in the sitemap.
        '/author/shubham-singla',
        '/how-it-works',
        '/contact',
        '/privacy',
        '/terms',
        '/disclaimer',
        // Policy + compliance surfaces added 2026-05-29.
        '/cookies',
        '/security',
        '/data-removal',
        '/responsible-disclosure',
        '/guides',
        '/blog',
        '/check-scam-text',
        '/check-scam-email',
        '/check-scam-link',
        '/check',
        '/have-i-been-scammed',
        '/i-got-a-scam-message',
        '/global-scam-reporting',
        '/reports',
        // Keyword-targeted SEO pages — see SEO/KWResults.csv for demand.
        '/scam-website-checker',
        '/scam-phone-number-checker',
        '/crypto-scam-checker',
        '/scam-checker-australia',
        '/scam-website-checker-uk',
        // IP reputation + community report lookup tools (added 2026-06).
        '/check-scam-ip',
        '/scam-report-lookup',
        // Weekly scam-alerts email landing page (added 2026-06-11).
        '/weekly-scam-alerts',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: lastModifiedFor(route),
        changeFrequency: 'weekly' as const,
        priority: route === '' ? 1 : 0.6,
    }))

    const blogCategoryRoutes = BLOG_CATEGORIES.map((category) => ({
        url: `${baseUrl}/blog/${category.slug}`,
        lastModified: lastModifiedFor(`/blog/${category.slug}`),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }))

    return [
        ...staticRoutes,
        ...hubRoutes,
        ...reportCategoryRoutes,
        ...blogCategoryRoutes,
        ...guideUrls,
        ...blogUrls,
    ]
}
