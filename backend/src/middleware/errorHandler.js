const { logger, logError, logSecurityEvent } = require('../utils/logger');

// Custom error classes
class AppError extends Error {
  constructor(message, statusCode, code = null, details = {}) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.code = code;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, details = {}) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'You do not have permission to perform this action') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND_ERROR');
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, 409, 'CONFLICT_ERROR');
  }
}

class RateLimitError extends AppError {
  constructor(message = 'Too many requests, please try again later') {
    super(message, 429, 'RATE_LIMIT_ERROR');
  }
}

class DatabaseError extends AppError {
  constructor(message = 'Database operation failed', details = {}) {
    super(message, 500, 'DATABASE_ERROR', details);
  }
}

// Error classification
const classifyError = (error) => {
  if (error.name === 'ValidationError') return 'validation';
  if (error.name === 'JsonWebTokenError') return 'authentication';
  if (error.name === 'TokenExpiredError') return 'authentication';
  if (error.name === 'UnauthorizedError') return 'authorization';
  if (error.code === 'ER_DUP_ENTRY') return 'database';
  if (error.code === 'ER_NO_REFERENCED_ROW_2') return 'database';
  if (error.code === 'ER_BAD_NULL_ERROR') return 'database';
  return 'unknown';
};

// Handle operational errors
const handleOperationalError = (err, req, res, next) => {
  logError(err, {
    requestId: req.requestId,
    userId: req.user?.id,
    path: req.path,
    method: req.method
  });

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    code: err.code,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: err.details
    }),
    requestId: req.requestId
  });
};

// Handle validation errors
const handleValidationError = (err, req, res, next) => {
  const errors = err.errors?.map(e => ({
    field: e.path,
    message: e.message,
    value: e.value
  })) || [];

  logError(err, {
    requestId: req.requestId,
    validationErrors: errors
  });

  res.status(400).json({
    success: false,
    message: 'Validation failed',
    code: 'VALIDATION_ERROR',
    errors,
    requestId: req.requestId
  });
};

// Handle JWT errors
const handleJWTError = (err, req, res, next) => {
  logSecurityEvent('JWT Error', {
    requestId: req.requestId,
    error: err.message,
    path: req.path
  });

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
      code: 'INVALID_TOKEN',
      requestId: req.requestId
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired',
      code: 'TOKEN_EXPIRED',
      requestId: req.requestId
    });
  }

  next(err);
};

// Handle database errors
const handleDatabaseError = (err, req, res, next) => {
  logError(err, {
    requestId: req.requestId,
    errorCode: err.code,
    sqlState: err.sqlState
  });

  if (err.code === 'ER_DUP_ENTRY') {
    const field = err.sqlMessage.match(/for key '(.+?)'/)?.[1];
    return res.status(409).json({
      success: false,
      message: `${field} already exists`,
      code: 'DUPLICATE_ENTRY',
      field,
      requestId: req.requestId
    });
  }

  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({
      success: false,
      message: 'Referenced resource does not exist',
      code: 'REFERENCE_ERROR',
      requestId: req.requestId
    });
  }

  res.status(500).json({
    success: false,
    message: 'Database error occurred',
    code: 'DATABASE_ERROR',
    ...(process.env.NODE_ENV === 'development' && {
      details: err.message
    }),
    requestId: req.requestId
  });
};

// Handle Multer (file upload) errors
const handleMulterError = (err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File size too large',
      code: 'FILE_TOO_LARGE',
      requestId: req.requestId
    });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      message: 'Unexpected file field',
      code: 'UNEXPECTED_FILE',
      requestId: req.requestId
    });
  }

  next(err);
};

// Global error handler
const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log security-related errors
  if (err.statusCode >= 400 && err.statusCode < 500) {
    logSecurityEvent('Client Error', {
      requestId: req.requestId,
      statusCode: err.statusCode,
      message: err.message,
      path: req.path
    });
  }

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return handleValidationError(err, req, res, next);
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return handleJWTError(err, req, res, next);
  }

  if (err.code && err.code.startsWith('ER_')) {
    return handleDatabaseError(err, req, res, next);
  }

  if (err.code && err.code.startsWith('LIMIT_')) {
    return handleMulterError(err, req, res, next);
  }

  // Handle operational errors
  if (err.isOperational) {
    return handleOperationalError(err, req, res, next);
  }

  // Handle unknown errors
  logError(err, {
    requestId: req.requestId,
    errorType: 'unknown',
    message: 'Unexpected error occurred'
  });

  res.status(err.statusCode).json({
    success: false,
    message: process.env.NODE_ENV === 'development' 
      ? err.message 
      : 'Something went wrong',
    code: 'INTERNAL_SERVER_ERROR',
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack
    }),
    requestId: req.requestId
  });
};

// 404 handler
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    code: 'ROUTE_NOT_FOUND',
    requestId: req.requestId
  });
};

// Async error wrapper
const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  DatabaseError,
  classifyError,
  globalErrorHandler,
  notFoundHandler,
  catchAsync
};