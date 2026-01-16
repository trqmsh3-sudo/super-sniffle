const express = require('express');
const cors = require('cors');
require('./loadEnv');
const apiRoutes = require('./routes/api');
const adminRoutes = require('./routes/admin');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  // Log request
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  
  // Log response
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} ${res.statusCode} - ${duration}ms`);
  });
  
  next();
});

// Root route
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
      jobStatus: 'GET /api/jobs/:jobId'
    },
    features: {
      database: 'PostgreSQL',
      queue: 'Bull Queue',
      ai: 'Claude (coming soon)',
      data_sources: 'Reddit (coming soon)'
    }
  });
});

// API Routes
app.use('/api', apiRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler (must come BEFORE error handler)
app.use(notFoundHandler);

// Global error handling middleware (must come LAST)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════╗
║   🚀 ClearPick.ai Backend Server         ║
║   📡 Running on: http://localhost:${PORT}  ║
║   💾 Database: PostgreSQL                 ║
║   🤖 AI: Claude (coming soon)             ║
╚═══════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received, shutting down gracefully...');
  process.exit(0);
});

module.exports = app;
