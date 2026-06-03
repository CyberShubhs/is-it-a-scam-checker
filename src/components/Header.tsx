'use client';

import Link from 'next/link';
import { ShieldAlert, Menu, X } from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';

export function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navLinks = [
        { href: '/check', label: 'Check for Scams' },
        { href: '/have-i-been-scammed', label: 'Have I Been Scammed?', className: 'text-red-600 font-bold hover:text-red-700' },
        { href: '/guides', label: 'Scam Guides' },
        { href: '/blog', label: 'Blog' },
        { href: '/reports', label: 'Community Reports' },
        { href: '/how-it-works', label: 'How it Works' },
        { href: '/about', label: 'About Us' },
        { href: '/contact', label: 'Contact' },
    ];

    return (
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
                    <ShieldAlert className="w-6 h-6" />
                    <span>Scam Checker</span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={link.className || "hover:text-primary transition-colors"}
                        >
                            {link.label}
                        </Link>
                    ))}
                    <Button asChild variant="default" size="sm">
                        <Link href="/check">Check for Free</Link>
                    </Button>
                </nav>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 text-slate-600 hover:text-slate-900"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                >
                    {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Navigation */}
            {mobileMenuOpen && (
                <nav className="md:hidden border-t bg-white">
                    <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`${link.className || "text-slate-700 hover:text-primary"} transition-colors py-2`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <Button asChild variant="default" className="w-full mt-2">
                            <Link href="/check" onClick={() => setMobileMenuOpen(false)}>
                                Check for Free
                            </Link>
                        </Button>
                    </div>
                </nav>
            )}
        </header>
    );
}
