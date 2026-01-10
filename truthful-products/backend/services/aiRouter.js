const Anthropic = require('@anthropic-ai/sdk');
const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Smart AI Router - מחליט אוטומטית איזה AI להשתמש
 * 
 * אסטרטגיה:
 * - Gemini (חינם): משימות פשוטות, סינון, סיכום
 * - Claude (בתשלום): web search, ניתוח עמוק, תיקים חדשים
 * 
 * חיסכון: 70-80% מעלויות AI!
 */
class SmartAIRouter {
  constructor() {
    // Gemini - חינם עד 60 requests/דקה
    if (process.env.GEMINI_API_KEY) {
      this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      this.geminiModel = this.gemini.getGenerativeModel({ 
        model: 'gemini-1.5-flash' // הכי מהיר!
      });
      console.log('✅ Gemini initialized (FREE)');
    } else {
      console.warn('⚠️  No GEMINI_API_KEY - Gemini features disabled');
    }
    
    // Claude - בתשלום, עם web search
    if (process.env.CLAUDE_API_KEY) {
      this.claude = new Anthropic({
        apiKey: process.env.CLAUDE_API_KEY
      });
      console.log('✅ Claude initialized (PAID)');
    } else {
      console.warn('⚠️  No CLAUDE_API_KEY - Claude features disabled');
    }
    
    // סטטיסטיקות
    this.stats = {
      gemini_calls: 0,
      claude_calls: 0,
      gemini_errors: 0,
      claude_errors: 0,
      money_saved: 0,
      started_at: new Date()
    };
  }

  // ============================================================================
  // ROUTING LOGIC - מי עושה מה?
  // ============================================================================

  /**
   * נתב משימה ל-AI המתאים
   */
  async route(task, data) {
    const complexity = this.assessComplexity(task, data);
    
    if (complexity === 'simple' && this.geminiModel) {
      console.log(`🟢 Routing "${task}" to Gemini (FREE)`);
      return await this.useGemini(task, data);
    } else if (this.claude) {
      console.log(`🔵 Routing "${task}" to Claude (PAID)`);
      return await this.useClaude(task, data);
    } else {
      throw new Error('No AI service available for this task');
    }
  }

  /**
   * הערך את מורכבות המשימה
   */
  assessComplexity(task, data) {
    const simpleTasks = [
      'identify_product',      // זיהוי מוצר מטקסט
      'clean_text',            // ניקוי טקסט
      'filter_spam',           // סינון ספאם
      'summarize_existing',    // סיכום תיק קיים
      'simple_comparison',     // השוואה פשוטה
      'basic_qa',             // שאלות בסיסיות
      'recommend_filter',     // המלצה מסוננת
      'categorize',           // קטגוריזציה
      'extract_features'      // חילוץ מאפיינים
    ];
    
    return simpleTasks.includes(task) ? 'simple' : 'complex';
  }

  // ============================================================================
  // GEMINI - משימות פשוטות (חינם!)
  // ============================================================================

  async useGemini(task, data) {
    this.stats.gemini_calls++;
    this.stats.money_saved += 0.02; // חסכנו $0.02 per call
    
    try {
      const prompt = this.buildGeminiPrompt(task, data);
      const result = await this.geminiModel.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log(`   ✓ Gemini completed (saved $0.02)`);
      return this.parseResponse(text);

    } catch (error) {
      this.stats.gemini_errors++;
      console.error('   ✗ Gemini error:', error.message);
      
      // Fallback to Claude if available
      if (this.claude) {
        console.log('   ↻ Falling back to Claude...');
        return await this.useClaude(task, data);
      }
      
      throw error;
    }
  }

  buildGeminiPrompt(task, data) {
    const prompts = {
      
      identify_product: `
Extract and normalize product information from this query: "${data.query}"

Return ONLY valid JSON in this format:
{
  "name": "Full normalized product name",
  "category": "product category (electronics, appliances, etc)",
  "brand": "brand name",
  "model": "model number or name",
  "confidence": 0-100
}

Example:
Query: "iphone 15 pro max"
Response: {"name":"iPhone 15 Pro Max","category":"smartphones","brand":"Apple","model":"15 Pro Max","confidence":95}
`,

      filter_spam: `
Analyze if this review is spam or genuine:

"${data.text}"

Return ONLY valid JSON:
{
  "is_spam": true/false,
  "reason": "brief explanation",
  "confidence": 0-100,
  "spam_indicators": ["indicator1", "indicator2"]
}

Spam indicators:
- All caps
- Excessive punctuation
- Generic praise without specifics
- Suspicious links
- Too short or too long
- Repetitive text
`,

      summarize_existing: `
Summarize this product dossier in 2-3 sentences for a user:

Product: ${data.product_name}
Overall Score: ${data.overall_score}/100
Pros: ${data.pros ? data.pros.join(', ') : 'None'}
Cons: ${data.cons ? data.cons.join(', ') : 'None'}
Summary: ${data.summary || 'No summary available'}

Return ONLY valid JSON:
{
  "summary": "2-3 sentence summary",
  "recommendation": "recommended|not_recommended|mixed",
  "key_point": "most important thing to know"
}
`,

      simple_comparison: `
Compare these two products based on their scores:

Product A: ${data.productA.name}
- Overall: ${data.productA.overall_score}/100
- Quality: ${data.productA.quality_score}/100
- Value: ${data.productA.value_score}/100

Product B: ${data.productB.name}
- Overall: ${data.productB.overall_score}/100
- Quality: ${data.productB.quality_score}/100
- Value: ${data.productB.value_score}/100

Return ONLY valid JSON:
{
  "winner": "A|B|tie",
  "reason": "brief explanation",
  "better_for_quality": "A|B",
  "better_for_value": "A|B"
}
`,

      basic_qa: `
Answer this question using the product data:

Question: "${data.question}"

Product Data:
${JSON.stringify(data.dossier, null, 2)}

Return ONLY valid JSON:
{
  "answer": "direct answer to the question",
  "confidence": 0-100,
  "source": "which field in the dossier was used"
}

Keep the answer short and direct.
`,

      categorize: `
Categorize this product: "${data.product_name}"

Return ONLY valid JSON:
{
  "category": "electronics|appliances|home|sports|beauty|other",
  "subcategory": "specific subcategory",
  "confidence": 0-100
}
`
    };

    return prompts[task] || `Perform task: ${task}\nData: ${JSON.stringify(data)}`;
  }

  // ============================================================================
  // CLAUDE - משימות מורכבות (בתשלום, עם web search!)
  // ============================================================================

  async useClaude(task, data) {
    this.stats.claude_calls++;
    
    try {
      const result = await this.executeClaudeTask(task, data);
      console.log(`   ✓ Claude completed (cost: ~$0.02)`);
      return result;

    } catch (error) {
      this.stats.claude_errors++;
      console.error('   ✗ Claude error:', error.message);
      throw error;
    }
  }

  async executeClaudeTask(task, data) {
    const tasks = {
      
      // זיהוי מוצר (Fallback מ-Gemini)
      identify_product: async () => {
        const response = await this.claude.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 500,
          messages: [{
            role: 'user',
            content: `Extract product information from: "${data.query}"
            
Return ONLY valid JSON:
{
  "name": "Full product name",
  "category": "category",
  "brand": "brand",
  "model": "model",
  "confidence": 0-100
}`
          }]
        });

        return this.parseResponse(response.content[0].text);
      },

      // בניית תיק חדש - עם web search!
      build_dossier: async () => {
        const response = await this.claude.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4000,
          tools: [{
            type: 'web_search_20250305',
            name: 'web_search'
          }],
          messages: [{
            role: 'user',
            content: `
Search the web for comprehensive reviews and information about: "${data.productName}"

Search for:
1. Reddit discussions (site:reddit.com ${data.productName} review)
2. Amazon reviews if available
3. YouTube reviews
4. Tech blogs and review sites
5. User forums

Extract and analyze:
- Common pros (what people love)
- Common cons (what people complain about)
- Reliability issues and failures
- Value for money opinions
- Overall sentiment

Return ONLY valid JSON:
{
  "sources_found": number,
  "overall_sentiment": "positive|negative|mixed",
  "pros": ["pro1", "pro2", ...],
  "cons": ["con1", "con2", ...],
  "common_issues": ["issue1", "issue2", ...],
  "value_rating": "excellent|good|fair|poor",
  "summary": "2-3 sentence summary",
  "confidence": 0-100,
  "typical_price_range": "$XXX - $YYY",
  "best_for": ["use case 1", "use case 2"],
  "not_for": ["scenario 1", "scenario 2"]
}
`
          }]
        });

        // Parse response
        const content = response.content
          .filter(block => block.type === 'text')
          .map(block => block.text)
          .join('\n');

        return this.parseResponse(content);
      },

      // עדכון תיק קיים עם מידע חדש
      update_dossier: async () => {
        const response = await this.claude.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 3000,
          tools: [{ type: 'web_search_20250305' }],
          messages: [{
            role: 'user',
            content: `
Find NEW information about "${data.productName}" posted in the last ${data.daysSinceUpdate || 30} days.

Current dossier summary:
- Overall score: ${data.currentDossier.overall_score}
- Last updated: ${data.currentDossier.last_updated}
- Known pros: ${data.currentDossier.pros?.length || 0}
- Known cons: ${data.currentDossier.cons?.length || 0}

Search for:
1. Recent reviews and discussions
2. New problems or failures reported
3. Price changes
4. Product updates or revisions

Return ONLY JSON:
{
  "has_updates": true/false,
  "new_pros": ["new pro 1", ...],
  "new_cons": ["new con 1", ...],
  "new_issues": ["new issue 1", ...],
  "price_change": "increased|decreased|stable|unknown",
  "recommendation_change": "upgrade|downgrade|same",
  "summary": "what changed since last update"
}
`
          }]
        });

        const content = response.content
          .filter(block => block.type === 'text')
          .map(block => block.text)
          .join('\n');

        return this.parseResponse(content);
      },

      // ניתוח עמוק של ביקורות
      deep_analysis: async () => {
        const response = await this.claude.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4000,
          messages: [{
            role: 'user',
            content: `
Perform deep analysis on these reviews about "${data.productName}":

${data.reviews?.slice(0, 50).map((r, i) => 
  `Review ${i+1} (${r.rating}/5): ${r.text}`
).join('\n\n')}

Find:
1. Hidden patterns and correlations
2. Rare but critical issues (mentioned by <10% but serious)
3. Long-term reliability concerns
4. Quality control issues (inconsistency between units)
5. Regional or batch-specific problems

Return ONLY JSON:
{
  "hidden_patterns": ["pattern 1", "pattern 2"],
  "rare_critical_issues": [
    {"issue": "...", "frequency": "X%", "severity": "high|medium|low"}
  ],
  "long_term_concerns": ["concern 1", "concern 2"],
  "quality_consistency": "consistent|inconsistent|unknown",
  "regional_issues": {"region": "issue"},
  "overall_reliability_score": 0-100,
  "recommendation": "buy|wait|avoid"
}
`
          }]
        });

        return this.parseResponse(response.content[0].text);
      },

      // שאלה מורכבת
      complex_qa: async () => {
        const response = await this.claude.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2000,
          messages: [{
            role: 'user',
            content: `
Answer this complex question about the product:

Question: "${data.question}"

Product dossier:
${JSON.stringify(data.dossier, null, 2)}

Provide a thoughtful, nuanced answer that considers multiple perspectives.

Return ONLY JSON:
{
  "answer": "detailed answer",
  "reasoning": "why this answer",
  "caveats": ["caveat 1", "caveat 2"],
  "confidence": 0-100
}
`
          }]
        });

        return this.parseResponse(response.content[0].text);
      }
    };

    const taskFunction = tasks[task];
    if (!taskFunction) {
      throw new Error(`Unknown task: ${task}`);
    }

    return await taskFunction();
  }

  // ============================================================================
  // UTILITIES
  // ============================================================================

  /**
   * פרסר אוניברסלי ל-JSON
   */
  parseResponse(text) {
    try {
      // נסה למצוא JSON בתגובה
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // אם אין JSON, החזר את הטקסט
      return { text: text.trim() };

    } catch (error) {
      console.warn('Failed to parse JSON response:', error.message);
      return { text: text.trim(), parse_error: true };
    }
  }

  /**
   * קבל סטטיסטיקות
   */
  getStats() {
    const totalCalls = this.stats.gemini_calls + this.stats.claude_calls;
    const geminiPercentage = totalCalls > 0 
      ? (this.stats.gemini_calls / totalCalls * 100).toFixed(1)
      : 0;

    const claudeCost = (this.stats.claude_calls * 0.02).toFixed(2);
    const potentialCost = (totalCalls * 0.02).toFixed(2);
    const actualSavings = (potentialCost - claudeCost).toFixed(2);

    return {
      calls: {
        total: totalCalls,
        gemini: this.stats.gemini_calls,
        claude: this.stats.claude_calls,
        gemini_percentage: geminiPercentage + '%'
      },
      errors: {
        gemini: this.stats.gemini_errors,
        claude: this.stats.claude_errors
      },
      costs: {
        gemini: '$0.00 (free)',
        claude: '$' + claudeCost,
        total: '$' + claudeCost,
        potential_without_routing: '$' + potentialCost,
        actual_savings: '$' + actualSavings,
        actual_savings_ils: '₪' + (actualSavings * 3.7).toFixed(2)
      },
      uptime: {
        started: this.stats.started_at,
        running_for: Math.floor((Date.now() - this.stats.started_at) / 1000 / 60) + ' minutes'
      },
      message: `Smart routing saved you ${geminiPercentage}% of AI costs! 🎉`
    };
  }

  /**
   * איפוס סטטיסטיקות
   */
  resetStats() {
    this.stats = {
      gemini_calls: 0,
      claude_calls: 0,
      gemini_errors: 0,
      claude_errors: 0,
      money_saved: 0,
      started_at: new Date()
    };
  }
}

module.exports = SmartAIRouter;
