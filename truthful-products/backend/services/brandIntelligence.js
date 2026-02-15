const db = require('../config/database');
const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Brand Intelligence Service — V1.0
 * 
 * When a user searches for a brand name (e.g., "Sony", "Apple"),
 * generates a Wikipedia-style brand profile page with:
 * - Company info (from Gemini)
 * - Aggregated rating from all analyzed products of that brand
 * - List of analyzed products with scores
 * - Category breakdown
 */
class BrandIntelligence {
  constructor() {
    if (process.env.GEMINI_API_KEY) {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      this.model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    } else {
      this.model = null;
    }
  }

  /**
   * Get brand profile — combines AI knowledge + DB data
   * @param {string} brandName - e.g., "sony", "apple"
   * @returns {Object} Full brand profile
   */
  async getBrandProfile(brandName) {
    const brandLower = brandName.toLowerCase().trim();
    
    // Run in parallel: AI profile + DB products
    const [aiProfile, brandProducts] = await Promise.all([
      this._getAIProfile(brandLower),
      this._getBrandProducts(brandLower),
    ]);
    
    // Calculate aggregate stats
    const stats = this._calculateStats(brandProducts);
    
    // Organize by category
    const categories = this._organizeByCategory(brandProducts);
    
    return {
      brand: {
        name: aiProfile.name || brandName,
        displayName: aiProfile.displayName || brandName.charAt(0).toUpperCase() + brandName.slice(1),
        logo: aiProfile.logo || null,
        founded: aiProfile.founded || null,
        headquarters: aiProfile.headquarters || null,
        description: aiProfile.description || `${brandName} is a well-known technology brand.`,
        website: aiProfile.website || null,
        sectors: aiProfile.sectors || [],
        knownFor: aiProfile.knownFor || [],
      },
      stats,
      categories,
      products: brandProducts,
      topProducts: brandProducts
        .filter(p => p.overall_score != null)
        .sort((a, b) => (b.overall_score || 0) - (a.overall_score || 0))
        .slice(0, 8),
      worstProducts: brandProducts
        .filter(p => p.overall_score != null)
        .sort((a, b) => (a.overall_score || 0) - (b.overall_score || 0))
        .slice(0, 3),
    };
  }

  /**
   * Get AI-generated brand profile from Gemini
   */
  async _getAIProfile(brandName) {
    if (!this.model) {
      return this._fallbackProfile(brandName);
    }

    try {
      const prompt = `You are a business encyclopedia. Provide factual information about the brand "${brandName}".

Return ONLY valid JSON (no markdown):
{
  "name": "${brandName}",
  "displayName": "Official brand name with correct capitalization",
  "founded": "Year founded (number or string)",
  "headquarters": "City, Country",
  "description": "2-3 sentence factual description of the company and what they're known for",
  "website": "official website URL",
  "sectors": ["Electronics", "Audio", etc.],
  "knownFor": ["Short phrase 1", "Short phrase 2", "Short phrase 3"],
  "logo": null
}

RULES:
- Be factual and concise
- Do NOT include opinions
- If unsure about a fact, omit it
- sectors should be the product categories they're known for
- knownFor should be 3-5 short phrases about what makes them notable`;

      const result = await this.model.generateContent(prompt);
      const text = result.response.text().trim();
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned);
    } catch (error) {
      console.warn('⚠️ Brand AI profile failed:', error.message);
      return this._fallbackProfile(brandName);
    }
  }

  /**
   * Fallback profile when AI is unavailable
   */
  _fallbackProfile(brandName) {
    const profiles = {
      apple: { displayName: 'Apple', founded: '1976', headquarters: 'Cupertino, California', description: 'Apple Inc. is a multinational technology company known for consumer electronics, software, and services. They design and sell smartphones, computers, tablets, and wearables.', website: 'https://www.apple.com', sectors: ['Smartphones', 'Computers', 'Wearables', 'Audio'], knownFor: ['iPhone', 'MacBook', 'Innovation in design', 'Premium ecosystem'] },
      sony: { displayName: 'Sony', founded: '1946', headquarters: 'Tokyo, Japan', description: 'Sony Group Corporation is a Japanese multinational conglomerate known for electronics, gaming, entertainment, and financial services.', website: 'https://www.sony.com', sectors: ['Audio', 'Gaming', 'Cameras', 'TVs'], knownFor: ['PlayStation', 'Noise-cancelling headphones', 'Cameras', 'Premium audio'] },
      samsung: { displayName: 'Samsung', founded: '1938', headquarters: 'Seoul, South Korea', description: 'Samsung Electronics is a South Korean multinational electronics corporation and one of the world\'s largest technology companies.', website: 'https://www.samsung.com', sectors: ['Smartphones', 'TVs', 'Appliances', 'Semiconductors'], knownFor: ['Galaxy smartphones', 'OLED displays', 'Home appliances', 'Memory chips'] },
      jbl: { displayName: 'JBL', founded: '1946', headquarters: 'Los Angeles, California', description: 'JBL is an American audio electronics company owned by Harman International (Samsung). Known for speakers, headphones, and professional audio equipment.', website: 'https://www.jbl.com', sectors: ['Speakers', 'Headphones', 'Professional Audio'], knownFor: ['Portable Bluetooth speakers', 'PartyBox series', 'Durable audio products'] },
      bose: { displayName: 'Bose', founded: '1964', headquarters: 'Framingham, Massachusetts', description: 'Bose Corporation is an American audio equipment company known for premium speakers, headphones, and noise-cancelling technology.', website: 'https://www.bose.com', sectors: ['Audio', 'Headphones', 'Speakers'], knownFor: ['QuietComfort noise-cancelling', 'Premium sound quality', 'Aviation headsets'] },
      dyson: { displayName: 'Dyson', founded: '1991', headquarters: 'Malmesbury, England', description: 'Dyson Ltd is a British technology company known for innovative vacuum cleaners, air purifiers, hair dryers, and hand dryers.', website: 'https://www.dyson.com', sectors: ['Appliances', 'Hair Care', 'Air Treatment'], knownFor: ['Bagless vacuum cleaners', 'Cyclone technology', 'Airwrap hair styler', 'Bladeless fans'] },
    };

    return profiles[brandName] || {
      displayName: brandName.charAt(0).toUpperCase() + brandName.slice(1),
      description: `${brandName.charAt(0).toUpperCase() + brandName.slice(1)} is a technology brand.`,
      sectors: [],
      knownFor: [],
    };
  }

  /**
   * Get all products of a brand from the database
   */
  async _getBrandProducts(brandName) {
    try {
      // Search for products whose name starts with or contains the brand
      const capitalizedBrand = brandName.charAt(0).toUpperCase() + brandName.slice(1);
      
      const result = await db.query(
        `SELECT p.id, p.name, p.category, p.image_url, p.created_at,
                d.overall_score, d.quality_score, d.value_score, d.reliability_score,
                d.summary, d.confidence_score, d.total_reviews, d.status
         FROM products p
         LEFT JOIN dossiers d ON p.id = d.product_id
         WHERE p.name ILIKE $1 OR p.name ILIKE $2
         ORDER BY d.overall_score DESC NULLS LAST
         LIMIT 50`,
        [`${capitalizedBrand}%`, `%${capitalizedBrand}%`]
      );
      
      return result.rows || [];
    } catch (error) {
      console.warn('⚠️ Brand products query failed:', error.message);
      return [];
    }
  }

  /**
   * Calculate aggregate statistics for the brand
   */
  _calculateStats(products) {
    const scored = products.filter(p => p.overall_score != null);
    
    if (scored.length === 0) {
      return {
        productsAnalyzed: 0,
        averageScore: null,
        averageQuality: null,
        averageValue: null,
        averageReliability: null,
        satisfactionRate: null,
        totalReviews: 0,
      };
    }
    
    const avg = (arr, field) => Math.round(arr.reduce((s, p) => s + (p[field] || 0), 0) / arr.length);
    
    return {
      productsAnalyzed: scored.length,
      averageScore: avg(scored, 'overall_score'),
      averageQuality: avg(scored, 'quality_score'),
      averageValue: avg(scored, 'value_score'),
      averageReliability: avg(scored, 'reliability_score'),
      satisfactionRate: Math.round((scored.filter(p => p.overall_score >= 70).length / scored.length) * 100),
      totalReviews: scored.reduce((s, p) => s + (p.total_reviews || 0), 0),
    };
  }

  /**
   * Organize products by category
   */
  _organizeByCategory(products) {
    const cats = {};
    for (const p of products) {
      const cat = p.category || 'general';
      if (!cats[cat]) cats[cat] = [];
      cats[cat].push(p);
    }
    
    return Object.entries(cats).map(([name, items]) => ({
      name,
      count: items.length,
      averageScore: items.filter(i => i.overall_score).length > 0
        ? Math.round(items.filter(i => i.overall_score).reduce((s, i) => s + i.overall_score, 0) / items.filter(i => i.overall_score).length)
        : null,
      products: items.sort((a, b) => (b.overall_score || 0) - (a.overall_score || 0)),
    }));
  }
}

module.exports = new BrandIntelligence();
