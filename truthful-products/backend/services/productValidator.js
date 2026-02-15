const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Product Validator & Translator — V3.0 (Input Guardian)
 * 
 * Multi-layer validation:
 * 1. Structural checks (length, characters, entropy)
 * 2. Blacklist / known-nonsense detection
 * 3. Brand/category detection with smart suggestions
 * 4. Gemini AI validation & translation (when available)
 * 5. Pre-flight Reddit check (optional, for build flow)
 */
class ProductValidator {
  constructor() {
    if (process.env.GEMINI_API_KEY) {
      this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      this.model = this.gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
      console.log('✅ Product Validator ready (Gemini + Input Guardian)');
    } else {
      console.warn('⚠️ GEMINI_API_KEY missing - validator will work in basic mode');
    }
  }

  // ---------------------------------------------------------------------------
  // Normalization helpers
  // ---------------------------------------------------------------------------

  normalizeForCompare(str) {
    return String(str || '')
      .toLowerCase()
      .replace(/[\u200e\u200f]/g, '') // bidi marks
      .replace(/[^a-z0-9\u0590-\u05FF\s+.-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // ---------------------------------------------------------------------------
  // Structural validation (no AI needed)
  // ---------------------------------------------------------------------------

  /**
   * Calculate Shannon entropy — detects random gibberish.
   * Real product names: entropy ~2.5-3.5 | Random: ~3.8+
   */
  calculateEntropy(str) {
    const s = str.toLowerCase().replace(/\s/g, '');
    if (s.length === 0) return 0;
    const freq = {};
    for (const c of s) freq[c] = (freq[c] || 0) + 1;
    let entropy = 0;
    for (const c in freq) {
      const p = freq[c] / s.length;
      entropy -= p * Math.log2(p);
    }
    return entropy;
  }

  /**
   * Check for 5+ consecutive consonants — sign of gibberish
   */
  hasExcessiveConsonants(str) {
    const cleaned = str.toLowerCase().replace(/[^a-z]/g, '');
    if (cleaned.length < 4) return false;
    return /[^aeiou]{5,}/i.test(cleaned);
  }

  /**
   * Check character composition — reject mostly-special or all-digit strings
   */
  hasInvalidCharacterRatio(str) {
    const cleaned = str.replace(/\s/g, '');
    if (cleaned.length === 0) return true;
    const letters = (cleaned.match(/[a-zA-Z\u0590-\u05FF]/g) || []).length;
    const digits = (cleaned.match(/\d/g) || []).length;
    const special = cleaned.length - letters - digits;
    if (special / cleaned.length > 0.6) return true;
    if (letters === 0 && digits > 0) return true;
    return false;
  }

  /**
   * Structural validation — catches obvious gibberish without AI
   */
  structuralValidation(input) {
    const trimmed = String(input || '').trim();
    if (trimmed.length < 2) return { valid: false, reason: 'Product name too short' };
    if (trimmed.length > 150) return { valid: false, reason: 'Product name too long' };
    if (this.hasInvalidCharacterRatio(trimmed)) {
      return { valid: false, reason: 'Input contains too many special characters or is not a valid product name' };
    }
    // Entropy check for single-word Latin inputs
    const isLatin = /^[a-zA-Z0-9\s.,+\-()'"!&]+$/.test(trimmed);
    if (isLatin && trimmed.length >= 5) {
      const words = trimmed.split(/\s+/);
      if (words.length === 1) {
        const entropy = this.calculateEntropy(trimmed);
        if (entropy > 4.0 && this.hasExcessiveConsonants(trimmed)) {
          return { valid: false, reason: 'Input appears to be random characters, not a product name' };
        }
      }
    }
    return { valid: true };
  }

  // ---------------------------------------------------------------------------
  // Blacklist / pattern matching
  // ---------------------------------------------------------------------------

  isBlacklisted(input) {
    const lower = input.toLowerCase().trim();

    const exactBlacklist = [
      'test', 'testing', 'hello', 'hi', 'hey', 'help', 'please', 'thanks',
      'lemon', 'banana', 'orange', 'apple fruit', 'potato', 'tomato',
      'example', 'sample', 'demo', 'foo', 'bar', 'baz',
      'asdf', 'qwerty', 'zxcv', 'aaa', 'bbb', 'abc', 'xyz',
      '123', '111', '000', '1234', '12345',
      'undefined', 'null', 'true', 'false', 'nope', 'nothing',
      'what', 'why', 'how', 'who', 'where', 'when',
      'yes', 'no', 'ok', 'okay', 'sure',
      'fuck', 'shit', 'damn', 'hell', 'ass',
      'haha', 'lol', 'lmao', 'omg', 'wtf',
      'בדיקה', 'טסט', 'שלום', 'מה', 'למה', 'איך', 'מי', 'איפה', 'מתי',
      'לימון', 'בננה', 'תפוז', 'תפוח', 'עגבניה', 'תפוח אדמה',
      'דוגמה', 'מדגם', 'כלום', 'שטויות', 'בלה בלה',
      'כן', 'לא', 'אוקי', 'טוב', 'רע',
    ];

    if (exactBlacklist.includes(lower)) return true;

    const phraseBlacklist = [
      'test product', 'banana phone', 'just testing', 'this is a test',
      'random product', 'fake product', 'not a product', 'nothing real',
      'בדיקת מערכת', 'סתם בדיקה', 'מוצר בדיקה',
    ];
    for (const phrase of phraseBlacklist) {
      if (lower.includes(phrase)) return true;
    }

    // Repeated characters
    if (/^(.)\1{3,}$/.test(lower.replace(/\s/g, ''))) return true;
    if (/^(.{1,3})\1{2,}$/.test(lower.replace(/\s/g, ''))) return true;

    return false;
  }

  // ---------------------------------------------------------------------------
  // Brand & category detection (enhanced)
  // ---------------------------------------------------------------------------

  /** Known brands database */
  get knownBrands() {
    return new Map([
      ['jbl', ['audio', 'JBL Flip 6', 'JBL Charge 5', 'JBL Xtreme 3', 'JBL Tune 760NC', 'JBL Live Pro 2', 'JBL PartyBox 310']],
      ['bose', ['audio', 'Bose QuietComfort Ultra', 'Bose QuietComfort 45', 'Bose SoundLink Flex', 'Bose SoundLink Revolve+']],
      ['sony', ['electronics', 'Sony WH-1000XM5', 'Sony WF-1000XM5', 'Sony WH-CH720N', 'Sony LinkBuds S', 'Sony A7 IV', 'Sony PS5']],
      ['dyson', ['appliances', 'Dyson V15', 'Dyson V12', 'Dyson Gen5detect', 'Dyson Airwrap', 'Dyson Supersonic']],
      ['samsung', ['electronics', 'Samsung Galaxy S24 Ultra', 'Samsung Galaxy S24', 'Samsung Galaxy Buds2 Pro', 'Samsung QN90C TV']],
      ['apple', ['electronics', 'iPhone 16 Pro', 'iPhone 16', 'MacBook Air M3', 'AirPods Pro 2', 'Apple Watch Ultra 2', 'iPad Pro M4']],
      ['lg', ['electronics', 'LG C4 OLED', 'LG G4 OLED', 'LG Gram 17', 'LG CordZero A9']],
      ['philips', ['electronics', 'Philips Hue Starter Kit', 'Philips OneBlade', 'Philips Sonicare 9900']],
      ['xiaomi', ['electronics', 'Xiaomi 14 Ultra', 'Xiaomi Redmi Note 13', 'Xiaomi Robot Vacuum X10+']],
      ['huawei', ['electronics', 'Huawei MatePad Pro', 'Huawei Watch GT 4', 'Huawei FreeBuds Pro 3']],
      ['lenovo', ['computers', 'Lenovo ThinkPad X1 Carbon', 'Lenovo Legion Pro 5', 'Lenovo Tab P12 Pro']],
      ['asus', ['computers', 'ASUS ROG Zephyrus G14', 'ASUS ZenBook 14', 'ASUS ROG Ally']],
      ['acer', ['computers', 'Acer Swift Go 14', 'Acer Predator Helios 16', 'Acer Nitro V']],
      ['dell', ['computers', 'Dell XPS 15', 'Dell Inspiron 16', 'Dell Alienware m18']],
      ['hp', ['computers', 'HP Spectre x360', 'HP Envy 16', 'HP Omen 16']],
      ['microsoft', ['electronics', 'Surface Pro 10', 'Surface Laptop 6', 'Xbox Series X', 'Xbox Controller']],
      ['nintendo', ['gaming', 'Nintendo Switch OLED', 'Nintendo Switch 2', 'Nintendo Pro Controller']],
      ['logitech', ['peripherals', 'Logitech MX Master 3S', 'Logitech G Pro X Superlight', 'Logitech C920']],
      ['razer', ['gaming', 'Razer DeathAdder V3', 'Razer BlackWidow V4', 'Razer Kraken V3']],
      ['google', ['electronics', 'Google Pixel 9 Pro', 'Google Pixel Buds Pro 2', 'Google Nest Hub Max']],
      ['amazon', ['electronics', 'Amazon Echo Dot 5', 'Amazon Kindle Paperwhite', 'Amazon Fire TV Stick 4K']],
      ['anker', ['accessories', 'Anker PowerCore 26800', 'Anker Soundcore Liberty 4', 'Anker 737 Charger']],
      ['sennheiser', ['audio', 'Sennheiser Momentum 4', 'Sennheiser HD 660S2', 'Sennheiser IE 600']],
      ['marshall', ['audio', 'Marshall Stanmore III', 'Marshall Major IV', 'Marshall Emberton II']],
      ['sonos', ['audio', 'Sonos Era 300', 'Sonos Beam Gen 2', 'Sonos Roam 2', 'Sonos Arc']],
      ['jabra', ['audio', 'Jabra Elite 10', 'Jabra Elite 85t', 'Jabra Evolve2 75']],
      ['beats', ['audio', 'Beats Studio Pro', 'Beats Fit Pro', 'Beats Solo 4']],
      ['irobot', ['appliances', 'iRobot Roomba j9+', 'iRobot Roomba Combo', 'iRobot Braava Jet m6']],
      ['roborock', ['appliances', 'Roborock S8 Pro Ultra', 'Roborock Q Revo', 'Roborock S7 MaxV']],
      ['nikon', ['cameras', 'Nikon Z8', 'Nikon Z6 III', 'Nikon Z50']],
      ['canon', ['cameras', 'Canon R5 II', 'Canon R6 Mark II', 'Canon R50']],
      ['fujifilm', ['cameras', 'Fujifilm X-T5', 'Fujifilm X100VI', 'Fujifilm X-S20']],
      ['garmin', ['wearables', 'Garmin Fenix 8', 'Garmin Venu 3', 'Garmin Forerunner 965']],
      ['fitbit', ['wearables', 'Fitbit Charge 6', 'Fitbit Sense 2', 'Fitbit Versa 4']],
      ['oneplus', ['electronics', 'OnePlus 12', 'OnePlus Buds Pro 2', 'OnePlus Watch 2']],
      ['nothing', ['electronics', 'Nothing Phone 2a', 'Nothing Ear 2', 'Nothing CMF Phone 1']],
      ['steelseries', ['gaming', 'SteelSeries Arctis Nova Pro', 'SteelSeries Apex Pro', 'SteelSeries Rival 5']],
      ['corsair', ['gaming', 'Corsair K70 RGB Pro', 'Corsair HS80 RGB', 'Corsair M65 RGB Ultra']],
      ['nvidia', ['computing', 'NVIDIA RTX 4090', 'NVIDIA RTX 4070 Ti', 'NVIDIA Shield TV Pro']],
      ['dji', ['cameras', 'DJI Mini 4 Pro', 'DJI Air 3', 'DJI Osmo Pocket 3', 'DJI Action 4']],
      ['gopro', ['cameras', 'GoPro Hero 12 Black', 'GoPro Hero 11 Mini']],
      ['tesla', ['automotive', 'Tesla Model 3', 'Tesla Model Y', 'Tesla Cybertruck']],
      ['instant pot', ['appliances', 'Instant Pot Duo Plus 6qt', 'Instant Pot Pro Plus']],
      ['ninja', ['appliances', 'Ninja Foodi 14-in-1', 'Ninja Creami', 'Ninja Air Fryer Pro']],
      ['breville', ['appliances', 'Breville Barista Express', 'Breville Smart Oven Air']],
      ['meta', ['gaming', 'Meta Quest 3', 'Meta Quest Pro', 'Meta Ray-Ban Smart Glasses']],
    ]);
  }

  /** Hebrew brand aliases */
  get hebrewBrandAliases() {
    return {
      'ג׳י בי אל': 'jbl', 'גי בי אל': 'jbl', 'גיבל': 'jbl', 'ג׳בל': 'jbl',
      'דייסון': 'dyson', 'סוני': 'sony', 'סמסונג': 'samsung',
      'אפל': 'apple', 'אייפון': 'apple', 'איפון': 'apple',
      'לנובו': 'lenovo', 'אסוס': 'asus', 'דל': 'dell',
      'לוג׳יטק': 'logitech', 'לוגיטק': 'logitech',
      'גוגל': 'google', 'אמזון': 'amazon',
      'שיאומי': 'xiaomi', 'פיליפס': 'philips',
      'בוזה': 'bose', 'בוז': 'bose',
      'מרשל': 'marshall', 'סנהייזר': 'sennheiser',
      'סונוס': 'sonos', 'ג׳ברה': 'jabra', 'גברה': 'jabra',
      'ביטס': 'beats', 'אנקר': 'anker',
      'רובורוק': 'roborock',
      'ניקון': 'nikon', 'קנון': 'canon',
      'גארמין': 'garmin', 'פיטביט': 'fitbit',
      'נינטנדו': 'nintendo', 'מיקרוסופט': 'microsoft',
      'נווידיה': 'nvidia', 'אינטל': 'intel',
      'טסלה': 'tesla', 'גופרו': 'gopro',
    };
  }

  /** Generic categories */
  get genericCategories() {
    return new Set([
      'headphones', 'earbuds', 'earphones', 'speaker', 'speakers', 'soundbar',
      'laptop', 'laptops', 'computer', 'computers', 'desktop', 'tablet', 'tablets',
      'smartphone', 'phone', 'phones', 'cellphone', 'mobile',
      'tv', 'television', 'monitor', 'monitors', 'display',
      'camera', 'cameras', 'lens', 'lenses',
      'keyboard', 'keyboards', 'mouse', 'mice',
      'vacuum', 'vacuum cleaner', 'robot vacuum',
      'router', 'routers', 'modem',
      'printer', 'printers', 'scanner',
      'watch', 'watches', 'smartwatch',
      'drone', 'drones', 'charger', 'chargers', 'cable', 'cables',
      'microphone', 'webcam',
      'blender', 'mixer', 'toaster', 'oven', 'air fryer',
      'refrigerator', 'fridge', 'dishwasher', 'washer', 'dryer',
      'אוזניות', 'רמקול', 'רמקולים', 'מחשב', 'מחשב נייד', 'טאבלט',
      'טלפון', 'סמארטפון', 'טלוויזיה', 'מסך', 'מצלמה',
      'מקלדת', 'עכבר', 'שואב', 'שואב אבק', 'רובוט שואב',
      'מדפסת', 'נתב', 'שעון', 'שעון חכם',
      'דרון', 'מטען', 'כבל', 'מיקרופון', 'מצלמת רשת',
      'בלנדר', 'מיקסר', 'טוסטר', 'תנור', 'מקרר', 'מדיח',
    ]);
  }

  resolveHebrewBrand(input) {
    const lower = input.toLowerCase().trim();
    for (const [heb, eng] of Object.entries(this.hebrewBrandAliases)) {
      if (lower === heb || lower.startsWith(heb + ' ') || lower.includes(' ' + heb + ' ') || lower.endsWith(' ' + heb)) {
        return eng;
      }
    }
    return null;
  }

  detectBrand(input) {
    const normalized = this.normalizeForCompare(input);
    const tokens = normalized.split(' ').filter(Boolean);

    // Hebrew aliases
    const hebrewBrand = this.resolveHebrewBrand(input);
    if (hebrewBrand) {
      const brandData = this.knownBrands.get(hebrewBrand);
      if (brandData) {
        let remaining = normalized;
        for (const [heb] of Object.entries(this.hebrewBrandAliases)) {
          remaining = remaining.replace(heb, '').trim();
        }
        if (!remaining || this.genericCategories.has(remaining)) return hebrewBrand;
      }
    }

    // English brand names
    for (const [brand] of this.knownBrands) {
      if (normalized === brand) return brand;
      if (tokens.length === 2 && tokens[0] === brand && this.genericCategories.has(tokens[1])) return brand;
      if (tokens.length === 2 && tokens[1] === brand && this.genericCategories.has(tokens[0])) return brand;
    }

    // All-caps short
    const isAllCapsShort = /^[A-Z0-9]{2,6}$/.test(String(input || '').trim());
    if (tokens.length === 1 && isAllCapsShort && this.knownBrands.has(tokens[0].toLowerCase())) {
      return tokens[0].toLowerCase();
    }

    return null;
  }

  getBrandSuggestions(brandKey) {
    const brandData = this.knownBrands.get(brandKey);
    if (!brandData) return [];
    return brandData.slice(1);
  }

  isTooGeneric(productName) {
    const raw = String(productName || '').trim();
    const normalized = this.normalizeForCompare(raw);
    if (!normalized) return { tooGeneric: true, reason: 'Product name is empty', type: 'empty' };
    const tokens = normalized.split(' ').filter(Boolean);

    if (tokens.length === 1 && this.genericCategories.has(tokens[0])) {
      return { tooGeneric: true, reason: 'Please specify a brand and model (e.g., "Sony WH-1000XM5" instead of "headphones")', type: 'category' };
    }
    if (this.genericCategories.has(normalized)) {
      return { tooGeneric: true, reason: 'Please specify a brand and model', type: 'category' };
    }

    const detectedBrand = this.detectBrand(raw);
    if (detectedBrand) {
      return { tooGeneric: true, reason: `"${raw}" is a brand name. Please specify a specific product model.`, type: 'brand', brand: detectedBrand };
    }

    const mentionsIphoneHeb = normalized.includes('אייפון') || normalized.includes('איפון');
    if (
      (/\biphone\b/i.test(normalized) && !/\biphone\s*\d{1,2}/i.test(normalized)) ||
      (mentionsIphoneHeb && !/\d{1,2}/.test(normalized))
    ) {
      return { tooGeneric: true, reason: 'Please specify the iPhone model (e.g., iPhone 15 Pro)', type: 'ambiguous_model' };
    }

    return { tooGeneric: false, reason: null, type: null };
  }

  buildSuggestions(productName, genericResult) {
    const normalized = this.normalizeForCompare(productName);
    const suggestions = [];

    if (genericResult.type === 'brand' && genericResult.brand) {
      suggestions.push(...this.getBrandSuggestions(genericResult.brand));
    }

    if (genericResult.type === 'ambiguous_model') {
      const m = normalized.match(/\biphone\s*(\d{1,2})\b/);
      if (m) {
        const gen = m[1];
        suggestions.push(`iPhone ${gen}`, `iPhone ${gen} Plus`, `iPhone ${gen} Pro`, `iPhone ${gen} Pro Max`);
      } else {
        suggestions.push('iPhone 16', 'iPhone 16 Pro', 'iPhone 16 Pro Max', 'iPhone 15', 'iPhone 15 Pro');
      }
    }

    return Array.from(new Set(suggestions)).slice(0, 8);
  }

  // ---------------------------------------------------------------------------
  // Hebrew → English translation dictionary (no AI fallback)
  // ---------------------------------------------------------------------------

  get translationDict() {
    return {
      'איפון': 'iPhone', 'אייפון': 'iPhone',
      'איפד': 'iPad', 'אייפד': 'iPad',
      'מקבוק': 'MacBook', 'מק בוק': 'MacBook',
      'אייר פודס': 'AirPods', 'אירפודס': 'AirPods', 'אייר פודז': 'AirPods',
      'אפל ווטש': 'Apple Watch', 'אפל וואטש': 'Apple Watch',
      'גלקסי': 'Galaxy', 'גלאקסי': 'Galaxy',
      'פיקסל': 'Pixel',
      'סוויטש': 'Switch', 'סוויץ': 'Switch',
      'פליי סטיישן': 'PlayStation', 'פלייסטיישן': 'PlayStation',
      'אקס בוקס': 'Xbox', 'אקסבוקס': 'Xbox',
    };
  }

  basicTranslate(input) {
    let result = input;
    let language = 'unknown';
    for (const [heb, eng] of Object.entries(this.hebrewBrandAliases)) {
      if (result.includes(heb)) {
        const capitalized = eng.charAt(0).toUpperCase() + eng.slice(1);
        result = result.replace(new RegExp(heb.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), capitalized);
        language = 'Hebrew';
      }
    }
    for (const [hebrew, english] of Object.entries(this.translationDict)) {
      if (result.includes(hebrew)) {
        result = result.replace(new RegExp(hebrew.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), english);
        language = 'Hebrew';
      }
    }
    if (/[\u0590-\u05FF]/.test(result) && language === 'unknown') language = 'Hebrew';
    return { translated: result.trim(), language };
  }

  // ---------------------------------------------------------------------------
  // Main validation API
  // ---------------------------------------------------------------------------

  async validateAndTranslate(productName) {
    if (!productName || !productName.trim()) {
      return { isValid: false, reason: 'Product name is empty', originalName: productName };
    }

    const trimmed = productName.trim();

    // Layer 1: Structural validation
    const structural = this.structuralValidation(trimmed);
    if (!structural.valid) {
      return { isValid: false, reason: structural.reason, originalName: trimmed };
    }

    // Layer 2: Blacklist check
    if (this.isBlacklisted(trimmed)) {
      return { isValid: false, reason: `"${trimmed}" is not a valid product name`, originalName: trimmed };
    }

    // Layer 3: Brand/category/ambiguity check (fast, no AI)
    const genericCheck = this.isTooGeneric(trimmed);
    if (genericCheck.tooGeneric) {
      const suggestions = this.buildSuggestions(trimmed, genericCheck);
      return {
        isValid: false,
        needsDisambiguation: true,
        isBrand: genericCheck.type === 'brand',
        brand: genericCheck.brand || null,
        suggestions,
        reason: genericCheck.reason,
        originalName: trimmed,
        translatedName: trimmed,
        language: 'unknown',
      };
    }

    // Layer 4: AI validation (Gemini)
    if (this.model) {
      try {
        return await this._geminiValidation(trimmed);
      } catch (error) {
        console.warn('⚠️ Gemini validation failed, using basic validation:', error.message);
        return this._basicFallbackValidation(trimmed);
      }
    }

    // Layer 5: Basic fallback (no AI)
    return this._basicFallbackValidation(trimmed);
  }

  async _geminiValidation(trimmed) {
    const prompt = `You are a product name validator and translator.

Task: Analyze the following user input and determine:
1. Is it a REAL, SPECIFIC PRODUCT NAME (electronics, appliances, gadgets, etc.)?
2. What language is it in?
3. What is the CANONICAL English product name?
4. Is it too broad/ambiguous?

Input: "${trimmed}"

Rules:
- REJECT: Random words, nonsense, gibberish, food items, abstract concepts
- REJECT: Profanity, test inputs
- ACCEPT: Real product names in ANY language (Hebrew, Russian, Hindi, Arabic, etc.)
- ACCEPT: Specific models like "iPhone 15 Pro", "Sony WH-1000XM5"
- If the product EXISTS but the user specified a version that DOESN'T EXIST YET (e.g., "iPhone 20"), still accept it but mark productExists=false
- For Hebrew input: translate to the canonical English product name
- CRITICAL: translatedName must be the EXACT official product name

Return ONLY valid JSON (no markdown):
{
  "isValid": true/false,
  "needsDisambiguation": false,
  "suggestions": [],
  "translatedName": "Canonical English product name",
  "originalName": "${trimmed}",
  "language": "detected language",
  "reason": "explanation if invalid",
  "productExists": true/false,
  "category": "product category"
}`;

    const result = await this.model.generateContent(prompt);
    const text = result.response.text().trim();
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
      productExists: parsed.productExists !== false,
      category: parsed.category || null,
    };
  }

  _basicFallbackValidation(trimmed) {
    const { translated, language } = this.basicTranslate(trimmed);
    const specificity = this.isTooGeneric(translated);
    if (specificity.tooGeneric) {
      const suggestions = this.buildSuggestions(translated, specificity);
      return {
        isValid: false,
        needsDisambiguation: true,
        isBrand: specificity.type === 'brand',
        brand: specificity.brand || null,
        suggestions,
        reason: specificity.reason,
        originalName: trimmed,
        translatedName: translated,
        language,
      };
    }
    return {
      isValid: true,
      translatedName: translated,
      originalName: trimmed,
      language,
      reason: language !== 'unknown' ? 'Translated using basic dictionary' : 'Basic validation passed (AI unavailable)',
    };
  }

  async quickCheck(productName) {
    const result = await this.validateAndTranslate(productName);
    return result.isValid;
  }
}

module.exports = new ProductValidator();
