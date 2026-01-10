const express = require('express');
const router = express.Router();
const DossierBuilder = require('../services/dossierBuilder');

// Initialize builder (shared instance for stats)
const builder = new DossierBuilder();

/**
 * GET /api/admin/ai-stats
 * קבל סטטיסטיקות שימוש ב-AI
 */
router.get('/ai-stats', (req, res) => {
  try {
    const stats = builder.getAIStats();
    
    res.json({
      success: true,
      stats: {
        overview: {
          total_calls: stats.calls.total,
          gemini_calls: stats.calls.gemini,
          claude_calls: stats.calls.claude,
          gemini_percentage: stats.calls.gemini_percentage
        },
        costs: {
          gemini: stats.costs.gemini,
          claude: stats.costs.claude,
          total_cost: stats.costs.total,
          savings: {
            usd: stats.costs.actual_savings,
            ils: stats.costs.actual_savings_ils
          },
          potential_cost_without_routing: stats.costs.potential_without_routing
        },
        errors: {
          gemini: stats.errors.gemini,
          claude: stats.errors.claude,
          total: stats.errors.gemini + stats.errors.claude
        },
        uptime: stats.uptime,
        message: stats.message
      },
      visualization: {
        pie_chart: [
          { name: 'Gemini (Free)', value: stats.calls.gemini, color: '#10b981' },
          { name: 'Claude (Paid)', value: stats.calls.claude, color: '#3b82f6' }
        ],
        cost_comparison: {
          with_routing: parseFloat(stats.costs.total.replace('$', '')),
          without_routing: parseFloat(stats.costs.potential_without_routing.replace('$', '')),
          saved: parseFloat(stats.costs.actual_savings.replace('$', ''))
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/admin/ai-stats/reset
 * אפס סטטיסטיקות
 */
router.post('/ai-stats/reset', (req, res) => {
  try {
    builder.router.resetStats();
    
    res.json({
      success: true,
      message: 'Statistics reset successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/admin/system-info
 * מידע על המערכת
 */
router.get('/system-info', (req, res) => {
  res.json({
    success: true,
    system: {
      ai_services: {
        gemini: {
          enabled: !!process.env.GEMINI_API_KEY,
          model: 'gemini-1.5-flash',
          cost: 'Free (60 req/min)',
          purpose: 'Simple tasks, filtering, summarization'
        },
        claude: {
          enabled: !!process.env.CLAUDE_API_KEY,
          model: 'claude-sonnet-4',
          cost: '~$0.02 per call',
          purpose: 'Complex tasks, web search, deep analysis'
        }
      },
      database: {
        type: 'PostgreSQL',
        connected: true // TODO: actual check
      },
      features: {
        smart_routing: 'Enabled',
        web_search: process.env.CLAUDE_API_KEY ? 'Available' : 'Requires Claude API Key',
        cost_optimization: 'Active'
      }
    }
  });
});

module.exports = router;
