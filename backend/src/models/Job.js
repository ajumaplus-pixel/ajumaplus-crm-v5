const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Job {
  static async create(jobData) {
    const { customer_id, category, description, priority, address, gps_coords, scheduled_date, notes } = jobData;
    const id = uuidv4();
    const job_number = `JOB${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 100)}`;
    
    const query = `
      INSERT INTO jobs (id, job_number, customer_id, category, description, priority, status, address, gps_coords, scheduled_date, notes, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, 'new', $7, $8, $9, $10, NOW(), NOW())
    `;

    const values = [id, job_number, customer_id, category, description, priority || 'normal', address, gps_coords, scheduled_date, notes];
    await pool.query(query, values);

    return await this.findById(id);
  }

  static async findById(id) {
    const query = 'SELECT * FROM jobs WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findByJobNumber(jobNumber) {
    const query = 'SELECT * FROM jobs WHERE job_number = $1';
    const result = await pool.query(query, [jobNumber]);
    return result.rows[0];
  }

  static async getAll(limit = 50, offset = 0) {
    const query = 'SELECT * FROM jobs ORDER BY created_at DESC LIMIT $1 OFFSET $2';
    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  }

  static async update(id, updateData) {
    const { category, description, priority, address, gps_coords, scheduled_date, notes } = updateData;
    const query = `
      UPDATE jobs
      SET category = $1, description = $2, priority = $3, address = $4, gps_coords = $5,
          scheduled_date = $6, notes = $7, updated_at = NOW()
      WHERE id = $8
    `;

    const values = [category, description, priority, address, gps_coords, scheduled_date, notes, id];
    await pool.query(query, values);

    return await this.findById(id);
  }

  static async updateStatus(id, status) {
    const query = 'UPDATE jobs SET status = $1, updated_at = NOW() WHERE id = $2';
    await pool.query(query, [status, id]);
    return await this.findById(id);
  }

  static async assignISP(id, isp_id) {
    const query = 'UPDATE jobs SET isp_id = $1, status = \'assigned\', updated_at = NOW() WHERE id = $2';
    await pool.query(query, [isp_id, id]);
    return await this.findById(id);
  }

  static async addNote(id, note) {
    const query = 'UPDATE jobs SET notes = COALESCE(notes, \'\') || E\'\\n\' || $1, updated_at = NOW() WHERE id = $2';
    await pool.query(query, [note, id]);
    return await this.findById(id);
  }

  static async getByCustomerId(customerId) {
    const query = 'SELECT * FROM jobs WHERE customer_id = $1 ORDER BY created_at DESC';
    const result = await pool.query(query, [customerId]);
    return result.rows;
  }

  static async getByISPId(ispId) {
    const query = 'SELECT * FROM jobs WHERE isp_id = $1 ORDER BY created_at DESC';
    const result = await pool.query(query, [ispId]);
    return result.rows;
  }

  static async getByStatus(status) {
    const query = 'SELECT * FROM jobs WHERE status = $1 ORDER BY created_at DESC';
    const result = await pool.query(query, [status]);
    return result.rows;
  }

  static async getCompletedJobs() {
    const query = 'UPDATE jobs SET completed_date = NOW() WHERE status = \'completed\' AND completed_date IS NULL';
    const result = await pool.query(query);
    return result.rows;
  }

  static async delete(id) {
    const query = 'DELETE FROM jobs WHERE id = $1';
    await pool.query(query, [id]);
  }
}

module.exports = Job;