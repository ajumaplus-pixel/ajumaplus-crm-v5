const { validateRequest, sanitizeObject } = require('../utils/validators');
const { validationResult } = require('express-validator');
const { logger } = require('../utils/logger');

// Validation middleware factory
const validate = (validationRules) => {
  return async (req, res, next) => {
    try {
      // Sanitize request body
      if (req.body) {
        req.body = sanitizeObject(req.body);
      }

      // Run validation
      await Promise.all(validationRules.map(rule => rule.run(req)));
      
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        logger.warn('Validation failed', {
          requestId: req.requestId,
          errors: errors.array(),
          path: req.path
        });

        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          errors: errors.array().map(err => ({
            field: err.path,
            message: err.msg,
            value: err.value
          })),
          requestId: req.requestId
        });
      }

      next();
    } catch (error) {
      logger.error('Validation middleware error', {
        requestId: req.requestId,
        error: error.message
      });

      return res.status(500).json({
        success: false,
        message: 'Validation error occurred',
        code: 'VALIDATION_ERROR',
        requestId: req.requestId
      });
    }
  };
};

// Body size limiter
const bodySizeLimiter = (maxSize = '10mb') => {
  return (req, res, next) => {
    const contentLength = req.get('content-length');
    const maxBytes = maxSize === '10mb' ? 10 * 1024 * 1024 : parseInt(maxSize);

    if (contentLength && contentLength > maxBytes) {
      logger.warn('Request body too large', {
        requestId: req.requestId,
        contentLength,
        maxSize
      });

      return res.status(413).json({
        success: false,
        message: 'Request body too large',
        code: 'PAYLOAD_TOO_LARGE',
        maxSize,
        requestId: req.requestId
      });
    }

    next();
  };
};

// Content type validator
const validateContentType = (allowedTypes = ['application/json']) => {
  return (req, res, next) => {
    const contentType = req.get('content-type');

    if (req.method !== 'GET' && req.method !== 'DELETE') {
      if (!contentType || !allowedTypes.includes(contentType.split(';')[0])) {
        logger.warn('Invalid content type', {
          requestId: req.requestId,
          contentType,
          allowedTypes
        });

        return res.status(415).json({
          success: false,
          message: 'Unsupported media type',
          code: 'UNSUPPORTED_MEDIA_TYPE',
          allowedTypes,
          requestId: req.requestId
        });
      }
    }

    next();
  };
};

// Query parameter validator
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query);

    if (error) {
      logger.warn('Query validation failed', {
        requestId: req.requestId,
        error: error.details
      });

      return res.status(400).json({
        success: false,
        message: 'Invalid query parameters',
        code: 'INVALID_QUERY',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        })),
        requestId: req.requestId
      });
    }

    req.query = value;
    next();
  };
};

// Path parameter validator
const validateParams = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params);

    if (error) {
      logger.warn('Path parameter validation failed', {
        requestId: req.requestId,
        error: error.details
      });

      return res.status(400).json({
        success: false,
        message: 'Invalid path parameters',
        code: 'INVALID_PARAMS',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        })),
        requestId: req.requestId
      });
    }

    req.params = value;
    next();
  };
};

// Headers validator
const validateHeaders = (requiredHeaders = []) => {
  return (req, res, next) => {
    const missingHeaders = requiredHeaders.filter(header => !req.get(header));

    if (missingHeaders.length > 0) {
      logger.warn('Missing required headers', {
        requestId: req.requestId,
        missingHeaders
      });

      return res.status(400).json({
        success: false,
        message: 'Missing required headers',
        code: 'MISSING_HEADERS',
        missingHeaders,
        requestId: req.requestId
      });
    }

    next();
  };
};

// Async validation wrapper
const asyncValidate = (validationFn) => {
  return async (req, res, next) => {
    try {
      await validationFn(req, res, next);
    } catch (error) {
      logger.error('Async validation error', {
        requestId: req.requestId,
        error: error.message
      });

      return res.status(500).json({
        success: false,
        message: 'Validation error occurred',
        code: 'VALIDATION_ERROR',
        requestId: req.requestId
      });
    }
  };
};

module.exports = {
  validate,
  bodySizeLimiter,
  validateContentType,
  validateQuery,
  validateParams,
  validateHeaders,
  asyncValidate
};