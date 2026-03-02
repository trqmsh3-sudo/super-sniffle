// =============================================================================
// ClearPick.ai — Search Results Page (SaaS Redesign)
// /search?q=query
// FilterPanel sidebar · AIInsight · ProductCard grid · CompareBar · Comparison
// =============================================================================

'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback, useMemo, useRef, Suspense } from 'react';
import { detectSearchIntent, type SearchIntent } from '@/lib/searchIntent';
import SearchBar from '@/components/SearchBar';
import ProductCard from '@/components/ProductCard';
import AIInsight from '@/components/AIInsight';
import FilterPanel, { DEFAULT_FILTERS, type FilterState } from '@/components/FilterPanel';
import ComparisonTable, { CompareBar } from '@/components/ComparisonTable';
import { VerifiedBadge, SourceLogos } from '@/components/TrustElements';
import CacheBadge from '@/components/CacheBadge';
import AccuracyRating from '@/components/AccuracyRating';

// ── Types ────────────────────────────────────────────────────────────────────

interface SearchResultItem {
  id: string;
  title: string;
  image?: string;
  price?: number;
  currency?: string;
  rating?: number;
  source?: string;
  url?: string;
  snippet?: string;
}

interface SearchResponse {
  results: SearchResultItem[];
  cacheStatus: 'cached' | 'fresh' | 'stale';
  cachedAt: number | null;
  averageAccuracy: number;
  totalRatings: number;
  error?: string;
}

// ── Product Card Skeleton ────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div className="rounded-card border border-surface-border bg-white p-5">
      <div className="mb-4 flex items-start justify-between">
        <div className="h-5 w-3/5 animate-pulse rounded-md bg-gray-100" />
        <div className="h-9 w-9 animate-pulse rounded-xl bg-gray-100" />
      </div>
      <div className="mb-3 h-48 animate-pulse rounded-xl bg-gray-50" />
      <div className="mb-3 space-y-2">
        <div className="h-3 w-full animate-pulse rounded bg-gray-100" />
        <div className="h-3 w-4/5 animate-pulse rounded bg-gray-50" />
      </div>
      <div className="flex items-center justify-between">
        <div className="h-6 w-20 animate-pulse rounded-md bg-gray-100" />
        <div className="h-8 w-24 animate-pulse rounded-lg bg-gray-50" />
      </div>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

// ── Garbage Query Message ────────────────────────────────────────────────────

function GarbageMessage({ query }: { query: string }) {
  return (
    <div className="mx-auto max-w-lg text-center">
      <div className="mb-4 text-5xl">🤔</div>
      <h2 className="text-xl font-semibold text-gray-800">
        We couldn&apos;t understand that search
      </h2>
      <p className="mt-2 text-gray-500">
        &ldquo;{query}&rdquo; doesn&apos;t look like a product, brand, or category.
      </p>
      <p className="mt-4 text-sm text-gray-400">
        Try searching for something like &ldquo;Sony headphones&rdquo;, &ldquo;Nike&rdquo;, or
        &ldquo;wireless earbuds&rdquo;.
      </p>
    </div>
  );
}

// ── Main Search Content ──────────────────────────────────────────────────────

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') ?? '';

  const [intent, setIntent] = useState<SearchIntent | null>(null);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [cacheStatus, setCacheStatus] = useState<'cached' | 'fresh' | 'stale'>('fresh');
  const [cachedAt, setCachedAt] = useState<number | null>(null);
  const [averageAccuracy, setAverageAccuracy] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter / compare state
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [compareSet, setCompareSet] = useState<Set<string>>(new Set());
  const [showComparison, setShowComparison] = useState(false);

  const comparisonRef = useRef<HTMLDivElement>(null);

  // ── Intent detection + fetch ────────────────────────────────────────────

  useEffect(() => {
    if (!query) return;

    const detected = detectSearchIntent(query);
    setIntent(detected);

    if (detected.type === 'brand' && detected.slug) {
      router.replace(`/brand/${detected.slug}`);
      return;
    }
    if (detected.type === 'garbage') return;

    setLoading(true);
    setError(null);
    setCompareSet(new Set());
    setShowComparison(false);
    setFilters(DEFAULT_FILTERS);

    fetch(`/api/search?q=${encodeURIComponent(query)}`)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? 'Search failed');
        }
        return res.json() as Promise<SearchResponse>;
      })
      .then((data) => {
        setResults(data.results);
        setCacheStatus(data.cacheStatus);
        setCachedAt(data.cachedAt);
        setAverageAccuracy(data.averageAccuracy);
        setTotalRatings(data.totalRatings);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Something went wrong.');
      })
      .finally(() => setLoading(false));
  }, [query, router]);

  // ── Derived: available brands ───────────────────────────────────────────

  const availableBrands = useMemo(() => {
    const set = new Set<string>();
    results.forEach((r) => {
      if (r.source) set.add(r.source);
    });
    return Array.from(set).sort();
  }, [results]);

  // ── Derived: filtered + sorted results ──────────────────────────────────

  const filteredResults = useMemo(() => {
    let items = [...results];

    // Price filter
    if (filters.priceMin > 0) {
      items = items.filter((r) => (r.price ?? 0) >= filters.priceMin);
    }
    if (filters.priceMax < 10000) {
      items = items.filter((r) => (r.price ?? 0) <= filters.priceMax);
    }

    // Brand (source) filter
    if (filters.brands.length > 0) {
      items = items.filter((r) => r.source && filters.brands.includes(r.source));
    }

    // Rating filter
    if (filters.minRating > 0) {
      items = items.filter((r) => {
        const ratingOut10 = r.rating ? (r.rating > 5 ? r.rating : r.rating * 2) : 0;
        return ratingOut10 >= filters.minRating;
      });
    }

    // Sort
    switch (filters.sort) {
      case 'price-asc':
        items.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
        break;
      case 'price-desc':
        items.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
        break;
      case 'rating':
        items.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      default:
        break;
    }

    return items;
  }, [results, filters]);

  // ── Comparison helpers ──────────────────────────────────────────────────

  const toggleCompare = useCallback((name: string) => {
    setCompareSet((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else if (next.size < 3) {
        next.add(name);
      }
      return next;
    });
  }, []);

  const compareProducts = useMemo(
    () =>
      results
        .filter((r) => compareSet.has(r.title))
        .map((r) => ({
          name: r.title,
          price: r.price ? `$${r.price.toLocaleString()}` : undefined,
          rating: r.rating ?? 0,
          description: r.snippet,
          source: r.source,
          image: r.image,
        })),
    [results, compareSet],
  );

  const handleViewCompare = useCallback(() => {
    setShowComparison(true);
    setTimeout(() => comparisonRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  }, []);

  // ── AI Insight derived data ─────────────────────────────────────────────

  const topProduct = results[0]?.title;
  const priceRange = useMemo(() => {
    const prices = results.filter((r) => r.price && r.price > 0).map((r) => r.price!);
    if (prices.length < 2) return undefined;
    return `$${Math.min(...prices).toLocaleString()} – $${Math.max(...prices).toLocaleString()}`;
  }, [results]);

  // ── Accuracy rating callback ────────────────────────────────────────────

  const handleRated = useCallback((newAvg: number) => {
    setAverageAccuracy(newAvg);
    setTotalRatings((prev) => prev + 1);
  }, []);

  // ── Empty state (no query) ──────────────────────────────────────────────

  if (!query) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-8 px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Clear<span className="text-accent">Pick</span>
          </h1>
          <p className="mt-2 text-gray-500">
            AI-powered product search with accuracy ratings
          </p>
        </div>
        <SearchBar autoFocus />
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-surface-bg">
      {/* Compact search bar */}
      <div className="border-b border-surface-border bg-white">
        <div className="mx-auto flex max-w-content items-center gap-4 px-4 py-3 sm:px-6">
          <SearchBar initialQuery={query} compact />
        </div>
      </div>

      {/* Main layout */}
      <div className="mx-auto flex max-w-content gap-6 px-4 py-6 sm:px-6">
        {/* Sidebar — desktop only */}
        {!loading && results.length > 0 && intent?.type !== 'garbage' && (
          <aside className="hidden w-64 shrink-0 lg:block">
            <FilterPanel
              filters={filters}
              onChange={setFilters}
              availableBrands={availableBrands}
            />
          </aside>
        )}

        {/* Content area */}
        <main className="min-w-0 flex-1">
          {/* Garbage query */}
          {intent?.type === 'garbage' && (
            <div className="mt-12">
              <GarbageMessage query={query} />
            </div>
          )}

          {/* Loading */}
          {loading && <SkeletonGrid />}

          {/* Error */}
          {error && !loading && (
            <div className="rounded-card border border-red-200 bg-red-50 p-6 text-center">
              <p className="text-sm text-red-600">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  fetch(`/api/search?q=${encodeURIComponent(query)}`)
                    .then(async (res) => {
                      if (!res.ok) {
                        const body = await res.json().catch(() => ({}));
                        throw new Error(body.error ?? 'Search failed');
                      }
                      return res.json() as Promise<SearchResponse>;
                    })
                    .then((data) => {
                      setResults(data.results);
                      setCacheStatus(data.cacheStatus);
                      setCachedAt(data.cachedAt);
                      setAverageAccuracy(data.averageAccuracy);
                      setTotalRatings(data.totalRatings);
                    })
                    .catch((err) => {
                      setError(err instanceof Error ? err.message : 'Something went wrong.');
                    })
                    .finally(() => setLoading(false));
                }}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-primary-800 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-primary-700 active:scale-[0.97]"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Try again
              </button>
            </div>
          )}

          {/* Results */}
          {!loading && !error && results.length > 0 && intent?.type !== 'garbage' && (
            <>
              {/* AI Insight */}
              <AIInsight
                query={query}
                resultCount={results.length}
                topProduct={topProduct}
                priceRange={priceRange}
              />

              {/* Meta bar */}
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-sm text-gray-500">
                    <span className="font-medium text-gray-700">{filteredResults.length}</span> results
                    for &ldquo;<span className="font-medium text-gray-700">{query}</span>&rdquo;
                  </p>
                  <CacheBadge status={cacheStatus} cachedAt={cachedAt} />
                </div>

                {/* Mobile filter button */}
                <button
                  onClick={() => setMobileFilterOpen(true)}
                  className="flex items-center gap-1.5 rounded-lg border border-surface-border bg-white px-3 py-2 text-xs font-medium text-gray-600 shadow-sm transition-colors hover:bg-gray-50 lg:hidden"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filters
                </button>
              </div>

              {/* Verified badge */}
              <div className="mb-4">
                <VerifiedBadge sourceCount={availableBrands.length} />
              </div>

              {/* Product grid */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredResults.map((item) => (
                  <ProductCard
                    key={item.id}
                    name={item.title}
                    year={new Date().getFullYear()}
                    price={item.price ? `$${item.price.toLocaleString()}` : 'N/A'}
                    image={item.image ?? ''}
                    description={item.snippet ?? ''}
                    rating={item.rating ?? 0}
                    source={item.url ?? '#'}
                    isSelected={compareSet.has(item.title)}
                    onToggleCompare={toggleCompare}
                  />
                ))}
              </div>

              {/* No filtered results */}
              {filteredResults.length === 0 && results.length > 0 && (
                <div className="mt-8 text-center">
                  <p className="text-sm text-gray-500">No products match your filters.</p>
                  <button
                    onClick={() => setFilters(DEFAULT_FILTERS)}
                    className="mt-2 text-sm font-medium text-accent hover:underline"
                  >
                    Reset filters
                  </button>
                </div>
              )}

              {/* Source logos */}
              <div className="mt-8">
                <SourceLogos />
              </div>

              {/* Comparison table */}
              {showComparison && (
                <div ref={comparisonRef} className="mt-6">
                  <ComparisonTable
                    products={compareProducts}
                    onRemove={(name) => toggleCompare(name)}
                    onClear={() => {
                      setCompareSet(new Set());
                      setShowComparison(false);
                    }}
                  />
                </div>
              )}
            </>
          )}

          {/* No results */}
          {!loading &&
            !error &&
            results.length === 0 &&
            intent?.type !== 'garbage' &&
            intent?.type !== 'brand' && (
              <div className="mt-12 text-center">
                <div className="mb-4 text-5xl">📭</div>
                <h2 className="text-lg font-semibold text-gray-700">No results found</h2>
                <p className="mt-1 text-sm text-gray-400">
                  Try a different search term or check back later.
                </p>
              </div>
            )}
        </main>
      </div>

      {/* Mobile filter drawer */}
      <FilterPanel
        filters={filters}
        onChange={setFilters}
        availableBrands={availableBrands}
        isMobile
        isOpen={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
      />

      {/* Compare bar (sticky bottom) */}
      <CompareBar
        count={compareSet.size}
        onView={handleViewCompare}
        onClear={() => {
          setCompareSet(new Set());
          setShowComparison(false);
        }}
      />

      {/* Floating accuracy rating widget */}
      {!loading && results.length > 0 && intent?.type !== 'garbage' && compareSet.size === 0 && (
        <AccuracyRating
          query={query}
          averageAccuracy={averageAccuracy}
          totalRatings={totalRatings}
          onRated={handleRated}
        />
      )}
    </div>
  );
}

// ── Page wrapper with Suspense for useSearchParams ───────────────────────────

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-surface-bg">
          <div className="mx-auto max-w-content px-4">
            <SkeletonGrid />
          </div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
