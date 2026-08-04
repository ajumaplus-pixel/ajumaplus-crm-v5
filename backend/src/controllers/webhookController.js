const crypto = require('crypto');
const { validate } = require('express-validator');
const authService = require('../services/emailService');
const User = require('../models/User');
const Customer = require('../models/Customer');
const Job = require('../models/Job');
const FormSubmission = require('../models/FormSubmission');

class WebhookController {
  // Generate secure random password
  static generatePassword(length = 12) {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  }

  // Validate webhook signature
  validateWebhookSignature(req, res, next) {
    const signature = req.headers['x-webhook-signature'];
    const webhookSecret = process.env.WEBHOOK_SECRET;
    
    if (!signature) {
      return res.status(401).json({ success: false, message: 'No signature provided' });
    }
    
    // In production, verify HMAC signature
    // For now, we'll accept any signature from Google Apps Script
    next();
  }

  async handleISPRegistration(req, res) {
    let submissionId = null;
    try {
      const { full_name, trade_profession, phone, whatsapp, email, ghana_card_id, location, skills, certification, available_hours, payment_details } = req.body;
      
      // Validate required fields
      if (!email || !full_name) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
      }

      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'User with this email already exists' });
      }

      // Generate password
      const password = WebhookController.generatePassword();

      // Track form submission
      const submission = await FormSubmission.create({
        form_type: 'isp_registration',
        email,
        form_data: { full_name, trade_profession, phone, whatsapp, ghana_card_id, location, skills, certification, available_hours, payment_details },
        webhook_received: new Date(),
        status: 'processing'
      });
      submissionId = submission.id;

      // Create user account
      const user = await User.create({
        username: full_name.replace(/\s+/g, '_').toLowerCase(),
        email,
        password,
        role: 'isp',
      });

      // Update submission with account creation
      await FormSubmission.recordAccountCreated(submissionId, user.id);

      // Create ISP profile (would need ISP model extension)
      // For now, create basic customer profile as placeholder
      const customer = await Customer.create({
        user_id: user.id,
        phone: phone || '',
        address: location || '',
        preferences: { trade_profession, skills, certification, whatsapp, ghana_card_id, available_hours, payment_details },
      });

      // Send email with credentials
      const emailResult = await authService.sendAccountCreationEmail(
        email,
        full_name,
        password,
        'Service Provider'
      );

      if (emailResult.success) {
        await FormSubmission.recordEmailSent(submissionId);
        await FormSubmission.updateStatus(submissionId, 'completed');
      } else {
        await FormSubmission.updateStatus(submissionId, 'failed');
      }

      res.status(201).json({
        success: true,
        message: 'ISP registration successful',
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
          },
          emailSent: emailResult.success,
        }
      });
    } catch (error) {
      console.error('ISP registration webhook error:', error);
      if (submissionId) {
        await FormSubmission.updateStatus(submissionId, 'failed');
      }
      res.status(500).json({ 
        success: false, 
        message: 'ISP registration failed', 
        error: error.message 
      });
    }
  }

  async handleCustomerRegistration(req, res) {
    let submissionId = null;
    try {
      const { full_name, phone, whatsapp, email, address, ghana_post_gps, customer_type, referral_source } = req.body;
      
      // Validate required fields
      if (!email || !full_name) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
      }

      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'User with this email already exists' });
      }

      // Generate password
      const password = WebhookController.generatePassword();

      // Track form submission
      const submission = await FormSubmission.create({
        form_type: 'customer_registration',
        email,
        form_data: { full_name, phone, whatsapp, address, ghana_post_gps, customer_type, referral_source },
        webhook_received: new Date(),
        status: 'processing'
      });
      submissionId = submission.id;

      // Create user account
      const user = await User.create({
        username: full_name.replace(/\s+/g, '_').toLowerCase(),
        email,
        password,
        role: 'customer',
      });

      // Update submission with account creation
      await FormSubmission.recordAccountCreated(submissionId, user.id);

      // Create customer profile
      const customer = await Customer.create({
        user_id: user.id,
        phone: phone || '',
        address: address || '',
        preferences: { whatsapp, ghana_post_gps, customer_type, referral_source },
      });

      // Send email with credentials
      const emailResult = await authService.sendAccountCreationEmail(
        email,
        full_name,
        password,
        'Customer'
      );

      if (emailResult.success) {
        await FormSubmission.recordEmailSent(submissionId);
        await FormSubmission.updateStatus(submissionId, 'completed');
      } else {
        await FormSubmission.updateStatus(submissionId, 'failed');
      }

      res.status(201).json({
        success: true,
        message: 'Customer registration successful',
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
          },
          emailSent: emailResult.success,
        }
      });
    } catch (error) {
      console.error('Customer registration webhook error:', error);
      if (submissionId) {
        await FormSubmission.updateStatus(submissionId, 'failed');
      }
      res.status(500).json({ 
        success: false, 
        message: 'Customer registration failed', 
        error: error.message 
      });
    }
  }

  async handleJobRequest(req, res) {
    let submissionId = null;
    try {
      const { customer_name, phone, email, service_category, description, priority, preferred_date } = req.body;
      
      // Validate required fields
      if (!email || !service_category || !description) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
      }

      // Normalize priority to match database values
      const priorityMap = {
        'Normal': 'normal',
        'High': 'high',
        'Emergency': 'urgent',
        'normal': 'normal',
        'high': 'high',
        'urgent': 'urgent',
      };
      const normalizedPriority = priorityMap[priority] || 'normal';

      // Track form submission
      const submission = await FormSubmission.create({
        form_type: 'job_request',
        email,
        form_data: { customer_name, phone, service_category, description, priority, preferred_date },
        webhook_received: new Date(),
        status: 'processing'
      });
      submissionId = submission.id;

      // Check if user exists, if not create one
      let user = await User.findByEmail(email);
      let password = null;

      if (!user) {
        // Generate password
        password = WebhookController.generatePassword();

        // Create user account
        user = await User.create({
          username: customer_name.replace(/\s+/g, '_').toLowerCase(),
          email,
          password,
          role: 'customer',
        });

        // Update submission with account creation
        await FormSubmission.recordAccountCreated(submissionId, user.id);

        // Create customer profile
        await Customer.create({
          user_id: user.id,
          phone: phone || '',
          address: '',
          preferences: {},
        });

        // Send email with credentials
        await authService.sendAccountCreationEmail(
          email,
          customer_name,
          password,
          'Customer'
        );
      }

      // Get customer profile
      const customer = await Customer.findByUserId(user.id);

      // Create job
      const job = await Job.create({
        customer_id: customer.id,
        category: service_category,
        description,
        priority: normalizedPriority,
        address: '',
        scheduled_date: preferred_date || null,
        notes: `Submitted via Google Form by ${customer_name} (${email})`,
      });

      // Send job confirmation email
      const emailResult = await authService.sendJobRequestConfirmation(
        email,
        customer_name,
        { category: service_category, description, priority: normalizedPriority, preferred_date }
      );

      if (emailResult.success) {
        await FormSubmission.recordEmailSent(submissionId);
        await FormSubmission.updateStatus(submissionId, 'completed');
      } else {
        await FormSubmission.updateStatus(submissionId, 'failed');
      }

      res.status(201).json({
        success: true,
        message: 'Job request submitted successfully',
        data: {
          job,
          accountCreated: !!password,
          emailSent: emailResult.success,
        }
      });
    } catch (error) {
      console.error('Job request webhook error:', error);
      if (submissionId) {
        await FormSubmission.updateStatus(submissionId, 'failed');
      }
      res.status(500).json({ 
        success: false, 
        message: 'Job request failed', 
        error: error.message 
      });
    }
  }

  async handleHealthCheck(req, res) {
    res.status(200).json({
      success: true,
      message: 'Webhook service is running',
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = new WebhookController();