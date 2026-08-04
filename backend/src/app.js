const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('rate-limiter-flexible').RateLimiterMemory;

const { logger, addRequestContext } = require('./utils/logger');
const { globalErrorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { initializeRedis, closeRedis } = require('./config/redis');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const customerRoutes = require('./routes/customerRoutes');
const jobRoutes = require('./routes/jobRoutes');
const pricingRoutes = require('./routes/pricingRoutes');
const webhookRoutes = require('./routes/webhookRoutes');
const matchingRoutes = require('./routes/matchingRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const ratingRoutes = require('./routes/ratingRoutes');

const app = express();

// Request timing middleware
app.use((req, res, next) => {
  req.startTime = Date.now();
  next();
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3003',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = new rateLimit({
  points: 100, // 100 requests
  duration: 60 * 60, // per 1 hour
  blockDuration: 60 * 15, // block for 15 minutes
});

const rateLimiterMiddleware = (req, res, next) => {
  limiter.consume(req.ip)
    .then(() => next())
    .catch(() => {
      res.status(429).json({
        success: false,
        message: 'Too many requests, please try again later',
        code: 'RATE_LIMIT_EXCEEDED'
      });
    });
};

// Request logging middleware
app.use(addRequestContext);

// HTTP request logger (Morgan with custom format)
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.http(message.trim())
  }
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  const healthData = {
    success: true,
    message: 'AJUMAPLUS CRM API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    requestId: req.requestId
  };
  
  logger.info('Health check accessed', {
    requestId: req.requestId,
    ...healthData
  });
  
  res.status(200).json(healthData);
});

// API routes with rate limiting
app.use('/api/auth', rateLimiterMiddleware, authRoutes);
app.use('/api/users', rateLimiterMiddleware, userRoutes);
app.use('/api/customers', rateLimiterMiddleware, customerRoutes);
app.use('/api/jobs', rateLimiterMiddleware, jobRoutes);
app.use('/api/pricing', rateLimiterMiddleware, pricingRoutes);
app.use('/api/matching', rateLimiterMiddleware, matchingRoutes);
app.use('/api/analytics', rateLimiterMiddleware, analyticsRoutes);
app.use('/api/ratings', rateLimiterMiddleware, ratingRoutes);
app.use('/api/webhooks', webhookRoutes); // Webhooks need different rate limiting

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(globalErrorHandler);

const PORT = process.env.PORT || 5000;

// Initialize services before starting server
const initializeServices = async () => {
  try {
    // Initialize Redis (optional - will fail gracefully if not available)
    await initializeRedis();
    logger.info('Services initialized successfully');
  } catch (error) {
    logger.warn('Redis initialization failed (this is expected if Redis is not configured):', error.message);
    logger.info('Starting server without Redis caching');
  }
};

// Graceful shutdown
const server = app.listen(PORT, async () => {
  await initializeServices();
  logger.info(`🚀 AJUMAPLUS CRM API Server running on port ${PORT}`);
  logger.info(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
});

const gracefulShutdown = async (signal) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);
  
  server.close(async () => {
    logger.info('HTTP server closed');
    
    // Close Redis connection
    await closeRedis();
    
    logger.info('All connections closed');
    process.exit(0);
  });
  
  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

module.exports = app;