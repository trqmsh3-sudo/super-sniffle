import { scrapeAmazon } from '../services/scrapers/amazon.scraper.js';
import { scrapeReddit } from '../services/scrapers/reddit.scraper.js';
import { analyzeProduct } from '../services/ai/claude.service.js';
import { getCachedProduct, setCachedProduct } from '../services/cache.service.js';
import { fuzzyCorrect, getSuggestions } from '../services/fuzzySearch.service.js';
import { logger } from '../utils/logger.js';

export const searchProduct = async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { query } = req.body;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Query must be at least 2 characters long',
      });
    }

    const correctedQuery = fuzzyCorrect(query);
    logger.info(`Product search request: "${query}" → "${correctedQuery}"`);

    const cached = await getCachedProduct(correctedQuery);
    if (cached) {
      return res.json({
        success: true,
        data: cached,
        cached: true,
        processingTime: Date.now() - startTime,
      });
    }

    logger.info('Starting parallel scraping...');
    const [amazonResult, redditResult] = await Promise.allSettled([
      scrapeAmazon(correctedQuery),
      scrapeReddit(correctedQuery),
    ]);

    const scrapedData = {
      amazon: amazonResult.status === 'fulfilled' ? amazonResult.value : { success: false },
      reddit: redditResult.status === 'fulfilled' ? redditResult.value : { success: false },
    };

    if (!scrapedData.amazon.success && !scrapedData.reddit.success) {
      return res.status(404).json({
        success: false,
        error: 'No data found for this product. Please try a different search term.',
      });
    }

    logger.info('Sending data to AI for analysis...');
    const aiAnalysis = await analyzeProduct(scrapedData);

    if (!aiAnalysis.success) {
      return res.status(500).json({
        success: false,
        error: 'Failed to analyze product data',
      });
    }

    const finalResult = {
      query: correctedQuery,
      originalQuery: query !== correctedQuery ? query : undefined,
      analysis: aiAnalysis.data,
      rawData: {
        amazon: scrapedData.amazon.success ? {
          url: scrapedData.amazon.data.url,
          reviewCount: scrapedData.amazon.data.reviews?.length || 0,
        } : null,
        reddit: scrapedData.reddit.success ? {
          posts: scrapedData.reddit.data.totalPosts,
          comments: scrapedData.reddit.data.totalComments,
        } : null,
      },
      timestamp: new Date().toISOString(),
    };

    await setCachedProduct(correctedQuery, finalResult);

    res.json({
      success: true,
      data: finalResult,
      cached: false,
      processingTime: Date.now() - startTime,
    });

  } catch (error) {
    logger.error('Product search error:', error);
    res.status(500).json({
      success: false,
      error: 'An error occurred while processing your request',
    });
  }
};

export const getAutocompleteSuggestions = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.json({ success: true, suggestions: [] });
    }

    const suggestions = getSuggestions(q);

    res.json({
      success: true,
      suggestions,
    });

  } catch (error) {
    logger.error('Autocomplete error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get suggestions',
    });
  }
};
