// CANONICAL loading skeleton for the Sonam dedication page.

export default function SonamLoading() {
  return (
    <div aria-busy="true" className="mx-auto max-w-3xl px-4 py-12 sm:px-6 md:py-20 lg:px-8">
      <div className="flex flex-col items-center">
        <div className="skeleton h-10 w-24" />
        <div className="skeleton mt-6 h-4 w-36" />
        <div className="skeleton mt-4 h-12 w-64" />
        <div className="skeleton mt-5 h-5 w-full max-w-lg" />
      </div>
      <div className="mt-16 space-y-4">
        <div className="skeleton h-8 w-72" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-11/12" />
        <div className="skeleton h-4 w-4/5" />
      </div>
      <div className="mt-14 space-y-4">
        <div className="skeleton h-28 rounded-2xl" />
        <div className="skeleton h-28 rounded-2xl" />
        <div className="skeleton h-28 rounded-2xl" />
      </div>
    </div>
  );
}
