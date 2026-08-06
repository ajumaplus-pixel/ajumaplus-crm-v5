const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class NotificationService {
  static async create(notificationData) {
    const { user_id, type, title, message, data } = notificationData;
    const id = uuidv4();
    
    const query = `
      INSERT INTO notifications (id, user_id, type, title, message, data, is_read, created_at)
      VALUES (?, ?, ?, ?, ?, ?, false, NOW())
    `;
    
    const values = [id, user_id, type, title, message, JSON.stringify(data || {})];
    
    try {
      await pool.query(query, values);
      return await this.findById(id);
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  static async findById(id) {
    const query = 'SELECT * FROM notifications WHERE id = ?';
    try {
      const result = await pool.query(query, [id]);
      return result[0];
    } catch (error) {
      console.error('Error finding notification by id:', error);
      throw error;
    }
  }

  static async findByUserId(user_id, limit = 50) {
    const query = 'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ?';
    try {
      const result = await pool.query(query, [user_id, limit]);
      return result;
    } catch (error) {
      console.error('Error finding notifications by user:', error);
      throw error;
    }
  }

  static async getUnreadCount(user_id) {
    const query = 'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = false';
    try {
      const result = await pool.query(query, [user_id]);
      return result[0].count;
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  }

  static async markAsRead(id) {
    const query = 'UPDATE notifications SET is_read = true WHERE id = ?';
    try {
      await pool.query(query, [id]);
      return await this.findById(id);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  static async markAllAsRead(user_id) {
    const query = 'UPDATE notifications SET is_read = true WHERE user_id = ? AND is_read = false';
    try {
      await pool.query(query, [user_id]);
      return await this.findByUserId(user_id);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  static async delete(id) {
    const query = 'DELETE FROM notifications WHERE id = ?';
    try {
      await pool.query(query, [id]);
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }
}

module.exports = NotificationService;