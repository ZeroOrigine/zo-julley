'use client';

// CANONICAL root error boundary for Julley. Covers the marketing pages
// (/, /pricing) and any route outside the (dashboard) group, which carries
// its own boundary. Deliberately self-contained: no marketing components and
// no next/link import, because an error boundary must not depend on code
// that may itself be the thing that crashed. globals.css utility classes are
// available since this renders inside the root layout.

import { useEffect } from 'react';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[julley/ui] root error:', error.message);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-4 py-24 text-center">
      <p className="text-sm font-bold uppercase tracking-widest text-amber-700">Julley stumbled</p>
      <h1 className="mt-3 font-display text-3xl text-stone-900 md:text-4xl">Something slipped on our side</h1>
      <p className="mt-4 text-lg leading-8 text-stone-600">
        Nothing you typed was lost to anyone, because Julley never stores it. Take a breath and try again.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button type="button" onClick={() => reset()} className="btn-primary px-8">
          Try again
        </button>
        <a href="/" className="btn-secondary px-8">
          Back to the start
        </a>
      </div>
    </main>
  );
}
