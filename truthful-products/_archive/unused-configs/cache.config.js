/**
 * Caching Configuration - Budget Protection
 * Cache product analyses to avoid repeated API calls
 */

module.exports = {
  // Redis configuration
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || null,
    db: 0,
    
    // Connection options
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    }
  },

  // Cache TTL (Time To Live) settings
  ttl: {
    // Product analysis cache - 30 days as recommended
    productAnalysis: 30 * 24 * 60 * 60, // 30 days in seconds
    
    // Price data cache - shorter (prices change often)
    priceData: 1 * 60 * 60, // 1 hour
    
    // Review data cache
    reviewData: 7 * 24 * 60 * 60, // 7 days
    
    // User session cache
    userSession: 24 * 60 * 60, // 24 hours
  },

  // Cache key patterns
  keys: {
    productAnalysis: (productId) => `analysis:${productId}`,
    priceData: (productId) => `price:${productId}`,
    reviewData: (productId) => `reviews:${productId}`,
    userUsage: (userId, date) => `usage:${userId}:${date}`,
  },

  // Cache strategy
  strategy: {
    // Always check cache first
    cacheFirst: true,
    
    // If cache miss, fetch and store
    fetchAndStore: true,
    
    // Background refresh for popular products
    backgroundRefresh: {
      enabled: true,
      threshold: 100, // Refresh if viewed 100+ times
      interval: 7 * 24 * 60 * 60, // Every 7 days
    }
  },

  // Cost savings estimation
  savings: {
    // Average cost per API call
    apiCallCost: 0.05, // $0.05 per analysis
    
    // Cache hit rate target
    targetHitRate: 0.80, // 80% of requests from cache
    
    // Calculate savings
    estimateMonthlySavings: (monthlyRequests) => {
      const cacheMisses = monthlyRequests * (1 - 0.80);
      const apiCalls = cacheMisses;
      const cost = apiCalls * 0.05;
      const potentialCost = monthlyRequests * 0.05;
      const savings = potentialCost - cost;
      
      return {
        totalRequests: monthlyRequests,
        cacheHits: monthlyRequests * 0.80,
        cacheMisses: cacheMisses,
        actualCost: cost,
        potentialCost: potentialCost,
        savings: savings,
        savingsPercent: (savings / potentialCost) * 100
      };
    }
  }
};

// Example usage:
// const config = require('./cache.config');
// console.log(config.savings.estimateMonthlySavings(10000));
// Output: { savings: $400, savingsPercent: 80% }
