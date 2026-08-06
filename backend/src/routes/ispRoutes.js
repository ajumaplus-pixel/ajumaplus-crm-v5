const express = require('express');
const router = express.Router();
const ispController = require('../controllers/ispController');
const ISP = require('../models/ISP');
const { auth, requireISP } = require('../middleware/auth');

// Get all ISPs (public - no auth required for landing page)
router.get('/all', async (req, res) => {
  try {
    const isps = await ISP.getAll(100, 0);
    res.json({ success: true, data: isps });
  } catch (error) {
    console.error('Get all ISPs error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// All other ISP routes require authentication
router.use(auth);

// Get available jobs for ISP to accept
router.get('/jobs/available', ispController.getAvailableJobs);

// Accept a job
router.put('/jobs/:job_id/accept', requireISP, ispController.acceptJob);

// Get ISP's assigned jobs
router.get('/jobs', requireISP, ispController.getISPJobs);

// Update ISP availability
router.put('/availability', requireISP, ispController.updateAvailability);

// Update current location
router.put('/location', requireISP, ispController.updateCurrentLocation);

// Get nearby ISPs based on location
router.get('/nearby', ispController.getNearbyISPs);

module.exports = router;