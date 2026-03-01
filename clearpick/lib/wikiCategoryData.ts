// =============================================================================
// ClearPick.ai — Wikipedia Category Product Data Layer
// Fetches products for category pages using Wikipedia Search + Summary APIs.
// Same pattern as wikiProductData.ts but keyed by category instead of brand.
// =============================================================================

import type { BrandProduct, BrandYearGroup } from './brandData';
import {
  NOISE_WORDS,
  NOISE_TITLE_PATTERNS,
  PERSON_INDICATORS,
  NON_PRODUCT_DESCRIPTION_PATTERNS,
  extractYearFromText,
} from './wikiFilters';

// ── Constants ────────────────────────────────────────────────────────────────

const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = CURRENT_YEAR - 10;
const CALL_TIMEOUT = 8000;
const USER_AGENT = 'ClearPick/1.0 (https://clearpick.ai; product-research)';
const MAX_ENRICHMENT_CALLS = 8;

// ── Category Search Queries ──────────────────────────────────────────────────

const CATEGORY_SEARCH_QUERIES: Record<string, string> = {
  laptops: 'laptop notebook computer 2024',
  phones: 'smartphone mobile phone 2024',
  headphones: 'headphones earbuds wireless audio',
  cameras: 'digital camera mirrorless DSLR',
  cars: 'car automobile vehicle model 2024',
  tablets: 'tablet iPad Android 2024',
  televisions: 'television TV OLED QLED 2024',
  speakers: 'bluetooth speaker audio 2024',
  watches: 'smartwatch wearable 2024',
  'gaming-consoles': 'gaming console video game 2024',
  'laptops-gaming': 'gaming laptop notebook 2024',
  monitors: 'computer monitor display 2024',
  printers: 'printer laser inkjet 2024',
  routers: 'WiFi router mesh networking 2024',
  keyboards: 'mechanical keyboard gaming wireless',
  mice: 'gaming mouse wireless ergonomic',
  refrigerators: 'refrigerator fridge smart appliance',
  'washing-machines': 'washing machine washer dryer 2024',
  dishwashers: 'dishwasher appliance 2024',
  'vacuum-cleaners': 'robot vacuum cleaner cordless 2024',
  drones: 'drone quadcopter camera DJI 2024',
  projectors: 'projector home theater laser 2024',
  'power-banks': 'power bank portable charger 2024',
  storage: 'SSD hard drive NVMe storage 2024',
  'graphics-cards': 'graphics card GPU RTX 2024',
  'running-shoes': 'running shoes marathon athletic 2024',
  sneakers: 'sneakers shoes Nike Adidas 2024',
  shoes: 'shoes footwear 2024',
  jackets: 'jacket outerwear coat 2024',
  backpacks: 'backpack travel bag 2024',
};

// ── In-memory Cache ──────────────────────────────────────────────────────────

const cache = new Map<string, { data: BrandYearGroup[]; ts: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

// ── Internal Types ───────────────────────────────────────────────────────────

interface RawProduct {
  name: string;
  wikiTitle?: string;
  year?: number;
  image?: string;
  description?: string;
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Fetch products for a category using Wikipedia Search + Summary APIs.
 * Returns products grouped by year, newest first.
 */
export async function fetchCategoryProducts(
  categorySlug: string,
): Promise<BrandYearGroup[]> {
  // Check cache
  const cached = cache.get(categorySlug);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return cached.data;
  }

  const searchQuery = CATEGORY_SEARCH_QUERIES[categorySlug];
  if (!searchQuery) return [];

  let products = await searchWikipedia(searchQuery);

  // Filter
  products = products.filter((p) => {
    if (!p.name || p.name.length < 3) return false;
    const nameLower = p.name.toLowerCase();
    if (NOISE_WORDS.some((w) => nameLower.includes(w))) return false;
    if (PERSON_INDICATORS.some((rx) => rx.test(p.name))) return false;
    if (NOISE_TITLE_PATTERNS.some((rx) => rx.test(p.name))) return false;
    // Year filter on name
    const nameYears = p.name.match(/\b(1[89]\d{2}|20[0-2]\d)\b/g);
    if (nameYears) {
      const newest = Math.max(...nameYears.map(Number));
      if (newest < MIN_YEAR) return false;
    }
    return true;
  });

  // Limit to 30, enrich top with Wikipedia summaries
  products = products.slice(0, 30);
  await enrichWithWikipedia(products);

  // Post-enrichment filter
  products = products.filter((p) => {
    if (!p.description) return true;
    if (NON_PRODUCT_DESCRIPTION_PATTERNS.some((rx) => rx.test(p.description!))) return false;
    if (!p.year) {
      const descYear = extractYearFromText(p.description);
      if (descYear) {
        if (descYear < MIN_YEAR) return false;
        p.year = descYear;
      }
    }
    return true;
  });

  const result = groupByYear(products);
  cache.set(categorySlug, { data: result, ts: Date.now() });
  return result;
}

// ── Wikipedia Search ─────────────────────────────────────────────────────────

async function searchWikipedia(query: string): Promise<RawProduct[]> {
  try {
    const url =
      `https://en.wikipedia.org/w/api.php?action=query&list=search` +
      `&srsearch=${encodeURIComponent(query)}&srnamespace=0&format=json&srlimit=40`;

    const res = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(CALL_TIMEOUT),
    });

    if (!res.ok) return [];

    const data = await res.json();
    const results = data?.query?.search ?? [];
    const products: RawProduct[] = [];

    for (const r of results) {
      const title: string = r.title;
      // Extract year from snippet if present
      const yearMatch = r.snippet?.match(/(?:20[1-2]\d)/);
      const year = yearMatch ? parseInt(yearMatch[0], 10) : undefined;

      products.push({
        name: title,
        wikiTitle: title,
        year: year && year >= MIN_YEAR ? year : undefined,
      });
    }

    return products;
  } catch {
    return [];
  }
}

// ── Wikipedia Summary Enrichment ─────────────────────────────────────────────

async function enrichWithWikipedia(products: RawProduct[]): Promise<void> {
  const toEnrich = products
    .filter((p) => p.wikiTitle && !p.image)
    .slice(0, MAX_ENRICHMENT_CALLS);

  const promises = toEnrich.map(async (product) => {
    try {
      const title = encodeURIComponent(
        (product.wikiTitle ?? product.name).replace(/\s/g, '_'),
      );
      const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${title}`;
      const res = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT },
        signal: AbortSignal.timeout(CALL_TIMEOUT),
      });

      if (!res.ok) return;

      const data = await res.json();

      if (data.thumbnail?.source) {
        product.image = data.thumbnail.source;
      }

      if (data.description) {
        product.description = data.description;
      }

      if (!product.year) {
        const descYear = extractYearFromText(data.description);
        if (descYear) {
          product.year = descYear;
        } else {
          const extractYear = extractYearFromText(data.extract);
          if (extractYear) {
            product.year = extractYear;
          }
        }
      }
    } catch {
      // Enrichment failure is non-critical
    }
  });

  await Promise.allSettled(promises);
}

// ── Group by Year ────────────────────────────────────────────────────────────

function groupByYear(products: RawProduct[]): BrandYearGroup[] {
  const byYear = new Map<number, BrandProduct[]>();

  for (const raw of products) {
    const year = raw.year && raw.year >= MIN_YEAR ? raw.year : undefined;
    const bucket = year ?? 0;

    const existing = byYear.get(bucket) ?? [];
    existing.push({
      id: raw.wikiTitle?.replace(/\s/g, '_') ?? raw.name.replace(/\s/g, '_').toLowerCase(),
      name: raw.name,
      image: raw.image ?? '',
      year: bucket,
      price: 'Unknown',
      rating: 0,
      description: raw.description ?? '',
      source: '',
      specs: raw.description ? [raw.description] : [],
    });
    byYear.set(bucket, existing);
  }

  // If we have many dated products (>= 5), drop the undated bucket
  const totalDated = Array.from(byYear.entries())
    .filter(([y]) => y !== 0)
    .reduce((sum, [, items]) => sum + items.length, 0);
  const undatedCount = byYear.get(0)?.length ?? 0;
  if (totalDated >= 5 && undatedCount < totalDated) {
    byYear.delete(0);
  }

  return Array.from(byYear.entries())
    .sort(([a], [b]) => {
      if (a === 0) return 1;
      if (b === 0) return -1;
      return b - a;
    })
    .filter(([year]) => year === 0 || year >= MIN_YEAR)
    .map(([year, items]) => ({
      year: year === 0 ? CURRENT_YEAR : year,
      items,
    }));
}
