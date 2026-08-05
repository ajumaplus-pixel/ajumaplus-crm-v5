const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Temporary init route for creating admin user (REMOVE IN PRODUCTION)
router.post('/init-admin', async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const User = require('../models/User');

    // Check if admin already exists
    const existingAdmin = await User.findByEmail('admin@example.com');
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Admin user already exists'
      });
    }

    // Create admin user
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin'
    });

    // Create staff user
    const staffUser = await User.create({
      username: 'staff',
      email: 'staff@example.com',
      password: 'staff123',
      role: 'staff'
    });

    res.status(201).json({
      success: true,
      message: 'Admin and staff users created successfully',
      data: {
        admin: { email: 'admin@example.com', password: 'admin123' },
        staff: { email: 'staff@example.com', password: 'staff123' }
      }
    });
  } catch (error) {
    console.error('Init admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create admin user',
      error: error.message
    });
  }
});

// Protected routes
router.post('/logout', (req, res, next) => {
  // Auth middleware would be applied here
  authController.logout(req, res, next);
});

module.exports = router;