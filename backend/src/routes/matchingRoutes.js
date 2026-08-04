const express = require('express');
const router = express.Router();
const matchingController = require('../controllers/matchingController');
const { auth, requireStaff } = require('../middleware/auth');

// All matching routes require authentication
router.use(auth);

// ISP matching routes
router.post('/jobs/:job_id/match', matchingController.matchISPForJob);
router.post('/jobs/:job_id/assign', requireStaff, matchingController.assignBestISP);
router.get('/isp/:isp_id/availability', matchingController.getISPAvailability);
router.post('/bulk-match', requireStaff, matchingController.bulkMatchISP);

module.exports = router;