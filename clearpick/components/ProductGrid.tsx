// =============================================================================
// ClearPick.ai — Product Grid Component (Light Design System)
// Flat responsive grid, sorted by year+rating DESC, max 24 products
// =============================================================================

'use client';

import { useMemo } from 'react';
import type { BrandYearGroup } from '@/lib/brandData';
import ProductCard from '@/components/ProductCard';

// ── Types ────────────────────────────────────────────────────────────────────

interface ProductGridProps {
  yearGroups: BrandYearGroup[];
  brandSlug: string;
  brandName: string;
  primaryColor: string;
}

// ── Constants ────────────────────────────────────────────────────────────────

const MAX_PRODUCTS = 24;

// ── Component ────────────────────────────────────────────────────────────────

export default function ProductGrid({
  yearGroups,
  brandSlug,
  brandName,
  primaryColor,
}: ProductGridProps) {
  // Flatten → sort year DESC then rating DESC → cap 24
  const products = useMemo(() => {
    const all = yearGroups.flatMap((g) =>
      g.items.map((p) => ({
        name: p.name,
        image: p.image || '',
        year: p.year ?? g.year,
        price: p.price ?? p.priceRange ?? 'Unknown',
        rating: p.rating ?? 0,
        description: p.description ?? '',
        source: p.source ?? '',
      })),
    );

    all.sort((a, b) => {
      if (b.year !== a.year) return b.year - a.year;
      return b.rating - a.rating;
    });

    return all.slice(0, MAX_PRODUCTS);
  }, [yearGroups]);

  // ── Empty State ─────────────────────────────────────────────────────────

  if (products.length === 0) {
    return (
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-12 text-center backdrop-blur-md">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5 border border-white/10">
            <svg className="h-8 w-8 text-primary/70 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-white font-display-lg">No products listed yet</h3>
          <p className="mt-2 text-sm text-gray-400 font-body-md">
            We are still gathering {brandName} product data. Check back soon.
          </p>
        </div>
      </section>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <section className="mx-auto max-w-6xl px-6 py-12 md:py-16">
      {/* Section Header */}
      <div className="mb-8 flex items-end justify-between border-b border-white/5 pb-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white md:text-3xl font-display-lg">
            Products
          </h2>
          <p className="mt-1 text-sm text-gray-400 font-body-md">
            {products.length} {products.length === 1 ? 'model' : 'models'}
          </p>
        </div>
      </div>

      {/* Grid: 2 mobile / 3 tablet / 4 desktop */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((p, i) => (
          <ProductCard
            key={`${p.name}-${i}`}
            name={p.name}
            year={p.year}
            price={p.price}
            image={p.image}
            description={p.description}
            rating={p.rating}
            source={p.source}
            brandColor={primaryColor}
          />
        ))}
      </div>
    </section>
  );
}

// ── Skeleton Loading State ───────────────────────────────────────────────────

export function ProductGridSkeleton() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-12 md:py-16">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="h-8 w-32 animate-pulse rounded-lg bg-white/5" />
        <div className="mt-2 h-4 w-48 animate-pulse rounded bg-white/10" />
      </div>

      {/* Cards skeleton */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-xl border border-white/5 bg-[#141418]/60">
            <div className="aspect-[4/3] animate-pulse bg-white/5" />
            <div className="p-3.5">
              <div className="h-4 w-3/4 animate-pulse rounded bg-white/10" />
              <div className="my-2 h-[2px] w-full animate-pulse rounded-full bg-white/5" />
              <div className="h-3 w-16 animate-pulse rounded bg-white/10" />
              <div className="mt-2 h-3 w-full animate-pulse rounded bg-white/5" />
              <div className="mt-1 h-3 w-5/6 animate-pulse rounded bg-white/5" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
