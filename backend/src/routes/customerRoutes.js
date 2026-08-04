const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { auth } = require('../middleware/auth');

// All customer routes require authentication
router.use(auth);

router.post('/', customerController.createCustomer);
router.get('/:id', customerController.getCustomerById);
router.get('/user/:userId', customerController.getCustomerByUserId);
router.put('/:id', customerController.updateCustomer);

module.exports = router;