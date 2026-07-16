// CANONICAL loading skeleton for the learn page. Mirrors the final layout so
// nothing jumps when the real page arrives.

export default function LearnLoading() {
  return (
    <div aria-busy="true" className="mx-auto max-w-4xl px-4 py-10 sm:px-6 md:py-16 lg:px-8">
      <div className="flex flex-col items-center">
        <div className="skeleton h-4 w-44" />
        <div className="skeleton mt-4 h-12 w-full max-w-xl" />
        <div className="skeleton mt-4 h-5 w-full max-w-lg" />
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <div className="skeleton h-8 w-28 rounded-full" />
          <div className="skeleton h-8 w-36 rounded-full" />
          <div className="skeleton h-8 w-28 rounded-full" />
        </div>
      </div>
      <div className="skeleton mt-10 h-96 w-full rounded-3xl" />
      <div className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="skeleton h-44 rounded-2xl" />
        <div className="skeleton h-44 rounded-2xl" />
        <div className="skeleton h-44 rounded-2xl" />
      </div>
    </div>
  );
}
