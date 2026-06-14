// =============================================================================
// ClearPick.ai — AI Analysis API Route
// POST /api/analyze
// Request body: { query: string }
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { searchReddit } from '@/lib/redditSearch';
import Groq from 'groq-sdk';

const MODEL_NAME = 'llama-3.3-70b-versatile';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const query = body.query?.trim();
    const lang = body.lang || 'he';

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: 'Product name must be at least 2 characters.' },
        { status: 400 }
      );
    }

    // ── 1. Fetch Reddit search results and comments ─────────────────────────
    console.log(`[Analyze API] Fetching Reddit data for: "${query}"`);
    const searchResult = await searchReddit(query);

    // ── 2. Call Groq for analysis ───────────────────────────────────────────
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey === 'your_groq_key_here') {
      return NextResponse.json(
        { error: 'Groq API search is not configured.' },
        { status: 503 }
      );
    }

    const groq = new Groq({ apiKey });

    const isFallback = searchResult.threads.length === 0;
    const contextText = searchResult.allCommentsText;

    const langNames: Record<string, string> = {
      he: 'fluent Hebrew (עברית)',
      en: 'fluent English',
      ar: 'fluent Arabic (العربية)',
      es: 'fluent Spanish (Español)',
      ru: 'fluent Russian (Русский)',
      fr: 'fluent French (Français)',
      de: 'fluent German (Deutsch)',
      zh: 'fluent Simplified Chinese (简体中文)',
      hi: 'fluent Hindi (हिन्दी)',
    };
    const targetLangName = langNames[lang] || 'fluent Hebrew (עברית)';
    const translateInstruction = `\nIMPORTANT: You MUST write the text values of all output keys ("productName", "pros", "cons", "quotes") in ${targetLangName}.`;

    let prompt = '';
    if (isFallback) {
      console.log(`[Analyze API] No Reddit threads fetched for "${query}". Using AI internal knowledge base fallback.`);
      prompt = `We were unable to scrape live Reddit discussions for the product "${query}" due to network limitations.
Please use your internal knowledge of consumer reviews, Reddit discussions, and forum consensus for the product "${query}" to generate an analysis.

Generate a summary in JSON format ONLY. Do not write any explanations, markdown code block fences, or other text. The output MUST be a valid, parseable JSON object matching this schema:
{
  "productName": "string - Proper official name of the product",
  "unsponsoredScore": number - A score from 0 to 100 representing how authentic and unbiased the reviews are,
  "pros": ["string", "string", "string"] - Exactly 3 distinct, concise pros (max 80 chars each) representing typical Reddit consensus,
  "cons": ["string", "string", "string"] - Exactly 3 distinct, concise cons (max 80 chars each) representing typical Reddit consensus,
  "quotes": ["string", "string", "string"] - Exactly 3 realistic, representative quotes (max 100 chars each) capturing the authentic voice of users discussing this product on Reddit
}
${translateInstruction}
`;
    } else {
      prompt = `Analyze these Reddit discussions, comments, and reviews for the product "${query}":

${contextText.slice(0, 18000)}

Generate a summary in JSON format ONLY. Do not write any explanations, markdown code block fences, or other text. The output MUST be a valid, parseable JSON object matching this schema:
{
  "productName": "string - Proper name of the product",
  "unsponsoredScore": number - A score from 0 to 100 representing how authentic and unbiased the reviews are. (100 = completely organic, unsponsored praise or criticism. 0 = purely promotional spam/marketing ads. Most honest discussions score 70-90. Low scores mean suspicious shill accounts or heavily sponsored opinions),
  "pros": ["string", "string", "string"] - Exactly 3 distinct, concise pros (max 80 chars each) based on the consensus of the Reddit users,
  "cons": ["string", "string", "string"] - Exactly 3 distinct, concise cons (max 80 chars each) based on the consensus of the Reddit users,
  "quotes": ["string", "string", "string"] - Exactly 3 real, representative quotes (edited slightly for readability if needed) from the comments that capture the authentic voice of the users
}
${translateInstruction}
`;
    }

    let completion;
    try {
      console.log(`[Analyze API] Sending to Groq (${MODEL_NAME})...`);
      completion = await groq.chat.completions.create({
        model: MODEL_NAME,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.15,
      });
    } catch (err: any) {
      if (err?.status === 429) {
        const FALLBACK_MODEL = 'llama-3.1-8b-instant';
        console.warn(`[Analyze API] Groq 70B model rate limited (429). Retrying with fallback model: ${FALLBACK_MODEL}`);
        completion = await groq.chat.completions.create({
          model: FALLBACK_MODEL,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.15,
        });
      } else {
        throw err;
      }
    }

    const aiResponse = completion.choices[0]?.message?.content?.trim() ?? '';
    
    // Clean up potential markdown code fences from response
    const cleanJsonStr = aiResponse
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    let analysis: {
      productName: string;
      unsponsoredScore: number;
      pros: string[];
      cons: string[];
      quotes: string[];
    };

    try {
      analysis = JSON.parse(cleanJsonStr);
    } catch (parseErr) {
      console.error('[Analyze API] Groq JSON parse failed. Raw response:', aiResponse);
      
      // Fallback response if parsing failed
      return NextResponse.json({
        productName: query,
        unsponsoredScore: 50,
        pros: ["Could not parse analysis. Please try again."],
        cons: [],
        quotes: searchResult.threads.slice(0, 3).map(t => t.snippet).filter(Boolean),
        threads: searchResult.threads.map(t => ({ title: t.title, url: t.url })),
        commentCount: searchResult.commentCount,
        lowData: true,
      });
    }

    return NextResponse.json({
      productName: analysis.productName || query,
      unsponsoredScore: Number(analysis.unsponsoredScore ?? 75),
      pros: Array.isArray(analysis.pros) ? analysis.pros.slice(0, 3) : [],
      cons: Array.isArray(analysis.cons) ? analysis.cons.slice(0, 3) : [],
      quotes: Array.isArray(analysis.quotes) ? analysis.quotes.slice(0, 3) : [],
      threads: searchResult.threads.map(t => ({ title: t.title, url: t.url })),
      commentCount: searchResult.commentCount,
      lowData: searchResult.lowData || isFallback,
    });

  } catch (error) {
    console.error('[Analyze API] Handler error:', error);
    return NextResponse.json(
      { error: 'An error occurred during analysis.' },
      { status: 500 }
    );
  }
}
