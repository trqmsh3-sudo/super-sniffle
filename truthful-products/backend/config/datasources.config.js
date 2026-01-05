/**
 * Data Sources Configuration
 * Using Rainforest API for stability (not Puppeteer)
 */

module.exports = {
  // Rainforest API - Stable Amazon data
  rainforest: {
    apiKey: process.env.RAINFOREST_API_KEY,
    baseUrl: 'https://api.rainforestapi.com/request',
    
    // Request parameters
    params: {
      api_key: process.env.RAINFOREST_API_KEY,
      type: 'product',
      amazon_domain: 'amazon.com',
      
      // IMPORTANT: Only new products (first-hand)
      condition: 'new',
      exclude_used: true,
      exclude_refurbished: true,
    },
    
    // Rate limits
    rateLimit: {
      requestsPerSecond: 2,
      requestsPerMonth: 10000, // Adjust based on plan
    },
    
    // Pricing
    pricing: {
      perRequest: 0.01, // $0.01 per request
      monthlyPlan: 99, // $99/month for 10,000 requests
    }
  },

  // Reddit API - Community insights
  reddit: {
    clientId: process.env.REDDIT_CLIENT_ID,
    clientSecret: process.env.REDDIT_CLIENT_SECRET,
    userAgent: 'ClearPick.ai/1.0',
    
    // Subreddits to search
    targetSubreddits: [
      'BuyItForLife',
      'ProductReviews',
      'ConsumerAdvice',
      'Frugal',
      'reviews',
      // Product-specific subs added dynamically
    ],
    
    // Search parameters
    searchParams: {
      sort: 'relevance',
      time: 'all',
      limit: 100,
    },
    
    // Rate limits (Reddit API)
    rateLimit: {
      requestsPerMinute: 60,
    }
  },

  // Walmart API (future)
  walmart: {
    enabled: false,
    apiKey: process.env.WALMART_API_KEY,
    baseUrl: 'https://developer.api.walmart.com',
  },

  // Best Buy API (future)
  bestbuy: {
    enabled: false,
    apiKey: process.env.BESTBUY_API_KEY,
    baseUrl: 'https://api.bestbuy.com/v1',
  },

  // Data filtering rules
  filtering: {
    // Product conditions to include
    allowedConditions: ['new', 'brand new'],
    
    // Exclude these
    excludedConditions: [
      'used',
      'refurbished',
      'renewed',
      'open box',
      'like new',
      'pre-owned'
    ],
    
    // Minimum data requirements
    minimumRequirements: {
      reviews: 5, // At least 5 reviews
      rating: 1.0, // At least 1 star (to have data)
    }
  },

  // Error handling
  errorHandling: {
    maxRetries: 3,
    retryDelay: 1000, // 1 second
    timeout: 30000, // 30 seconds
    
    fallbackStrategy: 'cache', // Use cached data if API fails
  }
};
