import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

/** Frontmatter fields required in every blog post. */
export interface PostFrontmatter {
    title: string;
    date: string; // YYYY-MM-DD
    summary: string;
    tags: string[];
    sources: string[];
}

export interface Post {
    slug: string;
    frontmatter: PostFrontmatter;
    content: string; // raw MDX body (without frontmatter)
}

const POSTS_DIR = path.join(process.cwd(), 'content', 'blog');

/**
 * List every .mdx post in content/blog/, sorted newest-first.
 * Files starting with _ (e.g. _template.mdx) are excluded.
 */
export function getAllPosts(): Post[] {
    if (!fs.existsSync(POSTS_DIR)) return [];

    const files = fs.readdirSync(POSTS_DIR).filter(
        (f) => f.endsWith('.mdx') && !f.startsWith('_'),
    );

    const posts: Post[] = files.map((filename) => {
        const slug = filename.replace(/\.mdx$/, '');
        const raw = fs.readFileSync(path.join(POSTS_DIR, filename), 'utf-8');
        const { data, content } = matter(raw);

        return {
            slug,
            frontmatter: data as PostFrontmatter,
            content,
        };
    });

    // Newest first
    posts.sort(
        (a, b) =>
            new Date(b.frontmatter.date).getTime() -
            new Date(a.frontmatter.date).getTime(),
    );

    return posts;
}

/**
 * Get a single post by its slug (filename without .mdx).
 * Returns null if not found.
 */
export function getPostBySlug(slug: string): Post | null {
    const filepath = path.join(POSTS_DIR, `${slug}.mdx`);
    if (!fs.existsSync(filepath)) return null;

    const raw = fs.readFileSync(filepath, 'utf-8');
    const { data, content } = matter(raw);

    return {
        slug,
        frontmatter: data as PostFrontmatter,
        content,
    };
}

/**
 * Editorial categories used for hub pages. Each one maps to a set of
 * tag keywords; a post belongs to a category if any of its tags or its
 * title matches.
 *
 * Order matters: a post is assigned to the first category that matches.
 */
export interface BlogCategory {
    slug: string;
    title: string;
    description: string;
    /** Matches against tags (case-insensitive substring) and post title. */
    keywords: string[];
}

export const BLOG_CATEGORIES: BlogCategory[] = [
    {
        slug: 'scam-alerts',
        title: 'Scam alerts and active fraud campaigns',
        description:
            'Live alerts on scam campaigns hitting consumers right now — what to look for, who is being targeted, and how to react quickly.',
        keywords: ['scam alert', 'urgent', 'active', 'campaign'],
    },
    {
        slug: 'phishing',
        title: 'Phishing scams and email fraud',
        description:
            'Deep dives on phishing emails, credential theft, and impersonation tactics — including real-world examples and detection tips.',
        keywords: ['phishing', 'email scam', 'spear phishing', 'credential', 'login'],
    },
    {
        slug: 'fake-websites',
        title: 'Fake websites and lookalike domains',
        description:
            'How fraudsters build convincing fake websites, lookalike domains, and clone storefronts — and how to spot them.',
        keywords: ['fake website', 'lookalike', 'fake site', 'domain', 'clone', 'storefront'],
    },
    {
        slug: 'crypto-scams',
        title: 'Crypto scams and investment fraud',
        description:
            'Wallet drainers, fake exchanges, pig-butchering rings, and other crypto-flavoured fraud campaigns.',
        keywords: ['crypto', 'bitcoin', 'wallet', 'investment scam', 'pig butchering', 'mining'],
    },
    {
        slug: 'job-scams',
        title: 'Job scams and fake employment offers',
        description:
            'Fake job offers, fake recruiters, task scams, equipment-purchase scams, and onboarding fraud — how they work and how to verify the employer before you reply.',
        keywords: [
            'job scam',
            'employment scam',
            'recruitment',
            'remote job',
            'fake check',
            'job offer',
            'onboarding',
            'i-9',
            'recruiter',
            'task scam',
        ],
    },
    {
        slug: 'marketplace-scams',
        title: 'Marketplace and rental scams',
        description:
            'Buyer/seller fraud on online marketplaces, overpayment scams, fake courier collection, and rental scams.',
        keywords: ['marketplace', 'rental', 'reshipping'],
    },
    {
        slug: 'text-message-scams',
        title: 'SMS, WhatsApp, and text message scams',
        description:
            'Smishing campaigns delivered by SMS and WhatsApp — fake delivery notifications, bank alerts, government impersonation, and more.',
        keywords: ['sms', 'text', 'smishing', 'whatsapp', 'message'],
    },
];

function postMatchesCategory(post: Post, category: BlogCategory): boolean {
    const haystack = [
        ...(post.frontmatter.tags || []),
        post.frontmatter.title,
        post.frontmatter.summary,
    ]
        .join(' ')
        .toLowerCase();
    return category.keywords.some((kw) => haystack.includes(kw.toLowerCase()));
}

export function getCategoryBySlug(slug: string): BlogCategory | null {
    return BLOG_CATEGORIES.find((c) => c.slug === slug) || null;
}

export function getPostsForCategory(slug: string): Post[] {
    const category = getCategoryBySlug(slug);
    if (!category) return [];
    return getAllPosts().filter((p) => postMatchesCategory(p, category));
}

/**
 * Returns the categories a post belongs to (used by post pages to link
 * back to their hubs).
 */
export function getCategoriesForPost(slug: string): BlogCategory[] {
    const post = getPostBySlug(slug);
    if (!post) return [];
    return BLOG_CATEGORIES.filter((c) => postMatchesCategory(post, c));
}

/**
 * Pick up to `limit` posts most relevant to the given post.
 * Ranking: shared-tag count, then recency. Falls back to newest posts.
 */
export function getRelatedPosts(currentSlug: string, limit: number = 4): Post[] {
    const all = getAllPosts().filter((p) => p.slug !== currentSlug);
    const current = getPostBySlug(currentSlug);
    if (!current) return all.slice(0, limit);

    const currentTags = new Set(
        (current.frontmatter.tags || []).map((t) => t.toLowerCase()),
    );

    const scored = all.map((p) => {
        const overlap = (p.frontmatter.tags || []).filter((t) =>
            currentTags.has(t.toLowerCase()),
        ).length;
        return { post: p, overlap };
    });

    scored.sort((a, b) => {
        if (b.overlap !== a.overlap) return b.overlap - a.overlap;
        return (
            new Date(b.post.frontmatter.date).getTime() -
            new Date(a.post.frontmatter.date).getTime()
        );
    });

    return scored.slice(0, limit).map((s) => s.post);
}
