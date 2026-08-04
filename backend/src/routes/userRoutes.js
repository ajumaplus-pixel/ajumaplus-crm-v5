const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth, requireAdmin } = require('../middleware/auth');

// All user routes require authentication
router.use(auth);

// Admin only routes
router.get('/', requireAdmin, userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', requireAdmin, userController.deleteUser);
router.put('/:id/status', requireAdmin, userController.updateUserStatus);
router.put('/:id/role', requireAdmin, userController.updateUserRole);

module.exports = router;