'use client'

// CANONICAL: components/marketing/site-header.tsx: shared marketing header for
// Julley. Sticky nav with mobile menu. The About link sits after FAQ in both
// the desktop nav and the mobile menu, per the marketing header rule.
import { useState } from 'react'
import Link from 'next/link'

const NAV_LINKS = [
  { href: '/#features', label: 'Features' },
  { href: '/#how-it-works', label: 'How it works' },
  { href: '/#languages', label: 'Languages' },
  { href: '/#free', label: 'Free forever' },
  { href: '/#faq', label: 'FAQ' },
  { href: '/about', label: 'About' },
]

export default function SiteHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className='sticky top-0 z-50 border-b border-stone-200/70 bg-white/85 backdrop-blur dark:border-stone-800 dark:bg-stone-950/85'>
      <div className='mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8'>
        <Link href='/' onClick={() => setOpen(false)} className='flex items-center gap-2'>
          <svg viewBox='0 0 24 24' className='h-7 w-7' aria-hidden='true'>
            <circle cx='17.5' cy='6' r='2.6' className='fill-amber-500' />
            <path d='M2.5 19.5 9.5 8l4 6 2.5-3.5 5.5 9z' className='fill-stone-800 dark:fill-stone-100' />
          </svg>
          <span className='font-display text-xl font-bold tracking-tight text-stone-900 dark:text-stone-50'>Julley</span>
        </Link>

        <nav className='hidden items-center gap-6 lg:flex' aria-label='Main navigation'>
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className='text-sm font-medium text-stone-600 transition-colors hover:text-stone-900 dark:text-stone-300 dark:hover:text-white'>
              {link.label}
            </Link>
          ))}
          <Link href='/learn' className='inline-flex min-h-[44px] items-center justify-center rounded-xl bg-amber-600 px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-amber-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600'>
            Start learning
          </Link>
        </nav>

        <button
          type='button'
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls='mobile-menu'
          aria-label={open ? 'Close menu' : 'Open menu'}
          className='flex h-11 w-11 items-center justify-center rounded-lg text-stone-700 transition-colors hover:bg-stone-100 lg:hidden dark:text-stone-200 dark:hover:bg-stone-800'
        >
          {open ? (
            <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={2} strokeLinecap='round' className='h-6 w-6' aria-hidden='true'>
              <path d='M6 6l12 12M18 6L6 18' />
            </svg>
          ) : (
            <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={2} strokeLinecap='round' className='h-6 w-6' aria-hidden='true'>
              <path d='M4 7h16M4 12h16M4 17h16' />
            </svg>
          )}
        </button>
      </div>

      {open && (
        <div id='mobile-menu' className='border-t border-stone-200 bg-white lg:hidden dark:border-stone-800 dark:bg-stone-950'>
          <nav className='mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4 sm:px-6' aria-label='Mobile navigation'>
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className='flex min-h-[44px] items-center rounded-lg px-3 text-base font-medium text-stone-700 transition-colors hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800'>
                {link.label}
              </Link>
            ))}
            <Link href='/learn' onClick={() => setOpen(false)} className='mt-2 flex min-h-[48px] items-center justify-center rounded-xl bg-amber-600 px-4 text-base font-semibold text-white transition-colors hover:bg-amber-700'>
              Start learning free
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
