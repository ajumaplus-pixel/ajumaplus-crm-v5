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
      VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    
    const values = [id, username, email, hashedPassword, role, status];
    await pool.query(query, values);
    
    return await this.findById(id);
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = ?';
    const [rows] = await pool.query(query, [email]);
    return rows[0];
  }

  static async findById(id) {
    const query = 'SELECT * FROM users WHERE id = ?';
    const [rows] = await pool.query(query, [id]);
    return rows[0];
  }

  static async updatePassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const query = 'UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?';
    await pool.query(query, [hashedPassword, id]);
  }

  static async updateStatus(id, status) {
    const query = 'UPDATE users SET status = ?, updated_at = NOW() WHERE id = ?';
    await pool.query(query, [status, id]);
  }

  static async updateRole(id, role) {
    const query = 'UPDATE users SET role = ?, updated_at = NOW() WHERE id = ?';
    await pool.query(query, [role, id]);
  }

  static async updateLastLogin(id) {
    const query = 'UPDATE users SET last_login = NOW() WHERE id = ?';
    await pool.query(query, [id]);
  }

  static async getAll(limit = 50, offset = 0) {
    const query = 'SELECT id, username, email, role, status, created_at, last_login FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?';
    const [rows] = await pool.query(query, [limit, offset]);
    return rows;
  }

  static async delete(id) {
    const query = 'DELETE FROM users WHERE id = ?';
    await pool.query(query, [id]);
  }

  static async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }
}

module.exports = User;