const ISP = require('../models/ISP');
const Job = require('../models/Job');

class ISPController {
  async getAvailableJobs(req, res) {
    try {
      const jobs = await Job.getByStatus('new');
      res.json({ success: true, data: jobs });
    } catch (error) {
      console.error('Get available jobs error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to get available jobs', 
        error: error.message 
      });
    }
  }

  async acceptJob(req, res) {
    try {
      const { job_id } = req.params;
      const isp = await ISP.findByUserId(req.user.id);
      
      if (!isp) {
        return res.status(404).json({ 
          success: false, 
          message: 'ISP profile not found' 
        });
      }
      
      const job = await Job.assignISP(job_id, isp.id);
      
      res.json({ 
        success: true, 
        message: 'Job accepted successfully',
        data: job 
      });
    } catch (error) {
      console.error('Accept job error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to accept job', 
        error: error.message 
      });
    }
  }

  async getISPJobs(req, res) {
    try {
      const isp = await ISP.findByUserId(req.user.id);
      
      if (!isp) {
        return res.status(404).json({ 
          success: false, 
          message: 'ISP profile not found' 
        });
      }
      
      const jobs = await Job.getByISPId(isp.id);
      res.json({ success: true, data: jobs });
    } catch (error) {
      console.error('Get ISP jobs error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to get ISP jobs', 
        error: error.message 
      });
    }
  }

  async updateAvailability(req, res) {
    try {
      const { availability } = req.body;
      const isp = await ISP.findByUserId(req.user.id);
      
      if (!isp) {
        return res.status(404).json({ 
          success: false, 
          message: 'ISP profile not found' 
        });
      }
      
      const updatedISP = await ISP.updateAvailability(isp.id, availability);
      
      res.json({ 
        success: true, 
        message: 'Availability updated successfully',
        data: updatedISP 
      });
    } catch (error) {
      console.error('Update availability error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to update availability', 
        error: error.message 
      });
    }
  }

  async updateCurrentLocation(req, res) {
    try {
      const { lat, lng } = req.body;
      const isp = await ISP.findByUserId(req.user.id);
      
      if (!isp) {
        return res.status(404).json({ 
          success: false, 
          message: 'ISP profile not found' 
        });
      }
      
      const updatedISP = await ISP.updateCurrentLocation(isp.id, lat, lng);
      
      res.json({ 
        success: true, 
        message: 'Location updated successfully',
        data: updatedISP 
      });
    } catch (error) {
      console.error('Update location error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to update location', 
        error: error.message 
      });
    }
  }

  async getNearbyISPs(req, res) {
    try {
      const { lat, lng, radius = 50 } = req.query;
      const nearbyISPs = await ISP.getNearbyISPs(
        parseFloat(lat), 
        parseFloat(lng), 
        parseFloat(radius)
      );
      
      res.json({ success: true, data: nearbyISPs });
    } catch (error) {
      console.error('Get nearby ISPs error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to get nearby ISPs', 
        error: error.message 
      });
    }
  }
}

module.exports = new ISPController();