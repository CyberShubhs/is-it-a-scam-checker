import { MetadataRoute } from 'next'
import { guides } from '@/lib/guides'
import { getAllPosts, BLOG_CATEGORIES } from '@/lib/posts'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://scamchecker.app'

    const guideUrls = guides.map((guide) => ({
        url: `${baseUrl}/guides/${guide.slug}`,
        lastModified: new Date(guide.date),
        changeFrequency: 'monthly' as const,
        priority: 0.8,
    }))

    const blogUrls = getAllPosts().map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: new Date(post.frontmatter.date),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }))

    const reportCategoryRoutes = [
        '/reports/websites',
        '/reports/phone-numbers',
        '/reports/emails',
        '/reports/crypto-wallets',
        '/reports/latest',
        '/reports/trending',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
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
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }))

    const staticRoutes = [
        '',
        '/about',
        '/how-it-works',
        '/contact',
        '/privacy',
        '/terms',
        '/disclaimer',
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
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: route === '' ? 1 : 0.6,
    }))

    const blogCategoryRoutes = BLOG_CATEGORIES.map((category) => ({
        url: `${baseUrl}/blog/${category.slug}`,
        lastModified: new Date(),
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
