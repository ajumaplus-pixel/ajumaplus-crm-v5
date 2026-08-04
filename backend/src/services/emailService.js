const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.init();
  }

  init() {
    try {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });
      console.log('Email service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize email service:', error);
    }
  }

  async sendAccountCreationEmail(email, username, password, role) {
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@ajumaplus.com',
        to: email,
        subject: 'Welcome to AjumaPlus CRM - Your Account Details',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #FFD400 0%, #FFA500 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: #1A1A1A; margin: 0;">Welcome to AjumaPlus CRM</h1>
              <p style="color: #4A4A4A; margin: 10px 0;">Ghana's Premier Service Management Platform</p>
            </div>
            <div style="background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #1A1A1A;">Your Account Has Been Created Successfully</h2>
              <p>Dear ${username},</p>
              <p>Your ${role} account has been created successfully on the AjumaPlus CRM platform. Below are your login credentials:</p>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Username:</strong> ${username}</p>
                <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
                <p style="margin: 5px 0;"><strong>Password:</strong> <code style="background: #e9ecef; padding: 2px 6px; border-radius: 4px;">${password}</code></p>
                <p style="margin: 5px 0;"><strong>Role:</strong> ${role}</p>
              </div>
              
              <p><strong>Important Security Notice:</strong></p>
              <ul style="color: #666;">
                <li>Please change your password after your first login</li>
                <li>Never share your password with anyone</li>
                <li>Keep your credentials secure</li>
              </ul>
              
              <p>You can log in to your account at:</p>
              <p><a href="http://localhost:3003/customer/login" style="color: #006B3F; text-decoration: none; font-weight: bold;">http://localhost:3003/customer/login</a></p>
              
              <p>If you have any questions or need assistance, please contact our support team.</p>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef;">
                <p style="color: #666; font-size: 12px;">This is an automated email. Please do not reply directly to this message.</p>
                <p style="color: #666; font-size: 12px;">© 2026 AJUMAPLUS CRM. All rights reserved.</p>
              </div>
            </div>
          </div>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Failed to send email:', error);
      return { success: false, error: error.message };
    }
  }

  async sendJobRequestConfirmation(email, customerName, jobDetails) {
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@ajumaplus.com',
        to: email,
        subject: 'Your Service Request Has Been Received - AjumaPlus CRM',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #006B3F 0%, #004D2C 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: #ffffff; margin: 0;">Service Request Received</h1>
              <p style="color: #ffffff; margin: 10px 0;">AjumaPlus CRM Ghana</p>
            </div>
            <div style="background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #1A1A1A;">Thank You, ${customerName}!</h2>
              <p>Your service request has been received successfully. Our team will review it and contact you shortly.</p>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #006B3F;">Request Details:</h3>
                <p style="margin: 5px 0;"><strong>Service Category:</strong> ${jobDetails.category}</p>
                <p style="margin: 5px 0;"><strong>Description:</strong> ${jobDetails.description}</p>
                <p style="margin: 5px 0;"><strong>Priority:</strong> ${jobDetails.priority}</p>
                <p style="margin: 5px 0;"><strong>Address:</strong> ${jobDetails.address}</p>
              </div>
              
              <p><strong>What Happens Next:</strong></p>
              <ul style="color: #666;">
                <li>Our team will review your request</li>
                <li>You'll receive a quotation within 24-48 hours</li>
                <li>Upon approval, we'll assign a service provider</li>
                <li>You can track progress in your customer dashboard</li>
              </ul>
              
              <p>To track your request status, please log in to your account.</p>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef;">
                <p style="color: #666; font-size: 12px;">This is an automated email. Please do not reply directly to this message.</p>
                <p style="color: #666; font-size: 12px;">© 2026 AJUMAPLUS CRM. All rights reserved.</p>
              </div>
            </div>
          </div>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Job confirmation email sent successfully:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Failed to send job confirmation email:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();