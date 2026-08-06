const express = require('express');
const router = express.Router();
const matchingController = require('../controllers/matchingController');
const { auth, requireStaff } = require('../middleware/auth');

// All matching routes require authentication
router.use(auth);

// Get suggested assignments for pending jobs (staff/admin only)
router.get('/suggestions', requireStaff, matchingController.getSuggestedAssignments);

// Approve a suggested assignment (staff/admin only)
router.post('/approve', requireStaff, matchingController.approveAssignment);

// Get matching ISPs for a specific job (staff/admin only)
router.get('/jobs/:job_id/matches', requireStaff, matchingController.getJobMatches);

module.exports = router;