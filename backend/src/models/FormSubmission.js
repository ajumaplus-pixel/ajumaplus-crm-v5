const db = require('../config/database');

class FormSubmission {
  static async create(submissionData) {
    const {
      form_type,
      email,
      form_data,
      webhook_received,
      account_created,
      email_sent,
      status
    } = submissionData;

    const query = `
      INSERT INTO form_submissions (form_type, email, form_data, webhook_received, account_created, email_sent, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      form_type,
      email,
      JSON.stringify(form_data),
      webhook_received || new Date(),
      account_created || null,
      email_sent || null,
      status || 'completed'
    ];

    try {
      const [result] = await db.execute(query, values);
      return {
        id: result.insertId,
        ...submissionData
      };
    } catch (error) {
      console.error('Error creating form submission:', error);
      throw error;
    }
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM form_submissions WHERE email = ? ORDER BY webhook_received DESC';
    
    try {
      const [rows] = await db.execute(query, [email]);
      return rows;
    } catch (error) {
      console.error('Error finding form submissions by email:', error);
      throw error;
    }
  }

  static async findByFormType(formType, limit = 50) {
    const query = 'SELECT * FROM form_submissions WHERE form_type = ? ORDER BY webhook_received DESC LIMIT ?';
    
    try {
      const [rows] = await db.execute(query, [formType, limit]);
      return rows;
    } catch (error) {
      console.error('Error finding form submissions by type:', error);
      throw error;
    }
  }

  static async getAll(limit = 100) {
    const query = 'SELECT * FROM form_submissions ORDER BY webhook_received DESC LIMIT ?';
    
    try {
      const [rows] = await db.execute(query, [limit]);
      return rows;
    } catch (error) {
      console.error('Error getting all form submissions:', error);
      throw error;
    }
  }

  static async updateStatus(id, status) {
    const query = 'UPDATE form_submissions SET status = ? WHERE id = ?';
    
    try {
      const [result] = await db.execute(query, [status, id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating form submission status:', error);
      throw error;
    }
  }

  static async recordEmailSent(id) {
    const query = 'UPDATE form_submissions SET email_sent = ? WHERE id = ?';
    
    try {
      const [result] = await db.execute(query, [new Date(), id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error recording email sent:', error);
      throw error;
    }
  }

  static async recordAccountCreated(id, userId) {
    const query = 'UPDATE form_submissions SET account_created = ?, user_id = ? WHERE id = ?';
    
    try {
      const [result] = await db.execute(query, [new Date(), userId, id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error recording account created:', error);
      throw error;
    }
  }
}

module.exports = FormSubmission;