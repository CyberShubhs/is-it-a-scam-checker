
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Scam Checker – Check if a Message, Email or Link Is a Scam",
    description: "Free online scam checker that helps you identify fraud by analysing messages, emails and links in seconds. Private, instant, and works worldwide.",
    // NOTE: meta `keywords` removed deliberately — Google has ignored it for
    // years and Bing actively treats it as a spam signal. Page-level intent is
    // now communicated via unique titles, descriptions and H1/H2 structure.
    openGraph: {
        type: "website",
        locale: "en",
        url: "https://scamchecker.app",
        title: "Scam Checker – Free Online Scam Detection Tool",
        description: "Check if a message, email, or link is a scam. Instant analysis to protect yourself from online fraud.",
        siteName: "Scam Checker",
        images: [
            {
                url: "https://scamchecker.app/og-default.png",
                width: 1200,
                height: 630,
                alt: "Scam Checker - Free online scam detection",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Scam Checker – Free Online Scam Detection Tool",
        description: "Check if a message, email, or link is a scam. Instant analysis to protect yourself from online fraud.",
        images: ["https://scamchecker.app/og-default.png"],
    },
    metadataBase: new URL('https://scamchecker.app'),
    alternates: {
        canonical: 'https://scamchecker.app',
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${inter.className} min-h-screen flex flex-col bg-slate-50`}>
                <Header />
                <main className="flex-1">
                    {children}
                </main>
                {/* Site-wide Organization + WebSite JSON-LD. Kept here so
                    every route inherits the entity definition. The home page
                    can layer FAQ / WebApplication on top of this. */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@graph': [
                                {
                                    '@type': 'Organization',
                                    '@id': 'https://scamchecker.app/#organization',
                                    name: 'Scam Checker',
                                    url: 'https://scamchecker.app',
                                    logo: {
                                        '@type': 'ImageObject',
                                        url: 'https://scamchecker.app/icon.png',
                                    },
                                    description:
                                        'Free, privacy-first scam checker. Paste a message, email, link, image, or PDF to detect fraud — analysis runs in the browser, nothing is stored.',
                                    sameAs: [
                                        'https://shubhamsingla.tech',
                                        'https://github.com/CyberShubhs',
                                    ],
                                    founder: {
                                        '@type': 'Person',
                                        '@id': 'https://scamchecker.app/author/shubham-singla#person',
                                        name: 'Shubham Singla',
                                        url: 'https://scamchecker.app/author/shubham-singla',
                                        sameAs: [
                                            'https://shubhamsingla.tech',
                                            'https://github.com/CyberShubhs',
                                        ],
                                    },
                                },
                                {
                                    '@type': 'WebSite',
                                    '@id': 'https://scamchecker.app/#website',
                                    url: 'https://scamchecker.app',
                                    name: 'Scam Checker',
                                    description:
                                        'Check if a message, link, email, SMS, image, or PDF is a scam. Free, private, no sign-up.',
                                    inLanguage: 'en',
                                    publisher: {
                                        '@id': 'https://scamchecker.app/#organization',
                                    },
                                },
                            ],
                        }),
                    }}
                />
                <Footer />
                {/* Consent-gated GA + the consent banner itself. Order
                    doesn't matter — GA listens for the consent event and
                    only mounts when granted. */}
                <CookieConsentBanner />
                <GoogleAnalytics />
                <Analytics />
            </body>
        </html>
    );
}
