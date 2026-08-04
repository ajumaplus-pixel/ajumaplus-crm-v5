const Redis = require('redis');
const { logger } = require('../utils/logger');

// Redis client configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: process.env.REDIS_DB || 0,
  retryStrategy: (times) => {
    // Stop reconnection after 3 attempts
    if (times > 3) {
      logger.warn('Redis reconnection attempts exhausted, running without cache');
      return null;
    }
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 1,
  enableReadyCheck: true,
  enableOfflineQueue: false
};

// Create Redis client
let redisClient;
let redisAvailable = false;

const createRedisClient = () => {
  try {
    redisClient = Redis.createClient(redisConfig);

    redisClient.on('error', (err) => {
      if (err.code !== 'ECONNREFUSED') {
        logger.error('Redis Client Error:', err);
      }
    });

    redisClient.on('connect', () => {
      logger.info('Redis Client Connected');
      redisAvailable = true;
    });

    redisClient.on('reconnecting', () => {
      // Only log if Redis is enabled
      if (process.env.REDIS_ENABLED === 'true') {
        logger.info('Redis Client Reconnecting');
      }
    });

    redisClient.on('ready', () => {
      logger.info('Redis Client Ready');
      redisAvailable = true;
    });

    return redisClient;
  } catch (error) {
    logger.error('Failed to create Redis client:', error);
    return null;
  }
};

// Initialize Redis connection
const initializeRedis = async () => {
  // Check if Redis is enabled
  if (process.env.REDIS_ENABLED === 'false') {
    logger.info('Redis is disabled, running without cache');
    redisAvailable = false;
    return false;
  }

  try {
    redisClient = createRedisClient();
    
    if (redisClient) {
      await redisClient.connect();
      logger.info('Redis connection established successfully');
      redisAvailable = true;
      return true;
    } else {
      logger.warn('Redis client creation failed, running without cache');
      redisAvailable = false;
      return false;
    }
  } catch (error) {
    logger.error('Redis initialization failed:', error);
    logger.warn('Running without Redis caching');
    redisAvailable = false;
    return false;
  }
};

// Check if Redis is available
const isRedisAvailable = () => {
  return redisAvailable && redisClient && redisClient.isOpen;
};

// Cache operations
const cache = {
  // Set value with expiration
  async set(key, value, ttl = 3600) {
    if (!isRedisAvailable()) return false;
    
    try {
      const serializedValue = JSON.stringify(value);
      await redisClient.setEx(key, ttl, serializedValue);
      logger.debug('Cache set', { key, ttl });
      return true;
    } catch (error) {
      logger.error('Cache set error:', error);
      return false;
    }
  },

  // Get value
  async get(key) {
    if (!isRedisAvailable()) return null;
    
    try {
      const value = await redisClient.get(key);
      if (value) {
        return JSON.parse(value);
      }
      return null;
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  },

  // Delete value
  async del(key) {
    if (!isRedisAvailable()) return false;
    
    try {
      await redisClient.del(key);
      logger.debug('Cache deleted', { key });
      return true;
    } catch (error) {
      logger.error('Cache delete error:', error);
      return false;
    }
  },

  // Delete multiple keys by pattern
  async delPattern(pattern) {
    if (!isRedisAvailable()) return false;
    
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
        logger.debug('Cache pattern deleted', { pattern, count: keys.length });
      }
      return true;
    } catch (error) {
      logger.error('Cache pattern delete error:', error);
      return false;
    }
  },

  // Check if key exists
  async exists(key) {
    if (!isRedisAvailable()) return false;
    
    try {
      return await redisClient.exists(key) === 1;
    } catch (error) {
      logger.error('Cache exists error:', error);
      return false;
    }
  },

  // Set multiple values
  async mset(keyValuePairs, ttl = 3600) {
    if (!isRedisAvailable()) return false;
    
    try {
      const pipeline = redisClient.multi();
      
      for (const [key, value] of Object.entries(keyValuePairs)) {
        const serializedValue = JSON.stringify(value);
        pipeline.setEx(key, ttl, serializedValue);
      }
      
      await pipeline.exec();
      logger.debug('Cache mset', { keys: Object.keys(keyValuePairs) });
      return true;
    } catch (error) {
      logger.error('Cache mset error:', error);
      return false;
    }
  },

  // Get multiple values
  async mget(keys) {
    if (!isRedisAvailable()) return {};

    try {
      const values = await redisClient.mGet(keys);
      const result = {};
      
      keys.forEach((key, index) => {
        if (values[index]) {
          try {
            result[key] = JSON.parse(values[index]);
          } catch (error) {
            result[key] = values[index];
          }
        }
      });
      
      return result;
    } catch (error) {
      logger.error('Cache mget error:', error);
      return {};
    }
  },

  // Increment value
  async incr(key, by = 1) {
    if (!isRedisAvailable()) return null;
    
    try {
      return await redisClient.incrBy(key, by);
    } catch (error) {
      logger.error('Cache incr error:', error);
      return null;
    }
  },

  // Set value only if key doesn't exist
  async setnx(key, value, ttl = 3600) {
    if (!isRedisAvailable()) return false;
    
    try {
      const serializedValue = JSON.stringify(value);
      const result = await redisClient.set(key, serializedValue, { NX: true, EX: ttl });
      logger.debug('Cache setnx', { key, success: result === 'OK' });
      return result === 'OK';
    } catch (error) {
      logger.error('Cache setnx error:', error);
      return false;
    }
  },

  // Get or set (cache-aside pattern)
  async getOrSet(key, fetchFunction, ttl = 3600) {
    const cachedValue = await this.get(key);
    
    if (cachedValue !== null) {
      logger.debug('Cache hit', { key });
      return cachedValue;
    }
    
    logger.debug('Cache miss', { key });
    const value = await fetchFunction();
    await this.set(key, value, ttl);
    return value;
  },

  // Flush all cache
  async flush() {
    if (!isRedisAvailable()) return false;
    
    try {
      await redisClient.flushDb();
      logger.info('Cache flushed');
      return true;
    } catch (error) {
      logger.error('Cache flush error:', error);
      return false;
    }
  },

  // Get cache statistics
  async getStats() {
    if (!isRedisAvailable()) return null;
    
    try {
      const info = await redisClient.info('stats');
      const keyCount = await redisClient.dbSize();
      
      return {
        keyCount,
        info
      };
    } catch (error) {
      logger.error('Cache stats error:', error);
      return null;
    }
  }
};

// Cache key generators
const cacheKeys = {
  user: (userId) => `user:${userId}`,
  userProfile: (userId) => `user:profile:${userId}`,
  userPermissions: (userId) => `user:permissions:${userId}`,
  
  customer: (customerId) => `customer:${customerId}`,
  customerJobs: (customerId) => `customer:jobs:${customerId}`,
  
  isp: (ispId) => `isp:${ispId}`,
  ispProfile: (ispId) => `isp:profile:${ispId}`,
  ispAvailable: (location) => `isp:available:${location}`,
  
  job: (jobId) => `job:${jobId}`,
  jobDetails: (jobId) => `job:details:${jobId}`,
  jobStatus: (jobId) => `job:status:${jobId}`,
  
  quotation: (quotationId) => `quotation:${quotationId}`,
  quotationJob: (jobId) => `quotation:job:${jobId}`,
  
  aiAnalysis: (jobId) => `ai:analysis:${jobId}`,
  aiPricing: (jobId) => `ai:pricing:${jobId}`,
  
  analytics: (type, period) => `analytics:${type}:${period}`,
  stats: (type) => `stats:${type}`,
  
  session: (sessionId) => `session:${sessionId}`,
  rateLimit: (identifier) => `ratelimit:${identifier}`,
  
  search: (query) => `search:${query}`,
  searchResults: (query, type) => `search:${type}:${query}`
};

// Cache TTL configurations
const cacheTTL = {
  short: 300,        // 5 minutes
  medium: 1800,      // 30 minutes
  long: 3600,        // 1 hour
  veryLong: 86400,   // 24 hours
  extended: 604800   // 7 days
};

// Close Redis connection
const closeRedis = async () => {
  if (redisClient && redisClient.isOpen) {
    try {
      await redisClient.quit();
      logger.info('Redis connection closed');
    } catch (error) {
      logger.error('Error closing Redis connection:', error);
    }
  }
};

module.exports = {
  redisClient,
  initializeRedis,
  isRedisAvailable,
  cache,
  cacheKeys,
  cacheTTL,
  closeRedis
};