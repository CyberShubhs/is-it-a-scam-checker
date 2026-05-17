import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCategoryBySlug } from '@/lib/posts';
import { BlogCategoryHub } from '@/components/BlogCategoryHub';

const SLUG = 'phishing';

export async function generateMetadata(): Promise<Metadata> {
    const category = getCategoryBySlug(SLUG);
    if (!category) return { title: 'Not Found' };
    return {
        title: `${category.title} | Scam Checker Blog`,
        description: category.description,
        alternates: { canonical: `https://scamchecker.app/blog/${SLUG}` },
        openGraph: {
            title: `${category.title} | Scam Checker Blog`,
            description: category.description,
            url: `https://scamchecker.app/blog/${SLUG}`,
        },
    };
}

export default function Page() {
    const category = getCategoryBySlug(SLUG);
    if (!category) notFound();
    return <BlogCategoryHub category={category} />;
}
