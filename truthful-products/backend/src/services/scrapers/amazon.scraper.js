import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { logger } from '../../utils/logger.js';
import { CONSTANTS } from '../../config/constants.js';

puppeteer.use(StealthPlugin());

export const scrapeAmazon = async (productName) => {
  logger.info(`Starting Amazon scrape for: ${productName}`);
  
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setUserAgent(CONSTANTS.SCRAPER.USER_AGENT);
    
    const searchUrl = `${CONSTANTS.AMAZON.BASE_URL}/s?k=${encodeURIComponent(productName)}`;
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: CONSTANTS.SCRAPER.TIMEOUT });

    const productData = await page.evaluate(() => {
      const firstProduct = document.querySelector('[data-component-type="s-search-result"]');
      if (!firstProduct) return null;

      const titleEl = firstProduct.querySelector('h2 a span');
      const priceEl = firstProduct.querySelector('.a-price .a-offscreen');
      const ratingEl = firstProduct.querySelector('.a-icon-star-small .a-icon-alt');
      const reviewCountEl = firstProduct.querySelector('[aria-label*="stars"]');
      const linkEl = firstProduct.querySelector('h2 a');

      return {
        title: titleEl?.textContent?.trim() || '',
        price: priceEl?.textContent?.trim() || '',
        rating: ratingEl?.textContent?.trim() || '',
        reviewCount: reviewCountEl?.getAttribute('aria-label') || '',
        link: linkEl?.href || '',
      };
    });

    if (!productData || !productData.title) {
      logger.warn(`No Amazon results found for: ${productName}`);
      return { success: false, data: null };
    }

    const productUrl = productData.link.startsWith('http') 
      ? productData.link 
      : `${CONSTANTS.AMAZON.BASE_URL}${productData.link}`;
    
    await page.goto(productUrl, { waitUntil: 'networkidle2', timeout: CONSTANTS.SCRAPER.TIMEOUT });

    const reviews = await page.evaluate((maxReviews) => {
      const reviewElements = document.querySelectorAll('[data-hook="review"]');
      const reviewsData = [];

      reviewElements.forEach((review, index) => {
        if (index >= maxReviews) return;

        const rating = review.querySelector('[data-hook="review-star-rating"]')?.textContent?.trim() || '';
        const title = review.querySelector('[data-hook="review-title"]')?.textContent?.trim() || '';
        const body = review.querySelector('[data-hook="review-body"]')?.textContent?.trim() || '';
        const verified = review.querySelector('[data-hook="avp-badge"]') !== null;

        reviewsData.push({ rating, title, body, verified });
      });

      return reviewsData;
    }, CONSTANTS.AMAZON.MAX_REVIEWS);

    logger.info(`Amazon scrape successful: ${reviews.length} reviews found`);

    return {
      success: true,
      data: {
        source: 'Amazon',
        product: productData.title,
        price: productData.price,
        rating: productData.rating,
        reviewCount: productData.reviewCount,
        reviews: reviews,
        url: productUrl,
      },
    };

  } catch (error) {
    logger.error('Amazon scraper error:', error);
    return { success: false, error: error.message };
  } finally {
    if (browser) await browser.close();
  }
};
