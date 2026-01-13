const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Simple AI Service - Gemini ONLY (Expert Analysis)
 * נותק Claude (יקר) - עוברים ל-Gemini עם Expert Analysis
 */
class SimpleAI {
  constructor() {
    // Gemini only
    if (process.env.GEMINI_API_KEY) {
      this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      this.model = this.gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
      console.log('✅ Gemini ready (Expert Analysis mode)');
    } else {
      // Do not crash the server if the key is missing in some environments.
      // We'll fall back to a safe "limited data" dossier.
      this.model = null;
      console.warn('⚠️ GEMINI_API_KEY is missing - using limited fallback analysis');
    }
  }

  sanitizeText(input) {
    if (typeof input !== 'string') return '';
    let s = input.trim();

    // Strip common LLM/tooling disclaimers that sometimes leak into the UI.
    const patterns = [
      /web\s*search\s*unavailable\.?/gi,
      /search\s*unavailable\.?/gi,
      /no\s+internet\.?/gi,
      /cannot\s+access\s+the\s+internet\.?/gi,
      /i\s+(do\s+not|don't)\s+have\s+access\s+to\s+the\s+internet\.?/gi,
      /analysis\s+unavailable\.?/gi,
      /using\s+general\s+knowledge\s+only\.?/gi,
      /as\s+an\s+ai[^.]*\./gi,
    ];

    for (const re of patterns) s = s.replace(re, ' ');

    // Normalize whitespace
    s = s.replace(/\s+/g, ' ').trim();

    // Guard against returning just punctuation/empty
    if (!s || /^[\W_]+$/.test(s)) return '';
    return s;
  }

  sanitizeStringArray(arr) {
    if (!Array.isArray(arr)) return [];
    const cleaned = arr
      .map((x) => this.sanitizeText(String(x ?? '')))
      .filter(Boolean);
    // de-dupe while keeping order
    return Array.from(new Set(cleaned));
  }

  sanitizePayload(data) {
    if (!data || typeof data !== 'object') return this.basicFallback('');
    return {
      ...data,
      summary: this.sanitizeText(data.summary) || this.basicFallback('').summary,
      pros: this.sanitizeStringArray(data.pros),
      cons: this.sanitizeStringArray(data.cons),
      common_issues: this.sanitizeStringArray(data.common_issues),
      best_for: this.sanitizeStringArray(data.best_for),
      not_for: this.sanitizeStringArray(data.not_for),
    };
  }

  /**
   * 🆕 NEW FLOW: Gemini as Editor
   * קבל aggregated data מ-Reddit/YouTube/Amazon ורק עדכן/שפר אותו
   */
  async editDossier(aggregatedData) {
    const productName = aggregatedData.productName;
    console.log(`✍️ Gemini Editor: Refining analysis for "${productName}" based on ${aggregatedData.totalReviews} real reviews`);
    
    if (!this.model) {
      console.warn('⚠️ No Gemini API - using raw aggregated data');
      return this.convertAggregatedToFormat(aggregatedData);
    }

    try {
      const prompt = `You are an expert product analyst. I have collected and analyzed ${aggregatedData.totalReviews} real user reviews for "${productName}" from Reddit.

RAW DATA FROM REAL REVIEWS:

Sentiment Analysis:
- Overall sentiment: ${aggregatedData.sentiment.overall.toFixed(2)} (-1 = very negative, +1 = very positive)
- ${aggregatedData.sentiment.percentPositive}% positive reviews
- ${aggregatedData.sentiment.percentNegative}% negative reviews

Extracted Pros (from positive reviews):
${aggregatedData.pros.map((p, i) => `${i + 1}. ${p}`).join('\n')}

Extracted Cons (from negative reviews):
${aggregatedData.cons.map((c, i) => `${i + 1}. ${c}`).join('\n')}

Common Issues (mentioned multiple times):
${aggregatedData.commonIssues.map((issue, i) => `${i + 1}. ${issue}`).join('\n')}

Top Patterns (repeating phrases in reviews):
${aggregatedData.patterns.slice(0, 5).map(p => `- "${p.pattern}" (${p.frequency} times)`).join('\n')}

YOUR TASK:
1. **Refine and improve** the extracted pros/cons (make them clearer, more specific)
2. **Add missing insights** from your knowledge of this product
3. **Identify time-based patterns** (when do issues appear?)
4. **Predict future issues** based on known problems
5. **Suggest who should/shouldn't buy** based on the data

CRITICAL RULES:
- **USE THE REAL DATA** - these are from actual Reddit users!
- DO NOT ignore the extracted pros/cons/issues
- DO NOT say "limited data" - we have ${aggregatedData.totalReviews} real reviews!
- BE SPECIFIC with timeframes (e.g., "after 6 months", "within first year")
- If sentiment is ${aggregatedData.sentiment.overall > 0.3 ? 'positive' : aggregatedData.sentiment.overall < -0.3 ? 'negative' : 'mixed'}, the summary should reflect that

Return ONLY JSON (no markdown):
{
  "summary": "Concise summary reflecting the ${aggregatedData.sentiment.percentPositive}% positive / ${aggregatedData.sentiment.percentNegative}% negative split",
  "pros": ["Refined pro 1", "Refined pro 2", "Added insight pro 3"],
  "cons": ["Refined con 1", "Refined con 2", "Added insight con 3"],
  "common_issues": ["Specific issue with timeframe", "Another issue"],
  "best_for": ["User type 1", "User type 2"],
  "not_for": ["User type 1", "User type 2"],
  "patterns": {
    "time_based": ["Issue X appears after Y months"],
    "correlations": ["Users who do X also experience Y"],
    "hidden_issues": ["Non-obvious problems from the data"]
  },
  "predictions": {
    "future_issues": ["Predicted problem 1", "Predicted problem 2"],
    "value_trend": "improving/stable/declining",
    "obsolescence_risk": "low/medium/high"
  },
  "overall_sentiment": "positive/mixed/negative",
  "value_rating": "excellent/good/fair/poor",
  "confidence": ${Math.min(95, aggregatedData.confidence + 10)}
}`;

      const result = await this.model.generateContent(prompt);
      const text = (await result.response).text().trim();
      
      console.log('📥 Gemini refined response (preview):', text.substring(0, 200) + '...');
      
      // Clean JSON
      let cleanText = text
        .replace(/```json\n?/g, '')
        .replace(/```\n?$/g, '')
        .trim();
      
      const jsonStart = cleanText.indexOf('{');
      const jsonEnd = cleanText.lastIndexOf('}');
      
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        cleanText = cleanText.substring(jsonStart, jsonEnd + 1);
      }
      
      const data = JSON.parse(cleanText);
      
      // Ensure all fields exist
      if (!data.patterns) data.patterns = {};
      if (!data.predictions) data.predictions = {};
      
      console.log('✅ Gemini editing complete!');
      return this.sanitizePayload(data);
      
    } catch (error) {
      console.error('❌ Gemini editing failed:', error.message);
      console.warn('⚠️ Falling back to raw aggregated data');
      return this.convertAggregatedToFormat(aggregatedData);
    }
  }

  /**
   * המר aggregated data לפורמט של dossier (fallback)
   */
  convertAggregatedToFormat(aggregatedData) {
    const sentimentLabel = aggregatedData.sentiment.overall > 0.3 ? 'positive' 
                         : aggregatedData.sentiment.overall < -0.3 ? 'negative' 
                         : 'mixed';
    
    return {
      summary: aggregatedData.summary,
      pros: aggregatedData.pros.slice(0, 8),
      cons: aggregatedData.cons.slice(0, 8),
      common_issues: aggregatedData.commonIssues.slice(0, 5),
      best_for: [
        'Users seeking real community feedback',
        aggregatedData.sentiment.percentPositive > 70 ? 'Users looking for reliable products' : 'Users who can tolerate some issues'
      ],
      not_for: [
        aggregatedData.sentiment.percentNegative > 30 ? 'Users needing flawless products' : 'Users seeking budget options',
        'Users needing official manufacturer info'
      ],
      patterns: {
        time_based: [],
        correlations: [],
        hidden_issues: []
      },
      predictions: {
        future_issues: [],
        value_trend: 'stable',
        obsolescence_risk: 'unknown'
      },
      overall_sentiment: sentimentLabel,
      value_rating: aggregatedData.sentiment.percentPositive > 70 ? 'good' : 'fair',
      confidence: aggregatedData.confidence
    };
  }

  /**
   * OLD FLOW: בנה דוסייה עם Expert Analysis (Gemini)
   * זה נשאר לbackward compatibility אבל לא משמש יותר
   * @deprecated - use editDossier(aggregatedData) instead
   */
  async buildDossier(productName) {
    console.log(`🤖 Building dossier with Gemini Expert Analysis: ${productName}`);
    
    if (!this.model) {
      console.warn('⚠️ No Gemini API - returning basic data');
      return this.basicFallback(productName);
    }

    try {
      const prompt = `You are a product research expert. Analyze "${productName}" using your knowledge of user reviews, common issues, and product specifications.

CRITICAL RULES:
- DO NOT say "I don't have access to real-time data" or "limited data"
- DO NOT use generic phrases like "widely available" or "strong brand presence"
- BE SPECIFIC: mention actual features, known issues, price ranges
- USE YOUR KNOWLEDGE: if you know this product, provide real insights
- If you truly don't know this product, set confidence to 20 and be honest

Example for "Apple AirPods Pro":
{
  "summary": "Premium noise-canceling earbuds with excellent ANC and spatial audio, but prone to rattling issues in some units after 6-12 months of use.",
  "pros": ["Industry-leading active noise cancellation", "Comfortable fit with multiple tip sizes", "Seamless integration with Apple devices", "Good battery life (4.5hrs with ANC)"],
  "cons": ["Premium price ($249)", "ANC can cause ear pressure for some users", "Rattling/crackling issues reported after 6+ months", "Lightning charging (not USB-C on older models)"],
  "common_issues": ["Rattling/crackling sound after 6-12 months (hardware defect)", "Firmware updates causing ANC degradation", "Battery degradation after 2 years"],
  "best_for": ["Apple ecosystem users", "Commuters needing strong ANC", "Frequent travelers", "Podcast/audiobook listeners"],
  "not_for": ["Budget-conscious buyers", "Android-primary users", "Those seeking audiophile sound quality", "People sensitive to ear pressure from ANC"],
  "patterns": {
    "time_based": ["Rattling issues typically appear 6-12 months after purchase", "Battery capacity drops noticeably after 18-24 months"],
    "correlations": ["Heavy ANC users report faster battery degradation", "Gym users more likely to experience moisture damage"],
    "hidden_issues": ["AppleCare+ often needed due to rattling issue prevalence", "Firmware updates can't be rolled back"]
  },
  "predictions": {
    "future_issues": ["USB-C version renders Lightning model outdated", "Battery replacement cost high after warranty"],
    "value_trend": "declining",
    "obsolescence_risk": "medium"
  },
  "overall_sentiment": "positive",
  "value_rating": "good",
  "confidence": 85
}

Now analyze "${productName}" - be SPECIFIC and HONEST:

Return ONLY JSON (no markdown):`;

      const result = await this.model.generateContent(prompt);
      const text = (await result.response).text().trim();
      
      console.log('📥 Gemini response:', text.substring(0, 300) + '...');
      
      // Clean JSON (remove markdown code blocks)
      let cleanText = text
        .replace(/```json\n?/g, '')
        .replace(/```\n?$/g, '')
        .trim();
      
      const jsonStart = cleanText.indexOf('{');
      const jsonEnd = cleanText.lastIndexOf('}');
      
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        cleanText = cleanText.substring(jsonStart, jsonEnd + 1);
      }
      
      const data = JSON.parse(cleanText);
      
      // Ensure all fields exist (for backward compatibility)
      if (!data.patterns) data.patterns = {};
      if (!data.predictions) data.predictions = {};
      
      console.log('✅ Expert analysis complete!');
      return this.sanitizePayload(data);
      
    } catch (error) {
      console.error('❌ Gemini analysis failed:', error.message);
      return this.basicFallback(productName);
    }
  }

  /**
   * Fallback without AI
   */
  basicFallback(productName) {
    return {
      summary: `${productName} — early analysis (limited verified review data right now).`,
      pros: [
        'Widely available',
        'Strong brand presence',
        'Plenty of user discussion online'
      ],
      cons: [
        'Not enough verified review signals yet',
        'Details may change as more data is collected'
      ],
      common_issues: ['Limited data available'],
      best_for: ['General users seeking popular products'],
      not_for: ['Those needing detailed verified reviews'],
      patterns: {},
      predictions: {},
      overall_sentiment: 'mixed',
      value_rating: 'fair',
      confidence: 30
    };
  }

  /**
   * זהה מוצר - Gemini (cheap)
   */
  async identifyProduct(query) {
    if (!this.gemini) {
      return { name: query, category: 'general' };
    }

    const prompt = `Extract product name from: "${query}"
Return ONLY JSON: {"name": "Full Product Name", "category": "category"}`;

    try {
      const result = await this.model.generateContent(prompt);
      const text = (await result.response).text().trim();
      let cleanText = text.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
      return JSON.parse(cleanText);
    } catch (error) {
      return { name: query, category: 'general' };
    }
  }
}

module.exports = SimpleAI;
