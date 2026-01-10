require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/database');
const DossierBuilder = require('./services/dossierBuilder');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Initialize builder
const builder = new DossierBuilder();

// ============================================================================
// ROOT ROUTE
// ============================================================================

app.get('/', (req, res) => {
  res.json({
    service: 'ClearPick.ai API',
    version: '2.0.0',
    status: 'running',
    endpoints: {
      health: 'GET /api/health',
      search: 'GET /api/search?q=product',
      product: 'GET /api/products/:id',
      build: 'POST /api/products/build',
      list: 'GET /api/products'
    },
    features: {
      database: '✅ PostgreSQL',
      ai: '✅ Gemini AI',
      data_collection: '✅ Active',
      caching: '⏳ Coming soon'
    }
  });
});

// ============================================================================
// HEALTH CHECK
// ============================================================================

app.get('/api/health', async (req, res) => {
  try {
    // Test database connection
    await db.query('SELECT NOW()');
    
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'ClearPick.ai API',
      database: '✅ Connected',
      ai: process.env.GEMINI_API_KEY ? '✅ Ready' : '❌ No API Key'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: '❌ ' + error.message
    });
  }
});

// ============================================================================
// SEARCH PRODUCTS
// ============================================================================

app.get('/api/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({
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
      error: error.message
    });
  }
});

// ============================================================================
// GET ALL PRODUCTS (LIST)
// ============================================================================

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

// ============================================================================
// GET PRODUCT BY ID
// ============================================================================

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

// ============================================================================
// BUILD NEW DOSSIER
// ============================================================================

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

    // Check if product already exists
    const existing = await db.query(
      'SELECT id FROM products WHERE name = $1',
      [productName]
    );

    if (existing.rows.length > 0) {
      const productId = existing.rows[0].id;
      const dossier = await builder.getDossier(productId);
      
      return res.json({
        success: true,
        message: 'Product already exists',
        productId,
        data: dossier
      });
    }

    // Build new dossier
    console.log(`\n🚀 Building new dossier for: ${productName}`);
    
    const result = await builder.buildDossier(productName, category || 'general');

    // Get the full dossier
    const dossier = await builder.getDossier(result.productId);

    res.json({
      success: true,
      message: 'Dossier built successfully',
      productId: result.productId,
      data: dossier
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

// ============================================================================
// ADMIN ROUTES
// ============================================================================

app.use('/api/admin', adminRoutes);

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// ============================================================================
// START SERVER
// ============================================================================

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════╗
║                                                    ║
║   🚀 ClearPick.ai API Server Running              ║
║                                                    ║
║   📡 URL: http://localhost:${PORT.toString().padEnd(4)}                       ║
║   💾 Database: PostgreSQL                          ║
║   🤖 AI: Gemini Pro                                ║
║   📊 Status: Ready                                 ║
║                                                    ║
╚════════════════════════════════════════════════════╝

🔗 Endpoints:
   - GET  /api/health          → Health check
   - GET  /api/search?q=...    → Search products
   - GET  /api/products        → List all products
   - GET  /api/products/:id    → Get product details
   - POST /api/products/build  → Build new dossier

💡 Try: curl http://localhost:${PORT}/api/health
  `);
});

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
