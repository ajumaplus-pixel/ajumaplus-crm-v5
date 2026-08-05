const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');

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

    const id = uuidv4();
    const query = `
      INSERT INTO form_submissions (id, form_type, email, form_data, webhook_received, account_created, email_sent, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;

    const values = [
      id,
      form_type,
      email,
      JSON.stringify(form_data),
      webhook_received || new Date(),
      account_created || null,
      email_sent || null,
      status || 'completed'
    ];

    try {
      await pool.query(query, values);
      return await this.findById(id);
    } catch (error) {
      console.error('Error creating form submission:', error);
      throw error;
    }
  }

  static async findById(id) {
    const query = 'SELECT * FROM form_submissions WHERE id = $1';
    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error finding form submission by id:', error);
      throw error;
    }
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM form_submissions WHERE email = $1 ORDER BY webhook_received DESC';

    try {
      const result = await pool.query(query, [email]);
      return result.rows;
    } catch (error) {
      console.error('Error finding form submissions by email:', error);
      throw error;
    }
  }

  static async findByFormType(formType, limit = 50) {
    const query = 'SELECT * FROM form_submissions WHERE form_type = $1 ORDER BY webhook_received DESC LIMIT $2';

    try {
      const result = await pool.query(query, [formType, limit]);
      return result.rows;
    } catch (error) {
      console.error('Error finding form submissions by type:', error);
      throw error;
    }
  }

  static async getAll(limit = 100) {
    const query = 'SELECT * FROM form_submissions ORDER BY webhook_received DESC LIMIT $1';

    try {
      const result = await pool.query(query, [limit]);
      return result.rows;
    } catch (error) {
      console.error('Error getting all form submissions:', error);
      throw error;
    }
  }

  static async updateStatus(id, status) {
    const query = 'UPDATE form_submissions SET status = $1 WHERE id = $2';

    try {
      const result = await pool.query(query, [status, id]);
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error updating form submission status:', error);
      throw error;
    }
  }

  static async recordEmailSent(id) {
    const query = 'UPDATE form_submissions SET email_sent = $1 WHERE id = $2';

    try {
      const result = await pool.query(query, [new Date(), id]);
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error recording email sent:', error);
      throw error;
    }
  }

  static async recordAccountCreated(id, userId) {
    const query = 'UPDATE form_submissions SET account_created = $1, user_id = $2 WHERE id = $3';

    try {
      const result = await pool.query(query, [new Date(), userId, id]);
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error recording account created:', error);
      throw error;
    }
  }
}

module.exports = FormSubmission;