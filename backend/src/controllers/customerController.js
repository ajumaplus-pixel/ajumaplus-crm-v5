const Customer = require('../models/Customer');
const { v4: uuidv4 } = require('uuid');

class CustomerController {
  async createGuestCustomer(req, res) {
    try {
      const { user_id, phone, address, preferences = {} } = req.body;
      
      // Validate required fields
      if (!user_id || !phone || !address) {
        return res.status(400).json({ 
          success: false, 
          message: 'Missing required fields: user_id, phone, address' 
        });
      }

      // Mark as guest customer
      const customerData = {
        id: uuidv4(),
        user_id,
        phone,
        address,
        preferences: {
          ...preferences,
          is_guest: true,
          created_at: new Date().toISOString(),
        },
      };

      const customer = await Customer.create(customerData);
      
      res.status(201).json({
        success: true,
        message: 'Guest customer created successfully',
        data: customer
      });
    } catch (error) {
      console.error('Create guest customer error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to create guest customer', 
        error: error.message 
      });
    }
  }

  async createCustomer(req, res) {
    try {
      const customer = await Customer.create(req.body);
      res.status(201).json({
        success: true,
        message: 'Customer created successfully',
        data: customer
      });
    } catch (error) {
      console.error('Create customer error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to create customer', 
        error: error.message 
      });
    }
  }

  async getCustomerById(req, res) {
    try {
      const { id } = req.params;
      const customer = await Customer.findById(id);
      
      if (!customer) {
        return res.status(404).json({ 
          success: false, 
          message: 'Customer not found' 
        });
      }

      res.status(200).json({
        success: true,
        data: customer
      });
    } catch (error) {
      console.error('Get customer error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to get customer', 
        error: error.message 
      });
    }
  }

  async getCustomerByUserId(req, res) {
    try {
      const { userId } = req.params;
      const customer = await Customer.findByUserId(userId);
      
      if (!customer) {
        return res.status(404).json({ 
          success: false, 
          message: 'Customer not found' 
        });
      }

      res.status(200).json({
        success: true,
        data: customer
      });
    } catch (error) {
      console.error('Get customer by user ID error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to get customer', 
        error: error.message 
      });
    }
  }

  async updateCustomer(req, res) {
    try {
      const { id } = req.params;
      const customer = await Customer.update(id, req.body);
      
      res.status(200).json({
        success: true,
        message: 'Customer updated successfully',
        data: customer
      });
    } catch (error) {
      console.error('Update customer error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to update customer', 
        error: error.message 
      });
    }
  }

  async convertGuestToCustomer(req, res) {
    try {
      const { id } = req.params;
      const { password, preferences } = req.body;
      
      const customer = await Customer.findById(id);
      
      if (!customer) {
        return res.status(404).json({ 
          success: false, 
          message: 'Customer not found' 
        });
      }

      if (!customer.preferences?.is_guest) {
        return res.status(400).json({ 
          success: false, 
          message: 'Customer is not a guest account' 
        });
      }

      // Update customer to regular customer
      const updatedCustomer = await Customer.update(id, {
        preferences: {
          ...customer.preferences,
          is_guest: false,
          converted_at: new Date().toISOString(),
          ...preferences,
        },
      });

      res.status(200).json({
        success: true,
        message: 'Guest customer converted successfully',
        data: updatedCustomer
      });
    } catch (error) {
      console.error('Convert guest customer error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to convert guest customer', 
        error: error.message 
      });
    }
  }

  async getCustomerStats(req, res) {
    try {
      const { id } = req.params;
      const Job = require('../models/Job');
      const Quotation = require('../models/Quotation');

      // Get customer jobs
      const jobs = await Job.getByCustomerId(id);
      
      // Calculate statistics
      const totalJobs = jobs.length;
      const activeJobs = jobs.filter(job => 
        ['new', 'assigned', 'in_progress'].includes(job.status)
      ).length;
      const completedJobs = jobs.filter(job => job.status === 'completed').length;

      // Get quotations for completed jobs to calculate total spent
      const completedJobIds = jobs
        .filter(job => job.status === 'completed')
        .map(job => job.id);
      
      let totalSpent = 0;
      if (completedJobIds.length > 0) {
        const quotations = await Promise.all(
          completedJobIds.map(jobId => Quotation.findByJobId(jobId))
        );
        
        totalSpent = quotations
          .flat()
          .filter(q => q && q.status === 'approved')
          .reduce((sum, q) => sum + parseFloat(q.total || 0), 0);
      }

      res.status(200).json({
        success: true,
        data: {
          totalJobs,
          activeJobs,
          completedJobs,
          totalSpent,
        }
      });
    } catch (error) {
      console.error('Get customer stats error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to get customer statistics', 
        error: error.message 
      });
    }
  }
}

module.exports = new CustomerController();