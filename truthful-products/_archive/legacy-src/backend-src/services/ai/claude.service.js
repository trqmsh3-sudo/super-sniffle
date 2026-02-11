import Anthropic from '@anthropic-ai/sdk';
import { logger } from '../../utils/logger.js';
import { CONSTANTS } from '../../config/constants.js';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const analyzeProduct = async (productData) => {
  logger.info('Starting AI analysis with Claude');

  try {
    const { amazon, reddit } = productData;

    const prompt = `You are a product research analyst. Analyze the following data and provide a comprehensive, unbiased product review.

PRODUCT: ${amazon?.data?.product || 'Unknown Product'}

AMAZON DATA:
- Price: ${amazon?.data?.price || 'N/A'}
- Rating: ${amazon?.data?.rating || 'N/A'}
- Review Count: ${amazon?.data?.reviewCount || 'N/A'}
- Sample Reviews (${amazon?.data?.reviews?.length || 0}):
${amazon?.data?.reviews?.slice(0, 10).map(r => `  - [${r.rating}] ${r.title}: ${r.body.substring(0, 200)}...`).join('\n') || 'No reviews'}

REDDIT DISCUSSIONS:
- Total Posts: ${reddit?.data?.totalPosts || 0}
- Total Comments: ${reddit?.data?.totalComments || 0}
- Sample Posts:
${reddit?.data?.posts?.slice(0, 5).map(p => `  - [${p.score} upvotes] ${p.title}\n    ${p.body.substring(0, 150)}...`).join('\n') || 'No posts'}
- Sample Comments:
${reddit?.data?.comments?.slice(0, 10).map(c => `  - [${c.score}] ${c.body.substring(0, 150)}...`).join('\n') || 'No comments'}

Please provide a JSON response with the following structure:
{
  "score": 8.5,
  "recommendation": "Highly Recommended" | "Recommended" | "Consider Alternatives" | "Not Recommended",
  "pros": [
    { "point": "Main benefit", "evidence": "Quote or stat", "mentions": 123 }
  ],
  "cons": [
    { "point": "Main issue", "evidence": "Quote or stat", "mentions": 45 }
  ],
  "pricing": {
    "average": 529,
    "bestDeal": { "store": "Amazon", "price": 499 },
    "trend": "Stable" | "Rising" | "Falling",
    "verdict": "Good time to buy" | "Wait for sale" | "Overpriced"
  },
  "verdict": "2-3 sentence summary with buying recommendation",
  "bestFor": "Who should buy this product",
  "sources": {
    "amazon": { "reviews": 2340, "avgRating": 4.4 },
    "reddit": { "posts": 156, "sentiment": "positive" | "mixed" | "negative" }
  }
}

Be honest, balanced, and data-driven. Focus on real user experiences.`;

    const message = await anthropic.messages.create({
      model: CONSTANTS.AI.MODEL,
      max_tokens: CONSTANTS.AI.MAX_TOKENS,
      temperature: CONSTANTS.AI.TEMPERATURE,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const responseText = message.content[0].text;
    
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to extract JSON from AI response');
    }

    const analysis = JSON.parse(jsonMatch[0]);
    
    logger.info('AI analysis completed successfully');
    return {
      success: true,
      data: analysis,
    };

  } catch (error) {
    logger.error('Claude AI error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};
