const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Notification {
  static async create(notificationData) {
    const { user_id, type, title, message, data } = notificationData;
    const id = uuidv4();
    
    const query = `
      INSERT INTO notifications (id, user_id, type, title, message, data, is_read, created_at)
      VALUES (?, ?, ?, ?, ?, ?, false, NOW())
    `;
    
    const values = [id, user_id, type, title, message, JSON.stringify(data || {})];
    await pool.query(query, values);
    
    return await this.findById(id);
  }

  static async findById(id) {
    const query = 'SELECT * FROM notifications WHERE id = ?';
    const result = await pool.query(query, [id]);
    return result[0];
  }

  static async findByUserId(user_id, limit = 50) {
    const query = 'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ?';
    const result = await pool.query(query, [user_id, limit]);
    return result;
  }

  static async getUnreadCount(user_id) {
    const query = 'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = false';
    const result = await pool.query(query, [user_id]);
    return result[0].count;
  }

  static async markAsRead(id) {
    const query = 'UPDATE notifications SET is_read = true WHERE id = ?';
    await pool.query(query, [id]);
    return await this.findById(id);
  }

  static async markAllAsRead(user_id) {
    const query = 'UPDATE notifications SET is_read = true WHERE user_id = ? AND is_read = false';
    await pool.query(query, [user_id]);
    return await this.findByUserId(user_id);
  }

  static async delete(id) {
    const query = 'DELETE FROM notifications WHERE id = ?';
    await pool.query(query, [id]);
  }
}

module.exports = Notification;