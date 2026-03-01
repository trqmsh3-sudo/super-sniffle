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
      <h2 className="mb-6 text-lg font-semibold text-gray-700">
        Related Brands
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {related.map((brand) => (
          <Link
            key={brand.slug}
            href={`/brand/${brand.slug}`}
            className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://logo.clearbit.com/${brand.slug}.com`}
              alt={`${brand.name} logo`}
              width={36}
              height={36}
              className="h-9 w-9 rounded-lg object-contain"
              loading="lazy"
            />
            <span className="text-sm font-medium text-gray-800">
              {brand.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
