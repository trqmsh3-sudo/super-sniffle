// =============================================================================
// ClearPick.ai — Search Results Page
// /search?q=query
// Intent routing + cache integration + accuracy rating + cache badge
// =============================================================================

'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { detectSearchIntent, type SearchIntent } from '@/lib/searchIntent';
import SearchBar from '@/components/SearchBar';
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

// ── Result Card ──────────────────────────────────────────────────────────────

function ResultCard({ item }: { item: SearchResultItem }) {
  return (
    <a
      href={item.url ?? '#'}
      target="_blank"
      rel="noopener noreferrer"
      className="
        group flex gap-4 rounded-2xl border border-gray-100 bg-white p-4
        shadow-sm transition-all duration-200
        hover:border-gray-200 hover:shadow-md
      "
    >
      {/* Thumbnail */}
      {item.image && (
        <div className="hidden h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-gray-50 sm:block">
          <img
            src={item.image}
            alt=""
            className="h-full w-full object-contain p-2 transition-transform duration-200 group-hover:scale-105"
            loading="lazy"
          />
        </div>
      )}

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <h3 className="truncate text-base font-semibold text-gray-900 group-hover:text-blue-600">
            {item.title}
          </h3>
          {item.snippet && (
            <p className="mt-1 line-clamp-2 text-sm text-gray-500">
              {item.snippet}
            </p>
          )}
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-3">
          {/* Price */}
          {item.price !== undefined && (
            <span className="text-lg font-bold text-gray-900">
              {item.currency === 'ILS' ? '₪' : '$'}
              {item.price.toLocaleString()}
            </span>
          )}

          {/* Star rating */}
          {item.rating !== undefined && (
            <span className="flex items-center gap-1 text-sm text-amber-500">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {item.rating.toFixed(1)}
            </span>
          )}

          {/* Source */}
          {item.source && (
            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-500">
              {item.source}
            </span>
          )}
        </div>
      </div>
    </a>
  );
}

// ── Loading Skeleton ─────────────────────────────────────────────────────────

function ResultSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex gap-4 rounded-2xl border border-gray-100 bg-white p-4"
        >
          <div className="hidden h-24 w-24 animate-pulse rounded-xl bg-gray-100 sm:block" />
          <div className="flex flex-1 flex-col gap-2">
            <div className="h-5 w-3/4 animate-pulse rounded bg-gray-100" />
            <div className="h-4 w-full animate-pulse rounded bg-gray-50" />
            <div className="h-4 w-1/4 animate-pulse rounded bg-gray-50" />
          </div>
        </div>
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

  // ── Intent detection + routing ──────────────────────────────────────────

  useEffect(() => {
    if (!query) return;

    const detected = detectSearchIntent(query);
    setIntent(detected);

    // Redirect brands directly to brand page
    if (detected.type === 'brand' && detected.slug) {
      router.replace(`/brand/${detected.slug}`);
      return;
    }

    // Garbage → don't search
    if (detected.type === 'garbage') return;

    // Fetch results
    setLoading(true);
    setError(null);

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
      .finally(() => {
        setLoading(false);
      });
  }, [query, router]);

  // ── Accuracy rating callback ────────────────────────────────────────────

  const handleRated = useCallback((newAvg: number) => {
    setAverageAccuracy(newAvg);
    setTotalRatings((prev) => prev + 1);
  }, []);

  // ── Empty state ─────────────────────────────────────────────────────────

  if (!query) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-8 px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Clear<span className="text-blue-500">Pick</span>
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
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-gray-100 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-4xl items-center gap-4 px-4 py-3">
          <a
            href="/search"
            className="hidden text-lg font-bold text-gray-900 sm:block"
          >
            Clear<span className="text-blue-500">Pick</span>
          </a>
          <SearchBar initialQuery={query} compact />
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-4 py-6">
        {/* Garbage query */}
        {intent?.type === 'garbage' && (
          <div className="mt-12">
            <GarbageMessage query={query} />
          </div>
        )}

        {/* Loading */}
        {loading && <ResultSkeleton />}

        {/* Error */}
        {error && !loading && (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-center">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Results */}
        {!loading && !error && results.length > 0 && intent?.type !== 'garbage' && (
          <>
            {/* Meta bar */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-gray-500">
                <span className="font-medium text-gray-700">{results.length}</span> results
                for &ldquo;<span className="font-medium text-gray-700">{query}</span>&rdquo;
              </p>
              <CacheBadge status={cacheStatus} cachedAt={cachedAt} />
            </div>

            {/* Result list */}
            <div className="space-y-3">
              {results.map((item) => (
                <ResultCard key={item.id} item={item} />
              ))}
            </div>
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

      {/* Floating accuracy rating widget */}
      {!loading && results.length > 0 && intent?.type !== 'garbage' && (
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
        <div className="flex min-h-screen items-center justify-center">
          <span className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
