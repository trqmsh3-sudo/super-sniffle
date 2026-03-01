// =============================================================================
// ClearPick.ai — Search Intent Detection Engine
// Pure TypeScript utility — zero framework dependencies
// Target: < 5 ms per call
// =============================================================================

import { findBrand, type BrandEntry } from './brandRegistry';

// ── Public Types ─────────────────────────────────────────────────────────────

export type IntentType = 'garbage' | 'brand' | 'product' | 'category' | 'ambiguous';

export interface SearchIntent {
  type: IntentType;
  normalizedQuery: string;
  confidence: number; // 0 – 1
  suggestedRoute: '/brand/[slug]' | '/search' | '/category/[slug]' | null;
  /** Populated when type === 'brand' */
  matchedBrand?: BrandEntry;
  /** The resolved slug for brand / category routes */
  slug?: string;
}

// ── Category Keywords ────────────────────────────────────────────────────────

const CATEGORY_KEYWORDS: Record<string, string> = {
  laptops: 'laptops',
  laptop: 'laptops',
  notebooks: 'laptops',
  headphones: 'headphones',
  earbuds: 'headphones',
  earphones: 'headphones',
  phones: 'phones',
  smartphones: 'phones',
  cellphones: 'phones',
  'mobile phones': 'phones',
  tablets: 'tablets',
  tablet: 'tablets',
  monitors: 'monitors',
  monitor: 'monitors',
  keyboards: 'keyboards',
  keyboard: 'keyboards',
  mice: 'mice',
  mouse: 'mice',
  cameras: 'cameras',
  camera: 'cameras',
  televisions: 'televisions',
  tvs: 'televisions',
  tv: 'televisions',
  speakers: 'speakers',
  speaker: 'speakers',
  watches: 'watches',
  smartwatch: 'watches',
  smartwatches: 'watches',
  printers: 'printers',
  printer: 'printers',
  routers: 'routers',
  router: 'routers',
  'running shoes': 'running-shoes',
  sneakers: 'sneakers',
  shoes: 'shoes',
  jackets: 'jackets',
  jacket: 'jackets',
  backpacks: 'backpacks',
  backpack: 'backpacks',
  refrigerators: 'refrigerators',
  fridge: 'refrigerators',
  fridges: 'refrigerators',
  'washing machines': 'washing-machines',
  'vacuum cleaners': 'vacuum-cleaners',
  vacuums: 'vacuum-cleaners',
  drones: 'drones',
  drone: 'drones',
  consoles: 'gaming-consoles',
  'gaming consoles': 'gaming-consoles',
  projectors: 'projectors',
  projector: 'projectors',
  chargers: 'chargers',
  charger: 'chargers',
  'power banks': 'power-banks',
  'power bank': 'power-banks',
  ssd: 'storage',
  'hard drives': 'storage',
  'hard drive': 'storage',
  gpu: 'graphics-cards',
  'graphics cards': 'graphics-cards',
  'graphics card': 'graphics-cards',
};

// ── Patterns ─────────────────────────────────────────────────────────────────

/** Matches model numbers / version suffixes: "15", "S24", "Pro Max", "2024", "X1 Carbon", "Series X" */
const MODEL_PATTERN =
  /\b(?:\d{1,4}(?:\.\d)?|[A-Z]\d{1,4}|pro\s?max|ultra|plus|pro|max|mini|lite|air|se|gen\s?\d|mark\s?\d|mk\s?\d|edition|series\s?[a-z0-9])\b/i;

/** Clusters of 3+ consonants with no vowels — strong gibberish signal */
const CONSONANT_CLUSTER = /[^aeiou\s\d]{4,}/i;

/** At least one latin vowel or digit somewhere */
const HAS_VOWEL_OR_DIGIT = /[aeiouy\d]/i;

// ── Main Function ────────────────────────────────────────────────────────────

/**
 * Classifies a search query into an intent type before any API call is made.
 *
 * Performance target: < 5 ms for any input.
 */
export function detectSearchIntent(query: string): SearchIntent {
  const raw = query.trim();
  const normalized = raw.replace(/\s+/g, ' ').toLowerCase();

  // ── 1. Garbage Detection ────────────────────────────────────────────────

  // Too short
  if (normalized.length < 2) {
    return garbage(normalized);
  }

  // Only non-latin characters (except common brand chars like & -)
  const latinChars = normalized.replace(/[^a-zA-Z0-9]/g, '');
  if (latinChars.length === 0) {
    return garbage(normalized);
  }

  // Repeated characters: "aaaaaaa", "xxxxxxxxxxx"
  if (/^(.)\1{3,}$/.test(latinChars)) {
    return garbage(normalized, 0.95);
  }

  // Early brand check — brands like "BMW", "LG", "HP" have no vowels
  const earlyBrand = findBrand(normalized);
  if (earlyBrand) {
    // Skip garbage checks — this is a known brand, handled below
  } else {
    // No vowels and no digits → likely mashed keyboard
    if (!HAS_VOWEL_OR_DIGIT.test(latinChars)) {
      return garbage(normalized, 0.9);
    }

    // Heavy consonant clusters → gibberish (e.g. "qwrtpsdfg")
    // Check per-word to avoid false positives on multi-word queries like "running shoes"
    const words = normalized.split(/\s+/);
    const hasGibberishWord = words.some((word) => {
      const clean = word.replace(/[^a-zA-Z]/g, '');
      return clean.length > 3 && CONSONANT_CLUSTER.test(clean);
    });
    if (hasGibberishWord) {
      return garbage(normalized, 0.85);
    }

    // Very high ratio of consonants to vowels → sus
    const vowelCount = (latinChars.match(/[aeiouy]/gi) || []).length;
    const consonantCount = latinChars.length - vowelCount;
    if (latinChars.length >= 5 && vowelCount > 0 && consonantCount / vowelCount > 5) {
      return garbage(normalized, 0.75);
    }
  }

  // ── 2. Brand Detection ──────────────────────────────────────────────────

  const brand = earlyBrand ?? findBrand(normalized);

  // If the ENTIRE query is a brand name (no extra model info), it's a brand search
  if (brand) {
    const nameTokens = brand.name.toLowerCase().split(/\s+/);
    const queryTokens = normalized.split(/\s+/);

    // Pure brand query: query matches brand name exactly or is a known alias
    const isPureBrand =
      queryTokens.length <= nameTokens.length + 1 && !MODEL_PATTERN.test(normalized);

    if (isPureBrand) {
      return {
        type: 'brand',
        normalizedQuery: brand.name,
        confidence: 0.95,
        suggestedRoute: '/brand/[slug]',
        matchedBrand: brand,
        slug: brand.slug,
      };
    }

    // Brand + model info → product search
    if (MODEL_PATTERN.test(normalized)) {
      return {
        type: 'product',
        normalizedQuery: normalized,
        confidence: 0.9,
        suggestedRoute: '/search',
        matchedBrand: brand,
        slug: brand.slug,
      };
    }

    // Brand + extra words → ambiguous
    return {
      type: 'ambiguous',
      normalizedQuery: normalized,
      confidence: 0.6,
      suggestedRoute: '/search',
      matchedBrand: brand,
      slug: brand.slug,
    };
  }

  // ── 3. Category Detection ───────────────────────────────────────────────

  const categorySlug = CATEGORY_KEYWORDS[normalized];
  if (categorySlug) {
    return {
      type: 'category',
      normalizedQuery: normalized,
      confidence: 0.95,
      suggestedRoute: '/category/[slug]',
      slug: categorySlug,
    };
  }

  // Partial category match: check if query starts with a category keyword
  for (const [keyword, slug] of Object.entries(CATEGORY_KEYWORDS)) {
    if (normalized.startsWith(keyword) || keyword.startsWith(normalized)) {
      if (normalized.length >= 3) {
        return {
          type: 'category',
          normalizedQuery: keyword,
          confidence: 0.7,
          suggestedRoute: '/category/[slug]',
          slug,
        };
      }
    }
  }

  // ── 4. Product Detection (no brand match, but has model pattern) ────────

  if (MODEL_PATTERN.test(normalized)) {
    return {
      type: 'product',
      normalizedQuery: normalized,
      confidence: 0.7,
      suggestedRoute: '/search',
    };
  }

  // ── 5. Final Validation — is it a real-ish word? ────────────────────────

  // If it got this far, it's not a known brand/category and has no model number.
  // Apply final heuristic: does it look like real words?
  const words = normalized.split(/\s+/);
  const suspiciousWords = words.filter((w) => {
    const clean = w.replace(/[^a-z]/g, '');
    if (clean.length < 2) return false;
    // No vowels in the word
    if (!/[aeiouy]/.test(clean)) return true;
    // More than 3 consonants in a row
    if (/[^aeiouy]{4,}/.test(clean)) return true;
    return false;
  });

  if (suspiciousWords.length > 0 && suspiciousWords.length >= words.length * 0.5) {
    return garbage(normalized, 0.65);
  }

  // ── 6. Fallback: treat as ambiguous product search ──────────────────────

  return {
    type: 'ambiguous',
    normalizedQuery: normalized,
    confidence: 0.4,
    suggestedRoute: '/search',
  };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function garbage(normalizedQuery: string, confidence = 0.95): SearchIntent {
  return {
    type: 'garbage',
    normalizedQuery,
    confidence,
    suggestedRoute: null,
  };
}
