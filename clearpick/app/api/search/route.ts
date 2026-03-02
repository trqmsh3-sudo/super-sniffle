// =============================================================================
// ClearPick.ai — Search API Route
// GET /api/search?q=query
// Uses Gemini + Google Search grounding for real-time product search
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  getCachedSearch,
  getCachedSearchRaw,
  setCachedSearch,
  type SearchResult,
} from '@/lib/searchCache';

const MODEL_NAME = 'gemini-2.5-flash';
const CURRENT_YEAR = new Date().getFullYear();

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')?.trim();

  if (!query || query.length < 2) {
    return NextResponse.json(
      { error: 'Query must be at least 2 characters.' },
      { status: 400 },
    );
  }

  // ── 1. Check cache ────────────────────────────────────────────────────────

  const rawCached = await getCachedSearchRaw(query);
  const isFlagged = rawCached?.flagged === true;
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

  // ── 2. Search via Gemini + Google Search grounding ────────────────────────

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_key_here') {
    return NextResponse.json(
      { error: 'Search service not configured.', results: [] },
      { status: 503 },
    );
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      tools: [{ googleSearch: {} } as never],
    });

    const prompt = `Search the web for: "${query}"

Find 10-20 real products matching this search query. Look at shopping sites, review sites (TechRadar, PCMag, CNET, The Verge, rtings, Tom's Guide), and retailer pages (Amazon, Best Buy, B&H Photo).

Return a JSON array only. Each product must have ALL these fields:
- id: a unique short identifier (lowercase, no spaces)
- title: exact official product name (e.g. "Apple iPhone 16 Pro Max")
- price: number (USD, no $ sign, e.g. 999). Use 0 if unknown.
- currency: "USD"
- rating: score out of 5 stars (e.g. 4.5). Use 0 if unknown.
- source: name of the review/shopping site (e.g. "TechRadar", "Amazon")
- url: direct URL to the product page or review
- snippet: 1-2 sentence description of the product
- image: direct image URL if found, or empty string

Important: Return REAL products with REAL prices from ${CURRENT_YEAR} or recent years. 
No markdown fences, no explanation — ONLY the JSON array.`;

    console.log(`[Search API] Gemini+GoogleSearch query: "${query}"`);
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Parse JSON response
    const jsonStr = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
    const parsed = JSON.parse(jsonStr);

    if (!Array.isArray(parsed)) {
      console.warn('[Search API] Gemini returned non-array:', typeof parsed);
      return NextResponse.json(
        { error: 'Search returned unexpected format.', results: [] },
        { status: 500 },
      );
    }

    const results: SearchResult[] = parsed
      .filter((p: Record<string, unknown>) => p && typeof p.title === 'string' && p.title.length > 0)
      .slice(0, 20)
      .map((item: Record<string, unknown>) => ({
        id: String(item.id ?? Math.random().toString(36).slice(2)),
        title: String(item.title ?? ''),
        image: typeof item.image === 'string' && item.image.startsWith('http')
          ? item.image
          : undefined,
        price: typeof item.price === 'number' && item.price > 0
          ? item.price
          : undefined,
        currency: String(item.currency ?? 'USD'),
        rating: typeof item.rating === 'number' && item.rating > 0
          ? item.rating
          : undefined,
        source: typeof item.source === 'string' ? item.source : undefined,
        url: typeof item.url === 'string' && item.url.startsWith('http')
          ? item.url
          : undefined,
        snippet: typeof item.snippet === 'string' ? item.snippet : undefined,
      }));

    console.log(`[Search API] Found ${results.length} products for "${query}"`);

    // ── 3. Cache the results ──────────────────────────────────────────────
    await setCachedSearch(query, results);

    return NextResponse.json({
      results,
      cacheStatus: isFlagged ? 'stale' : ('fresh' as const),
      cachedAt: null,
      averageAccuracy: 0,
      totalRatings: 0,
    });
  } catch (err) {
    console.error('[Search API] Gemini search error:', err);

    // Return stale cache if available
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
