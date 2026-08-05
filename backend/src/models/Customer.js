const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Customer {
  static async create(customerData) {
    const { user_id, phone, address, gps_coords, preferences } = customerData;
    const id = uuidv4();
    
    const query = `
      INSERT INTO customers (id, user_id, phone, address, gps_coords, preferences, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
    `;

    const values = [id, user_id, phone, address, gps_coords, JSON.stringify(preferences || {})];
    await pool.query(query, values);

    return await this.findById(id);
  }

  static async findById(id) {
    const query = 'SELECT * FROM customers WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findByUserId(user_id) {
    const query = 'SELECT * FROM customers WHERE user_id = $1';
    const result = await pool.query(query, [user_id]);
    return result.rows[0];
  }

  static async update(id, updateData) {
    const { phone, address, gps_coords, preferences } = updateData;
    const query = `
      UPDATE customers
      SET phone = $1, address = $2, gps_coords = $3, preferences = $4, updated_at = NOW()
      WHERE id = $5
    `;

    const values = [phone, address, gps_coords, JSON.stringify(preferences || {}), id];
    await pool.query(query, values);

    return await this.findById(id);
  }

  static async getJobs(customerId) {
    const query = 'SELECT * FROM jobs WHERE customer_id = $1 ORDER BY created_at DESC';
    const result = await pool.query(query, [customerId]);
    return result.rows;
  }

  static async addAddress(customerId, addressData) {
    const { address, gps_coords } = addressData;
    const query = `
      UPDATE customers
      SET address = $1, gps_coords = $2, updated_at = NOW()
      WHERE id = $3
    `;

    await pool.query(query, [address, gps_coords, customerId]);
    return await this.findById(customerId);
  }
}

module.exports = Customer;