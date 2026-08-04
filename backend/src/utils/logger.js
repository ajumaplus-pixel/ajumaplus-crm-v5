const winston = require('winston');
const { format } = winston;

// Custom log format with timestamps and request IDs
const customFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.splat(),
  format.json()
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: customFormat,
  defaultMeta: { service: 'ajumaplus-crm' },
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      )
    }),
    // File transport for all logs
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    })
  ]
});

// Add production-specific transports
if (process.env.NODE_ENV === 'production') {
  logger.add(new winston.transports.File({ 
    filename: 'logs/production.log',
    level: 'info'
  }));
}

// Request context middleware
const addRequestContext = (req, res, next) => {
  const requestId = req.headers['x-request-id'] || generateRequestId();
  req.requestId = requestId;
  
  logger.info('Incoming request', {
    requestId,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  
  res.on('finish', () => {
    logger.info('Request completed', {
      requestId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime: Date.now() - req.startTime
    });
  });
  
  next();
};

// Generate unique request ID
function generateRequestId() {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Log levels and their meanings
const logLevels = {
  error: 'Error - System errors and exceptions',
  warn: 'Warning - Potentially harmful situations',
  info: 'Info - General informational messages',
  http: 'HTTP - HTTP requests/responses',
  debug: 'Debug - Debugging information',
  silly: 'Silly - Extra verbose debugging'
};

// Performance logging
const logPerformance = (operation, duration, metadata = {}) => {
  logger.info('Performance metric', {
    operation,
    duration: `${duration}ms`,
    ...metadata
  });
};

// Error logging with context
const logError = (error, context = {}) => {
  logger.error('Error occurred', {
    message: error.message,
    stack: error.stack,
    ...context
  });
};

// Security event logging
const logSecurityEvent = (event, details = {}) => {
  logger.warn('Security event', {
    event,
    timestamp: new Date().toISOString(),
    ...details
  });
};

// Business event logging
const logBusinessEvent = (event, details = {}) => {
  logger.info('Business event', {
    event,
    timestamp: new Date().toISOString(),
    ...details
  });
};

module.exports = {
  logger,
  addRequestContext,
  generateRequestId,
  logPerformance,
  logError,
  logSecurityEvent,
  logBusinessEvent,
  logLevels
};