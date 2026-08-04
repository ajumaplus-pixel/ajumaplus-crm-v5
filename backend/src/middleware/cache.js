const { cache, cacheKeys, cacheTTL, isRedisAvailable } = require('../config/redis');
const { logger } = require('../utils/logger');

// Cache middleware factory
const cacheMiddleware = (keyGenerator, ttl = cacheTTL.medium) => {
  return async (req, res, next) => {
    if (!isRedisAvailable()) {
      return next();
    }

    // Generate cache key
    const cacheKey = keyGenerator(req);

    try {
      // Try to get from cache
      const cachedData = await cache.get(cacheKey);

      if (cachedData) {
        logger.debug('Cache hit', { 
          cacheKey, 
          path: req.path,
          requestId: req.requestId 
        });

        return res.json({
          success: true,
          data: cachedData,
          cached: true,
          requestId: req.requestId
        });
      }

      // Store original json method
      const originalJson = res.json.bind(res);

      // Override json method to cache response
      res.json = function(data) {
        // Cache the response
        cache.set(cacheKey, data, ttl).catch(error => {
          logger.error('Cache set error:', error);
        });

        logger.debug('Cache miss, data cached', { 
          cacheKey, 
          path: req.path,
          requestId: req.requestId 
        });

        return originalJson(data);
      };

      next();
    } catch (error) {
      logger.error('Cache middleware error:', error);
      next();
    }
  };
};

// Cache invalidation middleware
const invalidateCache = (keyPattern) => {
  return async (req, res, next) => {
    next();

    // Invalidate cache after response
    res.on('finish', async () => {
      if (res.statusCode < 400 && isRedisAvailable()) {
        try {
          const pattern = typeof keyPattern === 'function' 
            ? keyPattern(req) 
            : keyPattern;
          
          await cache.delPattern(pattern);
          
          logger.debug('Cache invalidated', { 
            pattern,
            path: req.path,
            requestId: req.requestId 
          });
        } catch (error) {
          logger.error('Cache invalidation error:', error);
        }
      }
    });
  };
};

// User-specific cache middleware
const userCache = (req, res, next) => {
  if (!req.user || !isRedisAvailable()) {
    return next();
  }

  const userId = req.user.id;
  const cacheKey = cacheKeys.userProfile(userId);

  cache.get(cacheKey).then(cachedData => {
    if (cachedData) {
      logger.debug('User cache hit', { userId });
      req.cachedUser = cachedData;
    }
    next();
  }).catch(error => {
    logger.error('User cache error:', error);
    next();
  });
};

// Session cache middleware
const sessionCache = (req, res, next) => {
  if (!req.sessionID || !isRedisAvailable()) {
    return next();
  }

  const cacheKey = cacheKeys.session(req.sessionID);

  cache.get(cacheKey).then(cachedData => {
    if (cachedData) {
      logger.debug('Session cache hit', { sessionId: req.sessionID });
      req.cachedSession = cachedData;
    }
    next();
  }).catch(error => {
    logger.error('Session cache error:', error);
    next();
  });
};

// Cache warming for frequently accessed data
const warmCache = async (dataMap, ttl = cacheTTL.long) => {
  if (!isRedisAvailable()) {
    logger.warn('Redis not available for cache warming');
    return;
  }

  try {
    const promises = Object.entries(dataMap).map(([key, value]) => {
      return cache.set(key, value, ttl);
    });

    await Promise.all(promises);
    logger.info('Cache warmed', { keys: Object.keys(dataMap).length });
  } catch (error) {
    logger.error('Cache warming error:', error);
  }
};

// Cache health check
const cacheHealthCheck = async () => {
  if (!isRedisAvailable()) {
    return {
      status: 'unavailable',
      message: 'Redis connection not available'
    };
  }

  try {
    const stats = await cache.getStats();
    return {
      status: 'healthy',
      keys: stats?.keyCount || 0,
      info: stats?.info
    };
  } catch (error) {
    return {
      status: 'error',
      message: error.message
    };
  }
};

// Predefined cache middleware for common routes
const cacheMiddlewarePresets = {
  userById: cacheMiddleware(
    (req) => cacheKeys.user(req.params.id),
    cacheTTL.long
  ),
  
  userProfile: cacheMiddleware(
    (req) => cacheKeys.userProfile(req.user?.id),
    cacheTTL.medium
  ),
  
  allUsers: cacheMiddleware(
    () => cacheKeys.search('all_users'),
    cacheTTL.short
  ),
  
  jobById: cacheMiddleware(
    (req) => cacheKeys.job(req.params.id),
    cacheTTL.medium
  ),
  
  jobDetails: cacheMiddleware(
    (req) => cacheKeys.jobDetails(req.params.id),
    cacheTTL.medium
  ),
  
  allJobs: cacheMiddleware(
    () => cacheKeys.search('all_jobs'),
    cacheTTL.short
  ),
  
  quotationById: cacheMiddleware(
    (req) => cacheKeys.quotation(req.params.id),
    cacheTTL.long
  ),
  
  analytics: cacheMiddleware(
    (req) => cacheKeys.analytics(req.query.type, req.query.period),
    cacheTTL.short
  ),
  
  ispAvailable: cacheMiddleware(
    (req) => cacheKeys.ispAvailable(req.query.location),
    cacheTTL.short
  ),
  
  aiAnalysis: cacheMiddleware(
    (req) => cacheKeys.aiAnalysis(req.params.jobId),
    cacheTTL.veryLong
  )
};

// Predefined cache invalidation middleware
const cacheInvalidationPresets = {
  user: invalidateCache((req) => `user:${req.params.id}:*`),
  userProfile: invalidateCache((req) => cacheKeys.userProfile(req.user?.id)),
  job: invalidateCache((req) => `job:${req.params.id}:*`),
  allJobs: invalidateCache('job:*'),
  quotation: invalidateCache((req) => `quotation:${req.params.id}:*`),
  allQuotations: invalidateCache('quotation:*'),
  analytics: invalidateCache('analytics:*'),
  search: invalidateCache('search:*')
};

module.exports = {
  cacheMiddleware,
  invalidateCache,
  userCache,
  sessionCache,
  warmCache,
  cacheHealthCheck,
  cacheMiddlewarePresets,
  cacheInvalidationPresets
};