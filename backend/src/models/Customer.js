const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Customer {
  static async create(customerData) {
    const { user_id, phone, address, gps_coords, preferences } = customerData;
    const id = uuidv4();
    
    const query = `
      INSERT INTO customers (id, user_id, phone, address, gps_coords, preferences, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    const values = [id, user_id, phone, address, gps_coords, JSON.stringify(preferences || {})];
    await pool.query(query, values);

    return await this.findById(id);
  }

  static async findById(id) {
    const query = 'SELECT * FROM customers WHERE id = ?';
    const result = await pool.query(query, [id]);
    return result[0];
  }

  static async findByUserId(user_id) {
    const query = 'SELECT * FROM customers WHERE user_id = ?';
    const result = await pool.query(query, [user_id]);
    return result[0];
  }

  static async update(id, updateData) {
    const { phone, address, gps_coords, preferences } = updateData;
    const query = `
      UPDATE customers
      SET phone = ?, address = ?, gps_coords = ?, preferences = ?, updated_at = NOW()
      WHERE id = ?
    `;

    const values = [phone, address, gps_coords, JSON.stringify(preferences || {}), id];
    await pool.query(query, values);

    return await this.findById(id);
  }

  static async getJobs(customerId) {
    const query = 'SELECT * FROM jobs WHERE customer_id = ? ORDER BY created_at DESC';
    const result = await pool.query(query, [customerId]);
    return result;
  }

  static async addAddress(customerId, addressData) {
    const { address, gps_coords } = addressData;
    const query = `
      UPDATE customers
      SET address = ?, gps_coords = ?, updated_at = NOW()
      WHERE id = ?
    `;

    await pool.query(query, [address, gps_coords, customerId]);
    return await this.findById(customerId);
  }
}

module.exports = Customer;