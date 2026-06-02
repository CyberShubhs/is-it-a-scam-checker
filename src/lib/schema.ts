/**
 * Reusable JSON-LD builders.
 *
 * Centralising structured-data construction keeps schema consistent across
 * page templates and ensures it always matches visible content (a Google /
 * Ahrefs requirement). Render the returned objects with the <JsonLd> component.
 *
 * Rules baked in:
 *   - Absolute URLs on the production origin (Google prefers absolute @id/url).
 *   - Only emit a BreadcrumbList when the page actually shows breadcrumbs.
 *   - Tool schema is WebApplication (a SoftwareApplication subtype) since the
 *     checkers are interactive browser tools, free to use.
 */

export const SITE_ORIGIN = 'https://scamchecker.app';

function abs(path: string): string {
    if (/^https?:\/\//i.test(path)) return path;
    if (path === '' || path === '/') return SITE_ORIGIN;
    return `${SITE_ORIGIN}${path.startsWith('/') ? '' : '/'}${path}`;
}

export interface BreadcrumbItem {
    name: string;
    /** Route path ('/' for home) or absolute URL. */
    path: string;
}

/**
 * Build a BreadcrumbList. Pass the SAME trail the page renders visibly
 * (e.g. Home → Website Scam Checker) so schema and UI never drift.
 */
export function breadcrumbSchema(items: BreadcrumbItem[]) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: item.name,
            item: abs(item.path),
        })),
    };
}

export interface ToolSchemaInput {
    /** Tool name, e.g. "Website Scam Checker". */
    name: string;
    /** Route path, e.g. "/scam-website-checker". */
    path: string;
    /** One-sentence description matching the page's visible purpose. */
    description: string;
}

/**
 * Build WebApplication schema for an interactive (free, browser-based) checker
 * tool page. Mirrors the pattern already used on the existing tool pages.
 */
export function toolApplicationSchema({ name, path, description }: ToolSchemaInput) {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        '@id': `${abs(path)}#tool`,
        name,
        url: abs(path),
        description,
        applicationCategory: 'SecurityApplication',
        operatingSystem: 'Web',
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        inLanguage: 'en',
    };
}
