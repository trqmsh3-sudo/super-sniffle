import { NextResponse } from 'next/server';

export async function GET() {
  const hasGeminiKey = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_key_here';

  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: {
      GEMINI_API_KEY: hasGeminiKey ? 'set' : 'MISSING',
      NODE_ENV: process.env.NODE_ENV ?? 'unknown',
    },
  });
}
