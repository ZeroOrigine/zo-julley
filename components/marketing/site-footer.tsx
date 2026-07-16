// CANONICAL: components/marketing/site-footer.tsx: shared marketing footer for
// Julley. Carries the required ZeroOrigine origin line and honest reassurance
// copy. No social links or legal pages are shown because none exist for this
// product; Julley collects no data, so the promise is stated in plain words.
import Link from 'next/link'

const EXPLORE_LINKS = [
  { href: '/#features', label: 'Features' },
  { href: '/#how-it-works', label: 'How it works' },
  { href: '/#languages', label: 'Languages' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/#faq', label: 'FAQ' },
]

const PROJECT_LINKS = [
  { href: '/learn', label: 'Start learning' },
  { href: '/sonam', label: 'For Sonam' },
  { href: '/about', label: 'About' },
]

export default function SiteFooter() {
  const year = new Date().getFullYear()
  return (
    <footer className='border-t border-stone-800 bg-stone-950 text-stone-300'>
      <div className='mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8'>
        <div className='grid gap-10 md:grid-cols-3'>
          <div>
            <div className='flex items-center gap-2'>
              <svg viewBox='0 0 24 24' className='h-7 w-7' aria-hidden='true'>
                <circle cx='17.5' cy='6' r='2.6' className='fill-amber-500' />
                <path d='M2.5 19.5 9.5 8l4 6 2.5-3.5 5.5 9z' className='fill-stone-200' />
              </svg>
              <span className='font-display text-xl font-bold tracking-tight text-white'>Julley</span>
            </div>
            <p className='mt-3 max-w-xs text-sm leading-relaxed text-stone-400'>
              Every school topic, retold in your world and your language. For students aged 10 to 18, their parents, and their teachers.
            </p>
            <p className='mt-4 text-sm font-medium text-stone-200'>No accounts. No payments. No data collected.</p>
          </div>
          <div>
            <p className='text-sm font-semibold uppercase tracking-widest text-stone-500'>Explore</p>
            <ul className='mt-3 space-y-1'>
              {EXPLORE_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className='inline-flex min-h-[44px] items-center text-sm text-stone-400 transition-colors hover:text-white'>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className='text-sm font-semibold uppercase tracking-widest text-stone-500'>Project</p>
            <ul className='mt-3 space-y-1'>
              {PROJECT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className='inline-flex min-h-[44px] items-center text-sm text-stone-400 transition-colors hover:text-white'>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className='mt-12 flex flex-col gap-2 border-t border-stone-800 pt-8 sm:flex-row sm:items-center sm:justify-between'>
          <p className='text-sm text-stone-500'>© {year} Julley. Built with respect for every mother tongue.</p>
          <a href='https://zeroorigine.com' target='_blank' rel='noopener noreferrer' className='inline-flex min-h-[44px] items-center text-sm text-stone-500 transition-colors hover:text-white'>
            Born autonomously at ZeroOrigine
          </a>
        </div>
      </div>
    </footer>
  )
}
