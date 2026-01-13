const db = require('../config/database');
const SimpleAI = require('./simpleAI');
const productImageService = require('./productImageService');
const universalImageService = require('./universalImageService');
const QualityMonitor = require('./qualityMonitor');
const redditScraper = require('./redditScraper');
const dataAggregator = require('./dataAggregator');
const smartCache = require('./smartCache');

/**
 * Simple Dossier Builder - V2.0 עם Web Scraping!
 * זרימה חדשה: Reddit → Data Aggregator → Gemini Editor → DB
 */
class SimpleDossierBuilder {
  constructor() {
    this.ai = new SimpleAI();
  }

  /**
   * 🆕 בנה דוסייה - V2.1 עם Smart Cache + Universal Images!
   */
  async buildDossier(productName, category = 'general', useCache = true) {
    console.log(`\n🏗️  Building dossier V2.1 for: "${productName}"`);
    console.log(`═══════════════════════════════════════════════════════════\n`);
    
    try {
      // Get product from DB first (to get productId for caching)
      const existingProduct = await db.query('SELECT id FROM products WHERE name = $1', [productName]);
      let productId = existingProduct.rows.length > 0 ? existingProduct.rows[0].id : null;
      
      // 0. Check cache first (if productId exists)
      if (useCache && productId) {
        console.log('📝 Step 0: Checking cache...\n');
        const cached = await smartCache.getDossier(productId);
        
        if (cached && !smartCache.isStale(cached)) {
          console.log(`   ✅ Cache HIT! Returning cached dossier (age: ${Math.round((Date.now() - cached.cachedAt) / 1000)}s)`);
          console.log(`   ✓ Skipping Reddit scraping & AI analysis\n`);
          
          return {
            success: true,
            productId,
            productName,
            scores: {
              overall: cached.scores.overall,
              quality: cached.scores.quality,
              value: cached.scores.value,
              reliability: cached.scores.reliability
            },
            confidence: cached.confidence,
            summary: cached.analysis.summary,
            imageUrl: cached.product.image_url,
            fromCache: true,
            cachedAt: cached.cachedAt,
            ttl: cached.ttl
          };
        }
        
        console.log('   ❌ Cache MISS or stale - building fresh dossier\n');
      }
      
      // Check if another process is building this dossier
      if (useCache && productId && await smartCache.isBuilding(productId)) {
        console.log('⏳ Another process is building this dossier - waiting...\n');
        const result = await smartCache.waitForBuild(productId);
        if (result) {
          return {
            success: true,
            productId,
            productName,
            ...result,
            fromCache: true,
            waitedForBuild: true
          };
        }
        console.log('⚠️ Wait timeout - proceeding with build\n');
      }
      
      // Set building lock
      if (useCache && productId) {
        await smartCache.setBuilding(productId);
      }
      
      try {
        // 1. Scrape Reddit (אוסף ביקורות אמיתיות!)
        console.log('📝 Step 1/6: Scraping Reddit for real reviews...\n');
        const posts = await redditScraper.smartSearch(productName, category);
        console.log(`   ✓ Found ${posts.length} Reddit posts`);
        
        // 2. Aggregate Data (ניתוח sentiment, pros/cons, patterns)
        console.log('\n📝 Step 2/6: Analyzing aggregated data...\n');
        const aggregatedData = await dataAggregator.aggregate(posts, productName);
        console.log(`   ✓ Sentiment: ${aggregatedData.sentiment.percentPositive}% positive`);
        console.log(`   ✓ Pros: ${aggregatedData.pros.length}, Cons: ${aggregatedData.cons.length}`);
        console.log(`   ✓ Common issues: ${aggregatedData.commonIssues.length}`);
        console.log(`   ✓ Confidence: ${aggregatedData.confidence}/100`);
        
        // 3. Gemini Editor (משפר/עורך את הנתונים)
        console.log('\n📝 Step 3/6: Refining with Gemini AI...\n');
        const aiData = await this.ai.editDossier(aggregatedData);
        console.log(`   ✓ AI refinement complete`);
        
        // 4. Fetch Images (Universal Image Service - 5 sources!)
        console.log('\n📝 Step 4/6: Fetching product images (Universal Service)...\n');
        const images = await universalImageService.getMultipleImages(productName, 5).catch(err => {
          console.warn('⚠️ Failed to fetch images from Universal Service, trying fallback...', err?.message || err);
          // Fallback to old service
          return productImageService.getMultipleImages(productName, 3).catch(() => []);
        });
        const imageUrl = images.length > 0 ? images[0].url : null;
        console.log(`   ✓ Found ${images.length} images`);
        
        // 5. Save product + Calculate scores
        console.log('\n📝 Step 5/6: Saving to database...\n');
        productId = await this.saveProduct(productName, category, imageUrl, images);
        const scores = this.calculateScores(aiData);
        console.log(`   ✓ Product ID: ${productId}`);
        console.log(`   ✓ Overall Score: ${scores.overall}/100`);
        
        // 6. Quality check + Save dossier
        console.log('\n📝 Step 6/6: Quality check + saving dossier...\n');
        const qualityCheck = QualityMonitor.isDossierGeneric(aiData);
        QualityMonitor.logQualityCheck(productName, qualityCheck);
        
        await this.saveDossier(productId, aiData, scores, aggregatedData.totalReviews);
        
        // 7. Cache the result
        if (useCache) {
          console.log('\n📝 Step 7/7: Caching result...\n');
          const dossier = await this.getDossier(productId);
          if (dossier) {
            await smartCache.saveDossier(productId, dossier, aiData.confidence);
            console.log(`   ✓ Dossier cached with TTL based on confidence: ${aiData.confidence}%`);
          }
        }
        
        console.log('\n═══════════════════════════════════════════════════════════');
        console.log('✅ Dossier V2.1 Complete!');
        console.log('═══════════════════════════════════════════════════════════\n');
        console.log(`📊 Summary:`);
        console.log(`   - Reddit posts: ${aggregatedData.totalReviews}`);
        console.log(`   - Sentiment: ${aggregatedData.sentiment.percentPositive}% positive`);
        console.log(`   - Overall Score: ${scores.overall}/100`);
        console.log(`   - Confidence: ${aiData.confidence}/100`);
        console.log(`   - Quality Score: ${qualityCheck.qualityScore}/100`);
        console.log(`   - Images: ${images.length} (Universal Service)`);
        console.log(`   - Cached: ${useCache ? 'Yes' : 'No'}`);
        console.log('');
        
        return {
          success: true,
          productId,
          productName,
          scores,
          confidence: aiData.confidence,
          summary: aiData.summary,
          imageUrl: imageUrl || null,
          images: images,
          qualityCheck: qualityCheck,
          dataSource: {
            reddit: aggregatedData.totalReviews,
            sentiment: aggregatedData.sentiment
          },
          fromCache: false,
          cached: useCache
        };
        
      } finally {
        // Always release building lock
        if (useCache && productId) {
          await smartCache.releaseBuilding(productId);
        }
      }
      
    } catch (error) {
      console.error('❌ Build failed:', error.message);
      throw error;
    }
  }

  /**
   * Get existing dossier
   */
  async getDossier(productId) {
    let result;
    try {
      // New schema (supports multiple images)
      result = await db.query(`
        SELECT 
          p.id, p.name, p.category, p.image_url, p.images, p.created_at,
          d.overall_score, d.quality_score, d.value_score, d.reliability_score,
          d.summary, d.pros, d.cons, d.common_failures,
          d.best_for, d.not_recommended_for,
          d.total_reviews, d.confidence_score, d.status, d.last_updated
        FROM products p
        LEFT JOIN dossiers d ON p.id = d.product_id
        WHERE p.id = $1
      `, [productId]);
    } catch (e) {
      // Backward compatibility: production DB may not have products.images yet
      const msg = String(e?.message || '');
      if (msg.includes('column') && msg.includes('images') && msg.includes('does not exist')) {
        result = await db.query(`
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
      } else {
        throw e;
      }
    }

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];

    let images = [];
    if (Array.isArray(row.images)) {
      images = row.images;
    } else if (typeof row.images === 'string') {
      try {
        const parsed = JSON.parse(row.images);
        if (Array.isArray(parsed)) images = parsed;
      } catch {
        images = [];
      }
    }
    
    return {
      product: {
        id: row.id,
        name: row.name,
        category: row.category,
        image_url: row.image_url,
        images
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
   * Save product (with multiple images support)
   */
  async saveProduct(name, category, imageUrl = null, images = []) {
    let existing;
    try {
      existing = await db.query('SELECT id, image_url, images FROM products WHERE name = $1', [name]);
    } catch (e) {
      // Backward compatibility: production DB may not have products.images yet
      const msg = String(e?.message || '');
      if (msg.includes('column') && msg.includes('images') && msg.includes('does not exist')) {
        existing = await db.query('SELECT id, image_url FROM products WHERE name = $1', [name]);
      } else {
        throw e;
      }
    }
    
    if (existing.rows.length > 0) {
      const updates = [];
      const params = [];
      let paramIndex = 1;
      
      // Update image_url if we found a new one (important for rebuilds / fixing wrong images)
      if (imageUrl && imageUrl !== existing.rows[0].image_url) {
        updates.push(`image_url = $${paramIndex++}`);
        params.push(imageUrl);
      }
      
      // Update images array if we have new images
      if (images.length > 0) {
        updates.push(`images = $${paramIndex++}`);
        params.push(JSON.stringify(images));
      }
      
      if (updates.length > 0) {
        params.push(existing.rows[0].id);
        try {
          await db.query(
            `UPDATE products SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${paramIndex}`,
            params
          );
          console.log(`   ✓ Updated product with ${images.length} images`);
        } catch (e) {
          const msg = String(e?.message || '');
          if (msg.includes('column') && msg.includes('images') && msg.includes('does not exist')) {
            // Fallback: update only image_url
            if (imageUrl) {
              await db.query(
                'UPDATE products SET image_url = $1, updated_at = NOW() WHERE id = $2',
                [imageUrl, existing.rows[0].id]
              );
              console.log('   ✓ Updated product image (legacy schema)');
            }
          } else {
            throw e;
          }
        }
      }
      
      return existing.rows[0].id;
    }
    
    let result;
    try {
      // New schema
      result = await db.query(
        'INSERT INTO products (name, category, image_url, images) VALUES ($1, $2, $3, $4) RETURNING id',
        [name, category, imageUrl, JSON.stringify(images)]
      );
    } catch (e) {
      const msg = String(e?.message || '');
      if (msg.includes('column') && msg.includes('images') && msg.includes('does not exist')) {
        // Legacy schema
        result = await db.query(
          'INSERT INTO products (name, category, image_url) VALUES ($1, $2, $3) RETURNING id',
          [name, category, imageUrl]
        );
      } else {
        throw e;
      }
    }
    
    if (images.length > 0) {
      console.log(`   ✓ Saved product with ${images.length} images`);
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
  async saveDossier(productId, aiData, scores, totalReviews = 0) {
    const existing = await db.query('SELECT id FROM dossiers WHERE product_id = $1', [productId]);
    
    if (existing.rows.length > 0) {
      // Update
      await db.query(`
        UPDATE dossiers SET
          overall_score = $1, quality_score = $2, value_score = $3, reliability_score = $4,
          summary = $5, pros = $6, cons = $7, common_failures = $8,
          best_for = $9, not_recommended_for = $10,
          confidence_score = $11, total_reviews = $12, status = 'ready', last_updated = NOW()
        WHERE product_id = $13
      `, [
        scores.overall, scores.quality, scores.value, scores.reliability,
        aiData.summary,
        JSON.stringify(aiData.pros),
        JSON.stringify(aiData.cons),
        JSON.stringify(aiData.common_issues),
        JSON.stringify(aiData.best_for),
        JSON.stringify(aiData.not_for),
        aiData.confidence,
        totalReviews,
        productId
      ]);
    } else {
      // Insert
      await db.query(`
        INSERT INTO dossiers (
          product_id, overall_score, quality_score, value_score, reliability_score,
          summary, pros, cons, common_failures, best_for, not_recommended_for,
          confidence_score, total_reviews, status, last_updated
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'ready', NOW())
      `, [
        productId,
        scores.overall, scores.quality, scores.value, scores.reliability,
        aiData.summary,
        JSON.stringify(aiData.pros),
        JSON.stringify(aiData.cons),
        JSON.stringify(aiData.common_issues),
        JSON.stringify(aiData.best_for),
        JSON.stringify(aiData.not_for),
        aiData.confidence,
        totalReviews
      ]);
    }
  }
}

module.exports = SimpleDossierBuilder;
