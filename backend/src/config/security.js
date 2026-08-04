const crypto = require('crypto');
const { logger } = require('../utils/logger');

// Security configuration
const securityConfig = {
  // Password requirements
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false,
    maxAge: 90 * 24 * 60 * 60 * 1000 // 90 days in milliseconds
  },

  // JWT configuration
  jwt: {
    expiresIn: '7d',
    refreshExpiresIn: '30d',
    algorithm: 'HS256'
  },

  // Rate limiting
  rateLimit: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 100,
    blockDuration: 15 * 60 * 1000 // 15 minutes
  },

  // Session configuration
  session: {
    secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  },

  // File upload security
  fileUpload: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.pdf']
  },

  // CORS configuration
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3003',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    exposedHeaders: ['X-Request-ID']
  },

  // Security headers
  headers: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  }
};

// Generate secure random token
const generateSecureToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

// Hash password (bcrypt wrapper)
const hashPassword = async (password, rounds = 10) => {
  const bcrypt = require('bcryptjs');
  return await bcrypt.hash(password, rounds);
};

// Compare password
const comparePassword = async (password, hash) => {
  const bcrypt = require('bcryptjs');
  return await bcrypt.compare(password, hash);
};

// Generate JWT token
const generateToken = (payload, secret = process.env.JWT_SECRET) => {
  const jwt = require('jsonwebtoken');
  return jwt.sign(payload, secret, {
    expiresIn: securityConfig.jwt.expiresIn
  });
};

// Verify JWT token
const verifyToken = (token, secret = process.env.JWT_SECRET) => {
  const jwt = require('jsonwebtoken');
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    logSecurityEvent('JWT Verification Failed', {
      error: error.message
    });
    throw error;
  }
};

// Generate refresh token
const generateRefreshToken = (payload, secret = process.env.JWT_REFRESH_SECRET) => {
  const jwt = require('jsonwebtoken');
  return jwt.sign(payload, secret, {
    expiresIn: securityConfig.jwt.refreshExpiresIn
  });
};

// Sanitize HTML to prevent XSS
const sanitizeHtml = (html) => {
  if (typeof html !== 'string') return html;
  
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/\//g, '&#x2F;');
};

// Sanitize SQL input
const sanitizeSql = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/'/g, "''")
    .replace(/"/g, '""')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '');
};

// Validate and sanitize user input
const sanitizeInput = (input, options = {}) => {
  const {
    trim = true,
    maxLength = 1000,
    removeHtml = true,
    removeSql = true
  } = options;

  if (typeof input !== 'string') return input;

  let sanitized = input;

  if (trim) {
    sanitized = sanitized.trim();
  }

  if (removeHtml) {
    sanitized = sanitizeHtml(sanitized);
  }

  if (removeSql) {
    sanitized = sanitizeSql(sanitized);
  }

  if (maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
};

// Generate API key
const generateApiKey = () => {
  const prefix = 'ak_';
  const randomPart = crypto.randomBytes(24).toString('hex');
  return `${prefix}${randomPart}`;
};

// Validate API key format
const validateApiKey = (apiKey) => {
  const apiKeyRegex = /^ak_[a-f0-9]{48}$/;
  return apiKeyRegex.test(apiKey);
};

// Encrypt sensitive data
const encryptData = (data, key = process.env.ENCRYPTION_KEY) => {
  const algorithm = 'aes-256-cbc';
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(key, 'hex'), iv);
  
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return {
    iv: iv.toString('hex'),
    data: encrypted
  };
};

// Decrypt sensitive data
const decryptData = (encryptedData, key = process.env.ENCRYPTION_KEY) => {
  const algorithm = 'aes-256-cbc';
  const decipher = crypto.createDecipheriv(
    algorithm,
    Buffer.from(key, 'hex'),
    Buffer.from(encryptedData.iv, 'hex')
  );
  
  let decrypted = decipher.update(encryptedData.data, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
};

// Generate CSRF token
const generateCsrfToken = () => {
  return crypto.randomBytes(32).toString('base64');
};

// Validate CSRF token
const validateCsrfToken = (token, sessionToken) => {
  return token === sessionToken;
};

// Security event logging
const logSecurityEvent = (event, details = {}) => {
  logger.warn('Security Event', {
    event,
    timestamp: new Date().toISOString(),
    ...details
  });
};

// Rate limit check
const checkRateLimit = (identifier, limit = 100, windowMs = 60 * 60 * 1000) => {
  // This would typically use Redis in production
  // For now, implement basic in-memory rate limiting
  const rateLimiter = require('rate-limiter-flexible').RateLimiterMemory;
  const limiter = new rateLimiter({
    points: limit,
    duration: windowMs
  });

  return limiter.consume(identifier);
};

// Validate Ghana-specific data
const validateGhanaPhone = (phone) => {
  const ghanaPhoneRegex = /^(\+233|0)?[0-9]{9,10}$/;
  const isValid = ghanaPhoneRegex.test(phone);
  
  if (!isValid) {
    logSecurityEvent('Invalid Ghana Phone Format', { phone });
  }
  
  return isValid;
};

const validateGhanaCardId = (cardId) => {
  const ghanaCardRegex = /^GHA-[0-9]{9}-[0-9]$/;
  const isValid = ghanaCardRegex.test(cardId);
  
  if (!isValid) {
    logSecurityEvent('Invalid Ghana Card ID Format', { cardId });
  }
  
  return isValid;
};

// Password strength checker
const checkPasswordStrength = (password) => {
  const strength = {
    score: 0,
    feedback: []
  };

  if (password.length >= 8) strength.score += 1;
  else strength.feedback.push('Password should be at least 8 characters');

  if (password.length >= 12) strength.score += 1;
  else strength.feedback.push('Consider using 12+ characters for better security');

  if (/[a-z]/.test(password)) strength.score += 1;
  else strength.feedback.push('Include lowercase letters');

  if (/[A-Z]/.test(password)) strength.score += 1;
  else strength.feedback.push('Include uppercase letters');

  if (/[0-9]/.test(password)) strength.score += 1;
  else strength.feedback.push('Include numbers');

  if (/[^a-zA-Z0-9]/.test(password)) strength.score += 1;
  else strength.feedback.push('Include special characters');

  if (strength.score <= 2) strength.level = 'weak';
  else if (strength.score <= 4) strength.level = 'medium';
  else strength.level = 'strong';

  return strength;
};

module.exports = {
  securityConfig,
  generateSecureToken,
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  generateRefreshToken,
  sanitizeHtml,
  sanitizeSql,
  sanitizeInput,
  generateApiKey,
  validateApiKey,
  encryptData,
  decryptData,
  generateCsrfToken,
  validateCsrfToken,
  checkRateLimit,
  validateGhanaPhone,
  validateGhanaCardId,
  checkPasswordStrength
};