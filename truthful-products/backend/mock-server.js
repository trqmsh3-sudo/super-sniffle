const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
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
      database: 'Mock (PostgreSQL coming soon)',
      queue: 'Mock (Bull Queue coming soon)',
      ai: 'Claude (coming soon)',
      data_sources: 'Reddit (coming soon)'
    }
  });
});

// Mock data store
const mockData = {
  products: [],
  dossiers: {},
  jobs: {}
};

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'ClearPick.ai API',
    database: 'mock',
    version: '2.0.0'
  });
});

// Search products
app.get('/api/search', (req, res) => {
  const { q } = req.query;
  
  if (!q) {
    return res.status(400).json({
      error: 'Search query is required'
    });
  }

  // Return empty results for now
  res.json({
    success: true,
    data: [],
    count: 0,
    message: 'No products found yet - system ready for data'
  });
});

// Get product details
app.get('/api/products/:id', (req, res) => {
  const { id } = req.params;
  
  // Check if product exists
  const product = mockData.products.find(p => p.id === parseInt(id));
  
  if (!product) {
    return res.status(404).json({
      error: 'Product not found',
      success: false
    });
  }
  
  // Get dossier
  const dossier = mockData.dossiers[id];
  
  res.json({
    success: true,
    data: {
      product,
      dossier: dossier || null,
      reviews: []
    }
  });
});

// Build product dossier
app.post('/api/products/build', (req, res) => {
  const { productName } = req.body;
  
  if (!productName) {
    return res.status(400).json({
      error: 'Product name is required'
    });
  }

  // Create product
  const productId = mockData.products.length + 1;
  const product = {
    id: productId,
    name: productName,
    category: 'electronics',
    created_at: new Date().toISOString()
  };
  
  mockData.products.push(product);
  
  // Create dossier
  mockData.dossiers[productId] = {
    product_id: productId,
    overall_score: 0,
    quality_score: 0,
    value_score: 0,
    reliability_score: 0,
    summary: '',
    pros: [],
    cons: [],
    common_failures: [],
    best_for: [],
    not_recommended_for: [],
    total_reviews: 0,
    confidence_score: 0,
    status: 'building',
    created_at: new Date().toISOString()
  };
  
  // Create job
  const jobId = 'job_' + Date.now();
  mockData.jobs[jobId] = {
    id: jobId,
    product_name: productName,
    status: 'waiting',
    progress: 0,
    result: null,
    error_message: null,
    created_at: new Date().toISOString()
  };
  
  // Simulate job completion after 3 seconds
  setTimeout(() => {
    if (mockData.jobs[jobId]) {
      mockData.jobs[jobId].status = 'completed';
      mockData.jobs[jobId].progress = 100;
      mockData.dossiers[productId].status = 'ready';
      mockData.dossiers[productId].overall_score = 85;
      mockData.dossiers[productId].summary = `Analysis complete for ${productName}`;
    }
  }, 3000);
  
  res.json({
    success: true,
    message: 'Building dossier...',
    productId,
    jobId,
    estimatedTime: 3
  });
});

// Get job status
app.get('/api/jobs/:jobId', (req, res) => {
  const { jobId } = req.params;
  
  const job = mockData.jobs[jobId];
  
  if (!job) {
    return res.status(404).json({
      error: 'Job not found',
      success: false
    });
  }

  res.json({
    success: true,
    data: {
      state: job.status,
      progress: job.progress,
      result: job.result,
      error: job.error_message
    }
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    status: 404
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════╗
║   🚀 ClearPick.ai Mock API Server        ║
║   📡 Running on: http://localhost:${PORT} ║
║   💾 Database: Mock Mode                  ║
║   🤖 AI: Coming Soon                     ║
╚═══════════════════════════════════════════╝
  `);
});

module.exports = app;
