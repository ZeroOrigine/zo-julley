// CANONICAL: app/pricing/page.tsx: Julley pricing page. The product anchor
// declares Julley permanently free with no accounts and no payments, so this
// page states the single plan honestly: free forever, everything included.
import type { Metadata } from 'next'
import Link from 'next/link'
import SiteHeader from '@/components/marketing/site-header'
import SiteFooter from '@/components/marketing/site-footer'

export const metadata: Metadata = {
  title: 'Julley pricing: free forever',
  description:
    'Julley has one plan: free, for every student, permanently. No accounts, no payments, no locked features, no data collected.',
  alternates: { canonical: '/pricing' },
}

const INCLUDED = [
  'Full lessons in any of the 37 languages',
  'Retold through your own place and surroundings',
  'Tuned to your age, from 10 to 18',
  'One hands-on task with free local materials',
  'Explain-it-back prompts with every lesson',
  'One spirit line to carry with you',
  'No account, no ads, no data collected',
]

export default function PricingPage() {
  return (
    <div className='bg-white text-stone-900 dark:bg-stone-950 dark:text-stone-100'>
      <a href='#main' className='sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-stone-900 focus:shadow-lg'>
        Skip to content
      </a>
      <SiteHeader />
      <main id='main'>
        <section className='bg-gradient-to-b from-amber-50 to-white dark:from-stone-900 dark:to-stone-950'>
          <div className='mx-auto max-w-3xl px-4 pb-14 pt-16 text-center sm:px-6 lg:pt-24'>
            <p className='text-sm font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400'>Pricing</p>
            <h1 className='mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-5xl'>Free forever. That is the whole page.</h1>
            <p className='mt-5 text-lg leading-relaxed text-stone-600 dark:text-stone-300'>
              No tiers, no trials, no seats, no invoices. Julley costs nothing because the students it serves are exactly the ones a paywall would turn away.
            </p>
          </div>
        </section>

        <section className='pb-20 lg:pb-24'>
          <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
            <div className='mx-auto max-w-4xl overflow-hidden rounded-3xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-white shadow-lg dark:border-amber-900/60 dark:from-stone-900 dark:to-stone-950'>
              <div className='grid gap-10 p-8 sm:p-10 md:grid-cols-2'>
                <div>
                  <p className='text-sm font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400'>The one plan</p>
                  <p className='mt-4 font-display text-6xl font-extrabold tracking-tight'>₹0</p>
                  <p className='mt-2 text-stone-600 dark:text-stone-300'>Also $0. Per student, per lesson, per forever.</p>
                  <Link href='/learn' className='mt-8 inline-flex min-h-[52px] w-full items-center justify-center rounded-xl bg-amber-600 px-6 text-base font-semibold text-white shadow-md shadow-amber-600/20 transition-colors hover:bg-amber-700 sm:w-auto'>
                    Start learning free
                  </Link>
                  <p className='mt-3 text-sm text-stone-500 dark:text-stone-400'>No card. No account. No catch.</p>
                </div>
                <ul className='space-y-3'>
                  {INCLUDED.map((item) => (
                    <li key={item} className='flex items-start gap-3'>
                      <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={2.2} strokeLinecap='round' strokeLinejoin='round' aria-hidden='true' className='mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400'>
                        <path d='M4.5 12.5l5 5 10-11' />
                      </svg>
                      <span className='text-sm leading-relaxed text-stone-700 dark:text-stone-200'>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className='mx-auto mt-12 max-w-3xl space-y-4 text-center'>
              <h2 className='font-display text-2xl font-bold tracking-tight'>Why is it free?</h2>
              <p className='text-stone-600 dark:text-stone-300'>
                Each lesson is one small AI call. The cost is tiny and the project covers it, because the students Julley is built for are exactly the ones a price would exclude. There are no accounts and no payment systems anywhere in the product, so there is nothing to unlock and nothing that could quietly start charging you later.
              </p>
              <p className='text-stone-600 dark:text-stone-300'>
                The deeper reason is the dedication. Julley is dedicated to Sonam Wangchuk, and charging a child to understand her own world would betray everything the dedication stands for. You can read it on{' '}
                <Link href='/sonam' className='font-semibold text-amber-700 underline dark:text-amber-400'>
                  the For Sonam page
                </Link>
                .
              </p>
              <p className='text-stone-600 dark:text-stone-300'>
                Teachers, parents, whole classrooms and whole villages: this includes you. There is nothing to license and no plan to upgrade to. Common questions are answered in{' '}
                <Link href='/#faq' className='font-semibold text-amber-700 underline dark:text-amber-400'>
                  the FAQ
                </Link>
                .
              </p>
            </div>

            <div className='mt-12 text-center'>
              <Link href='/learn' className='inline-flex min-h-[56px] items-center justify-center rounded-xl bg-amber-600 px-8 text-base font-bold text-white shadow-md shadow-amber-600/25 transition-colors hover:bg-amber-700'>
                Start learning free
              </Link>
              <p className='mt-3 text-sm text-stone-500 dark:text-stone-400'>No account needed. Works in any phone browser.</p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
