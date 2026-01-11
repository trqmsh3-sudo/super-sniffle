const db = require('../config/database');
const SimpleAI = require('./simpleAI');
const productImageService = require('./productImageService');

/**
 * Simple Dossier Builder - ללא סיבוכים מיותרים
 */
class SimpleDossierBuilder {
  constructor() {
    this.ai = new SimpleAI();
  }

  /**
   * בנה דוסייה - פשוט וישיר
   */
  async buildDossier(productName, category = 'general') {
    console.log(`\n🏗️  Building dossier for: "${productName}"`);
    
    try {
      // 1. Get product image (in parallel with AI analysis for speed)
      const [aiData, imageUrl] = await Promise.all([
        this.ai.buildDossier(productName),
        productImageService.getImageUrl(productName).catch(err => {
          console.warn('⚠️ Failed to fetch product image:', err?.message || err);
          return null;
        }),
      ]);
      
      // 2. Save product (with image)
      const productId = await this.saveProduct(productName, category, imageUrl);
      
      // 3. Calculate scores
      const scores = this.calculateScores(aiData);
      
      // 4. Save dossier
      await this.saveDossier(productId, aiData, scores);
      
      console.log('✅ Dossier complete!');
      
      return {
        success: true,
        productId,
        productName,
        scores,
        confidence: aiData.confidence,
        summary: aiData.summary,
        imageUrl: imageUrl || null
      };
      
    } catch (error) {
      console.error('❌ Build failed:', error.message);
      throw error;
    }
  }

  /**
   * Get existing dossier
   */
  async getDossier(productId) {
    const result = await db.query(`
      SELECT 
        p.id, p.name, p.category, p.image_url, p.created_at,
        d.overall_score, d.quality_score, d.value_score, d.reliability_score,
        d.summary, d.pros, d.cons, d.common_failures,
        d.best_for, d.not_recommended_for,
        d.total_reviews, d.confidence_score, d.status, d.last_updated
      FROM products p
      LEFT JOIN dossiers d ON p.id = d.product_id
      WHERE p.id = $1
    `, [productId]);

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    
    return {
      product: {
        id: row.id,
        name: row.name,
        category: row.category,
        image_url: row.image_url
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
   * Save product
   */
  async saveProduct(name, category, imageUrl = null) {
    const existing = await db.query('SELECT id, image_url FROM products WHERE name = $1', [name]);
    
    if (existing.rows.length > 0) {
      // Update image if provided and doesn't exist (or is null/empty)
      if (imageUrl && (!existing.rows[0].image_url || existing.rows[0].image_url === null)) {
        await db.query('UPDATE products SET image_url = $1, updated_at = NOW() WHERE id = $2', [imageUrl, existing.rows[0].id]);
        console.log(`   ✓ Updated product image: ${imageUrl.substring(0, 60)}...`);
      }
      return existing.rows[0].id;
    }
    
    const result = await db.query(
      'INSERT INTO products (name, category, image_url) VALUES ($1, $2, $3) RETURNING id',
      [name, category, imageUrl]
    );
    
    if (imageUrl) {
      console.log(`   ✓ Saved product with image: ${imageUrl.substring(0, 60)}...`);
    }
    
    return result.rows[0].id;
  }

  /**
   * Calculate scores from AI data
   */
  calculateScores(data) {
    const prosCount = data.pros.length;
    const consCount = data.cons.length;
    const issuesCount = data.common_issues.length;

    // Overall score based on sentiment
    let overall = 60;
    if (data.overall_sentiment === 'positive') overall = 75 + Math.min(15, prosCount * 3);
    else if (data.overall_sentiment === 'negative') overall = 45 - Math.min(20, consCount * 3);
    else overall = 55 + (prosCount - consCount) * 3;

    // Quality score
    const quality = Math.max(30, Math.min(95, overall + (prosCount * 3) - (issuesCount * 8)));

    // Value score
    const valueMap = { excellent: 90, good: 75, fair: 55, poor: 35 };
    const value = valueMap[data.value_rating] || 60;

    // Reliability score
    const reliability = Math.max(40, Math.min(95, 85 - (issuesCount * 10) - (consCount * 2)));

    return {
      overall: Math.round(Math.max(0, Math.min(100, overall))),
      quality: Math.round(Math.max(0, Math.min(100, quality))),
      value: Math.round(Math.max(0, Math.min(100, value))),
      reliability: Math.round(Math.max(0, Math.min(100, reliability)))
    };
  }

  /**
   * Save dossier to database
   */
  async saveDossier(productId, aiData, scores) {
    const existing = await db.query('SELECT id FROM dossiers WHERE product_id = $1', [productId]);
    
    if (existing.rows.length > 0) {
      // Update
      await db.query(`
        UPDATE dossiers SET
          overall_score = $1, quality_score = $2, value_score = $3, reliability_score = $4,
          summary = $5, pros = $6, cons = $7, common_failures = $8,
          best_for = $9, not_recommended_for = $10,
          confidence_score = $11, status = 'ready', last_updated = NOW()
        WHERE product_id = $12
      `, [
        scores.overall, scores.quality, scores.value, scores.reliability,
        aiData.summary,
        JSON.stringify(aiData.pros),
        JSON.stringify(aiData.cons),
        JSON.stringify(aiData.common_issues),
        JSON.stringify(aiData.best_for),
        JSON.stringify(aiData.not_for),
        aiData.confidence,
        productId
      ]);
    } else {
      // Insert
      await db.query(`
        INSERT INTO dossiers (
          product_id, overall_score, quality_score, value_score, reliability_score,
          summary, pros, cons, common_failures, best_for, not_recommended_for,
          confidence_score, status, last_updated
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'ready', NOW())
      `, [
        productId,
        scores.overall, scores.quality, scores.value, scores.reliability,
        aiData.summary,
        JSON.stringify(aiData.pros),
        JSON.stringify(aiData.cons),
        JSON.stringify(aiData.common_issues),
        JSON.stringify(aiData.best_for),
        JSON.stringify(aiData.not_for),
        aiData.confidence
      ]);
    }
  }
}

module.exports = SimpleDossierBuilder;
