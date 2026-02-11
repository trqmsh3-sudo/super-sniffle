const express = require('express');
const router = express.Router();
const db = require('../config/database');

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

/**
 * GET /api/search
 * Search for products
 */
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({
        error: 'Search query is required'
      });
    }

    const products = await db.query(`
      SELECT p.*, d.overall_score, d.status
      FROM products p
      LEFT JOIN dossiers d ON p.id = d.product_id
      WHERE p.name ILIKE $1
      ORDER BY d.overall_score DESC NULLS LAST
      LIMIT 10
    `, [`%${q}%`]);

    res.json({
      success: true,
      data: products.rows,
      count: products.rows.length
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      error: error.message,
      success: false
    });
  }
});

/**
 * GET /api/products/:id
 * Get product details with dossier
 */
router.get('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get product
    const product = await db.query(
      'SELECT * FROM products WHERE id = $1',
      [id]
    );
    
    if (product.rows.length === 0) {
      return res.status(404).json({
        error: 'Product not found',
        success: false
      });
    }
    
    // Get dossier
    const dossier = await db.query(
      'SELECT * FROM dossiers WHERE product_id = $1',
      [id]
    );
    
    // Get recent reviews
    const reviews = await db.query(
      'SELECT * FROM reviews WHERE product_id = $1 ORDER BY scraped_at DESC LIMIT 10',
      [id]
    );

    res.json({
      success: true,
      data: {
        product: product.rows[0],
        dossier: dossier.rows[0] || null,
        reviews: reviews.rows
      }
    });

  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      error: error.message,
      success: false
    });
  }
});

/**
 * POST /api/products/build
 * Trigger dossier building for a new product
 */
router.post('/products/build', async (req, res) => {
  try {
    const { productName } = req.body;
    
    if (!productName) {
      return res.status(400).json({
        error: 'Product name is required'
      });
    }

    // Check if already exists
    const existing = await db.query(
      'SELECT id FROM products WHERE name = $1',
      [productName]
    );
    
    if (existing.rows.length > 0) {
      return res.json({
        message: 'Product already exists',
        productId: existing.rows[0].id,
        success: true
      });
    }
    
    // Create product record
    const product = await db.query(`
      INSERT INTO products (name, category) VALUES ($1, $2) RETURNING id
    `, [productName, 'electronics']);
    
    const productId = product.rows[0].id;
    
    // Create dossier record (building status)
    await db.query(`
      INSERT INTO dossiers (product_id, status, next_update_due)
      VALUES ($1, 'building', NOW() + INTERVAL '1 hour')
    `, [productId]);
    
    // Create job record
    const job = await db.query(`
      INSERT INTO jobs (product_name, status)
      VALUES ($1, 'waiting')
      RETURNING id
    `, [productName]);
    
    res.json({
      success: true,
      message: 'Building dossier...',
      productId,
      jobId: job.rows[0].id,
      estimatedTime: 180 // 3 minutes
    });

  } catch (error) {
    console.error('Build product error:', error);
    res.status(500).json({
      error: error.message,
      success: false
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

module.exports = router;
