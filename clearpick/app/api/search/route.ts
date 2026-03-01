// =============================================================================
// ClearPick.ai — Search API Route
// GET /api/search?q=query
// Checks cache → falls back to external API → caches result
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import {
  getCachedSearch,
  getCachedSearchRaw,
  setCachedSearch,
  type SearchResult,
} from '@/lib/searchCache';
import { API_BASE } from '@/lib/config';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')?.trim();

  if (!query || query.length < 2) {
    return NextResponse.json(
      { error: 'Query must be at least 2 characters.' },
      { status: 400 },
    );
  }

  // ── 1. Check cache ────────────────────────────────────────────────────────

  // First get raw to detect flagged/stale entries
  const rawCached = await getCachedSearchRaw(query);
  const isFlagged = rawCached?.flagged === true;

  // getCachedSearch auto-invalidates low-accuracy entries
  const cached = await getCachedSearch(query);

  if (cached && !isFlagged) {
    return NextResponse.json({
      results: cached.results,
      cacheStatus: 'cached' as const,
      cachedAt: cached.cachedAt,
      averageAccuracy: cached.averageAccuracy,
      totalRatings: cached.accuracyRatings.length,
    });
  }

  // ── 2. Fetch from V12 backend API ─────────────────────────────────────────

  try {
    const res = await fetch(
      `${API_BASE}/api/search?q=${encodeURIComponent(query)}`,
      { signal: AbortSignal.timeout(8000) },
    );

    if (!res.ok) {
      // If we had a flagged cache entry, return it as stale rather than error
      if (rawCached) {
        return NextResponse.json({
          results: rawCached.results,
          cacheStatus: 'stale' as const,
          cachedAt: rawCached.cachedAt,
          averageAccuracy: rawCached.averageAccuracy,
          totalRatings: rawCached.accuracyRatings.length,
        });
      }

      return NextResponse.json(
        { error: 'Product search API returned an error.', results: [] },
        { status: 502 },
      );
    }

    const data = await res.json();
    // V12 backend returns { products: [...] } with fields: id, name, category,
    // overall_score, summary, status, image_url, last_updated
    const rawItems = (data.products ?? data.results ?? data.items ?? []);
    const results: SearchResult[] = rawItems
      .slice(0, 20)
      .map((item: Record<string, unknown>) => ({
        id: String(item.id ?? item.name ?? Math.random().toString(36).slice(2)),
        title: String(item.name ?? item.title ?? ''),
        image: item.image_url ? String(item.image_url) : item.image ? String(item.image) : item.thumbnail ? String(item.thumbnail) : undefined,
        price: item.price ? Number(item.price) : undefined,
        currency: item.currency ? String(item.currency) : 'USD',
        rating: item.overall_score ? Number(item.overall_score) / 20 : item.rating ? Number(item.rating) : undefined,
        source: item.source ? String(item.source) : undefined,
        url: item.url ? String(item.url) : undefined,
        snippet: item.summary ? String(item.summary) : item.snippet ? String(item.snippet) : item.description ? String(item.description) : undefined,
      }));

    // ── 3. Cache the results ──────────────────────────────────────────────
    await setCachedSearch(query, results);

    return NextResponse.json({
      results,
      cacheStatus: isFlagged ? 'stale' : ('fresh' as const),
      cachedAt: null,
      averageAccuracy: 0,
      totalRatings: 0,
    });
  } catch {
    // Network error — return stale cache if available
    if (rawCached) {
      return NextResponse.json({
        results: rawCached.results,
        cacheStatus: 'stale' as const,
        cachedAt: rawCached.cachedAt,
        averageAccuracy: rawCached.averageAccuracy,
        totalRatings: rawCached.accuracyRatings.length,
      });
    }

    return NextResponse.json(
      { error: 'Failed to fetch search results.', results: [] },
      { status: 500 },
    );
  }
}
