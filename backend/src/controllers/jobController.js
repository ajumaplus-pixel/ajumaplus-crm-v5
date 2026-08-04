const Job = require('../models/Job');
const Quotation = require('../models/Quotation');

class JobController {
  async createJob(req, res) {
    try {
      const { customer_id, category, description, priority, address, gps_coords, scheduled_date, notes } = req.body;
      
      const job = await Job.create({
        customer_id,
        category,
        description,
        priority,
        address,
        gps_coords,
        scheduled_date,
        notes
      });
      
      res.status(201).json({
        success: true,
        message: 'Job created successfully',
        data: job
      });
    } catch (error) {
      console.error('Create job error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to create job', 
        error: error.message 
      });
    }
  }

  async getAllJobs(req, res) {
    try {
      const { limit = 50, offset = 0 } = req.query;
      const jobs = await Job.getAll(parseInt(limit), parseInt(offset));
      
      res.status(200).json({
        success: true,
        data: jobs
      });
    } catch (error) {
      console.error('Get jobs error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to get jobs', 
        error: error.message 
      });
    }
  }

  async getJobById(req, res) {
    try {
      const { id } = req.params;
      const job = await Job.findById(id);
      
      if (!job) {
        return res.status(404).json({ 
          success: false, 
          message: 'Job not found' 
        });
      }

      // Get quotations for this job
      const quotations = await Quotation.findByJobId(id);
      
      res.status(200).json({
        success: true,
        data: {
          ...job,
          quotations
        }
      });
    } catch (error) {
      console.error('Get job error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to get job', 
        error: error.message 
      });
    }
  }

  async updateJob(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const job = await Job.findById(id);
      if (!job) {
        return res.status(404).json({ 
          success: false, 
          message: 'Job not found' 
        });
      }

      const updatedJob = await Job.update(id, updateData);
      
      res.status(200).json({
        success: true,
        message: 'Job updated successfully',
        data: updatedJob
      });
    } catch (error) {
      console.error('Update job error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to update job', 
        error: error.message 
      });
    }
  }

  async updateJobStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const job = await Job.findById(id);
      if (!job) {
        return res.status(404).json({ 
          success: false, 
          message: 'Job not found' 
        });
      }

      const updatedJob = await Job.updateStatus(id, status);
      
      res.status(200).json({
        success: true,
        message: 'Job status updated successfully',
        data: updatedJob
      });
    } catch (error) {
      console.error('Update job status error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to update job status', 
        error: error.message 
      });
    }
  }

  async assignISP(req, res) {
    try {
      const { id } = req.params;
      const { isp_id } = req.body;
      
      const job = await Job.findById(id);
      if (!job) {
        return res.status(404).json({ 
          success: false, 
          message: 'Job not found' 
        });
      }

      const updatedJob = await Job.assignISP(id, isp_id);
      
      res.status(200).json({
        success: true,
        message: 'ISP assigned successfully',
        data: updatedJob
      });
    } catch (error) {
      console.error('Assign ISP error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to assign ISP', 
        error: error.message 
      });
    }
  }

  async addNote(req, res) {
    try {
      const { id } = req.params;
      const { note } = req.body;
      
      const job = await Job.findById(id);
      if (!job) {
        return res.status(404).json({ 
          success: false, 
          message: 'Job not found' 
        });
      }

      const updatedJob = await Job.addNote(id, note);
      
      res.status(200).json({
        success: true,
        message: 'Note added successfully',
        data: updatedJob
      });
    } catch (error) {
      console.error('Add note error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to add note', 
        error: error.message 
      });
    }
  }

  async deleteJob(req, res) {
    try {
      const { id } = req.params;
      
      const job = await Job.findById(id);
      if (!job) {
        return res.status(404).json({ 
          success: false, 
          message: 'Job not found' 
        });
      }

      await Job.delete(id);
      
      res.status(200).json({
        success: true,
        message: 'Job deleted successfully'
      });
    } catch (error) {
      console.error('Delete job error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to delete job', 
        error: error.message 
      });
    }
  }
}

module.exports = new JobController();