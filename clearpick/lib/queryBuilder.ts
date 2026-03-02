// =============================================================================
// ClearPick.ai — AI Query Builder (Gemini Flash)
// Generates smart search queries for a given brand name
// =============================================================================

import { GoogleGenerativeAI } from '@google/generative-ai';

// ── Types ────────────────────────────────────────────────────────────────────

export interface QueryBuilderResult {
  queries: string[];
  displayName: string;
  category: string;
  color: string;
}

// ── Constants ────────────────────────────────────────────────────────────────

// gemini-2.0-flash: 1500 RPD free tier (vs 20 for 2.5-flash)
const MODEL_NAME = 'gemini-2.0-flash';

// ── Main Function ────────────────────────────────────────────────────────────

/**
 * Use Gemini Flash to build smart search queries for a brand.
 * Falls back to simple manual queries if Gemini is unavailable.
 */
export async function buildQueries(brandName: string): Promise<QueryBuilderResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_key_here') {
    console.warn('[QueryBuilder] No Gemini API key — using manual queries.');
    return buildManualQueries(brandName);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const prompt = `Given the brand '${brandName}', return JSON only:
- queries: 3 Google search queries to find their latest products (2022-2024)
- displayName: proper brand name
- category: main product category
- color: brand's primary hex color
No markdown, just JSON.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Strip markdown fences if Gemini wraps them
    const jsonStr = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
    const parsed = JSON.parse(jsonStr);

    return {
      queries: Array.isArray(parsed.queries) ? parsed.queries.slice(0, 3) : buildManualQueries(brandName).queries,
      displayName: typeof parsed.displayName === 'string' ? parsed.displayName : brandName,
      category: typeof parsed.category === 'string' ? parsed.category : 'general',
      color: typeof parsed.color === 'string' && parsed.color.startsWith('#') ? parsed.color : '#333333',
    };
  } catch (err) {
    console.error('[QueryBuilder] Gemini error, falling back to manual:', err);
    return buildManualQueries(brandName);
  }
}

// ── Manual Fallback ──────────────────────────────────────────────────────────

function buildManualQueries(brandName: string): QueryBuilderResult {
  return {
    queries: [
      `${brandName} latest products 2024 review`,
      `${brandName} new releases 2023 2024 best`,
      `${brandName} product lineup flagship 2024`,
    ],
    displayName: brandName.charAt(0).toUpperCase() + brandName.slice(1),
    category: 'general',
    color: '#333333',
  };
}
