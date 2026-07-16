'use client';

// CANONICAL error boundary for Julley's product pages. Friendly voice, one
// clear action, and an honest reminder that nothing the student typed was
// stored anywhere.

import Link from 'next/link';
import { useEffect } from 'react';

export default function ProductError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[julley/ui] page error:', error.message);
  }, [error]);

  return (
    <section className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <p className="text-sm font-bold uppercase tracking-widest text-amber-700">Julley stumbled</p>
      <h1 className="mt-3 font-display text-3xl text-stone-900 md:text-4xl">Something slipped on our side</h1>
      <p className="mt-4 text-lg leading-8 text-stone-600">
        Nothing you typed was lost to anyone, because Julley never stores it. Take a breath and try again.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button type="button" onClick={() => reset()} className="btn-primary px-8">
          Try again
        </button>
        <Link href="/learn" className="btn-secondary px-8">
          Go to the learn page
        </Link>
      </div>
    </section>
  );
}
