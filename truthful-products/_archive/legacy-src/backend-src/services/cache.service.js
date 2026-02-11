import { cacheGet, cacheSet, cacheDel } from '../config/redis.js';
import { logger } from '../utils/logger.js';
import { CONSTANTS } from '../config/constants.js';

export const getCachedProduct = async (productName) => {
  const key = `product:intel:${productName.toLowerCase().trim()}`;
  const cached = await cacheGet(key);
  
  if (cached) {
    logger.info(`Cache HIT for product: ${productName}`);
    return cached;
  }
  
  logger.info(`Cache MISS for product: ${productName}`);
  return null;
};

export const setCachedProduct = async (productName, data) => {
  const key = `product:intel:${productName.toLowerCase().trim()}`;
  const success = await cacheSet(key, data, CONSTANTS.CACHE_TTL.PRODUCT);
  
  if (success) {
    logger.info(`Cached product data for: ${productName} (TTL: ${CONSTANTS.CACHE_TTL.PRODUCT}s)`);
  }
  
  return success;
};

export const invalidateProductCache = async (productName) => {
  const key = `product:intel:${productName.toLowerCase().trim()}`;
  return await cacheDel(key);
};
