const Customer = require('../models/Customer');

class CustomerController {
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
}

module.exports = new CustomerController();