// =============================================================================
// ClearPick.ai — Brand Page Loading State (Dark Shimmer)
// Full dark theme — animated shimmer gradient
// =============================================================================

import { ProductGridSkeleton } from '@/components/ProductGrid';

export default function BrandLoading() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: '#0a0a0a' }}>
      {/* Shimmer keyframes */}
      <style>{`
        .shimmer {
          background: linear-gradient(90deg, #111 25%, #1a1a1a 50%, #111 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      {/* Hero Skeleton — 280px, gradient placeholder */}
      <section className="relative min-h-[280px] overflow-hidden" style={{ background: 'linear-gradient(135deg, #222 0%, #0a0a0a 60%)' }}>
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-14 md:py-20">
          {/* Logo placeholder */}
          <div className="h-20 w-20 shrink-0 rounded-xl shimmer md:h-24 md:w-24" />

          <div className="flex-1 space-y-3">
            {/* Title placeholder */}
            <div className="h-10 w-56 rounded-lg shimmer md:h-12 md:w-72" />

            {/* Pills placeholder */}
            <div className="flex gap-2">
              <div className="h-7 w-24 rounded-full shimmer" />
              <div className="h-7 w-20 rounded-full shimmer" />
              <div className="h-7 w-20 rounded-full shimmer" />
              <div className="h-7 w-28 rounded-full shimmer" />
            </div>
          </div>
        </div>
      </section>

      {/* Product Grid Skeleton */}
      <ProductGridSkeleton />
    </main>
  );
}
