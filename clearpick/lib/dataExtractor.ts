// =============================================================================
// ClearPick.ai — AI Data Extractor (Gemini Flash + Google Search Grounding)
// Primary: Gemini + Google Search → real-time product data from the web
// Fallback: Gemini knowledge-only (no grounding)
// =============================================================================

import { GoogleGenerativeAI } from '@google/generative-ai';

// ── Types ────────────────────────────────────────────────────────────────────

export interface ExtractedProduct {
  name: string;
  year: number;
  price: string;
  image: string;
  description: string;
  rating: number;
  source: string;
}

// ── Constants ────────────────────────────────────────────────────────────────

const MODEL_NAME = 'gemini-2.5-flash';
const CURRENT_YEAR = new Date().getFullYear();

// ── Primary: Gemini + Google Search Grounding ────────────────────────────────

/**
 * Use Gemini with Google Search grounding to find real product data.
 * Gemini automatically searches the web for up-to-date information,
 * grounded in real review sites (techradar, dpreview, pcmag, etc.).
 *
 * This replaces the DDG/Bing → scrape → extract pipeline with a single
 * API call that does search + extraction together.
 */
export async function searchAndExtractProducts(
  brandName: string,
): Promise<{ products: ExtractedProduct[]; sources: string[] }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_key_here') {
    console.warn('[DataExtractor] No Gemini API key — cannot search.');
    return { products: [], sources: [] };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // Enable Google Search grounding — Gemini will search the web
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      tools: [{ googleSearch: {} } as never],
    });

    const prompt = `Search the web for the latest ${brandName} products released or currently sold (2020-${CURRENT_YEAR}).
Find 15-25 REAL products across all categories (electronics, audio, cameras, gaming, etc.).
Use review sites like TechRadar, PCMag, Tom's Guide, The Verge, CNET, dpreview, rtings, etc.

Return a JSON array only. Each product MUST have ALL these fields:
- name: exact official product name (e.g. "Sony WH-1000XM5")
- year: release year (integer, 2020-${CURRENT_YEAR})
- price: retail price in USD as string (e.g. "$349") or "Unknown"
- description: one sentence describing the product (max 150 chars)
- rating: critic score 0-10 based on review consensus (0 if unknown)
- source: URL of the primary review source (or empty string)

Important: Include EVERY price you can find. Include ratings from real review sites.
No markdown fences, no explanation — ONLY the JSON array.`;

    console.log(`[DataExtractor] Searching web for ${brandName} products via Gemini+GoogleSearch...`);
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Extract grounding sources
    const sources: string[] = [];
    const candidates = result.response.candidates;
    if (candidates?.[0]) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const metadata = (candidates[0] as any).groundingMetadata;
      if (metadata?.webSearchQueries) {
        console.log(`[DataExtractor] Gemini searched: ${metadata.webSearchQueries.join(' | ')}`);
      }
      if (metadata?.groundingChunks) {
        for (const chunk of metadata.groundingChunks) {
          if (chunk?.web?.uri) sources.push(chunk.web.uri);
        }
        console.log(`[DataExtractor] Grounded in ${sources.length} web sources`);
      }
    }

    // Parse JSON response
    const jsonStr = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
    const parsed = JSON.parse(jsonStr);

    if (!Array.isArray(parsed)) {
      console.warn('[DataExtractor] Gemini returned non-array:', typeof parsed);
      return { products: [], sources };
    }

    const products = parsed
      .filter((p: Record<string, unknown>) => p && typeof p.name === 'string' && p.name.length > 0)
      .map((p: Record<string, unknown>) => ({
        name: String(p.name),
        year: normalizeYear(p.year),
        price: normalizePrice(p.price),
        image: typeof p.image === 'string' && p.image.startsWith('http')
          ? p.image
          : buildPlaceholderImage(String(p.name)),
        description: typeof p.description === 'string' ? p.description : '',
        rating: normalizeRating(p.rating),
        source: typeof p.source === 'string' && p.source.startsWith('http')
          ? p.source
          : '',
      }));

    console.log(`[DataExtractor] Extracted ${products.length} products with Google Search grounding`);
    return { products, sources };
  } catch (err) {
    console.error('[DataExtractor] Gemini+GoogleSearch error:', err);
    return { products: [], sources: [] };
  }
}

// ── Legacy: Extract from Scraped Text ────────────────────────────────────────

/**
 * Use Gemini Flash to extract structured product data from scraped page texts.
 * Kept as alternative path when Google Search grounding is unavailable.
 */
export async function extractProducts(
  brandName: string,
  pageTexts: { url: string; text: string }[],
): Promise<ExtractedProduct[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_key_here') {
    console.warn('[DataExtractor] No Gemini API key — cannot extract.');
    return [];
  }

  if (pageTexts.length === 0) return [];

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const combinedText = pageTexts
      .map((p, i) => `--- SOURCE ${i + 1}: ${p.url} ---\n${p.text}`)
      .join('\n\n');

    const truncated = combinedText.slice(0, 12000);

    const prompt = `Extract all ${brandName} products mentioned in this text.
Return JSON array only. Each product:
name, year (2010-${CURRENT_YEAR}), price, description (1 sentence), rating (0-10).
No markdown, just JSON array.

Text:
${truncated}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    const jsonStr = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
    const parsed = JSON.parse(jsonStr);

    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((p: Record<string, unknown>) => p && typeof p.name === 'string' && p.name.length > 0)
      .map((p: Record<string, unknown>) => ({
        name: String(p.name),
        year: normalizeYear(p.year),
        price: normalizePrice(p.price),
        image: typeof p.image === 'string' && p.image.startsWith('http')
          ? p.image
          : buildPlaceholderImage(String(p.name)),
        description: typeof p.description === 'string' ? p.description : '',
        rating: normalizeRating(p.rating),
        source: typeof p.source === 'string' ? p.source : pageTexts[0]?.url ?? '',
      }));
  } catch (err) {
    console.error('[DataExtractor] Gemini extraction error:', err);
    return [];
  }
}

// ── Fallback: Gemini Knowledge Only ──────────────────────────────────────────

/**
 * Generate product data directly from Gemini's knowledge (no web search).
 * Used when Google Search grounding fails or is unavailable.
 */
export async function generateProductsFromKnowledge(
  brandName: string,
): Promise<ExtractedProduct[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_key_here') {
    console.warn('[DataExtractor] No Gemini API key — cannot generate.');
    return [];
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const prompt = `List 15-20 real ${brandName} products that were released or are currently sold (2020-${CURRENT_YEAR}).
Include their most popular and flagship products across all categories.
Return JSON array only. Each product must have:
- name: exact official product name (e.g. "Sony WH-1000XM5", not just "headphones")
- year: release year (2020-${CURRENT_YEAR})
- price: approximate retail price in USD (e.g. "$349") or "Unknown"
- description: one sentence about the product
- rating: score 0-10 based on general critical reception, 0 if unknown
No markdown, no explanation, just a JSON array.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    const jsonStr = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
    const parsed = JSON.parse(jsonStr);

    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((p: Record<string, unknown>) => p && typeof p.name === 'string' && p.name.length > 0)
      .map((p: Record<string, unknown>) => ({
        name: String(p.name),
        year: normalizeYear(p.year),
        price: normalizePrice(p.price),
        image: buildPlaceholderImage(String(p.name)),
        description: typeof p.description === 'string' ? p.description : '',
        rating: normalizeRating(p.rating),
        source: 'AI-generated',
      }));
  } catch (err) {
    console.error('[DataExtractor] Gemini knowledge generation error:', err);
    return [];
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function normalizeYear(val: unknown): number {
  const num = Number(val);
  if (Number.isInteger(num) && num >= 2010 && num <= CURRENT_YEAR) return num;
  return CURRENT_YEAR;
}

function normalizeRating(val: unknown): number {
  const num = Number(val);
  if (!Number.isNaN(num) && num >= 0 && num <= 10) return Math.round(num * 10) / 10;
  return 0;
}

function normalizePrice(val: unknown): string {
  if (typeof val === 'string' && val.length > 0 && val !== 'null') return val;
  if (typeof val === 'number' && val > 0) return `$${val.toLocaleString()}`;
  return 'Unknown';
}

/** Build a dark placeholder image URL for a product name */
function buildPlaceholderImage(name: string): string {
  const text = encodeURIComponent(name.substring(0, 30));
  return `https://via.placeholder.com/400x300/111111/ffffff?text=${text}`;
}
