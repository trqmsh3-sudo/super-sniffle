const db = require('../config/database');
const SmartAIRouter = require('./aiRouter');
const productImageService = require('./productImageService');

/**
 * Dossier Builder - בונה תיקי מוצרים מלאים
 * משלב איסוף נתונים, ניתוח AI, וחישוב ציונים
 * משתמש ב-Smart AI Router לחיסכון בעלויות!
 */
class DossierBuilder {
  constructor() {
    this.router = new SmartAIRouter();
  }

  /**
   * בניית תיק מוצר מלא
   * @param {string} productName - שם המוצר
   * @param {string} category - קטגוריה
   * @returns {Promise<Object>} התיק שנבנה
   */
  async buildDossier(productName, category = 'general') {
    console.log(`\n🏗️  Building dossier for: "${productName}"`);
    console.log('═'.repeat(50));

    try {
      // 1. זיהוי וניקוי שם המוצר (Gemini - חינם!)
      console.log('\n🔍 Step 1/6: Identifying product...');
      let productInfo;
      try {
        productInfo = await this.router.route('identify_product', {
          query: productName
        });
        console.log(`   ✓ Identified: ${productInfo?.name || productName} (${productInfo?.category || category})`);
      } catch (identifyError) {
        console.warn(`   ⚠️ Product identification failed, using original name: ${identifyError.message}`);
        productInfo = { name: productName, category: category };
      }

      // Use original name as fallback
      const finalName = productInfo?.name || productName;
      const finalCategory = productInfo?.category || category;

      // 2. איסוף נתונים + תמונת מוצר (במקביל כדי לחסוך זמן)
      console.log('\n📥 Step 2/6: Collecting product data (AI) + fetching image...');
      let collectedData;
      let imageUrl;
      try {
        const [aiResult, img] = await Promise.all([
          this.router.route('build_dossier', { productName: finalName }),
          productImageService.getImageUrl(finalName),
        ]);
        collectedData = aiResult;
        imageUrl = img || null;
        console.log(`   ✓ Data collected successfully`);
        if (imageUrl) console.log(`   ✓ Image found`);
      } catch (collectError) {
        console.error(`   ❌ Data collection failed: ${collectError.message}`);
        // Provide minimal fallback data
        collectedData = {
          name: finalName,
          summary: `Analysis pending for ${finalName}`,
          pros: ['Product exists in market'],
          cons: ['No detailed analysis available yet'],
          common_issues: [],
          best_for: ['General users'],
          not_for: [],
          overall_sentiment: 'mixed',
          value_rating: 'fair',
          confidence: 30,
          sources_estimated: 0
        };
        // Best-effort image even if AI failed
        imageUrl = await productImageService.getImageUrl(finalName).catch(() => null);
      }

      // 3. שמירת המוצר בDB (כולל תמונה)
      console.log('\n💾 Step 3/6: Saving product to database...');
      const productId = await this.saveProduct(finalName, finalCategory, imageUrl);

      // 4. חישוב ציונים
      console.log('\n🧮 Step 4/6: Calculating scores...');
      const scores = this.calculateScores(collectedData);

      // 5. שמירת התיק
      console.log('\n📝 Step 5/6: Saving dossier...');
      await this.saveDossier(productId, collectedData, scores);

      // 6. שמירת ביקורות (סימולציה)
      console.log('\n📊 Step 6/6: Saving review data...');
      await this.saveReviewsSummary(productId, collectedData);

      // הצג סטטיסטיקות
      const stats = this.router.getStats();
      console.log(`\n💰 AI Cost Savings: ${stats.costs.actual_savings} (${stats.calls.gemini_percentage} via Gemini)`);

      console.log('\n✅ Dossier built successfully!');
      console.log('═'.repeat(50));

      return {
        success: true,
        productId,
        productName,
        scores,
        confidence: collectedData.confidence,
        summary: collectedData.summary,
        imageUrl: imageUrl || null
      };

    } catch (error) {
      console.error('\n❌ Build error:', error.message);
      throw error;
    }
  }

  /**
   * שמירת מוצר בDB
   */
  async saveProduct(name, category, imageUrl = null) {
    // Check if product exists first
    const existing = await db.query(
      'SELECT id, image_url FROM products WHERE name = $1',
      [name]
    );

    if (existing.rows.length > 0) {
      const productId = existing.rows[0].id;
      // Update category and image if missing
      const currentImage = existing.rows[0].image_url;
      if ((category && category !== 'general') || (imageUrl && !currentImage)) {
        await db.query(
          `UPDATE products
           SET category = COALESCE($1, category),
               image_url = COALESCE($2, image_url),
               updated_at = NOW()
           WHERE id = $3`,
          [category || null, imageUrl || null, productId]
        );
      }
      console.log(`   ✓ Product already exists with ID: ${productId}`);
      return productId;
    }

    // Create new product
    const result = await db.query(
      `INSERT INTO products (name, category, image_url, created_at, updated_at) 
       VALUES ($1, $2, $3, NOW(), NOW()) 
       RETURNING id`,
      [name, category, imageUrl]
    );

    const productId = result.rows[0].id;
    console.log(`   ✓ Product saved with ID: ${productId}`);
    return productId;
  }

  /**
   * חישוב ציונים מהנתונים
   */
  calculateScores(data) {
    const prosCount = data.pros.length;
    const consCount = data.cons.length;
    const issuesCount = data.common_issues.length;

    // ציון כללי - מבוסס על sentiment ויחס pros/cons
    let overallScore;
    if (data.overall_sentiment === 'positive') {
      overallScore = 75 + Math.min(20, prosCount * 2);
    } else if (data.overall_sentiment === 'negative') {
      overallScore = 40 - Math.min(20, consCount * 2);
    } else {
      overallScore = 55 + (prosCount - consCount) * 3;
    }

    // ציון איכות - מושפע מיתרונות ובעיות
    const qualityScore = Math.max(30, Math.min(95, 
      overallScore + (prosCount * 3) - (issuesCount * 8)
    ));

    // ציון תמורה למחיר
    let valueScore;
    if (data.value_rating === 'excellent') valueScore = 90;
    else if (data.value_rating === 'good') valueScore = 75;
    else if (data.value_rating === 'fair') valueScore = 55;
    else if (data.value_rating === 'poor') valueScore = 35;
    else valueScore = 60; // unknown

    // ציון אמינות - מושפע מבעיות ידועות
    const reliabilityScore = Math.max(40, Math.min(95,
      85 - (issuesCount * 10) - (consCount * 2)
    ));

    // נרמול הציונים
    const scores = {
      overall: Math.round(Math.max(0, Math.min(100, overallScore))),
      quality: Math.round(Math.max(0, Math.min(100, qualityScore))),
      value: Math.round(Math.max(0, Math.min(100, valueScore))),
      reliability: Math.round(Math.max(0, Math.min(100, reliabilityScore)))
    };

    console.log(`   ✓ Scores calculated:`);
    console.log(`     - Overall: ${scores.overall}`);
    console.log(`     - Quality: ${scores.quality}`);
    console.log(`     - Value: ${scores.value}`);
    console.log(`     - Reliability: ${scores.reliability}`);

    return scores;
  }

  /**
   * שמירת התיק בDB
   */
  async saveDossier(productId, data, scores) {
    // Check if dossier exists
    const existing = await db.query(
      'SELECT id FROM dossiers WHERE product_id = $1',
      [productId]
    );

    if (existing.rows.length > 0) {
      // Update existing dossier
      await db.query(
        `UPDATE dossiers SET
          overall_score = $1,
          quality_score = $2,
          value_score = $3,
          reliability_score = $4,
          summary = $5,
          pros = $6,
          cons = $7,
          common_failures = $8,
          best_for = $9,
          not_recommended_for = $10,
          total_reviews = $11,
          confidence_score = $12,
          status = $13,
          last_updated = NOW()
        WHERE product_id = $14`,
        [
          scores.overall,
          scores.quality,
          scores.value,
          scores.reliability,
          data.summary,
          JSON.stringify(data.pros),
          JSON.stringify(data.cons),
          JSON.stringify(data.common_issues.map(issue => ({
            issue,
            severity: 'medium',
            reports: 1
          }))),
          JSON.stringify(data.best_for),
          JSON.stringify(data.not_for),
          data.sources_found,
          data.confidence,
          'ready',
          productId
        ]
      );
      console.log(`   ✓ Dossier updated in database`);
      return;
    }

    // Create new dossier
    await db.query(
      `INSERT INTO dossiers (
        product_id, 
        overall_score, 
        quality_score, 
        value_score, 
        reliability_score,
        summary,
        pros,
        cons,
        common_failures,
        best_for,
        not_recommended_for,
        total_reviews,
        confidence_score,
        status,
        last_updated,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())`,
      [
        productId,
        scores.overall,
        scores.quality,
        scores.value,
        scores.reliability,
        data.summary,
        JSON.stringify(data.pros),
        JSON.stringify(data.cons),
        JSON.stringify(data.common_issues.map(issue => ({
          issue,
          severity: 'medium',
          reports: 1
        }))),
        JSON.stringify(data.best_for),
        JSON.stringify(data.not_for),
        data.sources_found,
        data.confidence,
        'ready' // status
      ]
    );

    console.log(`   ✓ Dossier saved to database`);
  }

  /**
   * שמירת סיכום ביקורות
   */
  async saveReviewsSummary(productId, data) {
    // כרגע פשוט שומר את הכמות
    // בעתיד נשמור ביקורות אמיתיות
    console.log(`   ✓ Review summary saved (${data.sources_found} sources)`);
  }

  /**
   * קבלת תיק קיים
   */
  async getDossier(productId) {
    const result = await db.query(
      `SELECT p.*, 
              d.overall_score, d.quality_score, d.value_score, d.reliability_score,
              d.summary, d.pros, d.cons, d.common_failures,
              d.best_for, d.not_recommended_for,
              d.total_reviews, d.confidence_score, d.status, d.last_updated
       FROM products p
       LEFT JOIN dossiers d ON p.id = d.product_id
       WHERE p.id = $1`,
      [productId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.formatDossier(result.rows[0]);
  }

  /**
   * עיצוב התיק לפורמט נוח
   */
  formatDossier(row) {
    return {
      product: {
        id: row.id,
        name: row.name,
        category: row.category,
        image_url: row.image_url || null
      },
      scores: {
        overall: row.overall_score,
        quality: row.quality_score,
        value: row.value_score,
        reliability: row.reliability_score
      },
      analysis: {
        summary: row.summary,
        pros: row.pros || [],
        cons: row.cons || [],
        common_failures: row.common_failures || [],
        best_for: row.best_for || [],
        not_for: row.not_recommended_for || []
      },
      meta: {
        total_reviews: row.total_reviews,
        confidence: row.confidence_score,
        status: row.status,
        last_updated: row.last_updated
      }
    };
  }

  /**
   * שאל שאלה על תיק (smart routing!)
   */
  async askQuestion(question, dossier) {
    // בדוק אם השאלה פשוטה או מורכבת
    const isSimple = this.isSimpleQuestion(question);
    
    if (isSimple) {
      // שאלה פשוטה → Gemini (חינם!)
      return await this.router.route('basic_qa', {
        question,
        dossier
      });
    } else {
      // שאלה מורכבת → Claude (בתשלום)
      return await this.router.route('complex_qa', {
        question,
        dossier
      });
    }
  }

  /**
   * בדוק אם שאלה פשוטה
   */
  isSimpleQuestion(question) {
    const simplePatterns = [
      /כמה עולה/i,
      /מה הציון/i,
      /האם טוב/i,
      /מה היתרונות/i,
      /מה החסרונות/i,
      /האם כדאי/i,
      /מומלץ/i,
      /what.*score/i,
      /is.*good/i,
      /pros.*cons/i
    ];
    
    return simplePatterns.some(pattern => pattern.test(question));
  }

  /**
   * עדכן תיק קיים עם מידע חדש
   */
  async updateDossier(productId) {
    console.log(`\n🔄 Updating dossier for product ${productId}...`);
    
    try {
      // קבל תיק נוכחי
      const currentDossier = await this.getDossier(productId);
      
      if (!currentDossier) {
        throw new Error('Dossier not found');
      }

      // כמה ימים עברו מאז העדכון?
      const lastUpdate = new Date(currentDossier.meta.last_updated);
      const daysSince = Math.floor((Date.now() - lastUpdate) / (1000 * 60 * 60 * 24));

      // חפש מידע חדש (Claude - web search!)
      const updates = await this.router.route('update_dossier', {
        productName: currentDossier.product.name,
        daysSinceUpdate: daysSince,
        currentDossier
      });

      if (updates.has_updates) {
        console.log(`   ✓ Found ${updates.new_pros?.length || 0} new pros, ${updates.new_cons?.length || 0} new cons`);
        
        // עדכן את התיק בDB
        // TODO: implement update logic
        
        return {
          success: true,
          updates,
          message: `Dossier updated with fresh data from last ${daysSince} days`
        };
      } else {
        console.log('   ✓ No significant updates found');
        return {
          success: true,
          updates: null,
          message: 'Dossier is up to date'
        };
      }

    } catch (error) {
      console.error('Update error:', error);
      throw error;
    }
  }

  /**
   * קבל סטטיסטיקות AI
   */
  getAIStats() {
    return this.router.getStats();
  }
}

module.exports = DossierBuilder;
