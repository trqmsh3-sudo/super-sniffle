'use client';

// =============================================================================
// ClearPick.ai — Related Brands Component
// Horizontal strip of related brand cards (same category, excluding current)
// =============================================================================

import Link from 'next/link';
import { BRAND_REGISTRY, type BrandEntry } from '@/lib/brandRegistry';

interface RelatedBrandsProps {
  currentSlug: string;
  category: string;
}

export default function RelatedBrands({ currentSlug, category }: RelatedBrandsProps) {
  const related: BrandEntry[] = BRAND_REGISTRY
    .filter((b) => b.category === category && b.slug !== currentSlug)
    .slice(0, 4);

  if (related.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <h2 className="mb-6 text-lg font-bold text-white font-display-lg border-b border-white/5 pb-3">
        Related Brands
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {related.map((brand) => (
          <Link
            key={brand.slug}
            href={`/brand/${brand.slug}`}
            className="group flex items-center gap-3 rounded-xl border border-white/5 bg-[#141418]/60 p-4 transition-all duration-300 hover:border-primary/30 hover:bg-white/10 hover:shadow-[0_4px_15px_rgba(242,202,80,0.06)] hover:-translate-y-0.5"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-black/40 p-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://logo.clearbit.com/${brand.slug}.com`}
                alt={`${brand.name} logo`}
                width={28}
                height={28}
                className="h-7 w-7 rounded object-contain"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(brand.name)}&background=f2ca50&color=000000&bold=true`;
                }}
              />
            </div>
            <span className="text-sm font-bold text-gray-200 group-hover:text-primary transition-colors font-body-md">
              {brand.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
