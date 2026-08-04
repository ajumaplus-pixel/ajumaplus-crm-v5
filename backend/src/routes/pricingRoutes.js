const express = require('express');
const router = express.Router();
const pricingController = require('../controllers/pricingController');
const quotationService = require('../services/quotationService');
const { auth, requireStaff } = require('../middleware/auth');

// All pricing routes require authentication
router.use(auth);

// AI Pricing estimation
router.post('/estimate', pricingController.estimatePrice);

// Quotation routes
router.post('/quotations', requireStaff, pricingController.createQuotation);
router.get('/quotations', requireStaff, pricingController.getAllQuotations);
router.get('/quotations/:id', pricingController.getQuotationById);
router.put('/quotations/:id/approve', requireStaff, pricingController.approveQuotation);
router.put('/quotations/:id/reject', requireStaff, pricingController.rejectQuotation);

// Quotation workflow routes
router.post('/quotations/job/:job_id/generate', requireStaff, async (req, res) => {
  try {
    const { job_id } = req.params;
    const result = await quotationService.generateQuotationFromJob(job_id, req.user.id);
    res.status(201).json({
      success: true,
      message: 'Quotation generated from job',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate quotation',
      error: error.message
    });
  }
});

router.post('/quotations/compare', requireStaff, async (req, res) => {
  try {
    const { quotation_ids } = req.body;
    const comparison = await quotationService.compareQuotations(quotation_ids);
    res.status(200).json({
      success: true,
      data: comparison
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to compare quotations',
      error: error.message
    });
  }
});

router.get('/quotations/job/:job_id/history', async (req, res) => {
  try {
    const { job_id } = req.params;
    const history = await quotationService.getQuotationHistory(job_id);
    res.status(200).json({
      success: true,
      data: history
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get quotation history',
      error: error.message
    });
  }
});

router.post('/quotations/:id/revise', requireStaff, async (req, res) => {
  try {
    const { id } = req.params;
    const revision = await quotationService.reviseQuotation(id, req.body, req.user.id);
    res.status(200).json({
      success: true,
      message: 'Quotation revised successfully',
      data: revision
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to revise quotation',
      error: error.message
    });
  }
});

router.get('/quotations/:id/expiration', async (req, res) => {
  try {
    const { id } = req.params;
    const expiration = await quotationService.checkQuotationExpiration(id);
    res.status(200).json({
      success: true,
      data: expiration
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to check quotation expiration',
      error: error.message
    });
  }
});

router.get('/quotations/job/:job_id/workflow', async (req, res) => {
  try {
    const { job_id } = req.params;
    const workflow = await quotationService.getWorkflowStatus(job_id);
    res.status(200).json({
      success: true,
      data: workflow
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get workflow status',
      error: error.message
    });
  }
});

router.post('/quotations/:id/send', requireStaff, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await quotationService.sendQuotationToCustomer(id);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to send quotation',
      error: error.message
    });
  }
});

router.get('/quotations/stats', requireStaff, async (req, res) => {
  try {
    const stats = await quotationService.getQuotationStats();
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get quotation stats',
      error: error.message
    });
  }
});

module.exports = router;