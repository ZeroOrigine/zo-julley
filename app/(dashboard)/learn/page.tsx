// CANONICAL learn page for Julley: the core product. Loads the language
// catalog server-side (falling back to a client fetch inside LearnFlow when
// the catalog is unreachable) and renders the single magic interaction:
// topic + place + language + age becomes a native lesson in one call.

import type { Metadata } from 'next';
import Link from 'next/link';
import LearnFlow from '@/components/learn-flow';
import { listLanguages } from '@/lib/db/catalog';
import type { JulleyLanguage } from '@/lib/db/types';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Learn',
  description:
    'Type a topic, your place, and your language. Julley retells the concept through your own world in one of 37 languages, with one hands-on activity. Free, no account, nothing stored.',
};

async function loadLanguages(): Promise<JulleyLanguage[]> {
  try {
    const { items } = await listLanguages({ page: 1, limit: 100, offset: 0 });
    return items;
  } catch {
    // LearnFlow fetches from /api/languages on the client when this is empty.
    return [];
  }
}

const HOW_IT_WORKS = [
  {
    title: 'Tell Julley three things',
    body: 'The topic school gave you, the place you live, and the language you think in. Your age tunes the tone.',
  },
  {
    title: 'Read it in your own world',
    body: 'The whole concept is retold through your streets, fields, weather, and markets, written natively in your language.',
  },
  {
    title: 'Build it and say it back',
    body: 'One hands-on activity with free materials nearby, then a few prompts to explain the idea out loud at home.',
  },
];

export default async function LearnPage() {
  const languages = await loadLanguages();
  const languageCount = languages.length > 0 ? languages.length : 37;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 md:py-16 lg:px-8">
      <section className="text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-amber-700">Julley means welcome</p>
        <h1 className="mt-3 font-display text-4xl leading-tight text-stone-900 md:text-5xl">
          Any topic. Your place. <span className="text-amber-700">Your language.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-stone-600">
          Type what school wants you to learn and where you live. Julley retells the whole idea through your
          own surroundings, in your mother tongue, and gives you one thing to build with your hands.
        </p>
        <ul className="mt-6 flex flex-wrap justify-center gap-2">
          {['Free forever', 'No account needed', `${languageCount} languages`, 'Nothing you type is stored'].map(
            (chip) => (
              <li
                key={chip}
                className="rounded-full border border-amber-200 bg-white px-3 py-1.5 text-sm font-medium text-stone-600"
              >
                {chip}
              </li>
            )
          )}
        </ul>
      </section>

      <section aria-label="Ask Julley for a lesson" className="mt-10">
        <LearnFlow initialLanguages={languages} />
      </section>

      <section aria-labelledby="how-it-works" className="mt-16">
        <h2 id="how-it-works" className="text-center font-display text-2xl text-stone-900 md:text-3xl">
          How a Julley lesson works
        </h2>
        <ol className="mt-8 grid list-none grid-cols-1 gap-4 md:grid-cols-3">
          {HOW_IT_WORKS.map((step, index) => (
            <li key={step.title} className="rounded-2xl border border-amber-100 bg-white p-6">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 font-display text-base font-bold text-amber-800">
                {index + 1}
              </span>
              <h3 className="mt-4 font-display text-lg text-stone-900">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-stone-600">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="no-homework" className="mt-16">
        <div className="rounded-3xl border border-amber-200 bg-white p-8 text-center md:p-10">
          <h2 id="no-homework" className="font-display text-2xl text-stone-900 md:text-3xl">
            Julley will not do your homework
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-stone-600">
            Ask for an exam answer, an essay to hand in, or a solved question paper, and Julley kindly says no.
            Then it reteaches the idea through your own world so the answer becomes yours. That is the whole
            point.
          </p>
          <Link
            href="/sonam"
            className="mt-6 inline-flex min-h-[44px] items-center justify-center font-semibold text-amber-800 underline underline-offset-4 hover:text-amber-900"
          >
            Read the dedication behind that rule
          </Link>
        </div>
      </section>
    </div>
  );
}
