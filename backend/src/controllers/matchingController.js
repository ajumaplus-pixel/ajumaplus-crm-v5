const matchingService = require('../services/matchingService');
const { logger } = require('../utils/logger');

class MatchingController {
  async matchISPForJob(req, res) {
    try {
      const { job_id } = req.params;
      
      const matchResult = await matchingService.getRecommendedISPs(job_id);
      
      res.status(200).json({
        success: true,
        message: 'ISP matching completed successfully',
        data: matchResult
      });
    } catch (error) {
      logger.error('Match ISP for job error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to match ISP for job', 
        error: error.message 
      });
    }
  }

  async assignBestISP(req, res) {
    try {
      const { job_id } = req.params;
      
      const assignmentResult = await matchingService.assignBestISP(job_id);
      
      res.status(200).json({
        success: true,
        message: 'ISP assigned successfully',
        data: assignmentResult
      });
    } catch (error) {
      logger.error('Assign best ISP error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to assign ISP', 
        error: error.message 
      });
    }
  }

  async getISPAvailability(req, res) {
    try {
      const { isp_id } = req.params;
      const { start_date, end_date } = req.query;
      
      if (!start_date || !end_date) {
        return res.status(400).json({
          success: false,
          message: 'Start date and end date are required'
        });
      }

      const availability = await matchingService.getISPAvailability(isp_id, start_date, end_date);
      
      res.status(200).json({
        success: true,
        data: availability
      });
    } catch (error) {
      logger.error('Get ISP availability error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to get ISP availability', 
        error: error.message 
      });
    }
  }

  async bulkMatchISP(req, res) {
    try {
      const { jobs } = req.body;
      
      if (!Array.isArray(jobs) || jobs.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Jobs array is required'
        });
      }

      const bulkResult = await matchingService.bulkMatchISP(jobs);
      
      res.status(200).json({
        success: true,
        message: 'Bulk ISP matching completed',
        data: bulkResult
      });
    } catch (error) {
      logger.error('Bulk ISP matching error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to perform bulk ISP matching', 
        error: error.message 
      });
    }
  }
}

module.exports = new MatchingController();