/**
 * Cache Service - Redis Integration
 * 30-day caching for budget protection
 */

const redis = require('redis');
const cacheConfig = require('../config/cache.config');

class CacheService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      errors: 0
    };
  }

  /**
   * Initialize Redis connection
   */
  async connect() {
    try {
      this.client = redis.createClient({
        socket: {
          host: cacheConfig.redis.host,
          port: cacheConfig.redis.port
        },
        password: cacheConfig.redis.password,
        database: cacheConfig.redis.db
      });

      this.client.on('error', (err) => {
        console.error('❌ Redis error:', err);
        this.stats.errors++;
      });

      this.client.on('connect', () => {
        console.log('✅ Redis connected');
        this.connected = true;
      });

      await this.client.connect();
      
    } catch (error) {
      console.error('❌ Failed to connect to Redis:', error.message);
      this.connected = false;
    }
  }

  /**
   * Get value from cache
   */
  async get(key) {
    if (!this.connected) {
      console.warn('⚠️ Redis not connected, skipping cache');
      return null;
    }

    try {
      const value = await this.client.get(key);
      
      if (value) {
        this.stats.hits++;
        console.log(`✅ Cache HIT: ${key}`);
      } else {
        this.stats.misses++;
        console.log(`❌ Cache MISS: ${key}`);
      }
      
      return value;
      
    } catch (error) {
      console.error('❌ Cache get error:', error.message);
      this.stats.errors++;
      return null;
    }
  }

  /**
   * Set value in cache with TTL
   */
  async set(key, value, ttl = cacheConfig.ttl.productAnalysis) {
    if (!this.connected) {
      console.warn('⚠️ Redis not connected, skipping cache set');
      return false;
    }

    try {
      await this.client.setEx(key, ttl, value);
      this.stats.sets++;
      console.log(`✅ Cache SET: ${key} (TTL: ${ttl}s)`);
      return true;
      
    } catch (error) {
      console.error('❌ Cache set error:', error.message);
      this.stats.errors++;
      return false;
    }
  }

  /**
   * Delete value from cache
   */
  async delete(key) {
    if (!this.connected) return false;

    try {
      await this.client.del(key);
      console.log(`🗑️ Cache DELETE: ${key}`);
      return true;
      
    } catch (error) {
      console.error('❌ Cache delete error:', error.message);
      return false;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key) {
    if (!this.connected) return false;

    try {
      const exists = await this.client.exists(key);
      return exists === 1;
      
    } catch (error) {
      console.error('❌ Cache exists error:', error.message);
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;

    return {
      ...this.stats,
      total,
      hitRate: hitRate.toFixed(2) + '%',
      connected: this.connected
    };
  }

  /**
   * Calculate cost savings
   */
  calculateSavings(apiCostPerCall = 0.05) {
    const savedCalls = this.stats.hits;
    const savings = savedCalls * apiCostPerCall;

    return {
      cacheHits: this.stats.hits,
      savedApiCalls: savedCalls,
      estimatedSavings: `$${savings.toFixed(2)}`,
      savingsPerHit: `$${apiCostPerCall.toFixed(3)}`
    };
  }

  /**
   * Disconnect from Redis
   */
  async disconnect() {
    if (this.client && this.connected) {
      await this.client.quit();
      this.connected = false;
      console.log('👋 Redis disconnected');
    }
  }
}

module.exports = new CacheService();
