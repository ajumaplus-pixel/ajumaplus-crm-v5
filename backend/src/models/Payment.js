const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Payment {
  static async create(paymentData) {
    const { quotation_id, amount, method, reference } = paymentData;
    const id = uuidv4();
    const payment_number = `PAY${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 100)}`;
    
    const query = `
      INSERT INTO payments (id, payment_number, quotation_id, amount, method, status, reference, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 'pending', ?, NOW(), NOW())
    `;

    const values = [id, payment_number, quotation_id, amount, method, reference];
    await pool.query(query, values);

    return await this.findById(id);
  }

  static async findById(id) {
    const query = 'SELECT * FROM payments WHERE id = ?';
    const result = await pool.query(query, [id]);
    return result[0];
  }

  static async findByQuotationId(quotationId) {
    const query = 'SELECT * FROM payments WHERE quotation_id = ? ORDER BY created_at DESC';
    const result = await pool.query(query, [quotationId]);
    return result;
  }

  static async getAll(limit = 50, offset = 0) {
    const query = 'SELECT * FROM payments ORDER BY created_at DESC LIMIT ? OFFSET ?';
    const result = await pool.query(query, [limit, offset]);
    return result;
  }

  static async updateStatus(id, status) {
    const paid_at = status === 'completed' ? 'NOW()' : 'paid_at';
    const query = `UPDATE payments SET status = ?, paid_at = ${paid_at}, updated_at = NOW() WHERE id = ?`;
    await pool.query(query, [status, id]);
    return await this.findById(id);
  }

  static async getByStatus(status) {
    const query = 'SELECT * FROM payments WHERE status = ? ORDER BY created_at DESC';
    const result = await pool.query(query, [status]);
    return result;
  }

  static async delete(id) {
    const query = 'DELETE FROM payments WHERE id = ?';
    await pool.query(query, [id]);
  }
}

module.exports = Payment;