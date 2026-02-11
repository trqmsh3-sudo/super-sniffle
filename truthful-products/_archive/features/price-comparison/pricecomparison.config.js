/**
 * Price Comparison Configuration
 * Including major retailers AND small/independent stores
 */

module.exports = {
  // Major Retailers (with affiliate programs)
  majorRetailers: {
    amazon: {
      enabled: true,
      apiType: 'rainforest',
      hasAffiliate: true,
      priority: 1
    },
    walmart: {
      enabled: true,
      apiType: 'walmart-api',
      hasAffiliate: true,
      priority: 2
    },
    bestbuy: {
      enabled: true,
      apiType: 'bestbuy-api',
      hasAffiliate: true,
      priority: 3
    },
    target: {
      enabled: false,
      apiType: 'target-api',
      hasAffiliate: true,
      priority: 4
    }
  },

  // Small/Independent Retailers (via Google Shopping or Serper)
  independentRetailers: {
    enabled: true,
    apiType: 'google-shopping', // or 'serper'
    
    // Google Shopping API
    googleShopping: {
      apiKey: process.env.GOOGLE_SHOPPING_API_KEY,
      cx: process.env.GOOGLE_SHOPPING_CX, // Custom Search Engine ID
      baseUrl: 'https://www.googleapis.com/customsearch/v1',
      maxResults: 10
    },

    // Serper API (alternative)
    serper: {
      apiKey: process.env.SERPER_API_KEY,
      baseUrl: 'https://google.serper.dev/shopping',
      maxResults: 10
    },

    // Pricing
    pricing: {
      perRequest: 0.005, // $0.005 per search
      monthlyBudget: 50 // $50/month
    }
  },

  // Trust-Building Strategy
  trustStrategy: {
    // ALWAYS show the lowest price, even without affiliate
    showLowestPriceAlways: true,
    
    // Highlight when lowest price is from small retailer
    highlightIndependentRetailers: true,
    
    // Message to show
    independentRetailerMessage: "Found a better deal at a local/smaller store!",
    
    // Explanation
    objectivityMessage: "We show you the best price even when we don't earn a commission."
  },

  // Price Comparison Logic
  comparisonLogic: {
    // Minimum price difference to show (avoid showing $0.01 differences)
    minPriceDifference: 1.00, // $1.00
    
    // Maximum retailers to display
    maxRetailersToShow: 5,
    
    // Sort order
    sortBy: 'price', // 'price' or 'trust_score'
    
    // Include shipping in comparison
    includeShipping: true,
    
    // Cache duration for prices
    cacheDuration: 1 * 60 * 60, // 1 hour
  },

  // Retailer Classification
  classification: {
    // Major retailers (known brands)
    majorRetailers: [
      'Amazon',
      'Walmart',
      'Best Buy',
      'Target',
      'Costco',
      'Home Depot',
      'Lowe\'s'
    ],
    
    // Classify as independent if not in major list
    isIndependent: (retailerName) => {
      const major = module.exports.classification.majorRetailers;
      return !major.some(name => 
        retailerName.toLowerCase().includes(name.toLowerCase())
      );
    }
  },

  // UI Configuration
  ui: {
    // Badge for independent retailers
    independentBadge: {
      text: 'Independent Retailer',
      color: 'accent-green',
      icon: 'store'
    },
    
    // Trust message styling
    trustMessage: {
      backgroundColor: 'blue-50',
      borderColor: 'blue-200',
      textColor: 'navy-light'
    },
    
    // Button text
    buttonText: {
      withAffiliate: 'Check Price',
      withoutAffiliate: 'View Deal',
      comparison: 'Compare All Prices'
    }
  },

  // Error Handling
  errorHandling: {
    // If Google Shopping fails, still show major retailers
    fallbackToMajorRetailers: true,
    
    // Max retries for API calls
    maxRetries: 2,
    
    // Timeout
    timeout: 10000 // 10 seconds
  },

  // Analytics
  analytics: {
    // Track which retailers users click
    trackClicks: true,
    
    // Track independent retailer discovery rate
    trackIndependentDiscovery: true,
    
    // Events
    events: {
      independentRetailerShown: 'independent_retailer_shown',
      independentRetailerClicked: 'independent_retailer_clicked',
      priceComparisonViewed: 'price_comparison_viewed'
    }
  }
};

// Example usage:
// const config = require('./pricecomparison.config');
// const isIndependent = config.classification.isIndependent('Joe\'s Electronics');
// console.log(isIndependent); // true
