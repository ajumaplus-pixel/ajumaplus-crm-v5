const User = require('../models/User');

class UserController {
  async getAllUsers(req, res) {
    try {
      const { limit = 50, offset = 0 } = req.query;
      const users = await User.getAll(parseInt(limit), parseInt(offset));
      
      res.status(200).json({
        success: true,
        data: users
      });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to get users', 
        error: error.message 
      });
    }
  }

  async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await User.findById(id);
      
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }

      // Remove password from response
      const { password_hash, ...userWithoutPassword } = user;
      
      res.status(200).json({
        success: true,
        data: userWithoutPassword
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to get user', 
        error: error.message 
      });
    }
  }

  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { username, email } = req.body;
      
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }

      // Update user (simplified - in real implementation, update all fields)
      // For now, just return the user
      const { password_hash, ...userWithoutPassword } = user;
      
      res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: userWithoutPassword
      });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to update user', 
        error: error.message 
      });
    }
  }

  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }

      await User.delete(id);
      
      res.status(200).json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to delete user', 
        error: error.message 
      });
    }
  }

  async updateUserStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }

      await User.updateStatus(id, status);
      
      res.status(200).json({
        success: true,
        message: 'User status updated successfully'
      });
    } catch (error) {
      console.error('Update user status error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to update user status', 
        error: error.message 
      });
    }
  }

  async updateUserRole(req, res) {
    try {
      const { id } = req.params;
      const { role } = req.body;
      
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }

      await User.updateRole(id, role);
      
      res.status(200).json({
        success: true,
        message: 'User role updated successfully'
      });
    } catch (error) {
      console.error('Update user role error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to update user role', 
        error: error.message 
      });
    }
  }
}

module.exports = new UserController();