/**
 * Product Version Detector — V1.0
 * 
 * Detects product versions, checks if they exist, and suggests alternatives.
 * Handles cases like "iPhone 17" when only iPhone 16 data exists.
 */
class ProductVersionDetector {
  
  /**
   * Parse a product name into structured components
   * @param {string} productName - e.g., "iPhone 15 Pro Max"
   * @returns {Object} { brand, line, version, variant, raw }
   */
  parse(productName) {
    const raw = String(productName || '').trim();
    const lower = raw.toLowerCase();
    
    // Known product line patterns
    const patterns = [
      // Apple
      { regex: /\b(iphone)\s*(\d{1,2})?\s*(pro\s*max|pro|plus|mini|ultra)?\b/i, brand: 'Apple', line: 'iPhone' },
      { regex: /\b(ipad)\s*(pro|air|mini)?\s*(m\d)?\b/i, brand: 'Apple', line: 'iPad' },
      { regex: /\b(macbook)\s*(pro|air)?\s*(m\d)?\s*(\d{2,})?\b/i, brand: 'Apple', line: 'MacBook' },
      { regex: /\b(airpods)\s*(pro|max)?\s*(\d)?\b/i, brand: 'Apple', line: 'AirPods' },
      { regex: /\b(apple\s*watch)\s*(series\s*\d+|ultra\s*\d*|se)?\b/i, brand: 'Apple', line: 'Apple Watch' },
      
      // Samsung
      { regex: /\b(galaxy)\s*(s|a|z\s*(?:fold|flip))?\s*(\d{1,2})?\s*(ultra|plus|fe)?\b/i, brand: 'Samsung', line: 'Galaxy' },
      { regex: /\b(galaxy)\s*buds\s*(\d)?\s*(pro|fe|plus)?\b/i, brand: 'Samsung', line: 'Galaxy Buds' },
      
      // Sony
      { regex: /\b(wh-?1000xm)(\d)\b/i, brand: 'Sony', line: 'WH-1000XM' },
      { regex: /\b(wf-?1000xm)(\d)\b/i, brand: 'Sony', line: 'WF-1000XM' },
      
      // Google
      { regex: /\b(pixel)\s*(\d{1,2})?\s*(pro|a|xl)?\b/i, brand: 'Google', line: 'Pixel' },
      
      // JBL
      { regex: /\b(jbl)\s*(flip|charge|xtreme|tune|live\s*pro|partybox|go)\s*(\d+)?\s*(nc)?\b/i, brand: 'JBL', line: 'JBL' },
      
      // Dyson
      { regex: /\b(dyson)\s*(v)(\d{1,2})\b/i, brand: 'Dyson', line: 'Dyson V' },
      
      // Generic version pattern: "Brand Model Number Variant"
      { regex: /^(\w+)\s+(.+?)\s+(\d+)\s*(.*)$/i, brand: null, line: null },
    ];
    
    for (const p of patterns) {
      const match = raw.match(p.regex);
      if (match) {
        // Extract version number
        let version = null;
        for (let i = 1; i < match.length; i++) {
          const val = match[i];
          if (val && /^\d+$/.test(val.trim())) {
            version = parseInt(val.trim(), 10);
            break;
          }
        }
        
        // Extract variant (pro, max, plus, etc.)
        let variant = null;
        for (let i = 1; i < match.length; i++) {
          const val = (match[i] || '').trim().toLowerCase();
          if (val && /^(pro|max|plus|mini|ultra|air|se|fe|nc|pro\s*max)$/i.test(val)) {
            variant = val;
            break;
          }
        }
        
        return {
          brand: p.brand,
          line: p.line,
          version,
          variant,
          raw,
          parsed: true,
        };
      }
    }
    
    // Fallback: try to extract any number as version
    const numMatch = raw.match(/(\d+)/);
    return {
      brand: null,
      line: null, 
      version: numMatch ? parseInt(numMatch[1], 10) : null,
      variant: null,
      raw,
      parsed: false,
    };
  }

  /**
   * Check if a product version likely exists based on known ranges
   * Returns { exists: boolean, latestKnown: number|null, suggestion: string|null }
   */
  checkVersionExists(parsed) {
    if (!parsed.version || !parsed.line) {
      return { exists: true, latestKnown: null, suggestion: null };
    }
    
    // Known latest versions as of early 2026
    const knownLatest = {
      'iPhone': { latest: 16, max: 16, upcoming: 17 },
      'iPad': { latest: 10, max: 10 },
      'MacBook': { latest: null, max: null }, // MacBook uses M-chip naming
      'Galaxy': { latest: 25, max: 25 },
      'Galaxy Buds': { latest: 3, max: 3 },
      'WH-1000XM': { latest: 5, max: 5 },
      'WF-1000XM': { latest: 5, max: 5 },
      'Pixel': { latest: 9, max: 9 },
      'Dyson V': { latest: 15, max: 15 },
    };
    
    const info = knownLatest[parsed.line];
    if (!info || !info.latest) {
      return { exists: true, latestKnown: null, suggestion: null };
    }
    
    if (parsed.version > info.latest) {
      // Product doesn't exist yet
      const variantStr = parsed.variant ? ` ${parsed.variant.charAt(0).toUpperCase() + parsed.variant.slice(1)}` : '';
      const suggestion = `${parsed.line} ${info.latest}${variantStr}`;
      return {
        exists: false,
        latestKnown: info.latest,
        isUpcoming: parsed.version === info.upcoming,
        suggestion,
        message: parsed.version === info.upcoming 
          ? `${parsed.raw} has not been released yet. Showing preliminary info based on rumors.`
          : `${parsed.raw} does not exist. The latest model is ${parsed.line} ${info.latest}.`,
      };
    }
    
    return { exists: true, latestKnown: info.latest, suggestion: null };
  }

  /**
   * Generate alternative version suggestions based on the DB
   * @param {Object} parsed - Parsed product info
   * @param {Array} dbProducts - Existing products from DB
   * @returns {Array} Suggested alternatives
   */
  suggestAlternatives(parsed, dbProducts = []) {
    const suggestions = [];
    
    if (!parsed.line) return suggestions;
    
    // Find matching products in DB by product line
    const lineRegex = new RegExp(parsed.line.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const matches = dbProducts.filter(p => lineRegex.test(p.name));
    
    // Sort by version number (descending)
    matches.sort((a, b) => {
      const aVer = this.parse(a.name).version || 0;
      const bVer = this.parse(b.name).version || 0;
      return bVer - aVer;
    });
    
    return matches.slice(0, 5).map(p => ({
      name: p.name,
      id: p.id,
      score: p.overall_score,
    }));
  }

  /**
   * Filter Reddit posts to match the EXACT version being searched
   * e.g., searching "iPhone 15 Pro" should not include "iPhone 15" (non-Pro) posts
   */
  filterByVersion(posts, parsed) {
    if (!parsed.version && !parsed.variant) return posts;
    
    return posts.filter(post => {
      const text = (post.title + ' ' + (post.content || '')).toLowerCase();
      
      // Must mention the exact version number
      if (parsed.version) {
        const versionStr = String(parsed.version);
        if (!text.includes(versionStr)) return false;
      }
      
      // If variant specified, prefer posts that mention it
      // But don't hard-filter — some posts discuss both
      if (parsed.variant) {
        const variantLower = parsed.variant.toLowerCase();
        // Give bonus but don't exclude
        post._variantMatch = text.includes(variantLower);
      }
      
      return true;
    });
  }
}

module.exports = new ProductVersionDetector();
