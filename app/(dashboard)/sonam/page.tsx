// CANONICAL /sonam page: the dedication behind Julley. Reads the live spirit
// lines from the public catalog and renders them alongside the story. All
// biographical statements here are limited to widely documented facts, and
// the page states plainly that this is an independent tribute.
// Self-validation fix: JSX text does not process JavaScript escape sequences,
// so literal \u2019 sequences were rendering verbatim. Real ’ characters are
// used throughout (also keeps react/no-unescaped-entities silent).

import type { Metadata } from 'next';
import Link from 'next/link';
import { listSpiritLines } from '@/lib/db/catalog';
import type { JulleySpiritLine } from '@/lib/db/types';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'For Sonam Wangchuk',
  description:
    'The dedication behind Julley: why this free learning tool is dedicated to Sonam Wangchuk of Ladakh, and the ideas it borrows from his work with students.',
};

async function loadSpiritLines(): Promise<JulleySpiritLine[]> {
  try {
    const { items } = await listSpiritLines({ page: 1, limit: 20, offset: 0 });
    return items;
  } catch {
    return [];
  }
}

const PRINCIPLES = [
  {
    title: 'The child was never the problem.',
    body: 'When a lesson does not land, Julley rewrites the lesson, not the child. Every topic is retold through the student’s own streets, fields, weather, and kitchen.',
  },
  {
    title: 'Your language can carry any idea.',
    body: 'Lessons are composed natively in 37 languages, from Assamese to Vietnamese, and the list makes room for Ladakhi, the language of the place that gave us the word Julley. Right-to-left scripts render the way they should.',
  },
  {
    title: 'Hands before marks.',
    body: 'Every lesson ends with one thing to build or try using free materials nearby, and a few prompts to explain the idea back out loud to someone at home.',
  },
  {
    title: 'No shortcuts.',
    body: 'Ask Julley for an exam answer, an essay to hand in, or a solved question paper and it kindly refuses. Then it reteaches the idea so the answer becomes yours.',
  },
  {
    title: 'Free means free.',
    body: 'No accounts, no payments, no data collected. A student alone at home owes us nothing, not even an email address.',
  },
];

export default async function SonamPage() {
  const spiritLines = await loadSpiritLines();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 md:py-20 lg:px-8">
      <header className="text-center">
        <p aria-hidden="true" className="font-display text-4xl text-amber-300 md:text-5xl">
          ཇུ་ལེ།
        </p>
        <p className="mt-4 text-sm font-bold uppercase tracking-widest text-amber-700">The dedication</p>
        <h1 className="mt-3 font-display text-4xl leading-tight text-stone-900 md:text-5xl">Julley, Sonam.</h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-stone-600">
          This tool is dedicated to Sonam Wangchuk, an engineer and educator from Ladakh, and to every student
          whose textbook was written for somewhere else.
        </p>
      </header>

      <section aria-labelledby="one-word" className="mt-16">
        <h2 id="one-word" className="font-display text-2xl text-stone-900 md:text-3xl">
          One word from Ladakh
        </h2>
        <p className="mt-4 text-lg leading-8 text-stone-700">
          Julley is the everyday greeting of Ladakh, high in the Indian Himalaya. One small word that carries
          hello, thank you, and welcome all at once. Say it to a stranger on a mountain path and the path feels
          shorter. We wanted every student who opens a schoolbook to feel that same welcome, so we borrowed the
          word.
        </p>
      </section>

      <section aria-labelledby="the-engineer" className="mt-14">
        <h2 id="the-engineer" className="font-display text-2xl text-stone-900 md:text-3xl">
          The engineer who listened to students
        </h2>
        <p className="mt-4 text-lg leading-8 text-stone-700">
          Sonam Wangchuk is an engineer and educator from Ladakh. In 1988 he co-founded SECMOL, the
          Students’ Educational and Cultural Movement of Ladakh, to work with young people the exam system
          had labelled failures.
        </p>
        <p className="mt-4 text-lg leading-8 text-stone-700">
          At the SECMOL campus near Leh, students help run everything: solar-heated earth buildings, food
          gardens, the daily life of the school. The campus keeps proving a simple point. The students were
          never the failure. The packaging was: a textbook written for another world, tested in a language many
          of them did not dream in.
        </p>
        <p className="mt-4 text-lg leading-8 text-stone-700">
          When spring water ran short in Ladakh’s villages, he and his students built ice stupas:
          cone-shaped towers of frozen winter water that melt slowly, exactly when the fields need them. Local
          water, local winter, local hands. A concept from physics, answered with what was already lying
          around.
        </p>
      </section>

      <section aria-labelledby="what-we-took" className="mt-14">
        <h2 id="what-we-took" className="font-display text-2xl text-stone-900 md:text-3xl">
          What Julley takes from that work
        </h2>
        <p className="mt-4 text-lg leading-8 text-stone-700">
          Julley is a small tool with a small promise, built on ideas his work makes hard to ignore.
        </p>
        <ul className="mt-6 space-y-4">
          {PRINCIPLES.map((principle) => (
            <li key={principle.title} className="rounded-2xl border border-amber-100 bg-white p-6">
              <h3 className="font-display text-lg text-stone-900">{principle.title}</h3>
              <p className="mt-2 leading-7 text-stone-600">{principle.body}</p>
            </li>
          ))}
        </ul>
      </section>

      {spiritLines.length > 0 && (
        <section aria-labelledby="spirit-lines" className="mt-14">
          <h2 id="spirit-lines" className="font-display text-2xl text-stone-900 md:text-3xl">
            The lines we close with
          </h2>
          <p className="mt-4 text-lg leading-8 text-stone-700">
            Every Julley lesson ends with one of these, rendered in the language of the lesson. They are our own
            lines, written for this dedication. They are not quotes from anyone.
          </p>
          <ul className="mt-6 space-y-3">
            {spiritLines.map((line) => (
              <li key={line.id} className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5">
                <p className="text-lg font-medium leading-7 text-stone-800">{line.line_text}</p>
                <p className="mt-1.5 text-xs font-semibold uppercase tracking-wider text-amber-700">
                  {line.theme.replace(/_/g, ' ')}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <aside className="mt-14 rounded-xl border border-stone-200 bg-stone-50 p-5 text-sm leading-6 text-stone-600">
        Julley is an independent tribute, built with admiration. It is not affiliated with, funded by, or
        endorsed by Sonam Wangchuk, SECMOL, or any organization connected to them.
      </aside>

      <section aria-labelledby="cta" className="mt-14">
        <div className="rounded-3xl bg-gradient-to-br from-amber-600 to-orange-700 p-8 text-center text-amber-50 md:p-12">
          <h2 id="cta" className="font-display text-2xl text-white md:text-3xl">
            Take the topic you fear most
          </h2>
          <p className="mx-auto mt-3 max-w-xl leading-7 text-amber-100">
            Hand it to Julley with the name of your village and the language you dream in. See what happens.
          </p>
          <Link
            href="/learn"
            className="mt-6 inline-flex min-h-[48px] items-center justify-center rounded-xl bg-white px-8 py-3.5 text-base font-bold text-amber-800 shadow-lg transition-all hover:bg-amber-50 active:scale-[0.98]"
          >
            Start learning free
          </Link>
        </div>
      </section>
    </div>
  );
}
