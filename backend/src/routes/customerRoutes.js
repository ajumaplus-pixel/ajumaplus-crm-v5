const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { auth } = require('../middleware/auth');

// Guest customer creation (no auth required)
router.post('/guest', customerController.createGuestCustomer);

// All other customer routes require authentication
router.use(auth);

router.post('/', customerController.createCustomer);
router.get('/:id', customerController.getCustomerById);
router.get('/:id/stats', customerController.getCustomerStats);
router.get('/user/:userId', customerController.getCustomerByUserId);
router.put('/:id', customerController.updateCustomer);
router.put('/:id/convert', customerController.convertGuestToCustomer);

module.exports = router;