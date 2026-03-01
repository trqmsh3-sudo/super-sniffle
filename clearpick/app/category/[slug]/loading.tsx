// =============================================================================
// ClearPick.ai — Category Page Loading State
// Skeleton while category products are being fetched
// =============================================================================

export default function CategoryLoading() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Skeleton */}
      <section className="relative overflow-hidden">
        <div className="relative mx-auto max-w-6xl px-6 pb-12 pt-16 md:pb-16 md:pt-24">
          <div className="flex flex-col items-center text-center">
            {/* Category badge */}
            <div className="mb-4 h-8 w-24 animate-pulse rounded-full bg-gray-100" />
            {/* Title */}
            <div className="h-12 w-56 animate-pulse rounded-xl bg-gray-100 md:h-16 md:w-72" />
            {/* Description */}
            <div className="mt-4 h-5 w-80 animate-pulse rounded bg-gray-50" />
          </div>
        </div>
        {/* Accent line */}
        <div className="h-[3px] animate-pulse bg-gray-100" />
      </section>

      {/* Product Grid Skeleton */}
      <section className="mx-auto max-w-6xl px-6 py-12 md:py-16">
        <div className="mb-10">
          <div className="h-10 w-40 animate-pulse rounded-lg bg-gray-100" />
          <div className="mt-2 h-4 w-60 animate-pulse rounded bg-gray-50" />
        </div>

        {[1, 2].map((group) => (
          <div key={group} className="mb-12">
            <div className="mb-6 flex items-center gap-3">
              <div className="h-9 w-9 animate-pulse rounded-lg bg-gray-100" />
              <div className="h-7 w-20 animate-pulse rounded bg-gray-100" />
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3].map((card) => (
                <div
                  key={card}
                  className="rounded-2xl border border-gray-50 bg-white p-5"
                >
                  <div className="mb-4 h-44 animate-pulse rounded-xl bg-gray-50" />
                  <div className="h-5 w-3/4 animate-pulse rounded bg-gray-100" />
                  <div className="mt-3 space-y-1.5">
                    <div className="h-3.5 w-full animate-pulse rounded bg-gray-50" />
                    <div className="h-3.5 w-5/6 animate-pulse rounded bg-gray-50" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
