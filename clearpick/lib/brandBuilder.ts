// =============================================================================
// ClearPick.ai — Brand Builder Pipeline
// Primary: Gemini + Google Search grounding → real-time product data
// Fallback: Gemini knowledge-only
// =============================================================================

import { buildQueries } from './queryBuilder';
import { searchAndExtractProducts, generateProductsFromKnowledge, type ExtractedProduct } from './dataExtractor';
import type { BrandData, BrandProduct, BrandYearGroup } from './brandData';
import Redis from 'ioredis';

// ── Redis Cache ──────────────────────────────────────────────────────────────

const BRAND_CACHE_PREFIX = 'brand:';
const BRAND_CACHE_TTL = 86400; // 24 hours

let redis: Redis | null = null;
let redisDown = false;

function getRedis(): Redis | null {
  if (redisDown) return null;
  if (!redis) {
    try {
      redis = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
        maxRetriesPerRequest: 1,
        lazyConnect: true,
        connectTimeout: 3000,
        retryStrategy(times) {
          if (times > 2) { redisDown = true; return null; }
          return Math.min(times * 200, 1000);
        },
      });
      redis.on('error', () => { redisDown = true; });
    } catch {
      redisDown = true;
      return null;
    }
  }
  return redis;
}

async function getCachedBrand(slug: string): Promise<BrandData | null> {
  const client = getRedis();
  if (!client) return null;
  try {
    const raw = await client.get(`${BRAND_CACHE_PREFIX}${slug}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

async function setCachedBrand(slug: string, data: BrandData): Promise<void> {
  const client = getRedis();
  if (!client) return;
  try {
    await client.setex(`${BRAND_CACHE_PREFIX}${slug}`, BRAND_CACHE_TTL, JSON.stringify(data));
  } catch {
    // non-critical
  }
}

// ── Pipeline ─────────────────────────────────────────────────────────────────

/**
 * AI-powered brand research pipeline:
 * 1. Gemini → brand metadata (name, category, color)
 * 2. Gemini + Google Search → real product data from review sites
 * 3. Fallback: Gemini knowledge if grounding fails
 * 4. Deduplicate + sort + package
 */
export async function buildBrandData(slug: string): Promise<BrandData> {
  // ── Check cache first ──────────────────────────────────────────────────
  const cached = await getCachedBrand(slug);
  if (cached) {
    console.log(`[BrandBuilder] Cache hit for "${slug}"`);
    return cached;
  }

  console.log(`[BrandBuilder] Building data for "${slug}"...`);

  // ── Step 1: Generate brand metadata ────────────────────────────────────
  const brandName = slug.replace(/-/g, ' ');
  const queryResult = await buildQueries(brandName);
  console.log(`[BrandBuilder] Brand: ${queryResult.displayName} | Category: ${queryResult.category}`);

  // ── Step 2: Gemini + Google Search grounding ───────────────────────────
  let extracted: ExtractedProduct[];
  const { products: searchProducts, sources } = await searchAndExtractProducts(queryResult.displayName);

  if (searchProducts.length >= 5) {
    extracted = searchProducts;
    console.log(`[BrandBuilder] Got ${extracted.length} products from Google Search grounding (${sources.length} sources)`);

    // Supplement with knowledge if < 10 products
    if (extracted.length < 10) {
      console.log('[BrandBuilder] < 10 grounded products — supplementing with Gemini knowledge');
      const extra = await generateProductsFromKnowledge(queryResult.displayName);
      extracted = [...extracted, ...extra];
      console.log(`[BrandBuilder] Total after supplement: ${extracted.length} products`);
    }
  } else {
    // Fallback: Gemini knowledge only
    console.log(`[BrandBuilder] Google Search returned only ${searchProducts.length} — using Gemini knowledge fallback`);
    extracted = await generateProductsFromKnowledge(queryResult.displayName);
    console.log(`[BrandBuilder] Generated ${extracted.length} products from Gemini knowledge`);
  }

  // ── Step 5: Build logo URL ─────────────────────────────────────────────
  const logo = `https://logo.clearbit.com/${slug.replace(/-/g, '')}.com`;

  // ── Step 6: Deduplicate by name ────────────────────────────────────────
  const deduped = deduplicateProducts(extracted);

  // ── Step 7: Group by year, sort DESC ───────────────────────────────────
  const products = groupByYear(deduped);

  // ── Step 8: Package result ─────────────────────────────────────────────
  const result: BrandData = {
    brand: {
      name: queryResult.displayName,
      slug,
      logo,
      primaryColor: queryResult.color,
      secondaryColor: deriveSecondary(queryResult.color),
      bio: `${queryResult.displayName} is a leading brand in the ${queryResult.category} industry.`,
      founded: 0,
      headquarters: '',
      category: queryResult.category,
    },
    products,
  };

  // ── Cache result (only if we have products) ─────────────────────────
  if (deduped.length > 0) {
    await setCachedBrand(slug, result);
    console.log(`[BrandBuilder] Cached "${slug}" with ${deduped.length} products`);
  } else {
    console.log(`[BrandBuilder] Skipped caching "${slug}" — no products found`);
  }

  return result;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function deduplicateProducts(products: ExtractedProduct[]): ExtractedProduct[] {
  const seen = new Map<string, ExtractedProduct>();
  for (const p of products) {
    const key = p.name.toLowerCase().trim();
    if (!seen.has(key)) {
      seen.set(key, p);
    }
  }
  return Array.from(seen.values());
}

function groupByYear(products: ExtractedProduct[]): BrandYearGroup[] {
  const byYear = new Map<number, BrandProduct[]>();

  for (const p of products) {
    const items = byYear.get(p.year) ?? [];
    items.push({
      id: p.name.toLowerCase().replace(/\s+/g, '-'),
      name: p.name,
      image: p.image || '',
      year: p.year,
      price: p.price || 'Unknown',
      rating: p.rating ?? 0,
      description: p.description || '',
      source: p.source || '',
      specs: [
        p.price !== 'Unknown' ? `Price: ${p.price}` : '',
        p.description || '',
        p.rating > 0 ? `Rating: ${p.rating}/10` : '',
      ].filter(Boolean).slice(0, 3),
      priceRange: p.price !== 'Unknown' ? p.price : undefined,
    });
    byYear.set(p.year, items);
  }

  return Array.from(byYear.entries())
    .sort(([a], [b]) => b - a)
    .map(([year, items]) => ({ year, items }));
}

function deriveSecondary(hex: string): string {
  try {
    const h = hex.replace('#', '');
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    const factor = luminance < 0.45 ? 1.4 : 0.65;
    const offset = luminance < 0.45 ? 60 : 0;
    const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
    return `#${[r, g, b]
      .map((c) => clamp(c * factor + offset).toString(16).padStart(2, '0'))
      .join('')}`;
  } catch {
    return '#555555';
  }
}
