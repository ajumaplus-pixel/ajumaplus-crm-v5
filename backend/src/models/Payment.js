const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Payment {
  static async create(paymentData) {
    const { quotation_id, amount, method, reference } = paymentData;
    const id = uuidv4();
    const payment_number = `PAY${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 100)}`;
    
    const query = `
      INSERT INTO payments (id, payment_number, quotation_id, amount, method, status, reference, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, 'pending', $6, NOW(), NOW())
    `;

    const values = [id, payment_number, quotation_id, amount, method, reference];
    await pool.query(query, values);

    return await this.findById(id);
  }

  static async findById(id) {
    const query = 'SELECT * FROM payments WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findByQuotationId(quotationId) {
    const query = 'SELECT * FROM payments WHERE quotation_id = $1 ORDER BY created_at DESC';
    const result = await pool.query(query, [quotationId]);
    return result.rows;
  }

  static async getAll(limit = 50, offset = 0) {
    const query = 'SELECT * FROM payments ORDER BY created_at DESC LIMIT $1 OFFSET $2';
    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  }

  static async updateStatus(id, status) {
    const paid_at = status === 'completed' ? 'NOW()' : 'paid_at';
    const query = `UPDATE payments SET status = $1, paid_at = ${paid_at}, updated_at = NOW() WHERE id = $2`;
    await pool.query(query, [status, id]);
    return await this.findById(id);
  }

  static async getByStatus(status) {
    const query = 'SELECT * FROM payments WHERE status = $1 ORDER BY created_at DESC';
    const result = await pool.query(query, [status]);
    return result.rows;
  }

  static async delete(id) {
    const query = 'DELETE FROM payments WHERE id = $1';
    await pool.query(query, [id]);
  }
}

module.exports = Payment;