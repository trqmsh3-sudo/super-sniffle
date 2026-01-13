/**
 * Redis Configuration
 * 
 * Support for both local Redis and Redis Cloud
 * For local: redis://localhost:6379
 * For cloud: redis://username:password@host:port
 */

const redis = require('redis');

class RedisClient {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  /**
   * Connect to Redis
   */
  async connect() {
    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      
      console.log('🔌 Connecting to Redis...');
      
      this.client = redis.createClient({
        url: redisUrl,
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              console.error('❌ Redis reconnection failed after 10 attempts');
              return new Error('Redis reconnection failed');
            }
            return Math.min(retries * 100, 3000); // exponential backoff
          }
        }
      });

      // Error handling
      this.client.on('error', (err) => {
        console.error('❌ Redis Client Error:', err.message);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        console.log('✅ Redis connected');
        this.isConnected = true;
      });

      this.client.on('reconnecting', () => {
        console.log('🔄 Redis reconnecting...');
      });

      this.client.on('ready', () => {
        console.log('✅ Redis ready!');
        this.isConnected = true;
      });

      await this.client.connect();
      
      return true;
    } catch (error) {
      console.error('❌ Redis connection failed:', error.message);
      console.warn('⚠️ Running without cache - performance will be slower');
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Get value from cache
   */
  async get(key) {
    if (!this.isConnected || !this.client) {
      return null;
    }

    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.warn(`⚠️ Redis GET failed for key "${key}":`, error.message);
      return null;
    }
  }

  /**
   * Set value in cache with TTL
   */
  async set(key, value, ttlSeconds = 3600) {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      await this.client.setEx(key, ttlSeconds, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn(`⚠️ Redis SET failed for key "${key}":`, error.message);
      return false;
    }
  }

  /**
   * Delete key from cache
   */
  async del(key) {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      console.warn(`⚠️ Redis DEL failed for key "${key}":`, error.message);
      return false;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key) {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      const exists = await this.client.exists(key);
      return exists === 1;
    } catch (error) {
      console.warn(`⚠️ Redis EXISTS failed for key "${key}":`, error.message);
      return false;
    }
  }

  /**
   * Get TTL (time to live) of a key
   */
  async ttl(key) {
    if (!this.isConnected || !this.client) {
      return -1;
    }

    try {
      return await this.client.ttl(key);
    } catch (error) {
      console.warn(`⚠️ Redis TTL failed for key "${key}":`, error.message);
      return -1;
    }
  }

  /**
   * Flush all cache (use with caution!)
   */
  async flushAll() {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      await this.client.flushAll();
      console.log('🗑️  Redis cache flushed!');
      return true;
    } catch (error) {
      console.error('❌ Redis FLUSHALL failed:', error.message);
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  async getStats() {
    if (!this.isConnected || !this.client) {
      return {
        connected: false,
        keys: 0,
        memory: 0
      };
    }

    try {
      const info = await this.client.info('stats');
      const dbSize = await this.client.dbSize();
      
      return {
        connected: true,
        keys: dbSize,
        info: info
      };
    } catch (error) {
      console.warn('⚠️ Redis STATS failed:', error.message);
      return {
        connected: false,
        keys: 0,
        memory: 0
      };
    }
  }

  /**
   * Disconnect from Redis
   */
  async disconnect() {
    if (this.client) {
      try {
        await this.client.quit();
        console.log('👋 Redis disconnected');
      } catch (error) {
        console.error('❌ Redis disconnect error:', error.message);
      }
    }
  }
}

// Singleton instance
const redisClient = new RedisClient();

module.exports = redisClient;
