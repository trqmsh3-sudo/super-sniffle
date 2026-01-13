const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Product Validator & Translator
 * מאמת שהמוצר הגיוני ומתרגם מכל שפה לאנגלית
 */
class ProductValidator {
  constructor() {
    if (process.env.GEMINI_API_KEY) {
      this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      this.model = this.gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
      console.log('✅ Product Validator ready (Gemini)');
    } else {
      console.warn('⚠️ GEMINI_API_KEY missing - validator will work in basic mode');
    }
  }

  // ---------------------------------------------------------------------------
  // Heuristics (no-AI) helpers
  // ---------------------------------------------------------------------------

  normalizeForCompare(str) {
    return String(str || '')
      .toLowerCase()
      .replace(/[\u200e\u200f]/g, '') // bidi marks
      .replace(/[^a-z0-9\u0590-\u05FF\s+.-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  getBrandSuggestions(lower) {
    const suggestionsByBrand = {
      jbl: ['JBL Flip 6', 'JBL Charge 5', 'JBL Xtreme 3', 'JBL Tune 760NC', 'JBL Live Pro 2'],
      bose: ['Bose QuietComfort Ultra', 'Bose QuietComfort 45', 'Bose SoundLink Flex', 'Bose SoundLink Revolve II'],
      sony: ['Sony WH-1000XM5', 'Sony WF-1000XM5', 'Sony WH-CH720N', 'Sony LinkBuds S'],
      dyson: ['Dyson V15', 'Dyson V12', 'Dyson Gen5detect', 'Dyson Airwrap'],
      samsung: ['Samsung Galaxy S24', 'Samsung Galaxy S24 Ultra', 'Samsung Galaxy Buds2 Pro', 'Samsung QN90C'],
      apple: ['iPhone 15', 'iPhone 15 Pro', 'MacBook Air M3', 'AirPods Pro 2', 'Apple Watch Series 9'],
    };

    // match whole word brand
    for (const brand of Object.keys(suggestionsByBrand)) {
      if (lower === brand || lower.startsWith(`${brand} `) || lower.includes(` ${brand} `)) {
        return suggestionsByBrand[brand];
      }
    }

    // common Hebrew brand hints
    if (lower.includes('ג׳י בי אל') || lower.includes('גי בי אל') || lower.includes('גיבל') || lower.includes('ג׳בל')) {
      return suggestionsByBrand.jbl;
    }
    if (lower.includes('דייסון')) return suggestionsByBrand.dyson;
    if (lower.includes('סוני')) return suggestionsByBrand.sony;
    if (lower.includes('סמסונג')) return suggestionsByBrand.samsung;
    if (lower.includes('אפל') || lower.includes('אייפון') || lower.includes('איפון')) return suggestionsByBrand.apple;

    return [];
  }

  buildIphoneVariantSuggestions(productName) {
    const normalized = this.normalizeForCompare(productName);
    const m = normalized.match(/\biphone\s*(\d{1,2})\b/);
    if (!m) return [];
    const gen = m[1];
    // If user already specified a variant, don't spam
    const hasVariant = /\b(pro|max|plus|mini|ultra)\b/.test(normalized);
    if (hasVariant) return [];
    return [
      `iPhone ${gen}`,
      `iPhone ${gen} Plus`,
      `iPhone ${gen} Pro`,
      `iPhone ${gen} Pro Max`,
    ];
  }

  buildIphoneFamilySuggestions(productName) {
    const normalized = this.normalizeForCompare(productName);
    const mentionsIphone =
      normalized.includes('iphone') || normalized.includes('אייפון') || normalized.includes('איפון');
    const hasGen = /\biphone\s*\d{1,2}\b/.test(normalized) || /\b\d{1,2}\b/.test(normalized);
    if (!mentionsIphone || hasGen) return [];

    return [
      'iPhone 15',
      'iPhone 15 Pro',
      'iPhone 15 Pro Max',
      'iPhone 15 Plus',
      'iPhone 14',
      'iPhone 14 Pro',
    ];
  }

  isTooGeneric(productName) {
    const raw = String(productName || '').trim();
    const normalized = this.normalizeForCompare(raw);
    if (!normalized) return { tooGeneric: true, reason: 'Product name is empty' };

    const tokens = normalized.split(' ').filter(Boolean);

    // Category-only queries (not a specific product/model)
    const genericCategories = new Set([
      'headphones', 'earbuds', 'speaker', 'speakers', 'laptop', 'smartphone', 'phone', 'tv', 'camera',
      'vacuum', 'vacuum cleaner', 'router', 'printer', 'monitor',
      // Hebrew common categories
      'אוזניות', 'רמקול', 'רמקולים', 'מחשב', 'מחשב נייד', 'טלפון', 'סמארטפון', 'טלוויזיה', 'שואב', 'שואב אבק',
    ]);

    if (tokens.length === 1 && genericCategories.has(tokens[0])) {
      return { tooGeneric: true, reason: 'Query is a category, not a specific product model' };
    }

    // Brand-only queries (e.g., "JBL")
    const knownBrands = new Set([
      'jbl', 'bose', 'sony', 'dyson', 'samsung', 'apple', 'lg', 'philips', 'xiaomi', 'huawei',
      'lenovo', 'asus', 'acer', 'dell', 'hp', 'nintendo', 'playstation', 'xbox', 'logitech',
    ]);

    // Single token, brand-like
    if (tokens.length === 1 && knownBrands.has(tokens[0])) {
      return { tooGeneric: true, reason: 'Query is a brand, not a specific model' };
    }

    // All-caps short tokens are often brands/models; if it's only a brand token, treat as ambiguous
    const isAllCapsShort = /^[A-Z0-9]{2,6}$/.test(raw);
    if (tokens.length === 1 && isAllCapsShort) {
      return { tooGeneric: true, reason: 'Query is too broad (brand-like). Please specify a model.' };
    }

    // iPhone without number is ambiguous
    const mentionsIphoneHeb = normalized.includes('אייפון') || normalized.includes('איפון');
    if (
      (/\biphone\b/.test(normalized) && !/\biphone\s*\d{1,2}\b/.test(normalized)) ||
      (mentionsIphoneHeb && !/\b\d{1,2}\b/.test(normalized))
    ) {
      return { tooGeneric: true, reason: 'Please specify the iPhone model (e.g., iPhone 15 Pro)' };
    }

    return { tooGeneric: false, reason: null };
  }

  /**
   * אימות ותרגום שם מוצר
   * @param {string} productName - שם המוצר בכל שפה
   * @returns {Promise<Object>} { isValid, translatedName, originalName, language, reason, needsDisambiguation?, suggestions? }
   */
  async validateAndTranslate(productName) {
    if (!productName || !productName.trim()) {
      return {
        isValid: false,
        reason: 'Product name is empty',
        originalName: productName,
      };
    }

    const trimmed = productName.trim();

    // אם אין Gemini, נעבור רק בדיקות בסיסיות
    if (!this.model) {
      return this.basicValidation(trimmed);
    }

    try {
      const prompt = `You are a product name validator and translator.

Task: Analyze the following input and determine:
1. Is it a REAL PRODUCT NAME (electronics, appliances, gadgets, etc.)?
2. What language is it in?
3. What is the English translation/transliteration?
4. Is it TOO BROAD / AMBIGUOUS (brand-only like "JBL", category-only like "headphones", or missing model number like "iPhone")? If so, return model suggestions.

Input: "${trimmed}"

Rules:
- REJECT: Random words (lemon, test, hello, etc.)
- REJECT: Nonsense or gibberish
- REJECT: Too short (< 2 characters)
- ACCEPT: Real product names in ANY language
- ACCEPT: Product models (iPhone 15, Galaxy S24, etc.)
- If input is TOO BROAD/AMBIGUOUS, set needsDisambiguation=true and provide 4-8 specific model suggestions.

Examples:
- "איפון 15" → VALID (Hebrew for iPhone 15)
- "Айфон 17" → VALID (Russian for iPhone 17)
- "लैपटॉप" → VALID (Hindi for Laptop)
- "לימון" → INVALID (Hebrew for lemon - not a product)
- "test" → INVALID (not a product)
- "בדיקה" → INVALID (Hebrew for test - not a product)
- "JBL" → needsDisambiguation=true, suggestions like "JBL Charge 5", "JBL Flip 6"...
- "iPhone" → needsDisambiguation=true, suggestions like "iPhone 15", "iPhone 15 Pro"...

Return ONLY valid JSON (no markdown):
{
  "isValid": true/false,
  "needsDisambiguation": true/false,
  "suggestions": ["specific model 1", "specific model 2"],
  "translatedName": "English product name",
  "originalName": "original input",
  "language": "detected language",
  "reason": "explanation if invalid"
}`;

      const result = await this.model.generateContent(prompt);
      const text = result.response.text().trim();
      
      // נסה לנקות markdown אם יש
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      const parsed = JSON.parse(cleaned);

      return {
        isValid: parsed.isValid === true,
        translatedName: parsed.translatedName || trimmed,
        originalName: trimmed,
        language: parsed.language || 'unknown',
        reason: parsed.reason || null,
        needsDisambiguation: parsed.needsDisambiguation === true,
        suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
      };

    } catch (error) {
      console.warn('⚠️ AI validation failed, using basic validation:', error.message);
      // Fallback לבדיקה בסיסית
      return this.basicValidation(trimmed);
    }
  }

  /**
   * בדיקה בסיסית ללא AI (fallback)
   */
  basicValidation(productName) {
    const trimmed = productName.trim();

    // בדיקות בסיסיות
    if (trimmed.length < 2) {
      return {
        isValid: false,
        reason: 'Product name too short',
        originalName: trimmed,
      };
    }

    // רשימה שחורה של מילים נפוצות שאינן מוצרים
    const blacklist = [
      'test', 'testing', 'בדיקה', 'טסט',
      'hello', 'hi', 'שלום',
      'lemon', 'לימון',
      'תפוח',
      'banana', 'בננה',
      'orange', 'תפוז',
      'example', 'דוגמה',
      'sample', 'מדגם',
      'asdf', 'qwerty',
      '123', '111', '000',
    ];

    const lower = trimmed.toLowerCase();
    if (blacklist.includes(lower)) {
      return {
        isValid: false,
        reason: `"${trimmed}" is not a valid product name`,
        originalName: trimmed,
      };
    }

    // תרגום בסיסי של מוצרים נפוצים (fallback כשאין AI)
    const translations = {
      'איפון': 'iPhone',
      'אייפון': 'iPhone',
      'איפד': 'iPad',
      'מקבוק': 'MacBook',
      'אייר פודס': 'AirPods',
      'אפל ווטש': 'Apple Watch',
      'סמסונג': 'Samsung',
      'גלקסי': 'Galaxy',
    };

    let translatedName = trimmed;
    let language = 'unknown';

    // נסה למצוא תרגום
    for (const [hebrew, english] of Object.entries(translations)) {
      if (trimmed.includes(hebrew)) {
        translatedName = trimmed.replace(hebrew, english);
        language = 'Hebrew';
        break;
      }
    }

    // אם עבר את הבדיקות הבסיסיות - נאשר
    const specificity = this.isTooGeneric(translatedName);
    if (specificity.tooGeneric) {
      const lower = this.normalizeForCompare(translatedName);
      const suggestions = [
        ...this.buildIphoneVariantSuggestions(translatedName),
        ...this.buildIphoneFamilySuggestions(translatedName),
        ...this.getBrandSuggestions(lower),
      ];

      return {
        isValid: false,
        needsDisambiguation: true,
        suggestions: Array.from(new Set(suggestions)).slice(0, 8),
        reason: specificity.reason || 'Query is too broad. Please specify a model.',
        originalName: trimmed,
        translatedName,
        language,
      };
    }

    return {
      isValid: true,
      translatedName: translatedName,
      originalName: trimmed,
      language: language,
      reason: language !== 'unknown' ? 'Translated using basic dictionary' : 'Basic validation passed (AI unavailable)',
    };
  }

  /**
   * בדיקה מהירה - האם שם המוצר נראה תקין
   * (ללא תרגום, רק בדיקה מהירה)
   */
  async quickCheck(productName) {
    const result = await this.validateAndTranslate(productName);
    return result.isValid;
  }
}

module.exports = new ProductValidator();
