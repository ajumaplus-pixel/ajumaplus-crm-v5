const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { auth, requireStaff } = require('../middleware/auth');

// All analytics routes require authentication
router.use(auth);

// Analytics routes
router.get('/forecast/demand', analyticsController.getDemandForecast);
router.get('/projection/revenue', analyticsController.getRevenueProjection);
router.get('/estimate/completion-time', analyticsController.getCompletionTimeEstimate);
router.get('/predict/churn/:customer_id', analyticsController.getChurnPrediction);
router.get('/estimate/clv/:customer_id', analyticsController.getCLVEstimate);
router.get('/predict/peak-periods', analyticsController.getPeakPeriods);
router.get('/dashboard', requireStaff, analyticsController.getDashboardData);

module.exports = router;