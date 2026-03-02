// =============================================================================
// Debug endpoint — test Gemini connection directly
// GET /api/debug-gemini
// =============================================================================

import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_key_here') {
    return NextResponse.json({ error: 'GEMINI_API_KEY not set' }, { status: 503 });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // Try models in priority order
    const models = ['gemini-2.0-flash', 'gemini-2.5-flash'];
    for (const modelName of models) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          tools: [{ googleSearch: {} } as never],
        });
        const result = await model.generateContent('What is the price of Sony WH-1000XM5 headphones? Reply in one short sentence.');
        const text = result.response.text().trim();
        return NextResponse.json({
          status: 'ok',
          model: modelName,
          response: text.slice(0, 500),
          responseLength: text.length,
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.includes('429') || msg.includes('quota')) {
          continue; // try next model
        }
        throw e; // non-quota error
      }
    }
    throw new Error('All models exhausted (quota exceeded on all)');
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    const errName = err instanceof Error ? err.name : 'Unknown';
    const errStack = err instanceof Error ? err.stack?.slice(0, 500) : undefined;

    return NextResponse.json({
      status: 'error',
      errorName: errName,
      errorMessage: errMsg,
      errorStack: errStack,
    }, { status: 500 });
  }
}
