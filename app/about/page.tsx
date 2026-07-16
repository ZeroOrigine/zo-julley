import Link from 'next/link'
import SiteHeader from '@/components/marketing/site-header'
import SiteFooter from '@/components/marketing/site-footer'

export const dynamic = 'force-dynamic'

type Guardrail = {
  id?: string
  title?: string
  rule?: string
  description?: string
}

function baseUrl(): string {
  const fromEnv =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '')
  return fromEnv.replace(/\/$/, '')
}

async function getGuardrails(): Promise<Guardrail[]> {
  try {
    const res = await fetch(`${baseUrl()}/api/guardrails`, {
      cache: 'no-store',
      headers: { accept: 'application/json' },
    })
    if (!res.ok) return []
    const data = await res.json()
    if (Array.isArray(data)) return data as Guardrail[]
    if (Array.isArray(data?.guardrails)) return data.guardrails as Guardrail[]
    if (Array.isArray(data?.data?.items)) return data.data.items as Guardrail[]
    if (Array.isArray(data?.data)) return data.data as Guardrail[]
    return []
  } catch {
    return []
  }
}

export const metadata = {
  title: 'About — Julley',
  description:
    'Julley retells any school topic through a student\u2019s own place and mother tongue, in 37 languages. Free forever: no login, no payments, no data collected.',
}

export default async function AboutPage() {
  const guardrails = await getGuardrails()

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-16">
      <p className="mb-3 text-sm font-medium uppercase tracking-wide text-emerald-700">
        About
      </p>
      <h1 className="text-4xl font-bold tracking-tight text-slate-900">
        Julley
      </h1>
      <p className="mt-2 text-lg text-slate-600">
        Dedicated to Sonam Wangchuk.
      </p>

      <section className="mt-10 space-y-4 text-base leading-relaxed text-slate-700">
        <p>
          Hundreds of millions of students learn from textbooks written for
          someone else’s world, in a language that is not their own. The concept
          is universal, but the packaging is alien — so the child concludes the
          failure is her own, memorizes to survive the exam, and learns that
          school is not for people like her.
        </p>
        <p>
          Julley is a free, no-login web tool that retells any school topic
          through a student’s own place and mother tongue, and adds one
          hands-on task using materials around them. One serverless call composes
          the lesson natively in the chosen language across 37 languages — 22
          Eighth-Schedule Indian languages plus Ladakhi/Bhoti and 13 world
          languages — rendering right-to-left for Urdu, Arabic, Kashmiri, Sindhi
          and Persian.
        </p>
        <p>
          It is built for school students aged 10 to 18 anywhere — especially
          where the textbook’s world is not their world — plus the parents who
          cannot help and the teachers in under-resourced schools.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-slate-900">
          Our guardrails
        </h2>
        <p className="mt-2 text-slate-600">
          Julley refuses exam answers and essays-to-submit, and reteaches
          instead. These are the rules it holds to:
        </p>
        {guardrails.length > 0 ? (
          <ul className="mt-4 space-y-3">
            {guardrails.map((g, i) => (
              <li
                key={g.id ?? i}
                className="rounded-lg border border-slate-200 bg-white p-4"
              >
                {g.title ? (
                  <p className="font-medium text-slate-900">{g.title}</p>
                ) : null}
                <p className="text-slate-700">
                  {g.rule ?? g.description ?? ''}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 text-slate-600">
            Guardrails are loaded from{' '}
            <code className="rounded bg-slate-200 px-1 py-0.5 text-sm">
              /api/guardrails
            </code>
            . They’re temporarily unavailable — please refresh in a moment.
          </p>
        )}
      </section>

      <section className="mt-12 rounded-xl border border-emerald-200 bg-emerald-50 p-6">
        <h2 className="text-2xl font-semibold text-emerald-900">
          Free forever
        </h2>
        <p className="mt-2 text-emerald-900/90">
          Julley is permanently free. No accounts, no payments, no data
          collected, and no users table. Nothing about you is stored — you open
          it, you learn, you leave.
        </p>
      </section>

      <nav className="mt-12 flex flex-wrap gap-4 text-sm">
        <Link className="text-emerald-700 underline hover:text-emerald-900" href="/learn">
          Start learning
        </Link>
        <Link className="text-emerald-700 underline hover:text-emerald-900" href="/sonam">
          The dedication
        </Link>
        <Link className="text-emerald-700 underline hover:text-emerald-900" href="/">
          Home
        </Link>
      </nav>
      </main>
      <SiteFooter />
    </>
  )
}
