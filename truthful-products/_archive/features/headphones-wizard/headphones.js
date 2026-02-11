const express = require('express');
const router = express.Router();
const headphonesWizard = require('../services/headphonesWizard');
const { buildLimiter } = require('../middleware/rateLimit');

/**
 * POST /api/headphones/recommend
 * 
 * Get headphones recommendations based on user preferences
 * 
 * NOTE: This endpoint requires POST method, not GET!
 * 
 * Body:
 * {
 *   budget: number (0-2000),
 *   useCase: string ('ריצה' | 'עבודה' | 'משחקים' | 'מוזיקה' | 'שיחות'),
 *   features: string[] (['ביטול רעשים', 'אלחוטי', 'עמיד למים', 'סוללה ארוכה']),
 *   brand: string ('לא משנה' | 'Sony' | 'Bose' | 'JBL' | 'Samsung' | 'Apple' | 'אחר')
 * }
 * 
 * Response:
 * {
 *   success: true,
 *   recommendations: [
 *     { best: {...} },
 *     { cheapest: {...} },
 *     { value: {...} }
 *   ],
 *   searchQuery: string,
 *   totalFound: number
 * }
 */
router.post('/recommend', buildLimiter, async (req, res) => {
  console.log(`🎧 POST /api/headphones/recommend called`);
  console.log(`   Method: ${req.method}`);
  console.log(`   Body:`, req.body);
  
  try {
    const { budget, useCase, features, brand } = req.body;

    // Validation
    if (!budget || typeof budget !== 'number' || budget < 0 || budget > 5000) {
      return res.status(400).json({
        success: false,
        error: 'Budget must be a number between 0 and 5000'
      });
    }

    if (!useCase || typeof useCase !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'useCase is required'
      });
    }

    if (!Array.isArray(features)) {
      return res.status(400).json({
        success: false,
        error: 'features must be an array'
      });
    }

    if (!brand || typeof brand !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'brand is required'
      });
    }

    console.log(`🎧 Headphones recommendation request:`, {
      budget,
      useCase,
      features,
      brand
    });

    // Get recommendations
    const result = await headphonesWizard.findHeadphones({
      budget,
      useCase,
      features,
      brand
    });

    res.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('Headphones recommendation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get recommendations',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * GET /api/headphones/health
 * Health check for headphones wizard
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'Headphones Wizard',
    status: 'active',
    version: '1.0.0'
  });
});

/**
 * GET /api/headphones/recommend
 * Info endpoint - tells user to use POST
 */
router.get('/recommend', (req, res) => {
  res.status(405).json({
    success: false,
    error: 'Method not allowed. Use POST /api/headphones/recommend',
    method: 'POST',
    body: {
      budget: 'number (0-5000)',
      useCase: 'string (ריצה | עבודה | משחקים | מוזיקה | שיחות)',
      features: 'array (ביטול רעשים | אלחוטי | עמיד למים | סוללה ארוכה)',
      brand: 'string (לא משנה | Sony | Bose | JBL | Samsung | Apple | אחר)'
    }
  });
});

module.exports = router;
