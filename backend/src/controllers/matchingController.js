const MatchingService = require('../services/matchingService');
const Job = require('../models/Job');
const ISP = require('../models/ISP');
const NotificationService = require('../services/notificationService');

class MatchingController {
  async getSuggestedAssignments(req, res) {
    try {
      const suggestions = await MatchingService.suggestAssignments();
      res.json({ success: true, data: suggestions });
    } catch (error) {
      console.error('Get suggested assignments error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to get suggested assignments', 
        error: error.message 
      });
    }
  }

  async approveAssignment(req, res) {
    try {
      const { job_id, isp_id } = req.body;
      
      // Validate job exists
      const job = await Job.findById(job_id);
      if (!job) {
        return res.status(404).json({ 
          success: false, 
          message: 'Job not found' 
        });
      }

      // Validate ISP exists
      const isp = await ISP.findById(isp_id);
      if (!isp) {
        return res.status(404).json({ 
          success: false, 
          message: 'ISP not found' 
        });
      }

      // Assign ISP to job
      const updatedJob = await Job.assignISP(job_id, isp_id);
      
      // Create notification for ISP
      try {
        await NotificationService.create({
          user_id: isp.user_id,
          type: 'job_assignment',
          title: 'New Job Assignment',
          message: `You have been assigned to job ${job.job_number} - ${job.category}`,
          data: { job_id, isp_id, job_number: job.job_number, category: job.category }
        });
      } catch (notifError) {
        console.error('Failed to create notification:', notifError);
        // Continue even if notification fails
      }
      
      res.json({ 
        success: true, 
        message: 'ISP assigned successfully',
        data: updatedJob 
      });
    } catch (error) {
      console.error('Approve assignment error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to approve assignment', 
        error: error.message 
      });
    }
  }

  async getJobMatches(req, res) {
    try {
      const { job_id } = req.params;
      
      const job = await Job.findById(job_id);
      if (!job) {
        return res.status(404).json({ 
          success: false, 
          message: 'Job not found' 
        });
      }

      const matches = await MatchingService.findMatchingISPs(job);
      
      res.json({ 
        success: true, 
        data: {
          job,
          matches: matches.map(m => ({
            isp_id: m.isp.id,
            isp_name: m.isp.trade,
            score: m.score,
            distance: m.distance,
            rating: m.isp.rating,
            experience: m.isp.experience_years,
            availability: m.isp.availability
          }))
        }
      });
    } catch (error) {
      console.error('Get job matches error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to get job matches', 
        error: error.message 
      });
    }
  }
}

module.exports = new MatchingController();