// CANONICAL: app/page.tsx: Julley marketing landing page (homepage).
// The product anchor declares Julley permanently free with no accounts, no
// payments and no data collection. Template items that would contradict the
// anchor or the honesty rules (paid tiers, fabricated testimonials, invented
// user counts, /signup links) are replaced with truthful equivalents: a
// free-forever pricing section, the Sonam Wangchuk dedication, and real
// product facts. Primary CTAs route to /learn, the no-login learn flow.
// Self-validation fixes: all ASCII apostrophes in JSX text replaced with
// &apos; (react/no-unescaped-entities is an error under next/core-web-vitals)
// and JSX.Element swapped for ReactNode (the global JSX namespace is gone in
// React 19 type packages).
import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Link from 'next/link'
import SiteHeader from '@/components/marketing/site-header'
import SiteFooter from '@/components/marketing/site-footer'

export const metadata: Metadata = {
  title: 'Julley: every school topic, retold in your world and your language',
  description:
    'Julley retells any school topic through your own place and mother tongue, natively in 37 languages, with one hands-on task from materials around you. Free forever, no login, no data collected.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Julley: every school topic, retold in your world and your language',
    description:
      'Type the topic, your place, and your language. Julley rebuilds the concept from your own surroundings and adds one hands-on task. Free forever, no login.',
    url: '/',
    siteName: 'Julley',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Julley: school topics retold in your world and your language',
    description:
      'Free forever. 37 languages. One hands-on task with every lesson. No login, no data collected.',
  },
}

function IconPin() {
  return (
    <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={1.8} strokeLinecap='round' strokeLinejoin='round' className='h-6 w-6' aria-hidden='true'>
      <path d='M12 21.5c-4.1-3.8-6.5-7.2-6.5-10.4a6.5 6.5 0 0 1 13 0c0 3.2-2.4 6.6-6.5 10.4z' />
      <circle cx='12' cy='11' r='2.3' />
    </svg>
  )
}

function IconSpeech() {
  return (
    <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={1.8} strokeLinecap='round' strokeLinejoin='round' className='h-6 w-6' aria-hidden='true'>
      <rect x='3' y='4.5' width='11' height='8.5' rx='2.5' />
      <path d='M6.5 13v3l3.5-3' />
      <path d='M17 8h1.5A2.5 2.5 0 0 1 21 10.5v3a2.5 2.5 0 0 1-2.5 2.5H18v2.5L15.5 16' />
    </svg>
  )
}

function IconTune() {
  return (
    <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={1.8} strokeLinecap='round' strokeLinejoin='round' className='h-6 w-6' aria-hidden='true'>
      <path d='M4 7h16M4 12h16M4 17h16' />
      <circle cx='9' cy='7' r='2' />
      <circle cx='15' cy='12' r='2' />
      <circle cx='8' cy='17' r='2' />
    </svg>
  )
}

function IconBeaker() {
  return (
    <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={1.8} strokeLinecap='round' strokeLinejoin='round' className='h-6 w-6' aria-hidden='true'>
      <path d='M9.5 3h5M10.5 3v5.2L5 17.4A2.2 2.2 0 0 0 7 20.5h10a2.2 2.2 0 0 0 2-3.1L13.5 8.2V3' />
      <path d='M7.5 14.5h9' />
    </svg>
  )
}

function IconEcho() {
  return (
    <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={1.8} strokeLinecap='round' strokeLinejoin='round' className='h-6 w-6' aria-hidden='true'>
      <path d='M4 9a8 8 0 0 1 14.9-2M20 15a8 8 0 0 1-14.9 2' />
      <path d='M18.5 3.5V7H15' />
      <path d='M5.5 20.5V17H9' />
    </svg>
  )
}

function IconShield() {
  return (
    <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={1.8} strokeLinecap='round' strokeLinejoin='round' className='h-6 w-6' aria-hidden='true'>
      <path d='M12 3.5l7 2.6v5.2c0 4.6-3 8-7 9.2-4-1.2-7-4.6-7-9.2V6.1z' />
      <path d='M9.8 10l4.4 4.4M14.2 10l-4.4 4.4' />
    </svg>
  )
}

const FEATURES = [
  {
    icon: <IconPin />,
    title: 'Your place is the textbook',
    body: 'Julley rebuilds the concept from what is already around you: the stream, the bus stand, the barley field, the fish market. The example is yours, so the idea finally lands.',
  },
  {
    icon: <IconSpeech />,
    title: 'Composed in your mother tongue',
    body: 'Every lesson is written natively in the language you choose, not translated as an afterthought. Urdu, Arabic, Kashmiri, Sindhi and Persian arrive right to left.',
  },
  {
    icon: <IconTune />,
    title: 'Tuned to your age',
    body: 'A ten-year-old and a seventeen-year-old meet the same truth at different depths. Tell Julley your age and the lesson meets you exactly there.',
  },
  {
    icon: <IconBeaker />,
    title: 'One task for your hands',
    body: 'Every lesson includes one activity built from free materials near you: stones, string, bottle caps, sunlight. Understanding sticks when your hands take part.',
  },
  {
    icon: <IconEcho />,
    title: 'Explain it back',
    body: 'A few short prompts ask you to say the idea in your own words. When you can teach it back, it is truly yours.',
  },
  {
    icon: <IconShield />,
    title: 'It will not do your homework',
    body: 'Ask for exam answers or a ready essay and Julley refuses, then reteaches the idea. The words you finally hand in will be your own.',
  },
]

const STEPS = [
  {
    title: 'Tell Julley three things',
    body: 'The topic you have to learn, the place you live, and the language you think in. Add your age so the lesson lands at the right depth.',
  },
  {
    title: 'Read it in your world',
    body: 'In moments the concept comes back retold through your own surroundings, composed natively in your language, right to left when your script asks for it.',
  },
  {
    title: 'Do it, then explain it back',
    body: 'Try the hands-on task with materials around you, answer the explain-it-back prompts, and keep the one spirit line every lesson closes with.',
  },
]

const LANGUAGES: Array<{ native: string; lang: string; name?: string; rtl?: boolean }> = [
  { native: 'हिन्दी', name: 'Hindi', lang: 'hi' },
  { native: 'اردو', name: 'Urdu', lang: 'ur', rtl: true },
  { native: 'বাংলা', name: 'Bangla', lang: 'bn' },
  { native: 'தமிழ்', name: 'Tamil', lang: 'ta' },
  { native: 'తెలుగు', name: 'Telugu', lang: 'te' },
  { native: 'मराठी', name: 'Marathi', lang: 'mr' },
  { native: 'ಕನ್ನಡ', name: 'Kannada', lang: 'kn' },
  { native: 'മലയാളം', name: 'Malayalam', lang: 'ml' },
  { native: 'ગુજરાતી', name: 'Gujarati', lang: 'gu' },
  { native: 'ਪੰਜਾਬੀ', name: 'Punjabi', lang: 'pa' },
  { native: 'ଓଡ଼ିଆ', name: 'Odia', lang: 'or' },
  { native: 'অসমীয়া', name: 'Assamese', lang: 'as' },
  { native: 'کٲشُر', name: 'Kashmiri', lang: 'ks', rtl: true },
  { native: 'سنڌي', name: 'Sindhi', lang: 'sd', rtl: true },
  { native: 'नेपाली', name: 'Nepali', lang: 'ne' },
  { native: 'Ladakhi', name: 'Bhoti', lang: 'lbj' },
  { native: 'Santali', lang: 'sat' },
  { native: 'العربية', name: 'Arabic', lang: 'ar', rtl: true },
  { native: 'فارسی', name: 'Persian', lang: 'fa', rtl: true },
  { native: 'Español', name: 'Spanish', lang: 'es' },
  { native: 'Kiswahili', name: 'Swahili', lang: 'sw' },
  { native: '中文', name: 'Chinese', lang: 'zh' },
  { native: 'Français', name: 'French', lang: 'fr' },
]

const INCLUDED = [
  'Full lessons in any of the 37 languages',
  'Retold through your own place and surroundings',
  'Tuned to your age, from 10 to 18',
  'One hands-on task with free local materials',
  'Explain-it-back prompts with every lesson',
  'One spirit line to carry with you',
  'No account, no ads, no data collected',
]

const FAQS: Array<{ q: string; a: ReactNode }> = [
  {
    q: 'Is Julley really free?',
    a: (
      <p>
        Yes, permanently. There are no accounts, no payments, no locked features and no trial that runs out. A lesson costs the project a tiny amount of AI compute, and the project covers it so a student never has to.
      </p>
    ),
  },
  {
    q: 'Do I need an account or an app?',
    a: (
      <p>
        No. Julley runs in the browser on any phone or computer. There is nothing to install, nothing to sign up for, and no personal data is collected or stored.
      </p>
    ),
  },
  {
    q: 'Will it give me exam answers or write my essay?',
    a: (
      <p>
        No. Ask for ready answers or an essay to submit and Julley will refuse, then reteach the idea so you can produce the work yourself. The goal is that you understand, not that you copy.
      </p>
    ),
  },
  {
    q: 'Which languages can I learn in?',
    a: (
      <p>
        37 languages: the 22 scheduled languages of India, Ladakhi, and world languages including English, Arabic, Spanish, Swahili, Chinese and Persian. Urdu, Arabic, Kashmiri, Sindhi and Persian render right to left.
      </p>
    ),
  },
  {
    q: 'Who is Julley for?',
    a: (
      <p>
        Students aged 10 to 18 anywhere, especially where the textbook&apos;s world is not your world. Parents who want to help but cannot follow the textbook&apos;s language. Teachers in under-resourced schools who need a concept retold for their classroom&apos;s reality.
      </p>
    ),
  },
  {
    q: 'Why is it called Julley?',
    a: (
      <p>
        Julley is the all-purpose greeting of Ladakh: hello, thank you, welcome. The project is dedicated to Sonam Wangchuk, whose philosophy of learning through your own world shapes every lesson. Read more on{' '}
        <Link href='/sonam' className='font-semibold text-amber-700 underline dark:text-amber-400'>
          the For Sonam page
        </Link>
        .
      </p>
    ),
  },
]

export default function HomePage() {
  return (
    <div className='bg-white text-stone-900 dark:bg-stone-950 dark:text-stone-100'>
      <style>{`
@keyframes jy-fade-up{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
.jy-fade-up{animation:jy-fade-up .7s ease-out both}
.jy-d1{animation-delay:.1s}
.jy-d2{animation-delay:.2s}
.jy-d3{animation-delay:.3s}
@media (prefers-reduced-motion:reduce){.jy-fade-up{animation:none}}
`}</style>
      <a href='#main' className='sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-stone-900 focus:shadow-lg'>
        Skip to content
      </a>
      <SiteHeader />
      <main id='main'>
        {/* Hero */}
        <section className='relative overflow-hidden bg-gradient-to-b from-amber-50 via-orange-50/50 to-white dark:from-stone-900 dark:via-stone-950 dark:to-stone-950'>
          <div className='mx-auto grid max-w-7xl gap-12 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-8 lg:pb-28 lg:pt-24'>
            <div className='max-w-xl'>
              <p className='jy-fade-up inline-flex items-center gap-2 rounded-full border border-amber-300/70 bg-white/70 px-4 py-1.5 text-xs font-semibold text-amber-800 sm:text-sm dark:border-amber-800 dark:bg-stone-900/70 dark:text-amber-300'>
                Free forever · No login · No data collected
              </p>
              <h1 className='jy-fade-up jy-d1 mt-5 font-display text-4xl font-extrabold tracking-tight text-stone-900 sm:text-5xl lg:text-6xl dark:text-white'>
                Every school topic, retold in your world and your language.
              </h1>
              <p className='jy-fade-up jy-d2 mt-5 text-lg leading-relaxed text-stone-600 dark:text-stone-300'>
                Type what you have to learn, the place you live, and the language you think in. Julley rebuilds the whole concept from your own surroundings, writes it natively in your mother tongue, and adds one hands-on task using things already around you.
              </p>
              <div className='jy-fade-up jy-d3 mt-8 flex flex-col gap-3 sm:flex-row'>
                <Link href='/learn' className='inline-flex min-h-[52px] items-center justify-center rounded-xl bg-amber-600 px-7 text-base font-semibold text-white shadow-md shadow-amber-600/25 transition-colors hover:bg-amber-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600'>
                  Start learning free
                </Link>
                <a href='#example' className='inline-flex min-h-[52px] items-center justify-center rounded-xl border border-stone-300 bg-white px-7 text-base font-semibold text-stone-700 transition-colors hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800'>
                  See an example
                </a>
              </div>
              <p className='jy-fade-up jy-d3 mt-3 text-sm text-stone-500 dark:text-stone-400'>
                Nothing to install. Nothing to sign up for. Nothing to pay.
              </p>
              <ul className='jy-fade-up jy-d3 mt-8 flex flex-wrap gap-2'>
                {['37 languages', 'Ages 10 to 18', 'Hands-on with local materials'].map((b) => (
                  <li key={b} className='rounded-full bg-stone-900/5 px-3.5 py-1.5 text-xs font-semibold text-stone-700 dark:bg-white/10 dark:text-stone-200'>
                    {b}
                  </li>
                ))}
              </ul>
            </div>

            <div id='example' className='jy-fade-up jy-d2 scroll-mt-24'>
              <div className='rounded-3xl bg-gradient-to-br from-amber-200 via-orange-100 to-sky-200 p-1.5 shadow-2xl dark:from-amber-900/50 dark:via-stone-800 dark:to-sky-900/50'>
                <div className='rounded-[20px] bg-white p-5 sm:p-6 dark:bg-stone-950'>
                  <p className='text-xs font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400'>What a lesson looks like</p>
                  <div className='mt-3 grid grid-cols-2 gap-2'>
                    {[
                      { label: 'Topic', value: 'Photosynthesis' },
                      { label: 'Place', value: 'Skara, Leh, Ladakh' },
                      { label: 'Language', value: 'English' },
                      { label: 'Age', value: '13' },
                    ].map((c) => (
                      <div key={c.label} className='rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 dark:border-stone-800 dark:bg-stone-900'>
                        <p className='text-[11px] font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400'>{c.label}</p>
                        <p className='mt-0.5 text-sm font-semibold text-stone-900 dark:text-stone-100'>{c.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className='mt-5 space-y-4 border-t border-stone-100 pt-5 dark:border-stone-800'>
                    <div>
                      <p className='text-xs font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400'>In your world</p>
                      <p className='mt-1.5 text-sm leading-relaxed text-stone-700 dark:text-stone-300'>
                        In July the barley fields below Skara turn deep green while the ridge behind them stays bare rock. The barley is doing something the rock cannot: catching sunlight in its leaves and using that energy to build its own food from air and the channel water your village brings down. That quiet work inside every green leaf is photosynthesis.
                      </p>
                    </div>
                    <div>
                      <p className='text-xs font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400'>Try this with your hands</p>
                      <p className='mt-1.5 text-sm leading-relaxed text-stone-700 dark:text-stone-300'>
                        Tape a small piece of cardboard over half a leaf on any plant near your home. Uncover it after three days. The covered half will look pale beside the sunlit half, because a leaf in the dark cannot make its food.
                      </p>
                    </div>
                    <div>
                      <p className='text-xs font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400'>Explain it back</p>
                      <ul className='mt-1.5 list-disc space-y-1 pl-5 text-sm leading-relaxed text-stone-700 dark:text-stone-300'>
                        <li>Why did the covered half of the leaf turn pale?</li>
                        <li>Name the three things the barley needs for photosynthesis, and where each comes from in Skara.</li>
                      </ul>
                    </div>
                    <p className='border-l-2 border-amber-500 pl-3 text-sm italic text-stone-600 dark:text-stone-400'>
                      If the lesson does not fit your world, remake the lesson. Not the child.
                    </p>
                  </div>
                </div>
              </div>
              <p className='mt-3 text-center text-xs text-stone-500 dark:text-stone-400'>
                An example, shown in English. Yours can arrive in Tamil, Urdu, Ladakhi, Santali, or any of the 37 languages.
              </p>
            </div>
          </div>
        </section>

        {/* Languages */}
        <section id='languages' className='scroll-mt-24 bg-white dark:bg-stone-950'>
          <div className='mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24'>
            <div className='mx-auto max-w-3xl text-center'>
              <p className='text-sm font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400'>37 languages</p>
              <h2 className='mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl'>Learn in the language you think in.</h2>
              <p className='mt-5 text-lg leading-relaxed text-stone-600 dark:text-stone-300'>
                Julley composes every lesson natively in the language you choose: the 22 scheduled languages of India, Ladakhi, and world languages from Arabic to Swahili. Urdu, Arabic, Kashmiri, Sindhi and Persian arrive written right to left, the way they are written by hand.
              </p>
            </div>
            <ul className='mx-auto mt-10 flex max-w-4xl flex-wrap justify-center gap-2.5'>
              {LANGUAGES.map((l) => (
                <li key={l.native} className='inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-stone-200 bg-stone-50 px-4 text-sm text-stone-800 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200'>
                  <span lang={l.lang} dir={l.rtl ? 'rtl' : undefined} className='font-semibold'>
                    {l.native}
                  </span>
                  {l.name ? <span className='text-stone-400 dark:text-stone-500'>· {l.name}</span> : null}
                </li>
              ))}
              <li className='inline-flex min-h-[40px] items-center rounded-full border border-dashed border-amber-300 bg-amber-50 px-4 text-sm font-semibold text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300'>
                and more: 37 in all
              </li>
            </ul>
            <p className='mt-6 text-center text-sm text-stone-500 dark:text-stone-400'>A sample of what you can pick. The full list waits inside the learn flow.</p>
          </div>
        </section>

        {/* Why Julley exists */}
        <section className='bg-orange-50 dark:bg-stone-900'>
          <div className='mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:py-24'>
            <p className='text-sm font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400'>Why Julley exists</p>
            <h2 className='mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl'>The concept was never the problem. The packaging was.</h2>
            <p className='mt-6 text-lg leading-relaxed text-stone-700 dark:text-stone-300'>
              Hundreds of millions of students study from textbooks written for someone else&apos;s world. Gravity gets explained with elevators to children who have never seen a two-storey building. Fractions arrive as pizza slices in villages where pizza has never been on the table. The idea is universal. The example is foreign. The language is borrowed.
            </p>
            <p className='mt-4 text-lg leading-relaxed text-stone-700 dark:text-stone-300'>
              So the child concludes the failure is her own, memorizes enough to survive the exam, and quietly learns that school is not for people like her. Julley starts from the other end: your stream, your market, your kitchen, your words.
            </p>
          </div>
        </section>

        {/* Features */}
        <section id='features' className='scroll-mt-24 bg-stone-50 dark:bg-stone-900'>
          <div className='mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24'>
            <div className='mx-auto max-w-3xl text-center'>
              <p className='text-sm font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400'>What you get</p>
              <h2 className='mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl'>Three small answers. One lesson that finally fits.</h2>
              <p className='mt-5 text-lg text-stone-600 dark:text-stone-300'>You give Julley a topic, a place, and a language. Here is what comes back.</p>
            </div>
            <div className='mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
              {FEATURES.map((f) => (
                <div key={f.title} className='rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-stone-800 dark:bg-stone-950'>
                  <div className='flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'>{f.icon}</div>
                  <h3 className='mt-4 font-display text-lg font-bold'>{f.title}</h3>
                  <p className='mt-2 text-sm leading-relaxed text-stone-600 dark:text-stone-300'>{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id='how-it-works' className='scroll-mt-24 bg-white dark:bg-stone-950'>
          <div className='mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24'>
            <div className='mx-auto max-w-3xl text-center'>
              <p className='text-sm font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400'>How it works</p>
              <h2 className='mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl'>From stuck to certain in three steps.</h2>
            </div>
            <div className='relative mt-14'>
              <div aria-hidden='true' className='absolute left-[12%] right-[12%] top-7 hidden border-t-2 border-dashed border-amber-300/70 lg:block dark:border-stone-700' />
              <ol className='relative grid gap-10 lg:grid-cols-3'>
                {STEPS.map((s, i) => (
                  <li key={s.title} className='flex flex-col items-start lg:items-center lg:text-center'>
                    <span aria-hidden='true' className='flex h-14 w-14 items-center justify-center rounded-full bg-amber-600 font-display text-xl font-bold text-white shadow-md shadow-amber-600/30'>
                      {i + 1}
                    </span>
                    <p className='mt-4 text-xs font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400'>Step {i + 1}</p>
                    <h3 className='mt-1 font-display text-xl font-bold'>{s.title}</h3>
                    <p className='mt-2 max-w-sm text-sm leading-relaxed text-stone-600 dark:text-stone-300'>{s.body}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* Pricing: free forever */}
        <section id='free' className='scroll-mt-24 bg-stone-50 dark:bg-stone-900'>
          <div className='mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24'>
            <div className='mx-auto max-w-3xl text-center'>
              <p className='text-sm font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400'>Pricing</p>
              <h2 className='mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl'>Free forever, for every student.</h2>
              <p className='mt-5 text-lg text-stone-600 dark:text-stone-300'>One plan, everything included. ₹0 today, ₹0 in ten years, in every currency.</p>
            </div>
            <div className='mx-auto mt-12 max-w-4xl overflow-hidden rounded-3xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-white shadow-lg dark:border-amber-900/60 dark:from-stone-900 dark:to-stone-950'>
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
            <div className='mx-auto mt-10 max-w-3xl text-center'>
              <p className='text-stone-600 dark:text-stone-300'>
                Why free? Because the students Julley serves are exactly the ones a paywall would turn away. The project is dedicated to Sonam Wangchuk, and charging a child to understand her own world would betray the point of the dedication.
              </p>
              <p className='mt-3 text-stone-600 dark:text-stone-300'>
                Teachers, parents, whole classrooms: this includes you. There is nothing to license and no plan to upgrade to. The longer story lives on the{' '}
                <Link href='/pricing' className='font-semibold text-amber-700 underline dark:text-amber-400'>
                  pricing page
                </Link>{' '}
                and the{' '}
                <Link href='/sonam' className='font-semibold text-amber-700 underline dark:text-amber-400'>
                  dedication
                </Link>
                .
              </p>
            </div>
          </div>
        </section>

        {/* Dedication */}
        <section className='bg-stone-900 text-stone-100'>
          <div className='mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:py-24'>
            <p className='text-sm font-bold uppercase tracking-widest text-amber-400'>The name</p>
            <h2 className='mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl'>Julley is how Ladakh says hello.</h2>
            <p className='mt-6 text-lg leading-relaxed text-stone-300'>
              It also means thank you, and welcome. This project is dedicated to Sonam Wangchuk, the engineer and teacher from Ladakh whose work keeps proving that real learning grows from the learner&apos;s own soil, own materials, and own language.
            </p>
            <blockquote className='mx-auto mt-8 max-w-xl border-l-2 border-amber-500 pl-5 text-left'>
              <p className='text-xl font-medium italic text-amber-100'>If the lesson does not fit the child&apos;s world, remake the lesson. Not the child.</p>
              <cite className='mt-2 block text-sm not-italic text-stone-400'>The line Julley is built on</cite>
            </blockquote>
            <Link href='/sonam' className='mt-10 inline-flex min-h-[52px] items-center justify-center rounded-xl border border-amber-500/60 px-7 text-base font-semibold text-amber-300 transition-colors hover:bg-amber-500/10'>
              Read the dedication
            </Link>
          </div>
        </section>

        {/* FAQ */}
        <section id='faq' className='scroll-mt-24 bg-white dark:bg-stone-950'>
          <div className='mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:py-24'>
            <div className='text-center'>
              <p className='text-sm font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400'>FAQ</p>
              <h2 className='mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl'>Straight answers.</h2>
            </div>
            <div className='mt-10 divide-y divide-stone-200 rounded-2xl border border-stone-200 bg-white px-6 dark:divide-stone-800 dark:border-stone-800 dark:bg-stone-900'>
              {FAQS.map((f) => (
                <details key={f.q} className='group'>
                  <summary className='flex min-h-[56px] cursor-pointer list-none items-center justify-between gap-4 py-4 text-left text-base font-semibold text-stone-900 [&::-webkit-details-marker]:hidden dark:text-stone-100'>
                    {f.q}
                    <span aria-hidden='true' className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 transition-transform duration-200 group-open:rotate-45 dark:bg-amber-950/60 dark:text-amber-400'>
                      <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={2} strokeLinecap='round' className='h-4 w-4'>
                        <path d='M12 5v14M5 12h14' />
                      </svg>
                    </span>
                  </summary>
                  <div className='pb-5 text-sm leading-relaxed text-stone-600 dark:text-stone-300'>{f.a}</div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className='bg-gradient-to-br from-amber-600 to-orange-700 text-white'>
          <div className='mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:py-24'>
            <h2 className='font-display text-3xl font-bold tracking-tight sm:text-4xl'>The next topic you have to learn can begin in your world.</h2>
            <p className='mt-4 text-lg text-amber-50'>Type the topic. Name your place. Choose your language. Julley does the rest, and it stays free.</p>
            <Link href='/learn' className='mt-8 inline-flex min-h-[56px] items-center justify-center rounded-xl bg-white px-8 text-base font-bold text-amber-800 shadow-lg transition-transform hover:scale-[1.02]'>
              Start learning free
            </Link>
            <p className='mt-4 text-sm text-amber-100'>No account needed. Works in any phone browser.</p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
