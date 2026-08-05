const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Quotation {
  static async create(quotationData) {
    const { job_id, labour_cost, materials_cost, travel_cost, experience_factor, complexity_factor, urgency_factor, total, notes, created_by } = quotationData;
    const id = uuidv4();
    const quotation_number = `QT${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 100)}`;
    
    const query = `
      INSERT INTO quotations (id, quotation_number, job_id, labour_cost, materials_cost, travel_cost, experience_factor, complexity_factor, urgency_factor, total, status, notes, created_by, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'draft', $11, $12, NOW(), NOW())
    `;

    const values = [id, quotation_number, job_id, labour_cost, materials_cost, travel_cost, experience_factor || 1.0, complexity_factor || 1.0, urgency_factor || 1.0, total, notes, created_by];
    await pool.query(query, values);

    return await this.findById(id);
  }

  static async findById(id) {
    const query = 'SELECT * FROM quotations WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findByJobId(jobId) {
    const query = 'SELECT * FROM quotations WHERE job_id = $1 ORDER BY created_at DESC';
    const result = await pool.query(query, [jobId]);
    return result.rows;
  }

  static async getAll(limit = 50, offset = 0) {
    const query = 'SELECT * FROM quotations ORDER BY created_at DESC LIMIT $1 OFFSET $2';
    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  }

  static async update(id, updateData) {
    const { labour_cost, materials_cost, travel_cost, experience_factor, complexity_factor, urgency_factor, total, notes } = updateData;
    const query = `
      UPDATE quotations
      SET labour_cost = $1, materials_cost = $2, travel_cost = $3, experience_factor = $4,
          complexity_factor = $5, urgency_factor = $6, total = $7, notes = $8, updated_at = NOW()
      WHERE id = $9
    `;

    const values = [labour_cost, materials_cost, travel_cost, experience_factor, complexity_factor, urgency_factor, total, notes, id];
    await pool.query(query, values);

    return await this.findById(id);
  }

  static async approve(id) {
    const query = 'UPDATE quotations SET status = \'approved\', updated_at = NOW() WHERE id = $1';
    await pool.query(query, [id]);
    return await this.findById(id);
  }

  static async reject(id) {
    const query = 'UPDATE quotations SET status = \'rejected\', updated_at = NOW() WHERE id = $1';
    await pool.query(query, [id]);
    return await this.findById(id);
  }

  static async getByStatus(status) {
    const query = 'SELECT * FROM quotations WHERE status = $1 ORDER BY created_at DESC';
    const result = await pool.query(query, [status]);
    return result.rows;
  }

  static async delete(id) {
    const query = 'DELETE FROM quotations WHERE id = $1';
    await pool.query(query, [id]);
  }
}

module.exports = Quotation;