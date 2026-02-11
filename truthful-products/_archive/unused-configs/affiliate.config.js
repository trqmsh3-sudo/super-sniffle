/**
 * Affiliate System Configuration
 * Trust-based, transparent monetization
 */

module.exports = {
  // Amazon Associates
  amazon: {
    enabled: true,
    associateTag: process.env.AMAZON_ASSOCIATE_TAG || 'clearpick-20',
    
    // Link generation
    generateLink: (asin, tag) => {
      return `https://www.amazon.com/dp/${asin}?tag=${tag}`;
    },
    
    // Commission rates (approximate)
    commissionRates: {
      electronics: 0.04, // 4%
      home: 0.03, // 3%
      fashion: 0.04, // 4%
      default: 0.03, // 3%
    }
  },

  // Walmart Affiliates
  walmart: {
    enabled: false, // Enable when ready
    publisherId: process.env.WALMART_PUBLISHER_ID,
    
    generateLink: (itemId, publisherId) => {
      return `https://www.walmart.com/ip/${itemId}?wmlspartner=${publisherId}`;
    },
    
    commissionRates: {
      default: 0.04, // 4%
    }
  },

  // Best Buy Affiliates
  bestbuy: {
    enabled: false, // Enable when ready
    affiliateId: process.env.BESTBUY_AFFILIATE_ID,
    
    generateLink: (sku, affiliateId) => {
      return `https://www.bestbuy.com/site/${sku}.p?skuId=${sku}&ref=${affiliateId}`;
    },
    
    commissionRates: {
      default: 0.01, // 1%
    }
  },

  // Price comparison logic
  priceComparison: {
    // Minimum retailers to show
    minRetailers: 2,
    
    // Maximum retailers to show
    maxRetailers: 3,
    
    // Sort by price (lowest first)
    sortByPrice: true,
    
    // Show savings badge if difference > this
    savingsBadgeThreshold: 10, // $10 difference
  },

  // Transparency settings
  transparency: {
    // Show disclosure message
    showDisclosure: true,
    
    // Disclosure text
    disclosureText: "We earn a small commission if you purchase through our links. This helps keep ClearPick.ai free and independent. Your price stays the same.",
    
    // Button text (not salesy)
    buttonText: {
      primary: "Check Price",
      secondary: "View on {retailer}",
      comparison: "Compare Prices"
    },
    
    // UI styling (subtle, service-oriented)
    uiStyle: {
      color: 'primary', // Use brand color
      variant: 'outline', // Not too aggressive
      size: 'medium',
      icon: 'external-link' // Shows it's external
    }
  },

  // Revenue tracking
  tracking: {
    // Track clicks (not purchases - privacy)
    trackClicks: true,
    
    // Analytics events
    events: {
      linkClick: 'affiliate_link_click',
      priceComparison: 'price_comparison_view',
    },
    
    // Estimated revenue calculation
    estimateRevenue: (clicks, conversionRate = 0.03, avgOrderValue = 50, avgCommission = 0.03) => {
      const purchases = clicks * conversionRate;
      const revenue = purchases * avgOrderValue * avgCommission;
      
      return {
        clicks,
        estimatedPurchases: purchases,
        estimatedRevenue: revenue,
        revenuePerClick: revenue / clicks
      };
    }
  },

  // Compliance
  compliance: {
    // FTC disclosure requirements
    ftcCompliant: true,
    
    // Show disclosure on every page with affiliate links
    showOnPages: ['product-intel', 'pricing', 'results'],
    
    // Disclosure placement
    disclosurePlacement: 'above-links', // Before affiliate buttons
  }
};

// Example usage:
// const affiliate = require('./affiliate.config');
// const amazonLink = affiliate.amazon.generateLink('B08N5WRWNW', 'clearpick-20');
// console.log(amazonLink);
// Output: https://www.amazon.com/dp/B08N5WRWNW?tag=clearpick-20
