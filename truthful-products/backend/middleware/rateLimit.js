const rateLimit = require('express-rate-limit');

/**
 * Rate limiter for expensive dossier building operations
 * Limits: 10 builds per IP per 15 minutes
 */
const buildLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per windowMs
  message: {
    success: false,
    error: 'Too many build requests. Please try again in 15 minutes.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  // Skip rate limiting for successful cached responses
  skip: (req, res) => {
    return res.locals?.cached === true;
  }
});

/**
 * General API rate limiter
 * Limits: 60 requests per IP per minute
 */
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // 60 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests. Please slow down.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Strict rate limiter for sensitive operations (admin, etc.)
 * Limits: 5 requests per IP per minute
 */
const strictLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5,
  message: {
    success: false,
    error: 'Too many requests. Please wait before trying again.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  buildLimiter,
  apiLimiter,
  strictLimiter
};
