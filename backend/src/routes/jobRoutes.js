const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { auth, requireStaff } = require('../middleware/auth');

// Allow guest job creation (no auth required)
router.post('/', jobController.createJob);

// All other job routes require authentication
router.use(auth);

router.get('/', requireStaff, jobController.getAllJobs);
router.get('/:id', jobController.getJobById);
router.get('/:id/quotes', jobController.getJobQuotes); // NEW
router.post('/quotations/:id/accept', jobController.acceptQuote); // NEW
router.post('/:id/link-customer', jobController.linkJobToCustomer); // NEW
router.get('/customer/:customerId', jobController.getJobsByCustomer);
router.put('/:id', jobController.updateJob);
router.put('/:id/status', jobController.updateJobStatus);
router.put('/:id/status/location', jobController.updateJobStatusWithLocation);
router.put('/:id/assign', requireStaff, jobController.assignISP);
router.post('/:id/notes', jobController.addNote);
router.delete('/:id', requireStaff, jobController.deleteJob);
router.get('/:id/progress', jobController.getJobProgress);

module.exports = router;