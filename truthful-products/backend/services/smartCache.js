/**
 * Smart Cache Service
 * 
 * חכם בכמה דרכים:
 * 1. TTL dynamically based on confidence score
 * 2. Building lock - prevents duplicate builds
 * 3. Stale-while-revalidate pattern
 * 4. Cache warming for popular products
 */

const redisClient = require('../config/redis');

class SmartCache {
  constructor() {
    this.DEFAULT_TTL = 3600; // 1 hour
    this.HIGH_CONFIDENCE_TTL = 86400; // 24 hours
    this.LOW_CONFIDENCE_TTL = 1800; // 30 minutes
    this.BUILDING_LOCK_TTL = 300; // 5 minutes
  }

  /**
   * Calculate TTL based on confidence score
   */
  calculateTTL(confidence) {
    if (confidence >= 80) {
      return this.HIGH_CONFIDENCE_TTL; // 24h for high confidence
    } else if (confidence >= 60) {
      return this.DEFAULT_TTL; // 1h for medium confidence
    } else {
      return this.LOW_CONFIDENCE_TTL; // 30m for low confidence
    }
  }

  /**
   * Generate cache key for dossier
   */
  getDossierKey(productId) {
    return `dossier:${productId}`;
  }

  /**
   * Generate cache key for building lock
   */
  getBuildingLockKey(productId) {
    return `building:${productId}`;
  }

  /**
   * Generate cache key for product search
   */
  getSearchKey(productName) {
    return `search:${productName.toLowerCase().replace(/\s+/g, '-')}`;
  }

  /**
   * Get dossier from cache
   */
  async getDossier(productId) {
    const key = this.getDossierKey(productId);
    const cached = await redisClient.get(key);
    
    if (cached) {
      const ttl = await redisClient.ttl(key);
      console.log(`✅ Cache HIT for dossier ${productId} (TTL: ${ttl}s)`);
      return {
        ...cached,
        fromCache: true,
        ttl
      };
    }
    
    console.log(`❌ Cache MISS for dossier ${productId}`);
    return null;
  }

  /**
   * Save dossier to cache
   */
  async saveDossier(productId, dossier, confidence) {
    const key = this.getDossierKey(productId);
    const ttl = this.calculateTTL(confidence);
    
    const cacheData = {
      ...dossier,
      cachedAt: Date.now(),
      confidence
    };
    
    const success = await redisClient.set(key, cacheData, ttl);
    
    if (success) {
      console.log(`✅ Dossier ${productId} cached (TTL: ${ttl}s, confidence: ${confidence}%)`);
    }
    
    return success;
  }

  /**
   * Check if dossier is being built (prevent duplicate builds)
   */
  async isBuilding(productId) {
    const lockKey = this.getBuildingLockKey(productId);
    return await redisClient.exists(lockKey);
  }

  /**
   * Set building lock
   */
  async setBuilding(productId) {
    const lockKey = this.getBuildingLockKey(productId);
    return await redisClient.set(lockKey, { startedAt: Date.now() }, this.BUILDING_LOCK_TTL);
  }

  /**
   * Release building lock
   */
  async releaseBuilding(productId) {
    const lockKey = this.getBuildingLockKey(productId);
    return await redisClient.del(lockKey);
  }

  /**
   * Wait for build to complete (polling)
   */
  async waitForBuild(productId, maxWaitSeconds = 60) {
    const startTime = Date.now();
    const pollInterval = 1000; // 1 second
    
    console.log(`⏳ Waiting for dossier ${productId} to be built...`);
    
    while (Date.now() - startTime < maxWaitSeconds * 1000) {
      // Check if build is complete (dossier in cache)
      const dossier = await this.getDossier(productId);
      if (dossier) {
        console.log(`✅ Dossier ${productId} build complete!`);
        return dossier;
      }
      
      // Check if still building
      const stillBuilding = await this.isBuilding(productId);
      if (!stillBuilding) {
        console.log(`⚠️ Build lock released but no dossier found for ${productId}`);
        return null;
      }
      
      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
    
    console.log(`⏰ Timeout waiting for dossier ${productId} build`);
    return null;
  }

  /**
   * Cache search results (product ID from search)
   */
  async cacheSearch(productName, productId) {
    const key = this.getSearchKey(productName);
    return await redisClient.set(key, { productId, productName }, this.DEFAULT_TTL);
  }

  /**
   * Get cached search result
   */
  async getSearch(productName) {
    const key = this.getSearchKey(productName);
    return await redisClient.get(key);
  }

  /**
   * Invalidate dossier cache (force rebuild)
   */
  async invalidateDossier(productId) {
    const key = this.getDossierKey(productId);
    const success = await redisClient.del(key);
    
    if (success) {
      console.log(`🗑️  Invalidated cache for dossier ${productId}`);
    }
    
    return success;
  }

  /**
   * Get all cache statistics
   */
  async getStats() {
    return await redisClient.getStats();
  }

  /**
   * Clear all cache
   */
  async clearAll() {
    return await redisClient.flushAll();
  }

  /**
   * Check if cache is stale (needs refresh)
   */
  isStale(dossier) {
    if (!dossier || !dossier.cachedAt) return true;
    
    const age = Date.now() - dossier.cachedAt;
    const maxAge = this.calculateTTL(dossier.confidence) * 1000;
    
    return age > maxAge * 0.8; // Stale if > 80% of TTL
  }

  /**
   * Warm cache for popular products
   * (to be called periodically or on-demand)
   */
  async warmCache(popularProductIds, buildFunction) {
    console.log(`🔥 Warming cache for ${popularProductIds.length} popular products...`);
    
    let warmed = 0;
    
    for (const productId of popularProductIds) {
      try {
        // Check if already cached
        const cached = await this.getDossier(productId);
        
        if (!cached || this.isStale(cached)) {
          console.log(`   Warming cache for product ${productId}...`);
          await buildFunction(productId);
          warmed++;
        }
      } catch (error) {
        console.error(`   ❌ Failed to warm cache for product ${productId}:`, error.message);
      }
    }
    
    console.log(`✅ Cache warming complete: ${warmed}/${popularProductIds.length} products refreshed`);
    
    return warmed;
  }
}

module.exports = new SmartCache();
