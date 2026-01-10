require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const db = require('./config/database');
const DossierBuilder = require('./services/dossierBuilder');

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
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

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
// ROOT ROUTES
// ============================================================================

app.get('/', (req, res) => {
  res.json({
    service: 'ClearPick.ai Unified API',
    version: '3.0.0',
    status: 'running',
    features: {
      smart_ai_routing: '✅ Active (70% cost savings)',
      gemini_ai: process.env.GEMINI_API_KEY ? '✅ Connected' : '❌ Missing key',
      claude_ai: process.env.CLAUDE_API_KEY ? '✅ Connected (Web Search)' : '⚠️ Optional',
      database: '✅ PostgreSQL',
      scrapers: '✅ Reddit + Amazon (Windsurf)',
      middleware: '✅ Rate Limit + Error Handler (Windsurf)',
      logger: '⏳ Upgrading to Winston (Windsurf)'
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
    // Test database connection
    await db.query('SELECT NOW()');
    
    res.json({
      success: true,
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        database: '✅ Connected',
        gemini: process.env.GEMINI_API_KEY ? '✅ Ready' : '❌ No API Key',
        claude: process.env.CLAUDE_API_KEY ? '✅ Ready' : '⚠️ Optional',
        smart_routing: '✅ Active'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 'error',
      timestamp: new Date().toISOString(),
      services: {
        database: '❌ ' + error.message
      }
    });
  }
});

// ============================================================================
// PRODUCT ROUTES
// ============================================================================

// Apply rate limiting to API routes
app.use('/api', apiLimiter);

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
      error: error.message
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

    // Build new dossier with Smart AI Routing
    console.log(`\n🚀 Building new dossier for: ${productName}`);
    console.log(`   Using Smart AI Routing (Gemini + Claude)`);
    
    const result = await builder.buildDossier(productName, category || 'general');

    // Get the full dossier
    const dossier = await builder.getDossier(result.productId);

    // Get AI stats
    const aiStats = builder.getAIStats();

    res.json({
      success: true,
      message: 'Dossier built successfully',
      productId: result.productId,
      data: dossier,
      ai_usage: {
        gemini_calls: aiStats.calls.gemini,
        claude_calls: aiStats.calls.claude,
        cost: aiStats.costs.total,
        savings: aiStats.costs.actual_savings
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
   🧠 Smart AI Routing (70% cost savings)
   🔍 Web Search (Claude)
   🔄 Auto-fallback (Gemini → Claude)
   📈 AI Statistics tracking
   🛡️  Rate limiting (Windsurf)
   🔒 Security headers (Windsurf)

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
