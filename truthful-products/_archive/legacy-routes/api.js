const express = require('express');
const router = express.Router();
const db = require('../config/database');
const SimpleDossierBuilder = require('../services/simpleDossierBuilder');
const { buildLimiter } = require('../middleware/rateLimit');

// Initialize dossier builder
const builder = new SimpleDossierBuilder();

/**
 * GET /api/search
 * Search for existing products in database
 */
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    // Validation
    if (!q || typeof q !== 'string' || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    const query = q.trim();
    console.log(`🔍 Searching database for: "${query}"`);

    // Search with ILIKE for fuzzy matching
    const products = await db.query(`
      SELECT 
        p.id, p.name, p.category, p.image_url,
        d.overall_score, d.confidence_score, d.status, d.summary
      FROM products p
      LEFT JOIN dossiers d ON p.id = d.product_id
      WHERE p.name ILIKE $1
      ORDER BY 
        d.overall_score DESC NULLS LAST,
        d.confidence_score DESC NULLS LAST,
        p.name ASC
      LIMIT 20
    `, [`%${query}%`]);

    console.log(`   Found ${products.rows.length} products`);

    res.json({
      success: true,
      query: query,
      products: products.rows,
      count: products.rows.length
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Search failed',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * GET /api/products/:id
 * Get product details with dossier (using SimpleDossierBuilder.getDossier)
 */
router.get('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validation
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        error: 'Invalid product ID'
      });
    }
    
    // Get complete dossier using builder method
    const dossier = await builder.getDossier(parseInt(id));
    
    if (!dossier) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: dossier
    });

  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get product',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * POST /api/products/build
 * Build product dossier using SimpleDossierBuilder (Reddit + AI + Cache + Images!)
 * Rate limited: 10 builds per IP per 15 minutes
 */
router.post('/products/build', buildLimiter, async (req, res) => {
  try {
    const { productName, category } = req.body;
    
    // Validation
    if (!productName || productName.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Product name is required'
      });
    }

    const trimmedName = productName.trim();
    const productCategory = category || 'general';

    console.log(`\n🔨 Building dossier for: "${trimmedName}"`);
    console.log(`📂 Category: ${productCategory}\n`);

    // Check if already exists and ready (fast path)
    const existing = await db.query(`
      SELECT p.id, p.name, p.image_url, d.status, d.overall_score, d.confidence_score, d.last_updated
      FROM products p
      LEFT JOIN dossiers d ON p.id = d.product_id
      WHERE p.name = $1
    `, [trimmedName]);
    
    if (existing.rows.length > 0) {
      const existingData = existing.rows[0];
      
      // If dossier exists and is ready, return it immediately
      if (existingData.status === 'ready') {
        console.log(`✅ Product already exists with ready dossier (ID: ${existingData.id})`);
        
        return res.json({
          success: true,
          message: 'Product already analyzed',
          productId: existingData.id,
          productName: existingData.name,
          cached: true,
          scores: {
            overall: existingData.overall_score,
            confidence: existingData.confidence_score
          },
          lastUpdated: existingData.last_updated
        });
      }
      
      // If building or failed, rebuild it
      console.log(`⚠️ Product exists but status is: ${existingData.status}. Rebuilding...`);
    }
    
    // Build dossier with SimpleDossierBuilder!
    // This will:
    // 1. Check Smart Cache
    // 2. Scrape Reddit for real reviews
    // 3. Aggregate data (sentiment, pros/cons, patterns)
    // 4. Refine with Gemini AI
    // 5. Fetch images (Universal Image Service)
    // 6. Calculate scores
    // 7. Save to DB
    // 8. Cache result
    console.log(`🚀 Starting SimpleDossierBuilder...`);
    
    const result = await builder.buildDossier(trimmedName, productCategory, true);
    
    if (!result.success) {
      throw new Error(result.error || 'Build failed');
    }
    
    console.log(`✅ Dossier built successfully!`);
    console.log(`   - Product ID: ${result.productId}`);
    console.log(`   - Overall Score: ${result.scores.overall}/100`);
    console.log(`   - Confidence: ${result.confidence}%`);
    console.log(`   - From Cache: ${result.fromCache ? 'Yes' : 'No'}`);
    console.log(`   - Images: ${result.images?.length || 0}\n`);
    
    res.json({
      success: true,
      message: result.fromCache ? 'Retrieved from cache' : 'Dossier built successfully',
      productId: result.productId,
      productName: result.productName,
      scores: result.scores,
      confidence: result.confidence,
      summary: result.summary,
      imageUrl: result.imageUrl,
      cached: result.fromCache || false,
      dataSource: result.dataSource,
      qualityCheck: result.qualityCheck
    });

  } catch (error) {
    console.error('❌ Build product error:', error);
    
    // User-friendly error messages
    let userMessage = 'Failed to build dossier';
    if (error.message.includes('Reddit')) {
      userMessage = 'Failed to fetch product reviews';
    } else if (error.message.includes('AI') || error.message.includes('Gemini')) {
      userMessage = 'AI analysis failed';
    } else if (error.message.includes('database') || error.message.includes('DB')) {
      userMessage = 'Database error';
    }
    
    res.status(500).json({
      success: false,
      error: userMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/jobs/:jobId
 * Check job status
 */
router.get('/jobs/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    
    const job = await db.query(
      'SELECT * FROM jobs WHERE id = $1',
      [jobId]
    );
    
    if (job.rows.length === 0) {
      return res.status(404).json({
        error: 'Job not found',
        success: false
      });
    }

    res.json({
      success: true,
      data: {
        state: job.rows[0].status,
        progress: job.rows[0].progress,
        result: job.rows[0].result,
        error: job.rows[0].error_message
      }
    });

  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({
      error: error.message,
      success: false
    });
  }
});

/**
 * GET /api/health
 * Health check with database status
 */
router.get('/health', async (req, res) => {
  try {
    // Test database connection
    await db.query('SELECT 1');
    
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'ClearPick.ai API',
      database: 'connected',
      version: '2.0.0'
    });
    
  } catch (error) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      service: 'ClearPick.ai API',
      database: 'disconnected',
      error: error.message
    });
  }
});

module.exports = router;
