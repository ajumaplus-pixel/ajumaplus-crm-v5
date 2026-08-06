import React, { useState } from 'react';
import { Box, Container, TextField, Button, Typography, Paper, Alert, CircularProgress, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoginCredentials } from '../../types';

const AdminStaffLogin: React.FC = () => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(credentials);
      
      // Get the logged-in user from localStorage
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Redirect based on user role (only admin/staff should use this login)
      switch (currentUser?.role) {
        case 'admin':
          navigate('/admin/dashboard');
          break;
        case 'staff':
          navigate('/staff/dashboard');
          break;
        default:
          setError('This login is for administrators and staff only. Please use the main login page.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%', bgcolor: '#FFFFFF' }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography component="h1" variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#FFD400' }}>
              AJUMAPLUS CRM
            </Typography>
            <Typography variant="h6" color="textSecondary" gutterBottom sx={{ fontWeight: 600 }}>
              Administrator & Staff Portal
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
              Access admin controls and staff management tools
            </Typography>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={credentials.email}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={credentials.password}
              onChange={handleChange}
              sx={{ mb: 3 }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ 
                mt: 2, 
                mb: 3, 
                py: 1.5, 
                fontSize: '1rem', 
                fontWeight: 600,
                bgcolor: '#FFD400',
                color: '#000',
                '&:hover': { bgcolor: '#E6BE00' }
              }}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>
          </Box>

          <Box sx={{ mt: 3, textAlign: 'center', pt: 3, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="body2" color="textSecondary">
              Are you a customer or ISP?{' '}
              <Button onClick={() => navigate('/login')} size="small" sx={{ fontWeight: 600 }}>
                Use Main Login
              </Button>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default AdminStaffLogin;