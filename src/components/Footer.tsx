import Link from 'next/link';

type FooterLink = { href: string; label: string; emphasis?: 'red' };

const sections: { heading: string; links: FooterLink[] }[] = [
    {
        heading: 'Tools',
        links: [
            { href: '/check', label: 'General scam checker' },
            { href: '/check-scam-text', label: 'Check a suspicious text or SMS' },
            { href: '/check-scam-email', label: 'Check a suspicious email' },
            { href: '/check-scam-link', label: 'Check a suspicious link or URL' },
            { href: '/scam-website-checker', label: 'Scam website checker (shopping & stores)' },
            { href: '/scam-phone-number-checker', label: 'Scam phone number checker' },
            { href: '/crypto-scam-checker', label: 'Crypto scam checker' },
            { href: '/guides/job-scams', label: 'Job scam checker (fake job offers)' },
            {
                href: '/guides/is-this-website-legit',
                label: 'Is this website legit? Buyer guide',
            },
            { href: '/scam-tools', label: 'All free scam-checking tools' },
            {
                href: '/have-i-been-scammed',
                label: 'Have I been scammed? Damage-control checklist',
                emphasis: 'red',
            },
        ],
    },
    {
        heading: 'Learn',
        links: [
            { href: '/scam-types', label: 'Scam types explained by category' },
            { href: '/scam-examples', label: 'Real scam message examples' },
            { href: '/scam-guides', label: 'Scam identification guides' },
            { href: '/guides', label: 'All guides on Scam Checker' },
            { href: '/blog', label: 'Scam alerts and fraud news blog' },
            { href: '/blog/job-scams', label: 'Job scams and fake employment offers' },
            { href: '/scam-checker-australia', label: 'Scam checker (Australia)' },
            { href: '/scam-website-checker-uk', label: 'Scam website checker (UK)' },
            { href: '/how-it-works', label: 'How our scam detection works' },
        ],
    },
    {
        heading: 'Community',
        links: [
            { href: '/reports', label: 'Community-reported scams' },
            { href: '/reports/latest', label: 'Latest community scam reports' },
            { href: '/reports/trending', label: 'Trending scam reports' },
            { href: '/reports/websites', label: 'Reported scam websites' },
            { href: '/reports/phone-numbers', label: 'Reported scam phone numbers' },
            { href: '/reports/emails', label: 'Reported scam email senders' },
            { href: '/reports/crypto-wallets', label: 'Reported scam crypto wallets' },
            { href: '/latest-scams', label: 'Latest scam alerts and campaigns' },
            { href: '/report-a-scam', label: 'Report a scam in 60 seconds' },
            {
                href: '/global-scam-reporting',
                label: 'Official scam reporting by country',
            },
        ],
    },
    {
        heading: 'Trust',
        links: [
            { href: '/about', label: 'About Scam Checker' },
            { href: '/author/shubham-singla', label: 'Author: Shubham Singla' },
            { href: '/contact', label: 'Contact the team' },
            { href: '/privacy', label: 'Privacy policy' },
            { href: '/cookies', label: 'Cookie policy' },
            { href: '/terms', label: 'Terms of use' },
            { href: '/disclaimer', label: 'Disclaimer' },
            { href: '/security', label: 'Security' },
            { href: '/responsible-disclosure', label: 'Responsible disclosure' },
            { href: '/data-removal', label: 'Data removal request' },
        ],
    },
];

export function Footer() {
    return (
        <footer className="w-full bg-slate-900 text-slate-300 py-12 mt-auto">
            <div className="container mx-auto px-4">
                <div className="mb-10">
                    <h3 className="text-white font-bold text-lg mb-3">Scam Checker</h3>
                    <p className="text-sm max-w-2xl mb-2 leading-relaxed">
                        Free tools and guides to check whether a website, email, or
                        message is a scam. We use pattern recognition to help people
                        identify fraud before they become victims.
                    </p>
                    <p className="text-sm font-medium text-emerald-400">
                        Free, private scam checks. No sign-up required.
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
                    {sections.map((section) => (
                        <nav
                            key={section.heading}
                            aria-label={`Footer ${section.heading} links`}
                        >
                            <h3 className="text-white font-bold text-base mb-4">
                                {section.heading}
                            </h3>
                            <ul className="space-y-2 text-sm">
                                {section.links.map((link) => (
                                    <li key={link.href}>
                                        <Link
                                            href={link.href}
                                            className={
                                                link.emphasis === 'red'
                                                    ? 'text-red-400 font-bold hover:text-red-300'
                                                    : 'hover:text-white'
                                            }
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    ))}
                </div>
                <div className="border-t border-slate-700 pt-8 text-center text-sm">
                    <p className="mb-2">
                        Built privacy-first by{' '}
                        <a
                            href="https://shubhamsingla.tech"
                            target="_blank"
                            rel="author noopener noreferrer"
                            className="text-white hover:underline"
                        >
                            Shubham Singla — shubhamsingla.tech
                        </a>
                        {' '}·{' '}
                        <a
                            href="https://github.com/CyberShubhs"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white hover:underline"
                            aria-label="Scam Checker source code on GitHub (@CyberShubhs)"
                        >
                            GitHub (@CyberShubhs)
                        </a>
                    </p>
                    <p>© {new Date().getFullYear()} Scam Checker. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
