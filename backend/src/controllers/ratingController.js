const Rating = require('../models/Rating');
const ISP = require('../models/ISP');
const Job = require('../models/Job');
const { logger } = require('../utils/logger');

class RatingController {
  // Create rating for ISP
  async createRating(req, res) {
    try {
      const { job_id, quality_rating, timeliness_rating, professionalism_rating, communication_rating, review } = req.body;
      const user_id = req.user.id;

      // Validate job exists and belongs to user
      const job = await Job.findById(job_id);
      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job not found'
        });
      }

      // Get customer ID from user
      const Customer = require('../models/Customer');
      const customer = await Customer.findByUserId(user_id);
      
      if (!customer || job.customer_id !== customer.id) {
        return res.status(403).json({
          success: false,
          message: 'You can only rate jobs you created'
        });
      }

      // Check if job is completed
      if (job.status !== 'completed') {
        return res.status(400).json({
          success: false,
          message: 'Job must be completed before rating'
        });
      }

      // Check if already rated
      const existingRating = await Rating.findByJobId(job_id);
      if (existingRating) {
        return res.status(400).json({
          success: false,
          message: 'Job already rated'
        });
      }

      // Get ISP ID from job
      const isp_id = job.isp_id;
      if (!isp_id) {
        return res.status(400).json({
          success: false,
          message: 'Job must be assigned to an ISP before rating'
        });
      }

      // Calculate overall rating
      const overall = (quality_rating + timeliness_rating + professionalism_rating + communication_rating) / 4;

      const rating = await Rating.create({
        isp_id,
        job_id,
        customer_id: customer.id,
        quality: quality_rating,
        timeliness: timeliness_rating,
        professionalism: professionalism_rating,
        communication: communication_rating,
        overall,
        comment: review
      });

      // Update ISP average rating
      await this.updateISPAverageRating(isp_id);

      // Increment ISP jobs completed
      await ISP.incrementJobsCompleted(isp_id);

      logger.info('Rating created', {
        ratingId: rating.id,
        ispId: isp_id,
        jobId: job_id,
        overall
      });

      res.status(201).json({
        success: true,
        message: 'Rating created successfully',
        data: rating
      });
    } catch (error) {
      logger.error('Create rating error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create rating',
        error: error.message
      });
    }
  }

  // Get ISP ratings
  async getISPRatings(req, res) {
    try {
      const { isp_id } = req.params;
      const { limit = 20, offset = 0 } = req.query;

      const ratings = await Rating.getByISPId(isp_id, parseInt(limit), parseInt(offset));
      const averageRating = await Rating.getAverageRating(isp_id);

      res.status(200).json({
        success: true,
        data: {
          ratings,
          averageRating,
          total: ratings.length
        }
      });
    } catch (error) {
      logger.error('Get ISP ratings error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get ISP ratings',
        error: error.message
      });
    }
  }

  // Get rating by job
  async getRatingByJob(req, res) {
    try {
      const { job_id } = req.params;
      const rating = await Rating.findByJobId(job_id);

      if (!rating) {
        return res.status(404).json({
          success: false,
          message: 'Rating not found for this job'
        });
      }

      res.status(200).json({
        success: true,
        data: rating
      });
    } catch (error) {
      logger.error('Get rating by job error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get rating',
        error: error.message
      });
    }
  }

  // Get rating by ID
  async getRatingById(req, res) {
    try {
      const { id } = req.params;
      const rating = await Rating.findById(id);

      if (!rating) {
        return res.status(404).json({
          success: false,
          message: 'Rating not found'
        });
      }

      res.status(200).json({
        success: true,
        data: rating
      });
    } catch (error) {
      logger.error('Get rating error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get rating',
        error: error.message
      });
    }
  }

  // Check if rating can be edited (within 24-hour window)
  async canEditRating(req, res) {
    try {
      const { id } = req.params;
      const rating = await Rating.findById(id);

      if (!rating) {
        return res.status(404).json({
          success: false,
          message: 'Rating not found'
        });
      }

      // Check ownership
      if (rating.customer_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'You can only check edit status for your own ratings'
        });
      }

      // Check if within 24 hours
      const ratingDate = new Date(rating.created_at);
      const now = new Date();
      const hoursSinceRating = (now - ratingDate) / (1000 * 60 * 60);
      const canEdit = hoursSinceRating <= 24;
      const timeRemaining = canEdit ? Math.max(0, 24 - hoursSinceRating) : 0;

      res.status(200).json({
        success: true,
        data: {
          canEdit,
          timeRemaining: canEdit ? Math.round(timeRemaining * 60) : 0 // Return minutes remaining
        }
      });
    } catch (error) {
      logger.error('Check edit rating error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check edit status',
        error: error.message
      });
    }
  }

  // Update rating (within 24 hours only)
  async updateRating(req, res) {
    try {
      const { id } = req.params;
      const { quality_rating, timeliness_rating, professionalism_rating, communication_rating, review } = req.body;

      const rating = await Rating.findById(id);
      if (!rating) {
        return res.status(404).json({
          success: false,
          message: 'Rating not found'
        });
      }

      // Check ownership
      if (rating.customer_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'You can only update your own ratings'
        });
      }

      // Check if within 24 hours
      const ratingDate = new Date(rating.created_at);
      const now = new Date();
      const hoursSinceRating = (now - ratingDate) / (1000 * 60 * 60);

      if (hoursSinceRating > 24) {
        return res.status(400).json({
          success: false,
          message: 'Ratings can only be updated within 24 hours'
        });
      }

      // Calculate new overall rating
      const overall = (quality_rating + timeliness_rating + professionalism_rating + communication_rating) / 4;

      const updatedRating = await Rating.update(id, {
        quality: quality_rating,
        timeliness: timeliness_rating,
        professionalism: professionalism_rating,
        communication: communication_rating,
        overall,
        comment: review
      });

      // Update ISP average rating
      await this.updateISPAverageRating(rating.isp_id);

      logger.info('Rating updated', {
        ratingId: id,
        overall
      });

      res.status(200).json({
        success: true,
        message: 'Rating updated successfully',
        data: updatedRating
      });
    } catch (error) {
      logger.error('Update rating error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update rating',
        error: error.message
      });
    }
  }

  // Delete rating (admin only)
  async deleteRating(req, res) {
    try {
      const { id } = req.params;

      const rating = await Rating.findById(id);
      if (!rating) {
        return res.status(404).json({
          success: false,
          message: 'Rating not found'
        });
      }

      await Rating.delete(id);

      // Update ISP average rating
      await this.updateISPAverageRating(rating.isp_id);

      logger.info('Rating deleted', {
        ratingId: id,
        ispId: rating.isp_id
      });

      res.status(200).json({
        success: true,
        message: 'Rating deleted successfully'
      });
    } catch (error) {
      logger.error('Delete rating error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete rating',
        error: error.message
      });
    }
  }

  // Get ISP ranking
  async getISPRanking(req, res) {
    try {
      const { limit = 10, offset = 0 } = req.query;

      const isps = await ISP.getAll(parseInt(limit), parseInt(offset));
      
      // Get ratings for each ISP
      const rankedISPs = await Promise.all(
        isps.map(async (isp) => {
          const ratingData = await Rating.getAverageRating(isp.id);
          return {
            ...isp,
            averageRating: ratingData?.average_rating || 0,
            totalRatings: ratingData?.total_ratings || 0,
            ratingBreakdown: ratingData?.rating_breakdown || {}
          };
        })
      );

      // Sort by average rating (descending)
      rankedISPs.sort((a, b) => b.averageRating - a.averageRating);

      res.status(200).json({
        success: true,
        data: rankedISPs.map((isp, index) => ({
          rank: index + 1,
          ...isp
        }))
      });
    } catch (error) {
      logger.error('Get ISP ranking error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get ISP ranking',
        error: error.message
      });
    }
  }

  // Report inappropriate rating
  async reportRating(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const rating = await Rating.findById(id);
      if (!rating) {
        return res.status(404).json({
          success: false,
          message: 'Rating not found'
        });
      }

      // Mark as reported
      await Rating.update(id, {
        reported: true,
        report_reason: reason,
        reported_by: req.user.id,
        reported_at: new Date()
      });

      logger.info('Rating reported', {
        ratingId: id,
        reason,
        reportedBy: req.user.id
      });

      res.status(200).json({
        success: true,
        message: 'Rating reported successfully'
      });
    } catch (error) {
      logger.error('Report rating error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to report rating',
        error: error.message
      });
    }
  }

  // Respond to rating (ISP only)
  async respondToRating(req, res) {
    try {
      const { id } = req.params;
      const { response } = req.body;

      const rating = await Rating.findById(id);
      if (!rating) {
        return res.status(404).json({
          success: false,
          message: 'Rating not found'
        });
      }

      // Check if user is the ISP
      const isp = await ISP.findByUserId(req.user.id);
      if (!isp || isp.id !== rating.isp_id) {
        return res.status(403).json({
          success: false,
          message: 'Only the rated ISP can respond'
        });
      }

      const updatedRating = await Rating.update(id, {
        isp_response: response,
        responded_at: new Date()
      });

      logger.info('ISP responded to rating', {
        ratingId: id,
        ispId: rating.isp_id
      });

      res.status(200).json({
        success: true,
        message: 'Response added successfully',
        data: updatedRating
      });
    } catch (error) {
      logger.error('Respond to rating error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to respond to rating',
        error: error.message
      });
    }
  }

  // Helper: Update ISP average rating
  async updateISPAverageRating(ispId) {
    try {
      const ratingData = await Rating.getAverageRating(ispId);
      const averageRating = ratingData?.average_rating || 0;
      
      await ISP.updateRating(ispId, averageRating);
      
      logger.info('ISP average rating updated', {
        ispId,
        averageRating
      });
    } catch (error) {
      logger.error('Update ISP average rating error:', error);
    }
  }
}

module.exports = new RatingController();