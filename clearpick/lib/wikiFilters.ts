// =============================================================================
// ClearPick.ai — Shared Wiki Quality Filters
// Reusable noise filters and year extraction used by both
// wikiProductData.ts and wikiCategoryData.ts
// =============================================================================

const CURRENT_YEAR = new Date().getFullYear();

// ── Noise Filters ────────────────────────────────────────────────────────────

/** Words in a title that signal "not a consumer product" */
export const NOISE_WORDS = [
  'list of', '(company)', '(brand)', '(organization)', '(manufacturer)',
  'history of', 'timeline of', 'works', 'group', 'corporation',
  'platform', 'modeling', 'factory', 'plant', 'community',
  'foundation', 'museum', 'racing', 'motorsport', 'formula',
  'auto ', ' auto', 'transportation', 'mobility',
  'industries', 'holdings', '(subsidiary)', 'category:',
  'comparison of', 'acquisition', 'lawsuit', 'controversy',
  'former ', ' fc', 'stadium',
  'transition to', ' pay', 'ecosystem',
  'architecture',
];

/** Title patterns that indicate "not a consumer product" */
export const NOISE_TITLE_PATTERNS = [
  /^apple silicon$/i,
  /^apple intelligence$/i,
  /^apple inc\.?$/i,
  /\belectric vehicle\b/i,
  /\bkeyboards?\b$/i,
  /\bmessages?\s*\(/i,
  /\bnewton\b/i,
  /\btranstech\b/i,
  /\bpower\b/i,
  /\blocomotive\b/i,
  /\btrolleybus\b/i,
  /\btram\b/i,
  /\b(books|maps|news)\b/i,
  /\bpopular\b/i,
  // OS names — software, not products
  /\b(iOS|macOS|watchOS|tvOS|iPadOS|Android|Windows)\b/i,
  // Services / subscription apps
  /\b(Plus|service|subscription|streaming)\b/i,
  // Wikipedia disambiguation pages
  /\(disambiguation\)/i,
  // Software versions / updates
  /\b(version|update|patch|release)\s+\d/i,
  // Wikipedia list articles
  /^List of/i,
];

/** Regex for chip/SoC identifiers — not consumer products */
export const CHIP_PATTERN = /\b[AM]\d{1,2}\b(?:\s+(pro|max|ultra|chip|bionic))?$/i;

/** Person name indicators */
export const PERSON_INDICATORS = [
  /\bvon\b/i, /\bjr\.?\b/i, /\bsr\.?\b/i, /\biii?\b$/i,
];

/** Description patterns that mean "this item is not a product" */
export const NON_PRODUCT_DESCRIPTION_PATTERNS = [
  /\bcompany\b/i,
  /\borganization\b/i,
  /\bcorporation\b/i,
  /\bsubsidiary\b/i,
  /\bdivision\s+of\b/i,
  /\bborn\s/i,
  /\bpolitician\b/i,
  /\bbusinessman\b/i,
  /\bfounder\b/i,
  /\bentrepreneur\b/i,
  /\bkeyboard\s?layout\b/i,
  /\bfootball\b/i,
  /\bhockey\b/i,
  /\bbasketball\b/i,
  /\bsoccer\b/i,
  /\btelevision series\b/i,
  /\bfilm\b/i,
  /\bsong\b/i,
  /\balbum\b/i,
  // Software / OS / services
  /\boperating system\b/i,
  /\bsoftware (application|service|platform)\b/i,
  /\bmusic streaming\b/i,
  /\bcloud storage service\b/i,
  /\bsubscription service\b/i,
];

// ── Year Extraction ──────────────────────────────────────────────────────────

const MONTHS = '(?:January|February|March|April|May|June|July|August|September|October|November|December)';
const YEAR_PAT = '(20[0-2]\\d)';

/** Patterns to extract year from free text, ordered from most specific to least */
const YEAR_EXTRACTION_PATTERNS: RegExp[] = [
  // "released in October 2023", "announced in March 2024"
  new RegExp(`(?:released|announced|introduced|launched|unveiled|presented)\\s+(?:on\\s+|in\\s+)?(?:${MONTHS}\\s+(?:\\d{1,2},?\\s+)?)?${YEAR_PAT}`, 'i'),
  // "at CES 2024", "at MWC 2023", "at WWDC 2024"
  new RegExp(`\\bat\\s+(?:CES|MWC|WWDC|IFA|E3|Computex)\\s+${YEAR_PAT}`, 'i'),
  // "in October 2023", "in 2024"
  new RegExp(`\\bin\\s+(?:${MONTHS}\\s+)?${YEAR_PAT}`, 'i'),
  // "first sold in 2022"
  new RegExp(`\\bfirst\\s+(?:sold|available|shipped)\\s+(?:in\\s+)?${YEAR_PAT}`, 'i'),
  // Bare 4-digit year anywhere
  new RegExp(YEAR_PAT),
];

/**
 * Extract the most recent valid year from a text string.
 * Returns the most recent year found between 2000 and currentYear+1, or undefined.
 */
export function extractYearFromText(text: string | undefined | null): number | undefined {
  if (!text) return undefined;

  const allYears: number[] = [];

  // Try each pattern
  for (const rx of YEAR_EXTRACTION_PATTERNS) {
    const globalRx = new RegExp(rx.source, rx.flags.includes('g') ? rx.flags : rx.flags + 'g');
    let match: RegExpExecArray | null;
    while ((match = globalRx.exec(text)) !== null) {
      // The year is always in the last capture group
      const yr = parseInt(match[1], 10);
      if (yr >= 2000 && yr <= CURRENT_YEAR + 1) {
        allYears.push(yr);
      }
    }
  }

  if (allYears.length === 0) return undefined;
  // Return the most recent year found
  return Math.max(...allYears);
}

// ── Deduplication ────────────────────────────────────────────────────────────

/**
 * Normalize a product title for deduplication:
 * lowercase, strip punctuation, remove common brand prefixes.
 */
export function normalizeTitle(title: string, brandName?: string): string {
  let s = title.toLowerCase().replace(/[^\w\s]/g, '').trim();
  if (brandName) {
    const bn = brandName.toLowerCase();
    if (s.startsWith(bn)) {
      s = s.slice(bn.length).trim();
    }
  }
  return s;
}

/**
 * Minimal Levenshtein distance for short strings.
 */
export function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (Math.abs(m - n) > 2) return 3; // fast exit for dedup threshold
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

/** Strip diacritics for fuzzy matching (e.g., Škoda → Skoda) */
export function stripDiacritics(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}
