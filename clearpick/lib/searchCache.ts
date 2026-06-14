// =============================================================================
// ClearPick.ai — Search Cache Layer (Redis via ioredis)
// TTL: 24 hours | Auto-invalidation when accuracy < 2.5
// Gracefully operates in no-cache mode when Redis is unavailable
// =============================================================================

import Redis from 'ioredis';

// ── Types ────────────────────────────────────────────────────────────────────

export interface SearchResult {
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

export interface CachedSearch {
  query: string;
  results: SearchResult[];
  cachedAt: number;
  accuracyRatings: number[];
  averageAccuracy: number;
  flagged?: boolean;
}

// ── Constants ────────────────────────────────────────────────────────────────

const CACHE_PREFIX = 'clearpick:search:';
const RATE_LIMIT_PREFIX = 'clearpick:ratelimit:';
const TTL_SECONDS = 24 * 60 * 60; // 24 hours
const RATE_LIMIT_TTL = 3600; // 1 hour
const LOW_ACCURACY_THRESHOLD = 2.5;

// ── Redis Client (graceful no-cache mode) ────────────────────────────────────

let redis: Redis | null = null;
/** Once true, all cache ops become no-ops (no repeated error logs) */
let redisUnavailable = false;
let redisErrorLogged = false;

function getRedis(): Redis | null {
  // If we already know Redis is down, skip entirely
  if (redisUnavailable) return null;

  if (!redis) {
    try {
      redis = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
        maxRetriesPerRequest: 0,
        lazyConnect: true,
        connectTimeout: 1000,
        enableOfflineQueue: false,
        retryStrategy() {
          // Never retry — enter no-cache mode immediately
          redisUnavailable = true;
          if (!redisErrorLogged) {
            console.warn('[ClearPick Cache] Redis unavailable — running in no-cache mode.');
            redisErrorLogged = true;
          }
          return null;
        },
      });

      redis.on('error', () => {
        // Log once, then go silent
        if (!redisErrorLogged) {
          console.warn('[ClearPick Cache] Redis connection failed — running in no-cache mode.');
          redisErrorLogged = true;
        }
        redisUnavailable = true;
      });
    } catch {
      redisUnavailable = true;
      if (!redisErrorLogged) {
        console.warn('[ClearPick Cache] Redis init failed — running in no-cache mode.');
        redisErrorLogged = true;
      }
      return null;
    }
  }
  return redis;
}

function cacheKey(query: string): string {
  return `${CACHE_PREFIX}${query.trim().toLowerCase().replace(/\s+/g, '_')}`;
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Read a cached search result. Returns null if not cached, Redis is down,
 * or if accuracy is below threshold (forcing a re-fetch).
 */
export async function getCachedSearch(query: string): Promise<CachedSearch | null> {
  const client = getRedis();
  if (!client) return null;

  try {
    const raw = await client.get(cacheKey(query));
    if (!raw) return null;

    const cached: CachedSearch = JSON.parse(raw);

    // If average accuracy is too low, invalidate and force re-fetch
    if (cached.averageAccuracy > 0 && cached.averageAccuracy < LOW_ACCURACY_THRESHOLD) {
      await invalidateCache(query);
      return null;
    }

    return cached;
  } catch {
    return null;
  }
}

/**
 * Write search results to cache with a 24-hour TTL.
 */
export async function setCachedSearch(
  query: string,
  results: SearchResult[],
): Promise<void> {
  const entry: CachedSearch = {
    query: query.trim().toLowerCase(),
    results,
    cachedAt: Date.now(),
    accuracyRatings: [],
    averageAccuracy: 0,
  };

  try {
    const client = getRedis();
    if (!client) return;
    await client.setex(cacheKey(query), TTL_SECONDS, JSON.stringify(entry));
  } catch {
    // no-op — cache write failure is non-critical
  }
}

/**
 * Add a user accuracy rating (1-5 stars) to an existing cache entry.
 * Returns the updated average, or null if no cache entry exists.
 */
export async function addAccuracyRating(
  query: string,
  rating: number,
): Promise<{ averageAccuracy: number; totalRatings: number; flagged: boolean } | null> {
  const clampedRating = Math.max(1, Math.min(5, Math.round(rating)));

  const client = getRedis();
  if (!client) return null;

  try {
    const raw = await client.get(cacheKey(query));
    if (!raw) return null;

    const cached: CachedSearch = JSON.parse(raw);
    cached.accuracyRatings.push(clampedRating);
    cached.averageAccuracy =
      cached.accuracyRatings.reduce((sum, r) => sum + r, 0) / cached.accuracyRatings.length;

    // Flag if accuracy dropped below threshold
    if (cached.averageAccuracy > 0 && cached.averageAccuracy < LOW_ACCURACY_THRESHOLD) {
      cached.flagged = true;
    } else {
      cached.flagged = false;
    }

    // Re-save with remaining TTL
    const ttl = await client.ttl(cacheKey(query));
    const effectiveTtl = ttl > 0 ? ttl : TTL_SECONDS;
    await client.setex(cacheKey(query), effectiveTtl, JSON.stringify(cached));

    return {
      averageAccuracy: Math.round(cached.averageAccuracy * 100) / 100,
      totalRatings: cached.accuracyRatings.length,
      flagged: cached.flagged ?? false,
    };
  } catch {
    return null;
  }
}

/**
 * Delete a cache entry (e.g., when accuracy is too low).
 */
export async function invalidateCache(query: string): Promise<void> {
  const client = getRedis();
  if (!client) return;
  try {
    await client.del(cacheKey(query));
  } catch {
    // no-op
  }
}

/**
 * Check if an IP is rate-limited for rating a specific query.
 * Returns true if rate-limited (should reject), false if allowed.
 */
export async function checkRateLimit(ip: string, query: string): Promise<boolean> {
  const client = getRedis();
  if (!client) return false; // fail open
  const key = `${RATE_LIMIT_PREFIX}${ip}:${query.trim().toLowerCase().replace(/\s+/g, '_')}`;
  try {
    const exists = await client.exists(key);
    return exists === 1;
  } catch {
    return false; // fail open
  }
}

/**
 * Mark that an IP has rated a specific query (1 hour cooldown).
 */
export async function setRateLimit(ip: string, query: string): Promise<void> {
  const client = getRedis();
  if (!client) return;
  const key = `${RATE_LIMIT_PREFIX}${ip}:${query.trim().toLowerCase().replace(/\s+/g, '_')}`;
  try {
    await client.setex(key, RATE_LIMIT_TTL, '1');
  } catch {
    // fail silently
  }
}

/**
 * Read a cached search result INCLUDING low-accuracy (flagged) entries.
 * Used by the search page to determine cache status before re-fetching.
 */
export async function getCachedSearchRaw(query: string): Promise<CachedSearch | null> {
  const client = getRedis();
  if (!client) return null;
  try {
    const raw = await client.get(cacheKey(query));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}


