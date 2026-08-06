const NotificationService = require('../services/notificationService');

class NotificationController {
  async getUserNotifications(req, res) {
    try {
      const { limit = 50 } = req.query;
      const notifications = await NotificationService.findByUserId(req.user.id, parseInt(limit));
      
      // Transform is_read to read for frontend compatibility
      const transformedNotifications = notifications.map(notif => ({
        ...notif,
        read: notif.is_read
      }));
      
      res.json({ 
        success: true, 
        data: transformedNotifications 
      });
    } catch (error) {
      console.error('Get user notifications error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to get notifications', 
        error: error.message 
      });
    }
  }

  async getUnreadCount(req, res) {
    try {
      const count = await NotificationService.getUnreadCount(req.user.id);
      
      res.json({ 
        success: true, 
        data: { count } 
      });
    } catch (error) {
      console.error('Get unread count error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to get unread count', 
        error: error.message 
      });
    }
  }

  async markAsRead(req, res) {
    try {
      const { id } = req.params;
      const notification = await NotificationService.markAsRead(id);
      
      if (!notification) {
        return res.status(404).json({ 
          success: false, 
          message: 'Notification not found' 
        });
      }
      
      // Transform is_read to read for frontend compatibility
      const transformedNotification = {
        ...notification,
        read: notification.is_read
      };
      
      res.json({ 
        success: true, 
        message: 'Notification marked as read',
        data: transformedNotification 
      });
    } catch (error) {
      console.error('Mark notification as read error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to mark notification as read', 
        error: error.message 
      });
    }
  }

  async markAllAsRead(req, res) {
    try {
      const notifications = await NotificationService.markAllAsRead(req.user.id);
      
      // Transform is_read to read for frontend compatibility
      const transformedNotifications = notifications.map(notif => ({
        ...notif,
        read: notif.is_read
      }));
      
      res.json({ 
        success: true, 
        message: 'All notifications marked as read',
        data: transformedNotifications 
      });
    } catch (error) {
      console.error('Mark all notifications as read error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to mark all notifications as read', 
        error: error.message 
      });
    }
  }

  async deleteNotification(req, res) {
    try {
      const { id } = req.params;
      await NotificationService.delete(id);
      
      res.json({ 
        success: true, 
        message: 'Notification deleted successfully' 
      });
    } catch (error) {
      console.error('Delete notification error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to delete notification', 
        error: error.message 
      });
    }
  }
}

module.exports = new NotificationController();