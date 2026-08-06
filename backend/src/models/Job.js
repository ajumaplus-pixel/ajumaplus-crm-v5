const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Job {
  static async create(jobData) {
    const { customer_id, category, description, priority, address, gps_coords, scheduled_date, notes } = jobData;
    const id = uuidv4();
    const job_number = `JOB${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 100)}`;
    
    const query = `
      INSERT INTO jobs (id, job_number, customer_id, category, description, priority, status, address, gps_coords, scheduled_date, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, 'new', ?, ?, ?, ?, NOW(), NOW())
    `;

    const values = [id, job_number, customer_id || null, category, description, priority || 'normal', address, gps_coords, scheduled_date, notes];
    await pool.query(query, values);

    return await this.findById(id);
  }

  static async findById(id) {
    const query = 'SELECT * FROM jobs WHERE id = ?';
    const [result] = await pool.query(query, [id]);
    return result[0];
  }

  static async findByJobNumber(jobNumber) {
    const query = 'SELECT * FROM jobs WHERE job_number = ?';
    const [result] = await pool.query(query, [jobNumber]);
    return result[0];
  }

  static async getAll(limit = 50, offset = 0) {
    const query = 'SELECT * FROM jobs ORDER BY created_at DESC LIMIT ? OFFSET ?';
    const [result] = await pool.query(query, [limit, offset]);
    return result;
  }

  static async update(id, updateData) {
    const { category, description, priority, address, gps_coords, scheduled_date, notes } = updateData;
    const query = `
      UPDATE jobs
      SET category = ?, description = ?, priority = ?, address = ?, gps_coords = ?,
          scheduled_date = ?, notes = ?, updated_at = NOW()
      WHERE id = ?
    `;

    const values = [category, description, priority, address, gps_coords, scheduled_date, notes, id];
    await pool.query(query, values);

    return await this.findById(id);
  }

  static async updateStatus(id, status) {
    const query = 'UPDATE jobs SET status = ?, updated_at = NOW() WHERE id = ?';
    await pool.query(query, [status, id]);
    return await this.findById(id);
  }

  static async assignISP(id, isp_id) {
    const query = 'UPDATE jobs SET isp_id = ?, status = \'assigned\', updated_at = NOW() WHERE id = ?';
    await pool.query(query, [isp_id, id]);
    return await this.findById(id);
  }

  static async addNote(id, note) {
    const query = 'UPDATE jobs SET notes = CONCAT(COALESCE(notes, \'\'), \'\n\', ?), updated_at = NOW() WHERE id = ?';
    await pool.query(query, [note, id]);
    return await this.findById(id);
  }

  static async getByCustomerId(customerId) {
    const query = 'SELECT * FROM jobs WHERE customer_id = ? ORDER BY created_at DESC';
    const [result] = await pool.query(query, [customerId]);
    return result;
  }

  static async getByISPId(ispId) {
    const query = 'SELECT * FROM jobs WHERE isp_id = ? ORDER BY created_at DESC';
    const [result] = await pool.query(query, [ispId]);
    return result;
  }

  static async getByStatus(status) {
    const query = 'SELECT * FROM jobs WHERE status = ? ORDER BY created_at DESC';
    const [result] = await pool.query(query, [status]);
    return result;
  }

  static async getCompletedJobs() {
    const query = 'UPDATE jobs SET completed_date = NOW() WHERE status = \'completed\' AND completed_date IS NULL';
    await pool.query(query);
  }

  static async delete(id) {
    const query = 'DELETE FROM jobs WHERE id = ?';
    await pool.query(query, [id]);
  }

  static async updateStatusWithLocation(id, status, lat, lng) {
    const query = `
      UPDATE jobs 
      SET status = ?, 
          current_lat = ?, 
          current_lng = ?,
          updated_at = NOW() 
      WHERE id = ?
    `;
    await pool.query(query, [status, lat, lng, id]);
    return await this.findById(id);
  }

  static async getJobProgress(jobId) {
    const query = `
      SELECT j.*, 
             i.current_location,
             i.gps_coords as destination,
             i.trade as service_type
      FROM jobs j
      LEFT JOIN isps i ON j.isp_id = i.id
      WHERE j.id = ?
    `;
    const [result] = await pool.query(query, [jobId]);
    return result[0];
  }
}

module.exports = Job;