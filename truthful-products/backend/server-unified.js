require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const db = require('./config/database');
// Use SIMPLE builder - no complications!
const DossierBuilder = require('./services/simpleDossierBuilder');
const productImageService = require('./services/productImageService');
const productValidator = require('./services/productValidator');

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
      images JSONB DEFAULT '[]'::JSONB,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);

  // Add image_url column if it doesn't exist (for existing databases)
  await db.query(`
    ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT;
  `);

  // Add images column if it doesn't exist (for multiple images support)
  await db.query(`
    ALTER TABLE products ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::JSONB;
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

    const queryText = String(q || '').trim();
    const querySpec = productValidator.isTooGeneric(queryText);
    const queryNeedsDisambiguation = querySpec?.tooGeneric === true;

    const results = await db.query(
      `SELECT p.id, p.name, p.category, p.created_at,
              d.overall_score, d.summary, d.status, d.last_updated
       FROM products p
       LEFT JOIN dossiers d ON p.id = d.product_id
       WHERE p.name ILIKE $1
       ORDER BY d.overall_score DESC NULLS LAST, p.created_at DESC
       LIMIT 20`,
      [`%${queryText}%`]
    );

    // If the USER query itself is ambiguous (e.g., "JBL"), don't return generic products like "JBL"
    // even if they exist in the DB (they are effectively junk/too broad).
    const productsRaw = results.rows || [];
    const products = queryNeedsDisambiguation
      ? productsRaw.filter((p) => !productValidator.isTooGeneric(p?.name || '')?.tooGeneric)
      : productsRaw;

    // Suggestions for "no results" cases (typos / too-generic queries)
    let suggestions = [];
    let needsDisambiguation = queryNeedsDisambiguation;
    let didYouMean = null;

    const levenshtein = (a, b) => {
      const s = String(a || '');
      const t = String(b || '');
      const n = s.length;
      const m = t.length;
      if (n === 0) return m;
      if (m === 0) return n;
      const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
      for (let i = 0; i <= n; i++) dp[i][0] = i;
      for (let j = 0; j <= m; j++) dp[0][j] = j;
      for (let i = 1; i <= n; i++) {
        for (let j = 1; j <= m; j++) {
          const cost = s[i - 1] === t[j - 1] ? 0 : 1;
          dp[i][j] = Math.min(
            dp[i - 1][j] + 1,
            dp[i][j - 1] + 1,
            dp[i - 1][j - 1] + cost
          );
        }
      }
      return dp[n][m];
    };

    const similarity = (a, b) => {
      const s = String(a || '').toLowerCase();
      const t = String(b || '').toLowerCase();
      const maxLen = Math.max(s.length, t.length) || 1;
      const dist = levenshtein(s, t);
      return 1 - dist / maxLen;
    };

    const addSuggestionsUnique = (arr) => {
      for (const item of arr || []) {
        if (typeof item === 'string' && item.trim() && !suggestions.includes(item.trim())) {
          suggestions.push(item.trim());
        }
      }
    };

    if (needsDisambiguation) {
      // Brand/category disambiguation suggestions (fast, no DB scan)
      addSuggestionsUnique(productValidator.buildIphoneVariantSuggestions(queryText));
      addSuggestionsUnique(productValidator.buildIphoneFamilySuggestions(queryText));
      addSuggestionsUnique(productValidator.getBrandSuggestions(productValidator.normalizeForCompare(queryText)));
    }

    if (products.length === 0) {
      // 2) Fuzzy suggestions from existing products (typos)
      if (queryText.length >= 3) {
        try {
          const pool = await db.query(
            'SELECT name FROM products ORDER BY updated_at DESC NULLS LAST, created_at DESC LIMIT 300'
          );

          const scored = [];
          for (const row of pool.rows || []) {
            const name = row?.name;
            if (!name) continue;
            const score = similarity(queryText, name);
            if (score >= 0.55) scored.push({ name, score });
          }

          scored.sort((a, b) => b.score - a.score);
          const top = scored.slice(0, 5).map((x) => x.name);
          addSuggestionsUnique(top);

          const best = scored[0];
          if (best && best.score >= 0.85 && best.name.toLowerCase() !== queryText.toLowerCase()) {
            didYouMean = best.name;
          }
        } catch {
          // ignore DB suggestion failures
        }
      }
    }

    // Final clean-up: remove non-actionable suggestions (same as query / still too generic)
    const normalizedQuery = queryText.toLowerCase();
    suggestions = suggestions.filter((s) => {
      const name = String(s || '').trim();
      if (!name) return false;
      if (name.toLowerCase() === normalizedQuery) return false;
      return !productValidator.isTooGeneric(name)?.tooGeneric;
    });

    res.json({
      success: true,
      query: queryText,
      count: products.length,
      products,
      ...(suggestions.length ? { suggestions } : {}),
      ...(didYouMean ? { didYouMean } : {}),
      ...(needsDisambiguation ? { needsDisambiguation: true } : {}),
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
    const hasImages =
      Array.isArray(dossier?.product?.images) && dossier.product.images.length > 0;

    if (!dossier?.product?.image_url || !hasImages) {
      const imgs = await productImageService
        .getMultipleImages(dossier?.product?.name, 3)
        .catch(() => []);
      const primary = imgs?.[0]?.url || null;

      if (primary || (Array.isArray(imgs) && imgs.length > 0)) {
        try {
          await db.query(
            'UPDATE products SET image_url = $1, images = $2, updated_at = NOW() WHERE id = $3',
            [primary, JSON.stringify(imgs), dossier.product.id]
          );
          dossier.product.image_url = primary || dossier.product.image_url;
          dossier.product.images = imgs;
        } catch (e) {
          // Backward compatibility: production DB may not have products.images yet
          const msg = String(e?.message || '');
          if (msg.includes('column') && msg.includes('images') && msg.includes('does not exist')) {
            if (primary) {
              await db.query(
                'UPDATE products SET image_url = $1, updated_at = NOW() WHERE id = $2',
                [primary, dossier.product.id]
              );
              dossier.product.image_url = primary;
            }
          } else {
            throw e;
          }
        }
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

    // 🔍 STEP 1: Validate & Translate product name (supports ALL languages!)
    console.log(`\n🌍 Validating & translating: "${productName}"`);
    const validation = await productValidator.validateAndTranslate(productName);
    
    if (validation?.needsDisambiguation) {
      return res.status(400).json({
        success: false,
        code: 'NEEDS_DISAMBIGUATION',
        error: 'Query is too broad',
        reason: validation.reason || 'Please specify a model (not just a brand/category).',
        originalInput: validation.originalName || productName,
        translatedName: validation.translatedName || null,
        suggestions: Array.isArray(validation.suggestions) ? validation.suggestions : [],
      });
    }

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid product name',
        reason: validation.reason,
        originalInput: validation.originalName,
        suggestion: 'Please enter a real product name (e.g., iPhone 15, Galaxy S24, MacBook Pro)'
      });
    }

    // Use translated name for building dossier
    const finalProductName = validation.translatedName;
    console.log(`   ✅ Valid product: "${validation.originalName}" → "${finalProductName}" (${validation.language})`);


    // Check if product already exists WITH a completed dossier (use translated name)
    const existing = await db.query(
      `SELECT p.id, d.overall_score 
       FROM products p 
       LEFT JOIN dossiers d ON p.id = d.product_id 
       WHERE p.name = $1`,
      [finalProductName]
    );

    // If product exists AND has a dossier with scores, return it
    if (existing.rows.length > 0 && existing.rows[0].overall_score !== null) {
      const productId = existing.rows[0].id;
      const dossier = await builder.getDossier(productId);

      // Backfill image_url for existing products (so UI shows an image immediately)
      if (dossier && !dossier?.product?.image_url) {
        const img = await productImageService.getImageUrl(dossier?.product?.name || finalProductName).catch(() => null);
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
        data: dossier,
        translation: validation.language !== 'English' ? {
          original: validation.originalName,
          translated: finalProductName,
          language: validation.language
        } : null
      });
    }

    // Build new dossier (or rebuild if product exists but no dossier)
    const existingProductId = existing.rows.length > 0 ? existing.rows[0].id : null;
    console.log(`\n🚀 Building dossier for: ${finalProductName}${existingProductId ? ' (rebuilding)' : ' (new)'}`);
    console.log(`   Using Smart AI Routing (Gemini only - cost savings mode)`);
    
    const result = await builder.buildDossier(finalProductName, category || 'general');

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
