export const CONSTANTS = {
  CACHE_TTL: {
    PRODUCT: 6 * 60 * 60,
    SUGGESTIONS: 24 * 60 * 60,
  },
  
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000,
    MAX_REQUESTS: 100,
  },
  
  SCRAPER: {
    TIMEOUT: 30000,
    MAX_RETRIES: 3,
    USER_AGENT: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  },
  
  REDDIT: {
    SUBREDDITS: [
      'BuyItForLife',
      'ProductReviews',
      'reviews',
      'HomeImprovement',
      'Cooking',
      'technology',
      'gadgets',
    ],
    MAX_POSTS: 20,
    MAX_COMMENTS_PER_POST: 10,
  },
  
  AMAZON: {
    BASE_URL: 'https://www.amazon.com',
    MAX_REVIEWS: 50,
  },
  
  AI: {
    MODEL: 'claude-3-5-sonnet-20241022',
    MAX_TOKENS: 4000,
    TEMPERATURE: 0.3,
  },
};
