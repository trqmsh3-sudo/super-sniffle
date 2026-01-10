const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Data Collector - אוסף נתונים על מוצרים מהאינטרנט
 * משתמש ב-Gemini AI עם Web Search capabilities
 */
class DataCollector {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is required');
    }

    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ 
      model: 'gemini-pro'
    });
  }

  /**
   * איסוף נתונים על מוצר
   * @param {string} productName - שם המוצר
   * @returns {Promise<Object>} נתוני המוצר
   */
  async collectProductData(productName) {
    console.log(`\n🔍 Collecting data for: "${productName}"`);
    console.log('━'.repeat(50));

    try {
      // בניית prompt מפורט ל-Gemini
      const prompt = this.buildPrompt(productName);
      
      console.log('Step 1/3: Sending request to Gemini...');
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log('Step 2/3: Parsing response...');
      const data = this.parseResponse(text);

      console.log('Step 3/3: Validating data...');
      const validated = this.validateData(data);

      console.log(`✅ Collected ${validated.pros.length} pros, ${validated.cons.length} cons`);
      console.log(`📊 Overall sentiment: ${validated.overall_sentiment}`);
      console.log(`🎯 Confidence: ${validated.confidence}%`);

      return validated;

    } catch (error) {
      console.error('❌ Collection error:', error.message);
      
      // Fallback - מחזיר נתונים בסיסיים
      return this.getFallbackData(productName, error);
    }
  }

  /**
   * בניית prompt מפורט ל-Gemini
   */
  buildPrompt(productName) {
    return `
You are a product research analyst. Analyze the product: "${productName}"

Based on your knowledge (you don't need live web search), provide a comprehensive analysis including:

1. **Overall Sentiment**: Determine if the general opinion is positive, negative, or mixed
2. **Common Pros**: List 5-10 things people commonly praise about this product
3. **Common Cons**: List 5-10 things people commonly complain about
4. **Reliability Issues**: Any known failures, defects, or quality problems
5. **Value Assessment**: Is it worth the money based on typical pricing?
6. **Summary**: A brief 2-3 sentence summary of the product
7. **Confidence**: Rate your confidence in this analysis (0-100)

Return ONLY valid JSON in this exact format:
{
  "sources_found": <number_estimate>,
  "overall_sentiment": "positive|negative|mixed",
  "pros": ["pro 1", "pro 2", "pro 3", ...],
  "cons": ["con 1", "con 2", "con 3", ...],
  "common_issues": ["issue 1", "issue 2", ...],
  "value_rating": "excellent|good|fair|poor",
  "summary": "Your summary here",
  "confidence": <0-100>,
  "typical_price_range": "$XXX - $YYY" or "unknown",
  "best_for": ["use case 1", "use case 2", ...],
  "not_for": ["scenario 1", "scenario 2", ...]
}

DO NOT include any text before or after the JSON. Just the JSON object.
`;
  }

  /**
   * פירוק התגובה של Gemini
   */
  parseResponse(text) {
    try {
      // ניסיון למצוא JSON בתגובה
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        console.warn('⚠️  No JSON found in response, trying full text...');
        return JSON.parse(text);
      }

      return JSON.parse(jsonMatch[0]);

    } catch (error) {
      console.error('❌ JSON parse error:', error.message);
      console.log('Raw response:', text.substring(0, 500));
      throw new Error('Failed to parse Gemini response');
    }
  }

  /**
   * ולידציה של הנתונים
   */
  validateData(data) {
    return {
      sources_found: data.sources_found || 10,
      overall_sentiment: ['positive', 'negative', 'mixed'].includes(data.overall_sentiment) 
        ? data.overall_sentiment 
        : 'mixed',
      pros: Array.isArray(data.pros) ? data.pros : [],
      cons: Array.isArray(data.cons) ? data.cons : [],
      common_issues: Array.isArray(data.common_issues) ? data.common_issues : [],
      value_rating: data.value_rating || 'unknown',
      summary: data.summary || 'No summary available',
      confidence: Math.min(100, Math.max(0, data.confidence || 50)),
      typical_price_range: data.typical_price_range || 'unknown',
      best_for: Array.isArray(data.best_for) ? data.best_for : [],
      not_for: Array.isArray(data.not_for) ? data.not_for : []
    };
  }

  /**
   * נתוני fallback אם יש שגיאה
   */
  getFallbackData(productName, error) {
    console.warn('⚠️  Using fallback data due to error');
    
    return {
      sources_found: 0,
      overall_sentiment: 'mixed',
      pros: [
        'Product exists in the market',
        'Available for purchase'
      ],
      cons: [
        'Limited data available',
        'Unable to gather comprehensive reviews'
      ],
      common_issues: [],
      value_rating: 'unknown',
      summary: `Unable to collect comprehensive data for ${productName}. ${error.message}`,
      confidence: 20,
      typical_price_range: 'unknown',
      best_for: [],
      not_for: [],
      error: error.message
    };
  }
}

module.exports = DataCollector;
