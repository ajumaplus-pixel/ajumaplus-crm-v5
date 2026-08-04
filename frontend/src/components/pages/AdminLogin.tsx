import React, { useState, useEffect } from 'react';
import { Box, Container, TextField, Button, Typography, Paper, Alert, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoginCredentials } from '../../types';

const AdminLogin: React.FC = () => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, user } = useAuth();
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
      console.log('Attempting login with:', credentials);
      await login(credentials);
      console.log('Login successful');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Redirect based on user role after login
  useEffect(() => {
    if (user) {
      console.log('User detected, redirecting based on role:', user.role);
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'staff') {
        navigate('/staff/dashboard');
      } else {
        // Fallback to main dashboard
        navigate('/dashboard');
      }
    }
  }, [user, navigate]);

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Button onClick={() => navigate('/admin')} sx={{ mb: 2 }}>
          ← Back to Admin Portal
        </Button>
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            AJUMAPLUS CRM
          </Typography>
          <Typography variant="h6" align="center" color="textSecondary" gutterBottom>
            Admin & Staff Login
          </Typography>
          <Typography variant="body2" align="center" color="textSecondary" sx={{ mb: 2 }}>
            Test credentials: admin@example.com / admin123
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
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
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>
          </Box>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="textSecondary">
              Restricted access for administrators and staff only
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default AdminLogin;