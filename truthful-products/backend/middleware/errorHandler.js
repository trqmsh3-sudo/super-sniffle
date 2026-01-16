/**
 * Global Error Handler Middleware
 * Catches and formats all errors in a consistent way
 */

const errorHandler = (err, req, res, next) => {
  // Log error
  console.error('Error Handler caught:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
    body: req.body
  });

  // Determine status code
  const statusCode = err.statusCode || err.status || 500;

  // User-friendly error messages
  const getUserMessage = (err) => {
    // Database errors
    if (err.message?.includes('database') || err.message?.includes('postgres')) {
      return 'Database error - please try again later';
    }
    
    // Validation errors
    if (err.message?.includes('required') || err.message?.includes('invalid')) {
      return err.message;
    }
    
    // Rate limit errors
    if (err.message?.includes('Too many')) {
      return err.message;
    }
    
    // AI errors
    if (err.message?.includes('Gemini') || err.message?.includes('Claude') || err.message?.includes('AI')) {
      return 'AI service temporarily unavailable';
    }
    
    // Reddit scraping errors
    if (err.message?.includes('Reddit') || err.message?.includes('scraper')) {
      return 'Failed to fetch product reviews';
    }
    
    // Generic errors
    if (statusCode >= 500) {
      return 'Internal server error - please try again later';
    }
    
    return err.message || 'An error occurred';
  };

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: getUserMessage(err),
    statusCode,
    timestamp: new Date().toISOString(),
    path: req.path,
    // Include details only in development
    ...(process.env.NODE_ENV === 'development' && {
      details: err.message,
      stack: err.stack
    })
  });
};

/**
 * 404 Handler - must come AFTER all routes
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    statusCode: 404,
    path: req.path,
    timestamp: new Date().toISOString(),
    availableRoutes: {
      health: 'GET /api/health',
      search: 'GET /api/search?q=product',
      product: 'GET /api/products/:id',
      build: 'POST /api/products/build',
      admin: 'GET /api/admin/*'
    }
  });
};

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors automatically
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler
};
