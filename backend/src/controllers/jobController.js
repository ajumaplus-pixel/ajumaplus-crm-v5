const Job = require('../models/Job');
const Quotation = require('../models/Quotation');
const Customer = require('../models/Customer');
const NotificationService = require('../services/notificationService');
const MatchingService = require('../services/matchingService');
const AutoQuoteService = require('../services/autoQuoteService');
const pool = require('../config/database');

class JobController {
  async createJob(req, res) {
    try {
      const { customer_id, category, description, priority, address, gps_coords, scheduled_date, notes } = req.body;
      
      // Allow guest requests without customer_id
      const jobData = {
        category,
        description,
        priority,
        address,
        gps_coords,
        scheduled_date,
        notes
      };

      // Only add customer_id if provided (logged-in customer)
      if (customer_id) {
        jobData.customer_id = customer_id;
      }

      // Remove any ISP assignment from request - customers cannot select ISPs
      const job = await Job.create(jobData);
      
      // Auto-generate quotes if customer is logged in
      if (req.user && req.user.role === 'customer' && customer_id) {
        try {
          await AutoQuoteService.generateQuotesForJob(job.id);
        } catch (quoteError) {
          console.error('Failed to auto-generate quotes:', quoteError);
          // Continue without quotes if generation fails
        }
      }
      
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

  async getJobsByCustomer(req, res) {
    try {
      const { customerId } = req.params;
      const { status } = req.query;
      
      let jobs;
      if (status) {
        // Filter by status if provided
        const allJobs = await Job.getByCustomerId(customerId);
        jobs = allJobs.filter(job => job.status === status);
      } else {
        jobs = await Job.getByCustomerId(customerId);
      }
      
      res.status(200).json({
        success: true,
        data: jobs
      });
    } catch (error) {
      console.error('Get customer jobs error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to get customer jobs', 
        error: error.message 
      });
    }
  }

  async updateJobStatusWithLocation(req, res) {
    try {
      const { id } = req.params;
      const { status, lat, lng } = req.body;
      
      const job = await Job.findById(id);
      if (!job) {
        return res.status(404).json({ 
          success: false, 
          message: 'Job not found' 
        });
      }

      const updatedJob = await Job.updateStatusWithLocation(id, status, lat, lng);
      
      // Notify customer of status change
      if (status === 'en_route' || status === 'arrived' || status === 'in_progress') {
        try {
          const customer = await Customer.findById(job.customer_id);
          await NotificationService.create({
            user_id: customer.user_id,
            type: 'job_status_update',
            title: `Job Status: ${status.replace('_', ' ').toUpperCase()}`,
            message: `Your job ${job.job_number} status has been updated to ${status.replace('_', ' ')}`,
            data: { job_id: id, status }
          });
        } catch (notifError) {
          console.error('Failed to create notification:', notifError);
        }
      }
      
      res.json({
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

  async getJobProgress(req, res) {
    try {
      const { id } = req.params;
      const progress = await Job.getJobProgress(id);
      
      if (!progress) {
        return res.status(404).json({ 
          success: false, 
          message: 'Job not found' 
        });
      }

      // Calculate ETA if ISP is en route
      let eta = null;
      let distance = null;
      if (progress.status === 'en_route' && progress.current_location && progress.destination) {
        const currentLoc = typeof progress.current_location === 'string' ? JSON.parse(progress.current_location) : progress.current_location;
        const destLoc = typeof progress.destination === 'string' ? JSON.parse(progress.destination) : progress.destination;
        
        if (currentLoc && destLoc) {
          distance = MatchingService.calculateDistance(
            currentLoc.lat,
            currentLoc.lng,
            destLoc.lat,
            destLoc.lng
          );
          // Assume average speed of 30 km/h in cities
          const timeMinutes = (distance / 30) * 60;
          eta = Math.ceil(timeMinutes);
        }
      }
      
      res.json({
        success: true,
        data: {
          ...progress,
          eta,
          distance: distance ? distance.toFixed(1) : null
        }
      });
    } catch (error) {
      console.error('Get job progress error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to get job progress', 
        error: error.message 
      });
    }
  }

  async getJobQuotes(req, res) {
    try {
      const { id } = req.params;
      const job = await Job.findById(id);
      
      if (!job) {
        return res.status(404).json({ 
          success: false, 
          message: 'Job not found' 
        });
      }

      // Check if user is the customer
      if (req.user.role !== 'staff' && req.user.role !== 'admin') {
        const customer = await Customer.findByUserId(req.user.id);
        
        if (!customer || customer.id !== job.customer_id) {
          return res.status(403).json({ 
            success: false, 
            message: 'You can only view quotes for your own jobs' 
          });
        }
      }

      // Check quote expiration
      await AutoQuoteService.checkQuoteExpiration(id);

      // Get quotes
      const quotations = await Quotation.findByJobId(id);
      
      // Add ISP details to each quote
      const quotesWithISP = await Promise.all(quotations.map(async (quote) => {
        if (quote.suggested_isp_id) {
          const isp = await ISP.findById(quote.suggested_isp_id);
          return {
            ...quote,
            isp_name: isp.trade,
            isp_rating: isp.rating
          };
        }
        return quote;
      }));
      
      res.status(200).json({
        success: true,
        data: {
          job,
          quotes: quotesWithISP,
          expiresAt: job.quote_expires_at
        }
      });
    } catch (error) {
      console.error('Get job quotes error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to get job quotes', 
        error: error.message 
      });
    }
  }

  async acceptQuote(req, res) {
    try {
      const { id } = req.params; // quotation ID
      const quotation = await Quotation.findById(id);
      
      if (!quotation) {
        return res.status(404).json({ 
          success: false, 
          message: 'Quotation not found' 
        });
      }

      // Check if expired
      if (quotation.expires_at && new Date() > new Date(quotation.expires_at)) {
        return res.status(400).json({ 
          success: false, 
          message: 'This quote has expired. Please request new quotes.' 
        });
      }

      const job = await Job.findById(quotation.job_id);
      
      // Check if user is the customer
      if (req.user.role !== 'staff' && req.user.role !== 'admin') {
        const customer = await Customer.findByUserId(req.user.id);
        
        if (!customer || customer.id !== job.customer_id) {
          return res.status(403).json({ 
            success: false, 
            message: 'You can only accept quotes for your own jobs' 
          });
        }
      }

      // Assign ISP and update job status
      if (quotation.suggested_isp_id) {
        await Job.assignISP(job.id, quotation.suggested_isp_id);
      }

      // Update job with selected tier
      await pool.query(
        'UPDATE jobs SET quote_tier_selected = ?, status = ? WHERE id = ?',
        [quotation.tier, 'assigned', job.id]
      );

      // Approve the selected quotation
      await Quotation.approve(id);

      // Reject other quotations for this job
      const otherQuotes = await Quotation.findByJobId(job.id);
      for (const otherQuote of otherQuotes) {
        if (otherQuote.id !== id) {
          await Quotation.reject(otherQuote.id, 'Another quote was selected');
        }
      }

      // Notify ISP
      if (quotation.suggested_isp_id) {
        const isp = await ISP.findById(quotation.suggested_isp_id);
        const customer = await Customer.findById(job.customer_id);
        
        await NotificationService.create({
          user_id: isp.user_id,
          type: 'job_assignment',
          title: 'New Job Assignment',
          message: `You have been assigned to job ${job.job_number} - ${job.category}`,
          data: { job_id: job.id, quotation_id: id }
        });
      }

      res.status(200).json({
        success: true,
        message: 'Quote accepted and ISP assigned successfully',
        data: await Job.findById(job.id)
      });
    } catch (error) {
      console.error('Accept quote error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to accept quote', 
        error: error.message 
      });
    }
  }

  async linkJobToCustomer(req, res) {
    try {
      const { jobId } = req.params;
      const { customer_id } = req.body;
      
      const job = await Job.findById(jobId);
      if (!job) {
        return res.status(404).json({ 
          success: false, 
          message: 'Job not found' 
        });
      }

      if (job.customer_id) {
        return res.status(400).json({ 
          success: false, 
          message: 'Job already linked to a customer' 
        });
      }

      await pool.query('UPDATE jobs SET customer_id = ? WHERE id = ?', [customer_id, jobId]);
      
      // Auto-generate quotes after linking
      try {
        await AutoQuoteService.generateQuotesForJob(jobId);
      } catch (quoteError) {
        console.error('Failed to auto-generate quotes:', quoteError);
      }

      res.status(200).json({
        success: true,
        message: 'Job linked to customer successfully',
        data: await Job.findById(jobId)
      });
    } catch (error) {
      console.error('Link job to customer error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to link job to customer', 
        error: error.message 
      });
    }
  }
}

module.exports = new JobController();