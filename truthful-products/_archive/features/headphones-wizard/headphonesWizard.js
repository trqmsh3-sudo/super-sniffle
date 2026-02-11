const db = require('../config/database');
const redditScraper = require('./redditScraper');
const dataAggregator = require('./dataAggregator');
const priceComparison = require('./priceComparison');
const universalImageService = require('./universalImageService');
const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Headphones Recommendation Wizard Service
 * 
 * Recommends headphones based on user preferences:
 * - Budget range
 * - Use case (running, work, gaming, music, calls)
 * - Features (noise canceling, wireless, waterproof, long battery)
 * - Brand preference
 * 
 * Uses:
 * - Reddit scraping (r/headphones, r/audiophile)
 * - AI analysis (Gemini/Claude)
 * - Price comparison (Zap, KSP, Bug)
 * - Image service
 */
class HeadphonesWizard {
  constructor() {
    // Headphones subreddits
    this.subreddits = [
      'headphones',
      'audiophile',
      'HeadphoneAdvice',
      'budgetaudiophile'
    ];

    // Initialize Gemini AI (if available)
    if (process.env.GEMINI_API_KEY) {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      this.geminiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    } else {
      this.geminiModel = null;
      console.warn('⚠️  No GEMINI_API_KEY - AI recommendations will use fallback');
    }
  }

  /**
   * Find headphones recommendations based on preferences
   * @param {Object} preferences - User preferences
   * @returns {Promise<Object>} Recommendations with best, cheapest, value options
   */
  async findHeadphones(preferences) {
    console.log(`\n🎧 Headphones Wizard: Finding recommendations`);
    console.log(`   Budget: ${preferences.budget}₪`);
    console.log(`   Use Case: ${preferences.useCase}`);
    console.log(`   Features: ${preferences.features.join(', ')}`);
    console.log(`   Brand: ${preferences.brand}\n`);

    try {
      // 1. Build search query
      const searchQuery = this.buildSearchQuery(preferences);

      // 2. Scrape Reddit for reviews
      console.log('📝 Step 1/5: Scraping Reddit...');
      const posts = await this.scrapeHeadphonesReddit(searchQuery, preferences);

      // 3. Aggregate data
      console.log('📝 Step 2/5: Analyzing reviews...');
      const aggregated = await dataAggregator.aggregate(posts, searchQuery);

      // 4. Get AI recommendations
      console.log('📝 Step 3/5: Getting AI recommendations...');
      const recommendations = await this.getAIRecommendations(preferences, aggregated);

      // 5. Get prices and images
      console.log('📝 Step 4/5: Fetching prices and images...');
      const enriched = await this.enrichWithPricesAndImages(recommendations);

      // 6. Return top 3: best, cheapest, value
      console.log('📝 Step 5/5: Ranking recommendations...');
      const top3 = this.selectTop3(enriched, preferences);

      console.log(`\n✅ Found ${top3.length} recommendations\n`);

      return {
        success: true,
        recommendations: top3,
        searchQuery,
        totalFound: enriched.length
      };
    } catch (error) {
      console.error('Headphones Wizard Error:', error);
      throw error;
    }
  }

  /**
   * Build search query from preferences
   */
  buildSearchQuery(preferences) {
    const parts = [];

    // Brand
    if (preferences.brand && preferences.brand !== 'לא משנה') {
      parts.push(preferences.brand);
    }

    // Use case keywords
    const useCaseMap = {
      'ריצה': 'running wireless',
      'עבודה': 'office noise canceling',
      'משחקים': 'gaming headset',
      'מוזיקה': 'audiophile',
      'שיחות': 'calls microphone'
    };
    if (useCaseMap[preferences.useCase]) {
      parts.push(useCaseMap[preferences.useCase]);
    }

    // Features
    if (preferences.features.includes('ביטול רעשים')) {
      parts.push('noise canceling');
    }
    if (preferences.features.includes('אלחוטי')) {
      parts.push('wireless bluetooth');
    }

    // Budget context (for AI understanding)
    if (preferences.budget < 300) {
      parts.push('budget affordable');
    } else if (preferences.budget > 1000) {
      parts.push('premium high-end');
    }

    return parts.join(' ') || 'headphones';
  }

  /**
   * Scrape Reddit for headphones reviews
   */
  async scrapeHeadphonesReddit(query, preferences) {
    const allPosts = [];

    for (const subreddit of this.subreddits) {
      try {
        const posts = await redditScraper.smartSearch(query, subreddit);
        allPosts.push(...posts);
      } catch (error) {
        console.error(`Error scraping r/${subreddit}:`, error.message);
      }
    }

    // Filter by budget mention (loose matching)
    const filtered = this.filterByBudget(allPosts, preferences.budget);

    return filtered.slice(0, 50); // Limit to top 50
  }

  /**
   * Filter posts by budget mentions
   */
  filterByBudget(posts, budget) {
    if (!budget) return posts;

    const budgetRange = {
      min: budget * 0.5, // ±50% tolerance
      max: budget * 1.5
    };

    return posts.filter(post => {
      const text = (post.title + ' ' + post.selftext).toLowerCase();
      
      // Extract price mentions
      const priceMatch = text.match(/₪?(\d+)/g);
      if (!priceMatch) return true; // Keep if no price mentioned

      // Check if any mentioned price is in range
      for (const priceStr of priceMatch) {
        const price = parseInt(priceStr.replace(/[₪,$]/g, ''));
        if (price >= budgetRange.min && price <= budgetRange.max) {
          return true;
        }
      }

      return false;
    });
  }

  /**
   * Get AI recommendations based on preferences
   */
  async getAIRecommendations(preferences, aggregated) {
    const prompt = this.buildRecommendationPrompt(preferences, aggregated);

    try {
      // Use Gemini directly if available
      if (this.geminiModel) {
        const result = await this.geminiModel.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        // Try to extract JSON from response
        const recommendations = this.parseAIRecommendations(text);
        
        // If valid recommendations found, return them
        if (recommendations && recommendations.length > 0) {
          return recommendations;
        }
      }

      // Fallback if Gemini not available or failed
      return this.fallbackRecommendations(aggregated);
    } catch (error) {
      console.error('AI Recommendation Error:', error);
      // Fallback to basic recommendations from aggregated data
      return this.fallbackRecommendations(aggregated);
    }
  }

  /**
   * Build AI prompt for recommendations
   */
  buildRecommendationPrompt(preferences, aggregated) {
    return `You are a headphones expert. Recommend headphones based on these criteria:

Budget: ${preferences.budget}₪
Use Case: ${preferences.useCase}
Required Features: ${preferences.features.join(', ')}
Brand Preference: ${preferences.brand}

Available data from reviews:
- Positive Sentiment: ${aggregated.sentiment.percentPositive}%
- Common Pros: ${aggregated.pros.slice(0, 5).join(', ')}
- Common Cons: ${aggregated.cons.slice(0, 5).join(', ')}

Return JSON array of 5-10 headphone recommendations:
[
  {
    "name": "Sony WH-1000XM4",
    "brand": "Sony",
    "model": "WH-1000XM4",
    "price_range": "900-1200",
    "score": 92,
    "pros": ["Excellent noise canceling", "Great sound quality"],
    "cons": ["Expensive", "Bulkier than expected"],
    "features": ["noise canceling", "wireless", "long battery"],
    "best_for": "work, travel"
  }
]

Focus on headphones that match the budget, use case, and required features.`;
  }

  /**
   * Parse AI recommendations from response
   */
  parseAIRecommendations(aiResponse) {
    try {
      // Try to extract JSON from response
      const text = typeof aiResponse === 'string' ? aiResponse : aiResponse.text || JSON.stringify(aiResponse);
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return Array.isArray(parsed) ? parsed : [parsed];
      }

      // Fallback: return empty array
      return [];
    } catch (error) {
      console.error('Error parsing AI recommendations:', error);
      return [];
    }
  }

  /**
   * Fallback recommendations if AI fails
   */
  fallbackRecommendations(aggregated) {
    // Return generic recommendations based on common headphones
    return [
      {
        name: 'Sony WH-1000XM5',
        brand: 'Sony',
        score: 90,
        pros: aggregated.pros.slice(0, 3),
        cons: aggregated.cons.slice(0, 2)
      },
      {
        name: 'Bose QuietComfort 45',
        brand: 'Bose',
        score: 88,
        pros: aggregated.pros.slice(0, 3),
        cons: aggregated.cons.slice(0, 2)
      },
      {
        name: 'Apple AirPods Pro',
        brand: 'Apple',
        score: 85,
        pros: aggregated.pros.slice(0, 3),
        cons: aggregated.cons.slice(0, 2)
      }
    ];
  }

  /**
   * Enrich recommendations with prices and images
   */
  async enrichWithPricesAndImages(recommendations) {
    const enriched = [];

    for (const rec of recommendations) {
      try {
        // Get prices
        const prices = await priceComparison.comparePrices(rec.name);
        const cheapestPrice = prices[0] || null;

        // Get image
        const image = await universalImageService.getImage(rec.name, 'headphones').catch(() => null);

        enriched.push({
          ...rec,
          prices: prices.slice(0, 5), // Top 5 prices
          cheapestPrice: cheapestPrice?.price || rec.price_range || 'N/A',
          cheapestSeller: cheapestPrice?.seller || null,
          cheapestUrl: cheapestPrice?.url || null,
          imageUrl: image?.url || null,
          priceValue: cheapestPrice?.priceValue || this.extractPriceFromRange(rec.price_range)
        });
      } catch (error) {
        console.error(`Error enriching ${rec.name}:`, error.message);
        enriched.push({
          ...rec,
          prices: [],
          cheapestPrice: rec.price_range || 'N/A',
          imageUrl: null
        });
      }
    }

    return enriched;
  }

  /**
   * Extract numeric price from range (e.g., "900-1200" → 1050)
   */
  extractPriceFromRange(range) {
    if (!range) return 0;
    const match = range.match(/(\d+)[-\s]+(\d+)/);
    if (match) {
      return (parseInt(match[1]) + parseInt(match[2])) / 2;
    }
    const single = range.match(/(\d+)/);
    return single ? parseInt(single[1]) : 0;
  }

  /**
   * Select top 3 recommendations: best, cheapest, value
   */
  selectTop3(recommendations, preferences) {
    if (recommendations.length === 0) return [];

    // Sort by score
    const sortedByScore = [...recommendations].sort((a, b) => (b.score || 0) - (a.score || 0));

    // Sort by price
    const sortedByPrice = [...recommendations].sort((a, b) => {
      const priceA = a.priceValue || 999999;
      const priceB = b.priceValue || 999999;
      return priceA - priceB;
    });

    // Value score = score / price
    const sortedByValue = [...recommendations]
      .map(r => ({
        ...r,
        valueScore: (r.score || 50) / Math.max(r.priceValue || 1, 1)
      }))
      .sort((a, b) => b.valueScore - a.valueScore);

    return [
      {
        ...sortedByScore[0],
        recommendationType: 'best',
        title: 'המומלץ ביותר',
        subtitle: 'האיכות הטובה ביותר לפי ביקורות'
      },
      {
        ...sortedByPrice[0],
        recommendationType: 'cheapest',
        title: 'הכי זול',
        subtitle: 'המחיר הנמוך ביותר'
      },
      {
        ...sortedByValue[0],
        recommendationType: 'value',
        title: 'הכי שווה',
        subtitle: 'האיכות הטובה ביותר במחיר'
      }
    ].filter(r => r && r.name); // Remove nulls
  }
}

module.exports = new HeadphonesWizard();
