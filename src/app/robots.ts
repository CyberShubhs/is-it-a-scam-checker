
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            // /private/ is reserved; /api/* are JSON endpoints (report,
            // check-reputation, ip-reputation, report-vote, contact) that
            // should never be crawled or indexed as documents.
            disallow: ['/private/', '/api/'],
        },
        sitemap: 'https://scamchecker.app/sitemap.xml',
    }
}
