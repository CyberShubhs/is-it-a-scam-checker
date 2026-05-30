import type { Metadata } from 'next';

/**
 * Shared metadata helper.
 *
 * Next.js shallow-merges the top-level `openGraph` / `twitter` keys: when a
 * route exports its own `openGraph`, it REPLACES the layout's object wholesale
 * rather than deep-merging. That silently dropped `og:image`, `og:site_name`,
 * the image dimensions, and `twitter:image` on ~100 pages, which Ahrefs
 * flagged as "Open Graph tags incomplete".
 *
 * Every indexable page builds its metadata through `pageMetadata()` so the
 * Open Graph + Twitter card blocks are always complete and consistent. The
 * deterministic SEO check (scripts/check-seo-hygiene.mjs) enforces that the
 * rendered output keeps every required tag, so this can't silently regress.
 */

export const SITE_URL = 'https://scamchecker.app';
export const SITE_NAME = 'Scam Checker';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.png`;
export const DEFAULT_OG_IMAGE_ALT =
    'Scam Checker — free, private online scam detection tool';
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

export interface PageMetaInput {
    /** Full <title> tag. Keep at or below 60 characters. */
    title: string;
    /** Meta description. Keep at or below 160 characters. */
    description: string;
    /**
     * Canonical URL. Pass either a full URL string or a route path
     * (e.g. '/about' or '' for the home page).
     */
    canonical?: string;
    /** Convenience alias for `canonical` when you only have a route path. */
    path?: string;
    /** og:title / twitter:title. Defaults to `title`. */
    ogTitle?: string;
    /** og:description / twitter:description. Defaults to `description`. */
    ogDescription?: string;
    /** og:type. 'website' (default) or 'article'. */
    type?: 'website' | 'article';
    /** Absolute og:image URL. Defaults to the site-wide OG image. */
    image?: string;
    imageAlt?: string;
    /** Article-only Open Graph fields. */
    publishedTime?: string;
    modifiedTime?: string;
    authors?: string[];
    tags?: string[];
}

function toAbsolute(canonicalOrPath: string): string {
    if (/^https?:\/\//i.test(canonicalOrPath)) return canonicalOrPath;
    if (canonicalOrPath === '' || canonicalOrPath === '/') return SITE_URL;
    return `${SITE_URL}${canonicalOrPath.startsWith('/') ? '' : '/'}${canonicalOrPath}`;
}

export function pageMetadata(input: PageMetaInput): Metadata {
    const canonical = toAbsolute(input.canonical ?? input.path ?? '');
    const ogTitle = input.ogTitle ?? input.title;
    const ogDescription = input.ogDescription ?? input.description;
    const image = input.image ?? DEFAULT_OG_IMAGE;
    const imageAlt = input.imageAlt ?? DEFAULT_OG_IMAGE_ALT;
    const type = input.type ?? 'website';

    const openGraph: NonNullable<Metadata['openGraph']> = {
        type,
        siteName: SITE_NAME,
        locale: 'en_US',
        title: ogTitle,
        description: ogDescription,
        url: canonical,
        images: [
            {
                url: image,
                width: OG_IMAGE_WIDTH,
                height: OG_IMAGE_HEIGHT,
                alt: imageAlt,
            },
        ],
    };

    if (type === 'article') {
        const article = openGraph as Record<string, unknown>;
        if (input.publishedTime) article.publishedTime = input.publishedTime;
        if (input.modifiedTime) article.modifiedTime = input.modifiedTime;
        if (input.authors && input.authors.length) article.authors = input.authors;
        if (input.tags && input.tags.length) article.tags = input.tags;
    }

    return {
        title: input.title,
        description: input.description,
        alternates: { canonical },
        openGraph,
        twitter: {
            card: 'summary_large_image',
            title: ogTitle,
            description: ogDescription,
            images: [image],
        },
    };
}
