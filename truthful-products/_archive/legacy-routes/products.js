const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');
const cacheService = require('../services/cacheService');
const googleShoppingService = require('../services/googleShoppingService');

/**
 * POST /api/products/search
 * Search for a product and get AI analysis
 */
router.post('/search', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        error: 'Search query is required'
      });
    }

    console.log(`🔍 Searching for: ${query}`);

    // Generate cache key
    const cacheKey = `product:${query.toLowerCase().trim()}`;

    // Check cache first
    const cachedResult = await cacheService.get(cacheKey);
    if (cachedResult) {
      console.log('✅ Cache hit!');
      return res.json({
        success: true,
        data: cachedResult,
        cached: true,
        timestamp: new Date().toISOString()
      });
    }

    console.log('❌ Cache miss - fetching fresh data...');

    // Fetch retailers via Google Shopping (primary data source)
    const retailers = await googleShoppingService.searchRetailers(query);

    // Build result with Google Shopping data only
    const result = {
      product: {
        title: query,
        imageUrl: retailers[0]?.image || 'https://via.placeholder.com/400x400?text=Product',
        query: query
      },
      prices: {
        retailers: retailers
      },
      metadata: {
        analyzedAt: new Date().toISOString(),
        cacheExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        dataSource: 'google_shopping',
        resultsCount: retailers.length
      }
    };

    // Step 6: Cache the result (30 days)
    await cacheService.set(cacheKey, result, 30 * 24 * 60 * 60);

    console.log('✅ Analysis complete and cached');

    res.json({
      success: true,
      data: result,
      cached: false,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error in product search:', error);
    res.status(500).json({
      error: error.message || 'Failed to search product',
      success: false
    });
  }
});

/**
 * GET /api/products/:productId
 * Get cached product details
 */
router.get('/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const cacheKey = `product:${productId}`;

    const cachedResult = await cacheService.get(cacheKey);
    
    if (!cachedResult) {
      return res.status(404).json({
        error: 'Product not found in cache',
        success: false
      });
    }

    res.json({
      success: true,
      data: cachedResult,
      cached: true
    });

  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      error: error.message,
      success: false
    });
  }
});

/**
 * Helper: Fetch product data from Rainforest API
 */
async function fetchProductData(query) {
  // TODO: Implement Rainforest API call
  // For now, return mock data
  
  console.log('📦 Fetching product data from Rainforest API...');
  
  // Mock data for testing
  return {
    title: `${query} - Premium Quality`,
    imageUrl: 'https://via.placeholder.com/400x400?text=Product+Image',
    rating: 4.5,
    reviewCount: 1234,
    asin: 'B08N5WRWNW',
    reviews: [
      { text: 'Great product, highly recommend!', rating: 5 },
      { text: 'Good quality but a bit expensive', rating: 4 },
      { text: 'Works as expected', rating: 4 }
    ]
  };
}

/**
 * Helper: Fetch prices from multiple retailers
 */
async function fetchPrices(asin) {
  // TODO: Implement price fetching from multiple sources
  // For now, return mock data
  
  console.log('💰 Fetching prices from retailers...');
  
  return [
    {
      retailer: 'Amazon',
      price: 299.99,
      originalPrice: 349.99,
      url: `https://amazon.com/dp/${asin}?tag=${process.env.AMAZON_AFFILIATE_TAG}`,
      hasAffiliate: true,
      inStock: true
    },
    {
      retailer: 'Walmart',
      price: 289.99,
      originalPrice: 329.99,
      url: 'https://walmart.com/...',
      hasAffiliate: true,
      inStock: true
    },
    {
      retailer: 'Joe\'s Electronics',
      price: 279.99,
      originalPrice: 279.99,
      url: 'https://joeselectronics.com/...',
      hasAffiliate: false,
      inStock: true,
      isIndependent: true
    }
  ];
}

module.exports = router;
