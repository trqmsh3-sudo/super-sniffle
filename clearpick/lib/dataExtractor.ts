// =============================================================================
// ClearPick.ai — AI Data Extractor (Groq llama-3.3-70b-versatile)
// Primary: Groq → product data from model knowledge
// =============================================================================

import Groq from 'groq-sdk';

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

const MODEL_NAME = 'llama-3.3-70b-versatile';
const CURRENT_YEAR = new Date().getFullYear();

// ── Helper: get Groq client ───────────────────────────────────────────────────

function getGroq(): Groq | null {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === 'your_groq_key_here') {
    console.warn('[DataExtractor] No Groq API key configured.');
    return null;
  }
  return new Groq({ apiKey });
}

// ── Primary: Search and Extract Products ─────────────────────────────────────

export async function searchAndExtractProducts(
  brandName: string,
): Promise<{ products: ExtractedProduct[]; sources: string[] }> {
  const groq = getGroq();
  if (!groq) return { products: [], sources: [] };

  try {
    const prompt = `List 15-25 real ${brandName} products released or currently sold (2020-${CURRENT_YEAR}).
Include popular and flagship products across all categories (electronics, audio, cameras, gaming, etc.).
Use your knowledge of review sites like TechRadar, PCMag, Tom's Guide, The Verge, CNET, rtings, etc.

Return a JSON array only. Each product MUST have ALL these fields:
- name: exact official product name (e.g. "Sony WH-1000XM5")
- year: release year (integer, 2020-${CURRENT_YEAR})
- price: retail price in USD as string (e.g. "$349") or "Unknown"
- description: one sentence describing the product (max 150 chars)
- rating: critic score 0-10 based on review consensus (0 if unknown)
- source: URL of the primary review source (or empty string)

No markdown fences, no explanation — ONLY the JSON array.`;

    console.log(`[DataExtractor] Searching for ${brandName} products via Groq...`);
    const completion = await groq.chat.completions.create({
      model: MODEL_NAME,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
    });

    const text = completion.choices[0]?.message?.content?.trim() ?? '';
    const jsonStr = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
    const parsed = JSON.parse(jsonStr);

    if (!Array.isArray(parsed)) {
      console.warn('[DataExtractor] Groq returned non-array:', typeof parsed);
      return { products: [], sources: [] };
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

    console.log(`[DataExtractor] Extracted ${products.length} products via Groq`);
    return { products, sources: [] };
  } catch (err) {
    console.error('[DataExtractor] Groq search error:', err);
    return { products: [], sources: [] };
  }
}

// ── Legacy: Extract from Scraped Text ────────────────────────────────────────

export async function extractProducts(
  brandName: string,
  pageTexts: { url: string; text: string }[],
): Promise<ExtractedProduct[]> {
  const groq = getGroq();
  if (!groq) return [];
  if (pageTexts.length === 0) return [];

  try {
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

    const completion = await groq.chat.completions.create({
      model: MODEL_NAME,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
    });

    const text = completion.choices[0]?.message?.content?.trim() ?? '';
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
    console.error('[DataExtractor] Groq extraction error:', err);
    return [];
  }
}

// ── Fallback: Generate from Knowledge ────────────────────────────────────────

export async function generateProductsFromKnowledge(
  brandName: string,
): Promise<ExtractedProduct[]> {
  const groq = getGroq();
  if (!groq) return [];

  try {
    const prompt = `List 15-20 real ${brandName} products that were released or are currently sold (2020-${CURRENT_YEAR}).
Include their most popular and flagship products across all categories.
Return JSON array only. Each product must have:
- name: exact official product name (e.g. "Sony WH-1000XM5", not just "headphones")
- year: release year (2020-${CURRENT_YEAR})
- price: approximate retail price in USD (e.g. "$349") or "Unknown"
- description: one sentence about the product
- rating: score 0-10 based on general critical reception, 0 if unknown
No markdown, no explanation, just a JSON array.`;

    const completion = await groq.chat.completions.create({
      model: MODEL_NAME,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
    });

    const text = completion.choices[0]?.message?.content?.trim() ?? '';
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
    console.error('[DataExtractor] Groq knowledge generation error:', err);
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
