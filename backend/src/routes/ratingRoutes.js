const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const { auth, requireStaff } = require('../middleware/auth');

// All rating routes require authentication
router.use(auth);

// Rating routes
router.post('/', ratingController.createRating);
router.get('/isp/:isp_id', ratingController.getISPRatings);
router.get('/job/:job_id', ratingController.getRatingByJob);
router.get('/ranking', ratingController.getISPRanking);
router.get('/:id', ratingController.getRatingById);
router.get('/:id/can-edit', ratingController.canEditRating);
router.put('/:id', ratingController.updateRating);
router.delete('/:id', requireStaff, ratingController.deleteRating);
router.post('/:id/report', ratingController.reportRating);
router.post('/:id/respond', ratingController.respondToRating);

module.exports = router;