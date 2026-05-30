import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { pageMetadata } from '@/lib/seo';

// The page itself is a client component (interactive assessment), which
// cannot export metadata. This thin server layout gives the route a unique
// title, description, canonical, and complete Open Graph / Twitter tags
// instead of inheriting the generic site-wide defaults from the root layout.
export const metadata: Metadata = pageMetadata({
    title: 'Have I Been Scammed? Damage-Control Checklist',
    description:
        'A step-by-step checklist for what to do right after a scam — lock down accounts, stop payments, and report it to the right authorities. Free and private.',
    canonical: 'https://scamchecker.app/have-i-been-scammed',
});

export default function HaveIBeenScammedLayout({
    children,
}: {
    children: ReactNode;
}) {
    return children;
}
