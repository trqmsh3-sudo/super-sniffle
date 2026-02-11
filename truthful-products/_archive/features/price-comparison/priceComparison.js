const axios = require('axios');
let cheerio;
try {
  cheerio = require('cheerio');
} catch (error) {
  console.warn('⚠️  cheerio not installed - price comparison will have limited functionality');
  cheerio = null;
}

/**
 * Price Comparison Service
 * 
 * Scrapes prices from Israeli retailers:
 * - Zap (www.zap.co.il)
 * - KSP (www.ksp.co.il)
 * - Bug (www.bug.co.il)
 * 
 * Returns sorted list: cheapest first
 */
class PriceComparisonService {
  constructor() {
    this.sellers = [
      {
        name: 'Zap',
        baseUrl: 'https://www.zap.co.il',
        searchUrl: 'https://www.zap.co.il/search.aspx',
        enabled: true
      },
      {
        name: 'KSP',
        baseUrl: 'https://www.ksp.co.il',
        searchUrl: 'https://www.ksp.co.il/web/search/',
        enabled: true
      },
      {
        name: 'Bug',
        baseUrl: 'https://www.bug.co.il',
        searchUrl: 'https://www.bug.co.il/search.php',
        enabled: true
      }
    ];
  }

  /**
   * Compare prices for a product name
   * @param {string} productName - Product name to search for
   * @returns {Promise<Array>} Array of { seller, price, url, title } sorted by price
   */
  async comparePrices(productName) {
    console.log(`💰 Comparing prices for: "${productName}"`);
    
    const results = [];
    const promises = [];

    // Search all sellers in parallel
    for (const seller of this.sellers) {
      if (seller.enabled) {
        promises.push(
          this.searchSeller(seller, productName)
            .catch(err => {
              console.error(`❌ Error searching ${seller.name}:`, err.message);
              return []; // Return empty array on error
            })
        );
      }
    }

    const allResults = await Promise.all(promises);
    
    // Flatten and sort by price
    for (const sellerResults of allResults) {
      results.push(...sellerResults);
    }

    // Sort by price (ascending)
    results.sort((a, b) => {
      const priceA = this.extractPrice(a.price);
      const priceB = this.extractPrice(b.price);
      return priceA - priceB;
    });

    console.log(`   ✓ Found ${results.length} prices from ${this.sellers.filter(s => s.enabled).length} sellers`);

    return results;
  }

  /**
   * Search a specific seller
   */
  async searchSeller(seller, productName) {
    try {
      const url = `${seller.searchUrl}?keyword=${encodeURIComponent(productName)}`;
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'he-IL,he;q=0.9,en-US;q=0.8,en;q=0.7'
        },
        timeout: 10000
      });

      return this.parseSellerResults(seller, response.data, productName);
    } catch (error) {
      console.error(`Error searching ${seller.name}:`, error.message);
      return [];
    }
  }

  /**
   * Parse seller results from HTML
   */
  parseSellerResults(seller, html, productName) {
    if (!cheerio) {
      console.warn(`⚠️  Cannot parse ${seller.name} - cheerio not available`);
      return [];
    }
    const $ = cheerio.load(html);
    const results = [];

    try {
      if (seller.name === 'Zap') {
        // Zap.co.il parsing
        $('.SearchResultsProductRow, .ProductRow').slice(0, 5).each((i, elem) => {
          const $item = $(elem);
          const title = $item.find('.ProductName a, .Title a').text().trim();
          const priceText = $item.find('.prices, .Price').text().trim();
          const price = this.extractPriceFromText(priceText);
          const link = $item.find('a').first().attr('href');
          
          if (title && price) {
            results.push({
              seller: 'Zap',
              title: title.substring(0, 100),
              price: `₪${price}`,
              priceValue: price,
              url: link?.startsWith('http') ? link : `${seller.baseUrl}${link}`,
              inStock: true // Assume in stock if found
            });
          }
        });
      } else if (seller.name === 'KSP') {
        // KSP.co.il parsing
        $('.product-item, .product-box').slice(0, 5).each((i, elem) => {
          const $item = $(elem);
          const title = $item.find('.product-name, .title a').text().trim();
          const priceText = $item.find('.price, .product-price').text().trim();
          const price = this.extractPriceFromText(priceText);
          const link = $item.find('a').first().attr('href');
          
          if (title && price) {
            results.push({
              seller: 'KSP',
              title: title.substring(0, 100),
              price: `₪${price}`,
              priceValue: price,
              url: link?.startsWith('http') ? link : `${seller.baseUrl}${link}`,
              inStock: true
            });
          }
        });
      } else if (seller.name === 'Bug') {
        // Bug.co.il parsing
        $('.product, .item-product').slice(0, 5).each((i, elem) => {
          const $item = $(elem);
          const title = $item.find('.product-title, .title').text().trim();
          const priceText = $item.find('.price, .product-price').text().trim();
          const price = this.extractPriceFromText(priceText);
          const link = $item.find('a').first().attr('href');
          
          if (title && price) {
            results.push({
              seller: 'Bug',
              title: title.substring(0, 100),
              price: `₪${price}`,
              priceValue: price,
              url: link?.startsWith('http') ? link : `${seller.baseUrl}${link}`,
              inStock: true
            });
          }
        });
      }
    } catch (error) {
      console.error(`Error parsing ${seller.name} results:`, error.message);
    }

    return results;
  }

  /**
   * Extract numeric price from text (e.g., "₪449" or "449 ₪" → 449)
   */
  extractPriceFromText(text) {
    if (!text) return 0;
    
    // Remove currency symbols and extract numbers
    const match = text.replace(/[₪,$,€]/g, '').match(/(\d+(?:,\d{3})*(?:\.\d{2})?)/);
    if (match) {
      return parseFloat(match[1].replace(/,/g, ''));
    }
    return 0;
  }

  /**
   * Extract price value from price object
   */
  extractPrice(price) {
    if (typeof price === 'number') return price;
    if (typeof price === 'string') return this.extractPriceFromText(price);
    return price?.priceValue || 0;
  }
}

module.exports = new PriceComparisonService();
