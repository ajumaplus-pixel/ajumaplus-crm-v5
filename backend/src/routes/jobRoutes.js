const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { auth, requireStaff } = require('../middleware/auth');

// All job routes require authentication
router.use(auth);

// Job CRUD routes
router.post('/', jobController.createJob);
router.get('/', requireStaff, jobController.getAllJobs);
router.get('/:id', jobController.getJobById);
router.put('/:id', jobController.updateJob);
router.put('/:id/status', jobController.updateJobStatus);
router.put('/:id/assign', requireStaff, jobController.assignISP);
router.post('/:id/notes', jobController.addNote);
router.delete('/:id', requireStaff, jobController.deleteJob);

module.exports = router;