const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

// Health check endpoint
router.get('/health', webhookController.handleHealthCheck);

// ISP Registration webhook
router.post('/google-forms/isp', webhookController.handleISPRegistration);

// Customer Registration webhook
router.post('/google-forms/customer', webhookController.handleCustomerRegistration);

// Job Request webhook
router.post('/google-forms/job', webhookController.handleJobRequest);

module.exports = router;