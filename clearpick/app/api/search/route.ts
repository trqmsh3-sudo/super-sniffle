// =============================================================================
// ClearPick.ai — Search API Route
// GET /api/search?q=query
// Uses Groq llama-3.3-70b-versatile for product search
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import {
  getCachedSearch,
  getCachedSearchRaw,
  setCachedSearch,
  type SearchResult,
} from '@/lib/searchCache';

const MODEL_NAME = 'llama-3.3-70b-versatile';
const CURRENT_YEAR = new Date().getFullYear();

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')?.trim();

  if (!query || query.length < 2) {
    return NextResponse.json(
      { error: 'Query must be at least 2 characters.' },
      { status: 400 },
    );
  }

  // ── 1. Check cache (Redis is optional — failures are silently skipped) ────

  let rawCached = null;
  let cached = null;
  try {
    rawCached = await getCachedSearchRaw(query);
    cached = await getCachedSearch(query);
  } catch {
    // Redis unavailable — proceed without cache
  }
  const isFlagged = rawCached?.flagged === true;

  if (cached && !isFlagged) {
    return NextResponse.json({
      results: cached.results,
      cacheStatus: 'cached' as const,
      cachedAt: cached.cachedAt,
      averageAccuracy: cached.averageAccuracy,
      totalRatings: cached.accuracyRatings.length,
    });
  }

  // ── 2. Search via Groq ────────────────────────────────────────────────────

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === 'your_groq_key_here') {
    return NextResponse.json(
      { error: 'Search service not configured.', results: [] },
      { status: 503 },
    );
  }

  try {
    const groq = new Groq({ apiKey });

    const prompt = `Search your knowledge for: "${query}"

Find 10-20 real products matching this search query. Use your knowledge of shopping sites, review sites (TechRadar, PCMag, CNET, The Verge, rtings, Tom's Guide), and retailers (Amazon, Best Buy, B&H Photo).

Return a JSON array only. Each product must have ALL these fields:
- id: a unique short identifier (lowercase, no spaces)
- title: exact official product name (e.g. "Apple iPhone 16 Pro Max")
- price: number (USD, no $ sign, e.g. 999). Use 0 if unknown.
- currency: "USD"
- rating: score out of 5 stars (e.g. 4.5). Use 0 if unknown.
- source: name of the review/shopping site (e.g. "TechRadar", "Amazon")
- url: direct URL to the product page or review (or empty string if unknown)
- snippet: 1-2 sentence description of the product
- image: direct image URL if known, or empty string

Important: Return REAL products with REAL prices from ${CURRENT_YEAR} or recent years.
No markdown fences, no explanation — ONLY the JSON array.`;

    console.log(`[Search API] Groq query: "${query}"`);

    const completion = await groq.chat.completions.create({
      model: MODEL_NAME,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
    });

    let text = completion.choices[0]?.message?.content?.trim() ?? '';

    // Robust JSON extraction — find the outermost [ ... ]
    let jsonStr = text;

    // Strip markdown fences
    jsonStr = jsonStr.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');

    // Find first '[' and last ']' to extract the JSON array
    const firstBracket = jsonStr.indexOf('[');
    const lastBracket = jsonStr.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket > firstBracket) {
      jsonStr = jsonStr.slice(firstBracket, lastBracket + 1);
    }

    // Fix common JSON issues: trailing commas before ]
    jsonStr = jsonStr.replace(/,\s*]/g, ']');

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonStr);
    } catch (parseErr) {
      console.error('[Search API] JSON parse failed. Raw text (first 500 chars):', text.slice(0, 500));
      return NextResponse.json(
        { error: 'Search returned unexpected format. Please try again.', results: [] },
        { status: 500 },
      );
    }

    if (!Array.isArray(parsed)) {
      console.warn('[Search API] Groq returned non-array:', typeof parsed);
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

    // ── 3. Cache the results (optional — skip if Redis unavailable) ──────
    try {
      await setCachedSearch(query, results);
    } catch {
      // no-op
    }

    return NextResponse.json({
      results,
      cacheStatus: isFlagged ? 'stale' : ('fresh' as const),
      cachedAt: null,
      averageAccuracy: 0,
      totalRatings: 0,
    });
  } catch (err) {
    console.error('[Search API] Groq search error:', err);

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
