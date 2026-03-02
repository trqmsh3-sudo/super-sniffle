// =============================================================================
// ClearPick.ai — Navbar
// Sticky top, logo, categories dropdown, how it works, saved, dark mode toggle
// Clean shadow on scroll · mobile hamburger
// =============================================================================

'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// ── Categories ───────────────────────────────────────────────────────────────

const CATEGORIES = [
  { slug: 'laptops', name: 'Laptops', icon: '💻' },
  { slug: 'phones', name: 'Phones', icon: '📱' },
  { slug: 'headphones', name: 'Headphones', icon: '🎧' },
  { slug: 'cameras', name: 'Cameras', icon: '📷' },
  { slug: 'televisions', name: 'TVs', icon: '📺' },
  { slug: 'tablets', name: 'Tablets', icon: '📱' },
  { slug: 'speakers', name: 'Speakers', icon: '🔊' },
  { slug: 'watches', name: 'Watches', icon: '⌚' },
  { slug: 'gaming-consoles', name: 'Gaming', icon: '🎮' },
  { slug: 'cars', name: 'Cars', icon: '🚗' },
] as const;

// ── Component ────────────────────────────────────────────────────────────────

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const catRef = useRef<HTMLDivElement>(null);

  // Shadow on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close category dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) {
        setCatOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setCatOpen(false);
  }, [pathname]);

  // Hide navbar on homepage hero (optional — show everywhere)
  const isHome = pathname === '/';

  return (
    <nav
      className={`
        sticky top-0 z-50 w-full transition-all duration-200
        ${scrolled ? 'shadow-nav' : ''}
        ${isHome ? 'bg-white/90 backdrop-blur-xl' : 'bg-white/95 backdrop-blur-xl border-b border-surface-border'}
      `}
    >
      <div className="mx-auto flex max-w-content items-center justify-between px-4 py-3 sm:px-6">
        {/* ── Logo ──────────────────────────────────────────────────────── */}
        <Link href="/" className="flex items-center gap-1.5 text-xl font-bold tracking-tight text-primary-800">
          Clear<span className="text-accent">Pick</span>
          <span className="text-[11px] font-semibold text-primary-300">.ai</span>
        </Link>

        {/* ── Desktop Nav ───────────────────────────────────────────────── */}
        <div className="hidden items-center gap-1 md:flex">
          {/* Categories dropdown */}
          <div ref={catRef} className="relative">
            <button
              onClick={() => setCatOpen(!catOpen)}
              className={`
                flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors
                ${catOpen ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
              `}
            >
              Categories
              <svg className={`h-4 w-4 transition-transform ${catOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {catOpen && (
              <div className="absolute left-0 top-full mt-1 w-56 animate-slide-down rounded-xl border border-surface-border bg-white p-2 shadow-card-hover">
                {CATEGORIES.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/category/${cat.slug}`}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-gray-700 transition-colors hover:bg-primary-50 hover:text-primary-700"
                  >
                    <span className="text-base">{cat.icon}</span>
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* How it works */}
          <Link
            href="/#how-it-works"
            className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
          >
            How it works
          </Link>
        </div>

        {/* ── Right actions ──────────────────────────────────────────────── */}
        <div className="flex items-center gap-2">
          {/* Saved items */}
          <button
            className="relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
            aria-label="Saved items"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
            </svg>
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-50 md:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* ── Mobile Menu ─────────────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="animate-slide-down border-t border-surface-border bg-white px-4 pb-4 md:hidden">
          <div className="py-2">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Categories
            </p>
            <div className="grid grid-cols-2 gap-1">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-gray-700 transition-colors hover:bg-primary-50"
                >
                  <span>{cat.icon}</span>
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
          <Link
            href="/#how-it-works"
            className="mt-2 block rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            How it works
          </Link>
        </div>
      )}
    </nav>
  );
}
