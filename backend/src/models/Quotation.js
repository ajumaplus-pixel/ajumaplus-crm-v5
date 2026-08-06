const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Quotation {
  static async create(quotationData) {
    const { job_id, labour_cost, materials_cost, travel_cost, experience_factor, complexity_factor, urgency_factor, total, notes, created_by, tier, suggested_isp_id, expires_at, is_auto_generated } = quotationData;
    const id = uuidv4();
    const quotation_number = `QT${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 100)}`;
    
    const query = `
      INSERT INTO quotations (id, quotation_number, job_id, labour_cost, materials_cost, travel_cost, experience_factor, complexity_factor, urgency_factor, total, status, notes, created_by, tier, suggested_isp_id, expires_at, is_auto_generated, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    const values = [id, quotation_number, job_id, labour_cost, materials_cost, travel_cost, experience_factor || 1.0, complexity_factor || 1.0, urgency_factor || 1.0, total, notes, created_by, tier || null, suggested_isp_id || null, expires_at || null, is_auto_generated || false];
    await pool.query(query, values);

    return await this.findById(id);
  }

  static async findById(id) {
    const query = 'SELECT * FROM quotations WHERE id = ?';
    const [result] = await pool.query(query, [id]);
    return result[0];
  }

  static async findByJobId(jobId) {
    const query = 'SELECT * FROM quotations WHERE job_id = ? ORDER BY created_at DESC';
    const [result] = await pool.query(query, [jobId]);
    return result;
  }

  static async getAll(limit = 50, offset = 0) {
    const query = 'SELECT * FROM quotations ORDER BY created_at DESC LIMIT ? OFFSET ?';
    const [result] = await pool.query(query, [limit, offset]);
    return result;
  }

  static async update(id, updateData) {
    const { labour_cost, materials_cost, travel_cost, experience_factor, complexity_factor, urgency_factor, total, notes } = updateData;
    const query = `
      UPDATE quotations
      SET labour_cost = ?, materials_cost = ?, travel_cost = ?, experience_factor = ?,
          complexity_factor = ?, urgency_factor = ?, total = ?, notes = ?, updated_at = NOW()
      WHERE id = ?
    `;

    const values = [labour_cost, materials_cost, travel_cost, experience_factor, complexity_factor, urgency_factor, total, notes, id];
    await pool.query(query, values);

    return await this.findById(id);
  }

  static async approve(id) {
    const query = 'UPDATE quotations SET status = \'approved\', updated_at = NOW() WHERE id = ?';
    await pool.query(query, [id]);
    return await this.findById(id);
  }

  static async reject(id, reason = null) {
    const query = reason 
      ? 'UPDATE quotations SET status = \'rejected\', notes = CONCAT(COALESCE(notes, \'\'), \'\n\nRejection Reason: \', ?), updated_at = NOW() WHERE id = ?'
      : 'UPDATE quotations SET status = \'rejected\', updated_at = NOW() WHERE id = ?';
    
    await pool.query(query, reason ? [reason, id] : [id]);
    return await this.findById(id);
  }

  static async getByStatus(status) {
    const query = 'SELECT * FROM quotations WHERE status = ? ORDER BY created_at DESC';
    const [result] = await pool.query(query, [status]);
    return result;
  }

  static async delete(id) {
    const query = 'DELETE FROM quotations WHERE id = ?';
    await pool.query(query, [id]);
  }
}

module.exports = Quotation;