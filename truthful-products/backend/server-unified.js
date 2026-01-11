require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const db = require('./config/database');
// Use SIMPLE builder - no complications!
const DossierBuilder = require('./services/simpleDossierBuilder');
const productImageService = require('./services/productImageService');

// Import Windsurf's middleware (converting from ES modules)
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================================
// MIDDLEWARE - משולב מWindsurf + שלי
// ============================================================================

// Security (Windsurf)
app.use(helmet());

// CORS (Windsurf's config)
// NOTE:
// In production (Vercel + Render), relying on a single FRONTEND_URL is brittle.
// We allow cross-origin requests broadly since this is a public API (no cookies).
app.use(cors({
  origin: true,
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.options('*', cors());

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting (Windsurf's approach)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Request logging (simple version - will upgrade to Winston later)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ============================================================================
// INITIALIZE SERVICES
// ============================================================================

const builder = new DossierBuilder();

// ============================================================================
// DATABASE SCHEMA (auto-create for first-run deployments)
// ============================================================================
async function ensureSchema() {
  // Minimal schema required for API routes to work.
  // This keeps production deployments functional without manual psql steps.
  await db.query(`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      category TEXT,
      image_url TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);

  // Add image_url column if it doesn't exist (for existing databases)
  await db.query(`
    ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT;
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS dossiers (
      id SERIAL PRIMARY KEY,
      product_id INTEGER UNIQUE REFERENCES products(id) ON DELETE CASCADE,
      overall_score INTEGER,
      quality_score INTEGER,
      value_score INTEGER,
      reliability_score INTEGER,
      summary TEXT,
      pros JSONB,
      cons JSONB,
      common_failures JSONB,
      best_for JSONB,
      not_recommended_for JSONB,
      total_reviews INTEGER,
      confidence_score DOUBLE PRECISION,
      status TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      last_updated TIMESTAMP DEFAULT NOW()
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS reviews_summary (
      id SERIAL PRIMARY KEY,
      product_id INTEGER UNIQUE REFERENCES products(id) ON DELETE CASCADE,
      sources_found INTEGER,
      overall_sentiment TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);
}

// Ensure critical columns exist on existing databases (non-destructive)
async function ensureCriticalColumns() {
  try {
    // Add created_at to dossiers if missing (some old DBs were created without it)
    await db.query(`
      ALTER TABLE dossiers
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW()
    `);
    console.log('✅ ensured dossiers.created_at column exists');
  } catch (err) {
    console.warn('⚠️  Unable to ensure dossiers.created_at column:', err?.message || err);
  }
}

// Fire-and-forget schema init (do not crash app if DB not configured yet)
ensureSchema()
  .then(() => console.log('✅ Database schema ensured'))
  .catch((err) => console.warn('⚠️  Database schema not ensured:', err?.message || err));

// Fire-and-forget column fixups (safe ALTER TABLE)
ensureCriticalColumns()
  .catch((err) => console.warn('⚠️  Column fixups failed:', err?.message || err));

// ============================================================================
// ROOT ROUTES
// ============================================================================

app.get('/', (req, res) => {
  res.json({
    service: 'ClearPick.ai Unified API',
    version: '3.1.0',
    status: 'running',
    features: {
      gemini_ai: process.env.GEMINI_API_KEY ? '✅ Connected (Expert Analysis)' : '❌ Missing key',
      expert_analysis: '✅ Patterns, Correlations, Time-based Issues',
      product_images: '✅ Official Product Images',
      database: '✅ PostgreSQL',
      middleware: '✅ Rate Limit + Error Handler',
    },
    endpoints: {
      health: 'GET /api/health',
      search: 'GET /api/search?q=product',
      products_list: 'GET /api/products',
      product_detail: 'GET /api/products/:id',
      build_dossier: 'POST /api/products/build',
      admin_stats: 'GET /api/admin/ai-stats',
      admin_info: 'GET /api/admin/system-info'
    },
    team: {
      backend: 'Cursor + Windsurf collaboration',
      smart_routing: 'Cursor',
      scrapers: 'Windsurf',
      middleware: 'Windsurf'
    }
  });
});

// ============================================================================
// HEALTH CHECK
// ============================================================================

app.get('/api/health', async (req, res) => {
  try {
    // Test database connection (fast fail). Even if DB is down, keep endpoint responsive.
    await db.query('SELECT NOW()');
    
    res.json({
      success: true,
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        database: '✅ Connected',
        gemini: process.env.GEMINI_API_KEY ? '✅ Ready (Expert Analysis)' : '❌ No API Key',
        expert_analysis: '✅ Active',
        product_images: '✅ Active'
      }
    });
  } catch (error) {
    // Don't hard-fail health just because DB is down; keep it useful for waking Render.
    res.status(200).json({
      success: true,
      status: 'degraded',
      timestamp: new Date().toISOString(),
      services: {
        database: '❌ ' + (error?.message || 'Database unavailable')
      }
    });
  }
});

// Convenience alias (many people try /health)
app.get('/health', (req, res) => res.redirect(302, '/api/health'));

// ============================================================================
// PRODUCT ROUTES
// ============================================================================

// Apply rate limiting to API routes
app.use('/api', apiLimiter);

/**
 * GET /api/stats
 * Lightweight public stats for social proof (best-effort; returns zeros if DB unavailable)
 */
app.get('/api/stats', async (req, res) => {
  try {
    const products = await db.query('SELECT COUNT(*)::int AS count FROM products');
    const dossiersReady = await db.query(
      `SELECT COUNT(*)::int AS count
       FROM dossiers
       WHERE status = 'ready'`
    );
    const last = await db.query('SELECT MAX(last_updated) AS last_updated FROM dossiers');

    res.json({
      success: true,
      data: {
        products_analyzed: products.rows?.[0]?.count ?? 0,
        dossiers_ready: dossiersReady.rows?.[0]?.count ?? 0,
        last_updated: last.rows?.[0]?.last_updated ?? null,
      },
    });
  } catch (error) {
    res.status(200).json({
      success: true,
      data: {
        products_analyzed: 0,
        dossiers_ready: 0,
        last_updated: null,
      },
      degraded: true,
      error: error?.message || 'Database unavailable',
    });
  }
});

/**
 * GET /api/search
 * Search for products in database
 */
app.get('/api/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required',
        example: '/api/search?q=iPhone'
      });
    }

    const results = await db.query(
      `SELECT p.id, p.name, p.category, p.created_at,
              d.overall_score, d.summary, d.status, d.last_updated
       FROM products p
       LEFT JOIN dossiers d ON p.id = d.product_id
       WHERE p.name ILIKE $1
       ORDER BY d.overall_score DESC NULLS LAST, p.created_at DESC
       LIMIT 20`,
      [`%${q}%`]
    );

    res.json({
      success: true,
      query: q,
      count: results.rows.length,
      products: results.rows
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Database unavailable'
    });
  }
});

/**
 * GET /api/products
 * List all products
 */
app.get('/api/products', async (req, res) => {
  try {
    const results = await db.query(
      `SELECT p.id, p.name, p.category, p.created_at,
              d.overall_score, d.status
       FROM products p
       LEFT JOIN dossiers d ON p.id = d.product_id
       ORDER BY p.created_at DESC
       LIMIT 50`
    );

    res.json({
      success: true,
      count: results.rows.length,
      products: results.rows
    });

  } catch (error) {
    console.error('List error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/products/:id
 * Get product details with full dossier
 */
app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const dossier = await builder.getDossier(id);

    if (!dossier) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Backfill image_url for existing products (no need to rebuild the whole dossier)
    if (!dossier?.product?.image_url) {
      const img = await productImageService.getImageUrl(dossier?.product?.name).catch(() => null);
      if (img) {
        await db.query(
          'UPDATE products SET image_url = $1, updated_at = NOW() WHERE id = $2',
          [img, dossier.product.id]
        );
        dossier.product.image_url = img;
      }
    }

    res.json({
      success: true,
      data: dossier
    });

  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/products/build
 * Build a new product dossier with Smart AI Routing
 */
app.post('/api/products/build', async (req, res) => {
  try {
    const { productName, category } = req.body;

    if (!productName) {
      return res.status(400).json({
        success: false,
        error: 'productName is required',
        example: { productName: 'iPhone 15 Pro', category: 'smartphones' }
      });
    }

    // Check if product already exists WITH a completed dossier
    const existing = await db.query(
      `SELECT p.id, d.overall_score 
       FROM products p 
       LEFT JOIN dossiers d ON p.id = d.product_id 
       WHERE p.name = $1`,
      [productName]
    );

    // If product exists AND has a dossier with scores, return it
    if (existing.rows.length > 0 && existing.rows[0].overall_score !== null) {
      const productId = existing.rows[0].id;
      const dossier = await builder.getDossier(productId);

      // Backfill image_url for existing products (so UI shows an image immediately)
      if (dossier && !dossier?.product?.image_url) {
        const img = await productImageService.getImageUrl(dossier?.product?.name || productName).catch(() => null);
        if (img) {
          await db.query(
            'UPDATE products SET image_url = $1, updated_at = NOW() WHERE id = $2',
            [img, productId]
          );
          dossier.product.image_url = img;
        }
      }
      
      return res.json({
        success: true,
        message: 'Product dossier already exists',
        productId,
        data: dossier
      });
    }

    // Build new dossier (or rebuild if product exists but no dossier)
    const existingProductId = existing.rows.length > 0 ? existing.rows[0].id : null;
    console.log(`\n🚀 Building dossier for: ${productName}${existingProductId ? ' (rebuilding)' : ' (new)'}`);
    console.log(`   Using Smart AI Routing (Gemini only - cost savings mode)`);
    
    const result = await builder.buildDossier(productName, category || 'general');

    // Get the full dossier
    const dossier = await builder.getDossier(result.productId);

    res.json({
      success: true,
      message: 'Dossier built successfully',
      productId: result.productId,
      data: dossier,
      ai_usage: {
        gemini_calls: 1,
        cost: '$0.00',
        mode: 'Expert Analysis'
      }
    });

  } catch (error) {
    console.error('Build error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * POST /api/products/:id/rebuild
 * Force rebuild dossier for existing product
 */
app.post('/api/products/:id/rebuild', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get product name
    const product = await db.query('SELECT name, category FROM products WHERE id = $1', [id]);
    
    if (product.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    const { name, category } = product.rows[0];
    
    console.log(`\n🔄 Force rebuilding dossier for: ${name} (ID: ${id})`);
    
    // Delete existing dossier
    await db.query('DELETE FROM dossiers WHERE product_id = $1', [id]);
    await db.query('DELETE FROM reviews_summary WHERE product_id = $1', [id]);
    
    // Build new dossier
    const result = await builder.buildDossier(name, category || 'general');
    
    // Get the full dossier
    const dossier = await builder.getDossier(result.productId);
    
    res.json({
      success: true,
      message: 'Dossier rebuilt successfully',
      productId: result.productId,
      data: dossier,
      ai_usage: {
        gemini_calls: 1,
        cost: '$0.00',
        mode: 'Expert Analysis'
      }
    });
    
  } catch (error) {
    console.error('Rebuild error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================================
// ADMIN ROUTES (Cursor)
// ============================================================================

const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);

// ============================================================================
// ERROR HANDLING - Windsurf's approach
// ============================================================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method
  });

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ============================================================================
// START SERVER
// ============================================================================

// Start server only if not in Vercel serverless environment
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 ClearPick.ai Unified API Server                     ║
║                                                           ║
║   👥 Built by: Cursor + Windsurf                         ║
║   📡 URL: http://localhost:${PORT.toString().padEnd(4)}                          ║
║   💾 Database: PostgreSQL                                 ║
║   🤖 AI: Gemini + Claude (Smart Routing)                 ║
║   📊 Status: Ready                                        ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

✨ Features:
   🧠 Expert Analysis (Patterns, Correlations, Predictions)
   🖼️  Product Images (Official Product Photos)
   📈 AI Statistics tracking
   🛡️  Rate limiting
   🔒 Security headers

🔗 Endpoints:
   GET  /                      → Server info
   GET  /api/health            → Health check + DB status
   GET  /api/search?q=...      → Search products
   GET  /api/products          → List all products
   GET  /api/products/:id      → Get product dossier
   POST /api/products/build    → Build new dossier (AI!)
   GET  /api/admin/ai-stats    → AI usage statistics
   GET  /api/admin/system-info → System information

💡 Try:
   curl http://localhost:${PORT}/api/health
   curl http://localhost:${PORT}/api/admin/ai-stats
  `);
  });
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n⚠️  SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n⚠️  SIGINT received, shutting down gracefully...');
  process.exit(0);
});

module.exports = app;
