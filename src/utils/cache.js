import Redis from "ioredis";

let redisClient = null;

const getRedisClient = () => {
  if (!redisClient) {
    redisClient = new Redis({
      host: process.env.REDIS_HOST || "localhost",
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    redisClient.on("error", (err) => {
      console.error("Redis Client Error:", err);
    });

    redisClient.on("connect", () => {
      console.log("Redis Client Connected");
    });
  }
  return redisClient;
};

const cacheService = {
  /**
   * Get cached data
   * @param {string} key - Cache key
   * @returns {Promise<any|null>} - Cached data or null
   */
  async get(key) {
    try {
      const client = getRedisClient();
      const data = await client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Cache get error:", error);
      return null;
    }
  },

  /**
   * Set cached data
   * @param {string} key - Cache key
   * @param {any} value - Data to cache
   * @param {number} ttl - Time to live in seconds (default 3600)
   */
  async set(key, value, ttl = 3600) {
    try {
      const client = getRedisClient();
      await client.setex(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error("Cache set error:", error);
      return false;
    }
  },

  /**
   * Delete cached data
   * @param {string} key - Cache key or pattern
   */
  async del(key) {
    try {
      const client = getRedisClient();
      await client.del(key);
      return true;
    } catch (error) {
      console.error("Cache delete error:", error);
      return false;
    }
  },

  /**
   * Delete all keys matching a pattern
   * @param {string} pattern - Pattern to match (e.g., "user:123:*")
   */
  async delPattern(pattern) {
    try {
      const client = getRedisClient();
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(...keys);
      }
      return true;
    } catch (error) {
      console.error("Cache delete pattern error:", error);
      return false;
    }
  },

  /**
   * Clear all cache
   */
  async flushAll() {
    try {
      const client = getRedisClient();
      await client.flushall();
      return true;
    } catch (error) {
      console.error("Cache flush error:", error);
      return false;
    }
  },

  /**
   * Close Redis connection
   */
  async close() {
    try {
      if (redisClient) {
        await redisClient.quit();
        redisClient = null;
      }
    } catch (error) {
      console.error("Cache close error:", error);
    }
  },
};

export default cacheService;
