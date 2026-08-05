const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

class User {
  static async create(userData) {
    const { username, email, password, role } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);
    const id = uuidv4();
    
    // Auto-activate accounts for initial deployment
    const status = 'active';
    
    const query = `
      INSERT INTO users (id, username, email, password_hash, role, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
    `;
    
    const values = [id, username, email, hashedPassword, role, status];
    await pool.query(query, values);
    
    return await this.findById(id);
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async updatePassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const query = 'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2';
    await pool.query(query, [hashedPassword, id]);
  }

  static async updateStatus(id, status) {
    const query = 'UPDATE users SET status = $1, updated_at = NOW() WHERE id = $2';
    await pool.query(query, [status, id]);
  }

  static async updateRole(id, role) {
    const query = 'UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2';
    await pool.query(query, [role, id]);
  }

  static async updateLastLogin(id) {
    const query = 'UPDATE users SET last_login = NOW() WHERE id = $1';
    await pool.query(query, [id]);
  }

  static async getAll(limit = 50, offset = 0) {
    const query = 'SELECT id, username, email, role, status, created_at, last_login FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2';
    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  }

  static async delete(id) {
    const query = 'DELETE FROM users WHERE id = $1';
    await pool.query(query, [id]);
  }

  static async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }
}

module.exports = User;