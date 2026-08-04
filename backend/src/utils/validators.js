const { body, param, query, validationResult } = require('express-validator');

// Common validation rules
const commonValidations = {
  email: body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),

  password: body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

  phone: body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^(\+233|0)?[0-9]{9,10}$/)
    .withMessage('Invalid Ghana phone number format'),

  name: body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes'),

  ghanaCardId: body('ghana_card_id')
    .trim()
    .notEmpty()
    .withMessage('Ghana Card ID is required')
    .matches(/^GHA-[0-9]{9}-[0-9]$/)
    .withMessage('Invalid Ghana Card ID format (e.g., GHA-123456789-0)'),

  ghanaPostGPS: body('ghana_post_gps')
    .trim()
    .optional()
    .matches(/^[A-Z]{2}-[0-9]{3}-[0-9]{4}$/)
    .withMessage('Invalid GhanaPost GPS format (e.g., AK-039-5021)'),

  location: body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Location must be between 2 and 100 characters'),

  uuid: param('id')
    .trim()
    .notEmpty()
    .withMessage('ID is required')
    .isUUID()
    .withMessage('Invalid ID format'),

  pagination: [
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
      .toInt(),
    query('offset')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Offset must be a non-negative integer')
      .toInt()
  ]
};

// Request validation middleware
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

// Sanitization helpers
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential XSS characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .substring(0, 1000); // Limit length
};

const sanitizeObject = (obj) => {
  const sanitized = {};
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      sanitized[key] = sanitizeInput(obj[key]);
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitized[key] = sanitizeObject(obj[key]);
    } else {
      sanitized[key] = obj[key];
    }
  }
  return sanitized;
};

// SQL injection prevention
const escapeSql = (input) => {
  if (typeof input !== 'string') return input;
  return input
    .replace(/'/g, "''")
    .replace(/"/g, '""')
    .replace(/\\/g, '\\\\');
};

// XSS prevention
const escapeHtml = (unsafe) => {
  if (typeof unsafe !== 'string') return unsafe;
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

// File upload validation
const validateFile = (file, allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'], maxSize = 5 * 1024 * 1024) => {
  if (!file) {
    throw new Error('No file provided');
  }

  if (!allowedTypes.includes(file.mimetype)) {
    throw new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
  }

  if (file.size > maxSize) {
    throw new Error(`File size exceeds maximum of ${maxSize / 1024 / 1024}MB`);
  }

  return true;
};

// Ghana-specific validations
const validateGhanaPhone = (phone) => {
  const ghanaPhoneRegex = /^(\+233|0)?[0-9]{9,10}$/;
  return ghanaPhoneRegex.test(phone);
};

const validateGhanaCardId = (cardId) => {
  const ghanaCardRegex = /^GHA-[0-9]{9}-[0-9]$/;
  return ghanaCardRegex.test(cardId);
};

const validateGhanaPostGPS = (gps) => {
  const ghanaGPSRegex = /^[A-Z]{2}-[0-9]{3}-[0-9]{4}$/;
  return ghanaGPSRegex.test(gps);
};

// Business logic validations
const validateJobPriority = (priority) => {
  const validPriorities = ['low', 'normal', 'high', 'urgent'];
  return validPriorities.includes(priority);
};

const validateJobStatus = (status) => {
  const validStatuses = ['new', 'assigned', 'in_progress', 'completed', 'cancelled'];
  return validStatuses.includes(status);
};

const validateUserRole = (role) => {
  const validRoles = ['admin', 'staff', 'customer', 'isp'];
  return validRoles.includes(role);
};

const validateServiceCategory = (category) => {
  const validCategories = [
    'electrical',
    'plumbing',
    'carpentry',
    'painting',
    'cleaning',
    'air_conditioning',
    'masonry',
    'roofing',
    'aluminium',
    'general_repairs',
    'generator',
    'solar',
    'security'
  ];
  return validCategories.includes(category);
};

// Data integrity validations
const validateEmailUniqueness = async (email, UserModel) => {
  const existingUser = await UserModel.findByEmail(email);
  if (existingUser) {
    throw new Error('Email already registered');
  }
  return true;
};

const validateAge = (dateOfBirth, minAge = 18) => {
  const dob = new Date(dateOfBirth);
  const today = new Date();
  const age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    return age - 1;
  }
  
  if (age < minAge) {
    throw new Error(`Must be at least ${minAge} years old`);
  }
  
  return age;
};

// Export all validators
module.exports = {
  commonValidations,
  validateRequest,
  sanitizeInput,
  sanitizeObject,
  escapeSql,
  escapeHtml,
  validateFile,
  validateGhanaPhone,
  validateGhanaCardId,
  validateGhanaPostGPS,
  validateJobPriority,
  validateJobStatus,
  validateUserRole,
  validateServiceCategory,
  validateEmailUniqueness,
  validateAge
};