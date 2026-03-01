// =============================================================================
// ClearPick.ai — Rate Search API Route (v2)
// POST /api/rate-search
// With IP-based rate limiting, integer validation, flagged field
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import {
  addAccuracyRating,
  checkRateLimit,
  setRateLimit,
} from '@/lib/searchCache';

interface RateSearchBody {
  query?: string;
  rating?: number;
}

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    '0.0.0.0'
  );
}

export async function POST(request: NextRequest) {
  try {
    const body: RateSearchBody = await request.json();

    // ── Validation ──────────────────────────────────────────────────────────

    if (
      !body.query ||
      typeof body.query !== 'string' ||
      body.query.trim().length < 2
    ) {
      return NextResponse.json(
        { error: 'Query must be at least 2 characters.' },
        { status: 400 },
      );
    }

    if (
      body.rating === undefined ||
      typeof body.rating !== 'number' ||
      !Number.isInteger(body.rating) ||
      body.rating < 1 ||
      body.rating > 5
    ) {
      return NextResponse.json(
        { error: 'Rating must be an integer between 1 and 5.' },
        { status: 400 },
      );
    }

    // ── Rate Limiting (1 rating per IP per query per hour) ──────────────────

    const ip = getClientIp(request);
    const isLimited = await checkRateLimit(ip, body.query);

    if (isLimited) {
      return NextResponse.json(
        { error: 'You have already rated this search recently. Try again later.' },
        { status: 429 },
      );
    }

    // ── Update Cache ────────────────────────────────────────────────────────

    const result = await addAccuracyRating(body.query, body.rating);

    if (!result) {
      return NextResponse.json(
        { error: 'No cached results found for this query.' },
        { status: 404 },
      );
    }

    // ── Mark rate limit ─────────────────────────────────────────────────────

    await setRateLimit(ip, body.query);

    return NextResponse.json({
      success: true,
      query: body.query.trim().toLowerCase(),
      averageAccuracy: result.averageAccuracy,
      totalRatings: result.totalRatings,
      flagged: result.flagged,
    });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 },
    );
  }
}
