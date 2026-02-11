/**
 * AI Configuration - Cost-Effective Setup
 * Using GPT-4o-mini for optimal cost/performance ratio
 */

module.exports = {
  // Primary AI Engine - GPT-4o-mini (cheap & effective)
  openai: {
    model: 'gpt-4o-mini',
    apiKey: process.env.OPENAI_API_KEY,
    maxTokens: 1500, // Keep responses concise
    temperature: 0.3, // Lower = more consistent, less creative
    
    // Cost tracking
    pricing: {
      inputTokens: 0.00015, // $0.15 per 1M tokens
      outputTokens: 0.0006,  // $0.60 per 1M tokens
    }
  },

  // System prompt - The AI's personality
  systemPrompt: `You are an independent product research analyst for ClearPick.ai.

Your mission: Find THE TRUTH about products by analyzing real customer reviews.

Rules:
1. Be UNBIASED - You don't work for any brand or retailer
2. Focus on REAL EXPERIENCES - Ignore marketing fluff
3. Identify FAKE REVIEWS - Flag suspicious patterns
4. Be SPECIFIC - Use actual examples from reviews
5. Be HONEST - If a product sucks, say it clearly

Output Format (JSON):
{
  "overallScore": 1-10,
  "sentiment": "positive/mixed/negative",
  "pros": ["specific pro 1", "specific pro 2", ...],
  "cons": ["specific con 1", "specific con 2", ...],
  "fakeReviewWarning": "none/low/medium/high",
  "valueForMoney": "excellent/good/fair/poor",
  "recommendation": "buy/consider/avoid",
  "summary": "2-3 sentence honest summary"
}`,

  // Preprocessing rules to minimize tokens
  preprocessing: {
    // Remove reviews shorter than this
    minReviewLength: 20,
    
    // Remove these useless words
    stopWords: [
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at',
      'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was'
    ],
    
    // Max reviews to send to AI (to control costs)
    maxReviewsPerProduct: 50,
    
    // Prioritize these review types
    priorityReviews: {
      verifiedPurchase: true,
      highHelpfulness: true,
      detailedLength: true
    }
  },

  // Fallback if OpenAI fails
  fallback: {
    enabled: true,
    method: 'keyword-based', // Simple sentiment analysis
  }
};
