const User = require('../models/User');
const { generateToken, generateRefreshToken } = require('../config/auth');

class AuthController {
  async register(req, res) {
    try {
      const { username, email, password, role } = req.body;
      
      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          message: 'User with this email already exists' 
        });
      }

      // Create new user
      const user = await User.create({ username, email, password, role });
      
      // Generate tokens
      const token = generateToken({ id: user.id, role: user.role });
      const refreshToken = generateRefreshToken({ id: user.id, role: user.role });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            status: user.status
          },
          token,
          refreshToken
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Registration failed', 
        error: error.message 
      });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      
      console.log('Login attempt for email:', email);
      
      // Find user by email
      const user = await User.findByEmail(email);
      if (!user) {
        console.log('User not found for email:', email);
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid credentials' 
        });
      }

      console.log('User found:', user.id, user.email, user.role, user.status);

      // Check password
      const isPasswordValid = await User.comparePassword(password, user.password_hash);
      if (!isPasswordValid) {
        console.log('Invalid password for user:', email);
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid credentials' 
        });
      }

      // Check account status
      if (user.status !== 'active') {
        console.log('Account not active for user:', email, 'status:', user.status);
        return res.status(403).json({ 
          success: false, 
          message: 'Account is not active' 
        });
      }

      console.log('Login successful for user:', email);

      // Update last login
      await User.updateLastLogin(user.id);

      // Generate tokens
      const token = generateToken({ id: user.id, role: user.role });
      const refreshToken = generateRefreshToken({ id: user.id, role: user.role });

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            status: user.status
          },
          token,
          refreshToken
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Login failed', 
        error: error.message 
      });
    }
  }

  async logout(req, res) {
    try {
      // In a real implementation, you would invalidate the token
      // For now, we'll just return success
      res.status(200).json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Logout failed', 
        error: error.message 
      });
    }
  }

  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;
      
      // Verify refresh token
      const { verifyToken } = require('../config/auth');
      const decoded = verifyToken(refreshToken);
      
      // Generate new access token
      const newToken = generateToken({ id: decoded.id, role: decoded.role });

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          token: newToken
        }
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(401).json({ 
        success: false, 
        message: 'Invalid refresh token' 
      });
    }
  }

  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }

      // In a real implementation, send email with reset link
      // For now, we'll just return success
      res.status(200).json({
        success: true,
        message: 'Password reset email sent'
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to send reset email', 
        error: error.message 
      });
    }
  }

  async resetPassword(req, res) {
    try {
      const { email, newPassword } = req.body;
      
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }

      await User.updatePassword(user.id, newPassword);

      res.status(200).json({
        success: true,
        message: 'Password reset successful'
      });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to reset password', 
        error: error.message 
      });
    }
  }
}

module.exports = new AuthController();