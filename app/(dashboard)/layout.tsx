'use client';

// CANONICAL app chrome for Julley's product pages (/learn, /sonam, /dashboard).
// Julley has no accounts, so there is no user menu and no sidebar: three nav
// links, a skip link, and a footer that repeats the product promise. The
// About link is required after the last content link, and the footer carries
// the ZeroOrigine line.

import Link from 'next/link';
import { useState } from 'react';

const NAV_LINKS = [
  { href: '/learn', label: 'Learn' },
  { href: '/sonam', label: 'Sonam' },
  { href: '/about', label: 'About' },
];

function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" focusable="false">
      <rect width="64" height="64" rx="14" className="fill-amber-700" />
      <circle cx="44" cy="21" r="7" className="fill-amber-300" />
      <path d="M8 50 L26 24 L38 42 L46 32 L58 50 Z" className="fill-amber-50" />
    </svg>
  );
}

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const year = new Date().getFullYear();

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-amber-700 focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-white"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-40 border-b border-amber-100/80 bg-amber-50/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex min-h-[44px] items-center gap-2.5 rounded-lg">
            <Mark className="h-8 w-8" />
            <span className="font-display text-xl font-extrabold tracking-tight text-stone-900">Julley</span>
            <span aria-hidden="true" className="hidden pt-1 text-sm text-amber-700 sm:inline">
              ཇུ་ལེ།
            </span>
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex min-h-[44px] items-center rounded-lg px-3 py-2.5 text-sm font-semibold text-stone-700 transition-colors hover:bg-amber-100 hover:text-stone-900"
              >
                {link.label}
              </Link>
            ))}
            <Link href="/learn" className="btn-primary ml-2 px-5">
              Start learning
            </Link>
          </nav>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            className="flex h-11 w-11 items-center justify-center rounded-lg text-stone-700 transition-colors hover:bg-amber-100 md:hidden"
          >
            {menuOpen ? (
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>
        </div>

        {menuOpen && (
          <nav id="mobile-menu" aria-label="Main menu" className="border-t border-amber-100 bg-amber-50 px-4 pb-4 pt-2 md:hidden">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block rounded-lg px-3 py-3 text-base font-semibold text-stone-800 transition-colors hover:bg-amber-100"
              >
                {link.label}
              </Link>
            ))}
            <Link href="/learn" onClick={() => setMenuOpen(false)} className="btn-primary mt-2 w-full">
              Start learning
            </Link>
          </nav>
        )}
      </header>

      <main id="main" className="flex-1">
        {children}
      </main>

      <footer className="border-t border-amber-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-3">
            <div>
              <div className="flex items-center gap-2.5">
                <Mark className="h-7 w-7" />
                <span className="font-display text-lg font-extrabold text-stone-900">Julley</span>
              </div>
              <p className="mt-3 max-w-xs text-sm leading-6 text-stone-600">
                Any school topic, retold through your place and your mother tongue, with one thing to build with
                your hands.
              </p>
            </div>
            <nav aria-label="Footer">
              <h2 className="text-sm font-bold uppercase tracking-wider text-stone-500">Pages</h2>
              <ul className="mt-3 space-y-1">
                <li>
                  <Link href="/learn" className="inline-flex min-h-[44px] items-center text-sm font-semibold text-stone-700 hover:text-amber-800">
                    Learn
                  </Link>
                </li>
                <li>
                  <Link href="/sonam" className="inline-flex min-h-[44px] items-center text-sm font-semibold text-stone-700 hover:text-amber-800">
                    Sonam: the dedication
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="inline-flex min-h-[44px] items-center text-sm font-semibold text-stone-700 hover:text-amber-800">
                    About
                  </Link>
                </li>
              </ul>
            </nav>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-stone-500">The promise</h2>
              <ul className="mt-3 space-y-2 text-sm text-stone-600">
                <li>Free forever</li>
                <li>No accounts, no payments</li>
                <li>Nothing you type is stored</li>
                <li>No exam answers, ever</li>
              </ul>
            </div>
          </div>
          <div className="mt-10 flex flex-col gap-2 border-t border-amber-100 pt-6 text-sm text-stone-500 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {year} Julley. Dedicated to{' '}
              <Link href="/sonam" className="font-semibold text-amber-800 underline underline-offset-2 hover:text-amber-900">
                Sonam Wangchuk
              </Link>
              .
            </p>
            <p>
              Born autonomously at{' '}
              <a
                href="https://zeroorigine.com"
                className="font-semibold text-amber-800 underline underline-offset-2 hover:text-amber-900"
              >
                ZeroOrigine
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
