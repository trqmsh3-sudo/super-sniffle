// =============================================================================
// ClearPick.ai — Wikipedia/Wikidata Product Data Layer
// Fetches real product lists for brand pages using free public APIs:
//   1. Wikidata SPARQL — manufacturer (P176) → product list
//   2. Wikipedia Search API — fallback for brands with no Wikidata products
//   3. Wikipedia Summary API — image + description enrichment
//
// No API key required. Max 5 HTTP calls per brand. In-memory cache.
// =============================================================================

import { getWikidataBrand } from './wikidataIds';
import type { BrandProduct, BrandYearGroup } from './brandData';
import {
  NOISE_WORDS,
  NOISE_TITLE_PATTERNS,
  CHIP_PATTERN,
  PERSON_INDICATORS,
  NON_PRODUCT_DESCRIPTION_PATTERNS,
  extractYearFromText,
  normalizeTitle,
  levenshtein,
  stripDiacritics,
} from './wikiFilters';

// ── Constants ────────────────────────────────────────────────────────────────

const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = CURRENT_YEAR - 15;
const CALL_TIMEOUT = 8000; // 8s per request (Wikidata SPARQL can be slow)
const USER_AGENT = 'ClearPick/1.0 (https://clearpick.ai; product-research)';
const MAX_ENRICHMENT_CALLS = 8; // max Wikipedia summary calls per brand

// ── In-memory Cache ──────────────────────────────────────────────────────────

const cache = new Map<string, { data: BrandYearGroup[]; ts: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Fetch products for a brand using Wikidata + Wikipedia.
 * Returns products grouped by year, newest first (last 15 years).
 *
 * @param brandSlug  The brand slug (e.g., "apple", "skoda")
 * @param brandName  Human-readable brand name for search fallback
 */
export async function fetchWikiProducts(
  brandSlug: string,
  brandName: string,
): Promise<BrandYearGroup[]> {
  // Check cache
  const cached = cache.get(brandSlug);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return cached.data;
  }

  const wikiEntry = getWikidataBrand(brandSlug);
  if (!wikiEntry) return [];

  let rawProducts: RawWikiProduct[] = [];

  // Strategy 1: Wikidata SPARQL (if QID available)
  if (wikiEntry.qid) {
    rawProducts = await fetchFromWikidata(wikiEntry.qid);
  }

  // Strategy 2: Wikipedia Search augmentation (always run if we have < 10 products)
  if (rawProducts.length < 10) {
    const searchProducts = await fetchFromWikipediaSearch(
      wikiEntry.wikiSearchPrefix,
      brandName,
      wikiEntry.productPrefixes,
    );
    // Merge, deduplicate by name
    const existingNames = new Set(rawProducts.map((p) => p.name.toLowerCase()));
    for (const sp of searchProducts) {
      if (!existingNames.has(sp.name.toLowerCase())) {
        rawProducts.push(sp);
        existingNames.add(sp.name.toLowerCase());
      }
    }
  }

  // Deduplicate: normalize titles and merge near-duplicates (edit distance <= 2)
  rawProducts = deduplicateProducts(rawProducts, brandName);

  // Filter: skip items whose labels are just QIDs, too short, chips, or non-products
  rawProducts = rawProducts.filter((p) => {
    if (!p.name || (p.name.startsWith('Q') && /^Q\d+$/.test(p.name))) return false;
    if (p.name.length < 3) return false;
    const nameLower = p.name.toLowerCase();
    // Noise word filter (company names, non-product articles)
    if (NOISE_WORDS.some((w) => nameLower.includes(w))) return false;
    // Person name filter
    if (PERSON_INDICATORS.some((rx) => rx.test(p.name))) return false;
    // Chip/SoC filter — e.g., "Apple M2", "Apple A16 Bionic"
    if (CHIP_PATTERN.test(p.name)) return false;
    // Exact title pattern filter
    if (NOISE_TITLE_PATTERNS.some((rx) => rx.test(p.name))) return false;
    // Name-based year filter: skip products with old years in their name
    // e.g., "Škoda Superb (1934–1949)" → 1934 is old
    const nameYears = p.name.match(/\b(1[89]\d{2}|20[0-2]\d)\b/g);
    if (nameYears) {
      const newest = Math.max(...nameYears.map(Number));
      if (newest < MIN_YEAR) return false;
    }
    return true;
  });

  // Sort by year descending, limit to 30
  rawProducts.sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
  rawProducts = rawProducts.slice(0, 30);

  // Enrich top products with Wikipedia summary (image + description)
  await enrichWithWikipedia(rawProducts);

  // Post-enrichment filter: remove items whose Wikipedia description says "company"/"person"/etc.
  // or whose description reveals an old product year
  rawProducts = rawProducts.filter((p) => {
    if (!p.description) return true; // no description → keep (can't tell)
    // Check non-product description patterns
    if (NON_PRODUCT_DESCRIPTION_PATTERNS.some((rx) => rx.test(p.description!))) return false;
    // If description reveals an old year and product has no assigned year, mark old & exclude
    if (!p.year) {
      const descYear = extractYearFromText(p.description);
      if (descYear) {
        if (descYear < MIN_YEAR) return false;
        p.year = descYear;
      }
    }
    return true;
  });

  // Group by year
  const result = groupByYear(rawProducts);

  // Cache
  cache.set(brandSlug, { data: result, ts: Date.now() });
  return result;
}

// ── Internal Types ───────────────────────────────────────────────────────────

interface RawWikiProduct {
  name: string;
  wikiTitle?: string;   // Wikipedia article title (for summary enrichment)
  year?: number;
  image?: string;
  description?: string; // short extract for specs
}

// ── Wikidata SPARQL ──────────────────────────────────────────────────────────

async function fetchFromWikidata(qid: string): Promise<RawWikiProduct[]> {
  // Query: products manufactured by entity, with optional inception date
  // and Wikipedia article link for enrichment.
  // Uses P571 (inception) for release year — the most common date property.
  const sparql = `
SELECT ?product ?productLabel ?year ?article WHERE {
  ?product wdt:P176 wd:${qid} .
  OPTIONAL { ?product wdt:P571 ?inception . BIND(YEAR(?inception) AS ?year) }
  OPTIONAL { ?article schema:about ?product ; schema:isPartOf <https://en.wikipedia.org/> }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en" }
  FILTER(!REGEX(STR(?productLabel), "^Q[0-9]+$"))
  FILTER(!BOUND(?year) || ?year >= ${MIN_YEAR})
}
ORDER BY DESC(?year)
LIMIT 50`.trim();

  try {
    const url = `https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(sparql)}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'application/sparql-results+json' },
      signal: AbortSignal.timeout(CALL_TIMEOUT),
    });

    if (!res.ok) return [];

    const data = await res.json();
    const bindings = data?.results?.bindings ?? [];
    const seen = new Set<string>();
    const products: RawWikiProduct[] = [];

    for (const b of bindings) {
      const label = b.productLabel?.value;
      if (!label) continue;
      // Deduplicate
      const key = label.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);

      const year = b.year?.value ? parseInt(b.year.value, 10) : undefined;
      const articleUrl = b.article?.value;  // e.g., https://en.wikipedia.org/wiki/IPhone_15
      const wikiTitle = articleUrl
        ? decodeURIComponent(articleUrl.split('/wiki/').pop() ?? '').replace(/_/g, ' ')
        : undefined;

      products.push({ name: label, wikiTitle, year: year && year >= 1900 ? year : undefined });
    }

    return products;
  } catch {
    return [];
  }
}

// ── Wikipedia Search Fallback ────────────────────────────────────────────────

async function fetchFromWikipediaSearch(
  searchPrefix: string,
  brandName: string,
  productPrefixes?: string[],
): Promise<RawWikiProduct[]> {
  try {
    const query = searchPrefix;
    const url =
      `https://en.wikipedia.org/w/api.php?action=query&list=search` +
      `&srsearch=${encodeURIComponent(query)}&srnamespace=0&format=json&srlimit=30`;

    const res = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(CALL_TIMEOUT),
    });

    if (!res.ok) return [];

    const data = await res.json();
    const results = data?.query?.search ?? [];

    const brandLower = brandName.toLowerCase();
    const prefixLower = searchPrefix.toLowerCase();
    const extraPrefixes = (productPrefixes ?? []).map((p) => p.toLowerCase());
    // Strip diacritics for fuzzy matching (Škoda ↔ Skoda)
    const brandStripped = stripDiacritics(brandLower);
    const products: RawWikiProduct[] = [];

    for (const r of results) {
      const title: string = r.title;
      const titleLower = title.toLowerCase();
      const titleStripped = stripDiacritics(titleLower);

      // Must contain the brand name, search prefix, OR a known product prefix
      const containsBrand =
        titleStripped.includes(brandStripped) ||
        titleLower.includes(prefixLower) ||
        extraPrefixes.some((px) => titleLower.includes(px));
      if (!containsBrand) continue;

      // Exact match to brand name = generic page, skip
      if (titleStripped === brandStripped || titleLower === prefixLower) continue;

      // Skip noise (uses module-level NOISE_WORDS)
      if (NOISE_WORDS.some((w) => titleLower.includes(w))) continue;

      // Name-based year filter: skip products with old years in their name
      const titleYears = title.match(/\b(1[89]\d{2}|20[0-2]\d)\b/g);
      if (titleYears) {
        const newest = Math.max(...titleYears.map(Number));
        if (newest < MIN_YEAR) continue;
      }

      // Person name filter
      if (PERSON_INDICATORS.some((rx) => rx.test(title))) continue;

      // Extract year from snippet HTML if present (e.g., "released in 2022")
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

async function enrichWithWikipedia(products: RawWikiProduct[]): Promise<void> {
  // Only enrich products that have a Wikipedia title, limit calls
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

      // Image
      if (data.thumbnail?.source) {
        product.image = data.thumbnail.source;
      }

      // Short description → specs
      if (data.description) {
        product.description = data.description;
      }

      // Extract year from description or extract if missing
      if (!product.year) {
        // Try description first (e.g., "2023 smartphone by Apple")
        const descYear = extractYearFromText(data.description);
        if (descYear) {
          product.year = descYear;
        } else {
          // Try Wikipedia extract (first paragraph)
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

// ── Deduplication ─────────────────────────────────────────────────────────────

function deduplicateProducts(products: RawWikiProduct[], brandName: string): RawWikiProduct[] {
  // Remove exact duplicate IDs
  const seenIds = new Set<string>();
  const unique: RawWikiProduct[] = [];
  for (const p of products) {
    const id = (p.wikiTitle ?? p.name).toLowerCase();
    if (seenIds.has(id)) continue;
    seenIds.add(id);
    unique.push(p);
  }

  // Fuzzy dedup: if normalized titles have edit distance <= 2, keep the better one
  const result: RawWikiProduct[] = [];
  const removed = new Set<number>();

  for (let i = 0; i < unique.length; i++) {
    if (removed.has(i)) continue;
    const normI = normalizeTitle(unique[i].name, brandName);

    for (let j = i + 1; j < unique.length; j++) {
      if (removed.has(j)) continue;
      const normJ = normalizeTitle(unique[j].name, brandName);
      if (levenshtein(normI, normJ) <= 2) {
        // Keep the one with a year, or the first
        if (unique[j].year && !unique[i].year) {
          removed.add(i);
          break;
        } else {
          removed.add(j);
        }
      }
    }
    if (!removed.has(i)) {
      result.push(unique[i]);
    }
  }

  return result;
}

// ── Group by Year ────────────────────────────────────────────────────────────

function groupByYear(products: RawWikiProduct[]): BrandYearGroup[] {
  const byYear = new Map<number, BrandProduct[]>();

  for (const raw of products) {
    const year = raw.year && raw.year >= MIN_YEAR ? raw.year : undefined;
    // Products without a year go into "0" bucket (displayed as current year)
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

  // If we have many dated products (>= 8), drop the undated bucket
  const totalDated = Array.from(byYear.entries())
    .filter(([y]) => y !== 0)
    .reduce((sum, [, items]) => sum + items.length, 0);
  const undatedCount = byYear.get(0)?.length ?? 0;
  if (totalDated >= 8 && undatedCount < totalDated) {
    byYear.delete(0);
  }

  // Sort years descending; year=0 (unknown) goes last
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
