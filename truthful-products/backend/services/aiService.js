/**
 * AI Service - Google Gemini Integration
 * Free and cost-effective sentiment analysis
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const aiConfig = require('../config/ai.config');
const cacheService = require('./cacheService');

class AIService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
    this.tokensUsed = 0;
    this.requestCount = 0;
  }

  /**
   * Preprocess reviews to minimize tokens
   */
  preprocessReviews(reviews) {
    // Filter out short/useless reviews
    let filtered = reviews.filter(r => 
      r.text && r.text.length >= aiConfig.preprocessing.minReviewLength
    );

    // Prioritize verified purchases and helpful reviews
    filtered.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      if (a.verifiedPurchase) scoreA += 10;
      if (b.verifiedPurchase) scoreB += 10;

      scoreA += (a.helpfulVotes || 0);
      scoreB += (b.helpfulVotes || 0);

      return scoreB - scoreA;
    });

    // Limit to max reviews
    filtered = filtered.slice(0, aiConfig.preprocessing.maxReviewsPerProduct);

    // Clean text (remove stop words for efficiency)
    filtered = filtered.map(review => ({
      ...review,
      text: this.cleanText(review.text)
    }));

    return filtered;
  }

  /**
   * Clean text to reduce tokens
   */
  cleanText(text) {
    // Remove extra whitespace
    text = text.replace(/\s+/g, ' ').trim();
    
    // Remove URLs
    text = text.replace(/https?:\/\/[^\s]+/g, '');
    
    // Remove excessive punctuation
    text = text.replace(/[!?]{2,}/g, '!');
    
    return text;
  }

  /**
   * Analyze product with GPT-4o-mini
   */
  async analyzeProduct(productId, reviews) {
    try {
      // Check cache first (30-day cache as recommended)
      const cached = await cacheService.get(`analysis:${productId}`);
      if (cached) {
        console.log(`✅ Cache hit for product ${productId}`);
        return JSON.parse(cached);
      }

      console.log(`🔄 Analyzing product ${productId} with AI...`);

      // Preprocess reviews to save tokens
      const processedReviews = this.preprocessReviews(reviews);

      // Prepare prompt
      const reviewsText = processedReviews
        .map((r, i) => `Review ${i + 1} (${r.rating}⭐): ${r.text}`)
        .join('\n\n');

      const userPrompt = `Analyze these ${processedReviews.length} customer reviews for this product:

${reviewsText}

Provide a JSON response with your analysis.`;

      // Call Gemini
      const startTime = Date.now();
      
      const prompt = `${aiConfig.systemPrompt}

${userPrompt}

Please respond with valid JSON only.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const duration = Date.now() - startTime;

      // Extract JSON from response
      let analysis;
      try {
        // Try to parse as JSON directly
        analysis = JSON.parse(text);
      } catch (e) {
        // If fails, try to extract JSON from markdown code blocks
        const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/);
        if (jsonMatch) {
          analysis = JSON.parse(jsonMatch[1]);
        } else {
          throw new Error('Failed to parse JSON from Gemini response');
        }
      }

      // Track usage (Gemini is free, but track requests)
      this.requestCount++;
      this.tokensUsed += text.length; // Approximate

      console.log(`✅ Analysis complete in ${duration}ms`);
      console.log(`🆓 Gemini Free Tier | Request #${this.requestCount}`);

      // Add metadata
      analysis.metadata = {
        analyzedAt: new Date().toISOString(),
        reviewsAnalyzed: processedReviews.length,
        requestNumber: this.requestCount,
        cost: 0, // Free!
        model: 'gemini-pro'
      };

      // Cache for 30 days
      await cacheService.set(
        `analysis:${productId}`,
        JSON.stringify(analysis),
        aiConfig.ttl.productAnalysis
      );

      return analysis;

    } catch (error) {
      console.error('❌ AI analysis failed:', error.message);
      
      // Fallback to keyword-based analysis
      return this.fallbackAnalysis(reviews);
    }
  }

  /**
   * Fallback: Simple keyword-based analysis
   */
  fallbackAnalysis(reviews) {
    console.log('⚠️ Using fallback keyword analysis');

    const positiveWords = ['great', 'excellent', 'love', 'perfect', 'amazing', 'best'];
    const negativeWords = ['terrible', 'awful', 'broke', 'waste', 'worst', 'disappointed'];

    let positiveCount = 0;
    let negativeCount = 0;

    reviews.forEach(review => {
      const text = review.text.toLowerCase();
      positiveWords.forEach(word => {
        if (text.includes(word)) positiveCount++;
      });
      negativeWords.forEach(word => {
        if (text.includes(word)) negativeCount++;
      });
    });

    const totalSentiment = positiveCount - negativeCount;
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    return {
      overallScore: Math.round(avgRating * 2) / 2, // Round to .5
      sentiment: totalSentiment > 0 ? 'positive' : totalSentiment < 0 ? 'negative' : 'mixed',
      pros: ['Based on star ratings'],
      cons: ['Limited analysis available'],
      fakeReviewWarning: 'none',
      valueForMoney: avgRating >= 4 ? 'good' : 'fair',
      recommendation: avgRating >= 4 ? 'consider' : 'research more',
      summary: `Average rating: ${avgRating.toFixed(1)} stars. Fallback analysis used.`,
      metadata: {
        fallback: true,
        analyzedAt: new Date().toISOString()
      }
    };
  }

  /**
   * Get usage statistics
   */
  getStats() {
    return {
      requestCount: this.requestCount,
      tokensUsed: this.tokensUsed,
      costAccumulated: 0, // Gemini is free!
      dailyLimit: 1500,
      remainingToday: 1500 - (this.requestCount % 1500)
    };
  }
}

module.exports = new AIService();
