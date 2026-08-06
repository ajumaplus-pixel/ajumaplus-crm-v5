const aiService = require('../services/aiService');
const Quotation = require('../models/Quotation');
const Job = require('../models/Job');
const ISP = require('../models/ISP');
const { logger } = require('../utils/logger');

class PricingController {
  async estimatePrice(req, res) {
    try {
      const { job_id, description, category, urgency, complexity } = req.body;
      
      // Get job details
      const job = await Job.findById(job_id);
      if (!job) {
        return res.status(404).json({ 
          success: false, 
          message: 'Job not found' 
        });
      }

      // Use enhanced AI service for comprehensive analysis
      const jobData = {
        description,
        category,
        location: job.address,
        urgency: urgency || 3,
        complexity: complexity || 3
      };

      const aiAnalysis = await aiService.analyzeJobFull(jobData);
      
      // Get available ISPs in the area
      const availableISPs = await ISP.getAvailableByLocation(job.address);
      
      // Calculate enhanced pricing with AI insights
      const pricing = await aiService.calculateEnhancedPricing(jobData, aiAnalysis, availableISPs);
      
      res.status(200).json({
        success: true,
        message: 'Price estimated successfully',
        data: pricing
      });
    } catch (error) {
      logger.error('Price estimation error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to estimate price', 
        error: error.message 
      });
    }
  }

  async createQuotation(req, res) {
    try {
      const { job_id, labour_cost, materials_cost, travel_cost, experience_factor, complexity_factor, urgency_factor, total, notes, created_by } = req.body;
      
      const quotation = await Quotation.create({
        job_id,
        labour_cost,
        materials_cost,
        travel_cost,
        experience_factor,
        complexity_factor,
        urgency_factor,
        total,
        notes,
        created_by
      });
      
      res.status(201).json({
        success: true,
        message: 'Quotation created successfully',
        data: quotation
      });
    } catch (error) {
      logger.error('Create quotation error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to create quotation', 
        error: error.message 
      });
    }
  }

  async getAllQuotations(req, res) {
    try {
      const { limit = 50, offset = 0 } = req.query;
      const quotations = await Quotation.getAll(parseInt(limit), parseInt(offset));
      
      res.status(200).json({
        success: true,
        data: quotations
      });
    } catch (error) {
      logger.error('Get quotations error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to get quotations', 
        error: error.message 
      });
    }
  }

  async getQuotationById(req, res) {
    try {
      const { id } = req.params;
      const quotation = await Quotation.findById(id);
      
      if (!quotation) {
        return res.status(404).json({ 
          success: false, 
          message: 'Quotation not found' 
        });
      }

      res.status(200).json({
        success: true,
        data: quotation
      });
    } catch (error) {
      logger.error('Get quotation error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to get quotation', 
        error: error.message 
      });
    }
  }

  async approveQuotation(req, res) {
    try {
      const { id } = req.params;
      
      const quotation = await Quotation.findById(id);
      if (!quotation) {
        return res.status(404).json({ 
          success: false, 
          message: 'Quotation not found' 
        });
      }

      // Get the job to check if the user is the customer
      const job = await Job.findById(quotation.job_id);
      if (!job) {
        return res.status(404).json({ 
          success: false, 
          message: 'Associated job not found' 
        });
      }

      // If user is not staff, check if they are the customer
      if (req.user.role !== 'staff' && req.user.role !== 'admin') {
        const Customer = require('../models/Customer');
        const customer = await Customer.findByUserId(req.user.id);
        
        if (!customer || customer.id !== job.customer_id) {
          return res.status(403).json({ 
            success: false, 
            message: 'You can only approve quotations for your own jobs' 
          });
        }
      }

      const updatedQuotation = await Quotation.approve(id);
      
      res.status(200).json({
        success: true,
        message: 'Quotation approved successfully',
        data: updatedQuotation
      });
    } catch (error) {
      logger.error('Approve quotation error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to approve quotation', 
        error: error.message 
      });
    }
  }

  async rejectQuotation(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      
      const quotation = await Quotation.findById(id);
      if (!quotation) {
        return res.status(404).json({ 
          success: false, 
          message: 'Quotation not found' 
        });
      }

      // Get the job to check if the user is the customer
      const job = await Job.findById(quotation.job_id);
      if (!job) {
        return res.status(404).json({ 
          success: false, 
          message: 'Associated job not found' 
        });
      }

      // If user is not staff, check if they are the customer
      if (req.user.role !== 'staff' && req.user.role !== 'admin') {
        const Customer = require('../models/Customer');
        const customer = await Customer.findByUserId(req.user.id);
        
        if (!customer || customer.id !== job.customer_id) {
          return res.status(403).json({ 
            success: false, 
            message: 'You can only reject quotations for your own jobs' 
          });
        }
      }

      const updatedQuotation = await Quotation.reject(id, reason);
      
      res.status(200).json({
        success: true,
        message: 'Quotation rejected successfully',
        data: updatedQuotation
      });
    } catch (error) {
      logger.error('Reject quotation error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to reject quotation', 
        error: error.message 
      });
    }
  }
}

module.exports = new PricingController();