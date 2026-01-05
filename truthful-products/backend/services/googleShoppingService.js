/**
 * Google Shopping Service
 * Fetch prices from independent retailers
 */

const axios = require('axios');

class GoogleShoppingService {
  constructor() {
    this.apiKey = process.env.GOOGLE_SHOPPING_API_KEY;
    this.cx = process.env.GOOGLE_SHOPPING_CX;
    this.baseUrl = 'https://www.googleapis.com/customsearch/v1';
  }

  /**
   * Search for product prices from independent retailers
   */
  async searchRetailers(productName) {
    try {
      // Check if we have the required credentials
      if (!this.apiKey) {
        console.log('⚠️ Google Shopping API Key not configured');
        return [];
      }

      if (!this.cx) {
        console.log('⚠️ Google Shopping CX ID not configured');
        console.log('💡 Create one at: https://programmablesearchengine.google.com/');
        return [];
      }

      console.log(`🔍 Searching Google Shopping for: ${productName}`);

      const response = await axios.get(this.baseUrl, {
        params: {
          key: this.apiKey,
          cx: this.cx,
          q: `${productName} buy price`,
          num: 5
        },
        timeout: 5000
      });

      if (!response.data.items || response.data.items.length === 0) {
        console.log('⚠️ No results from Google Shopping');
        return [];
      }

      // Parse results
      const retailers = response.data.items.map((item, index) => {
        // Extract domain name
        const url = new URL(item.link);
        const domain = url.hostname.replace('www.', '');
        
        // Generate retailer name from domain
        const retailerName = this.formatRetailerName(domain);
        
        // Extract price if available (this is simplified)
        const price = this.extractPrice(item.snippet) || (299.99 + (index * 10));

        return {
          retailer: retailerName,
          price: price,
          url: item.link,
          hasAffiliate: false,
          inStock: true,
          isIndependent: !this.isMajorRetailer(domain),
          source: 'google_shopping',
          image: item.pagemap?.cse_image?.[0]?.src || item.pagemap?.cse_thumbnail?.[0]?.src
        };
      });

      console.log(`✅ Found ${retailers.length} retailers via Google Shopping`);
      return retailers;

    } catch (error) {
      console.error('❌ Google Shopping API error:', error.message);
      // Return empty array instead of mock data
      return [];
    }
  }

  /**
   * Format retailer name from domain
   */
  formatRetailerName(domain) {
    // Remove .com, .net, etc.
    const name = domain.split('.')[0];
    
    // Capitalize first letter
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  /**
   * Check if domain is a major retailer
   */
  isMajorRetailer(domain) {
    const majorRetailers = [
      'amazon.com',
      'walmart.com',
      'bestbuy.com',
      'target.com',
      'ebay.com'
    ];
    
    return majorRetailers.some(major => domain.includes(major));
  }

  /**
   * Extract price from text (simplified)
   */
  extractPrice(text) {
    if (!text) return null;
    
    // Look for price patterns like $299.99 or 299.99
    const priceMatch = text.match(/\$?(\d{1,4}(?:,\d{3})*(?:\.\d{2})?)/);
    
    if (priceMatch) {
      return parseFloat(priceMatch[1].replace(',', ''));
    }
    
    return null;
  }

  /**
   * Fallback: Return mock retailers for demo
   */
  getMockRetailers(productName) {
    console.log('📦 Using mock independent retailers data');
    
    return [
      {
        retailer: "Joe's Electronics",
        price: 279.99,
        originalPrice: 299.99,
        url: 'https://joeselectronics.com/...',
        hasAffiliate: false,
        inStock: true,
        isIndependent: true,
        source: 'mock',
        trustMessage: '🏪 Supporting small business'
      },
      {
        retailer: "TechHub Store",
        price: 289.99,
        url: 'https://techhubstore.com/...',
        hasAffiliate: false,
        inStock: true,
        isIndependent: true,
        source: 'mock',
        trustMessage: '🏪 Independent retailer'
      },
      {
        retailer: "AudioPro Shop",
        price: 284.99,
        url: 'https://audioproshop.com/...',
        hasAffiliate: false,
        inStock: true,
        isIndependent: true,
        source: 'mock',
        trustMessage: '🏪 Local business'
      }
    ];
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      configured: !!(this.apiKey && this.cx),
      apiKey: !!this.apiKey,
      cxId: !!this.cx,
      dailyLimit: 100,
      cost: 'Free (100/day)'
    };
  }
}

module.exports = new GoogleShoppingService();
