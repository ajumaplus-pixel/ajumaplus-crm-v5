import React, { useState, useEffect } from 'react';
import { Box, Container, TextField, Button, Typography, Paper, Alert, CircularProgress } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoginCredentials } from '../../types';
import api from '../../services/api';

const Login: React.FC = () => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if user was redirected from job creation
    const state = location.state as { jobCreated: boolean; jobId: string };
    if (state?.jobCreated && state?.jobId) {
      // User needs to link job after login
    }
  }, [location.state]);

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
      
      // Get the logged-in user from localStorage (updated by login)
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Check if we need to link a job to the customer
      const state = location.state as { jobCreated: boolean; jobId: string };
      if (state?.jobCreated && state?.jobId && currentUser?.role === 'customer') {
        try {
          const customerResponse = await api.get('/api/customers/me');
          const customerId = customerResponse.data.data.id;
          
          await api.post(`/api/jobs/${state.jobId}/link-customer`, { customer_id: customerId });
          
          // Redirect to quotes page
          navigate(`/customer/jobs/${state.jobId}/quotes`);
          return;
        } catch (linkError) {
          console.error('Failed to link job:', linkError);
          // Continue with normal redirect if linking fails
        }
      }
      
      // Redirect based on user role
      switch (currentUser?.role) {
        case 'admin':
          navigate('/admin/dashboard');
          break;
        case 'staff':
          navigate('/staff/dashboard');
          break;
        case 'customer':
          navigate('/customer/dashboard');
          break;
        case 'isp':
          navigate('/isp/dashboard');
          break;
        default:
          navigate('/dashboard');
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
        <Button onClick={() => navigate('/')} sx={{ mb: 2 }}>
          ← Back to Home
        </Button>
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom sx={{ fontWeight: 700, color: '#FFD400' }}>
            AJUMAPLUS
          </Typography>
          <Typography variant="h6" align="center" color="textSecondary" gutterBottom>
            Sign In
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
            <Typography variant="body2">
              Don't have an account?{' '}
              <Button onClick={() => navigate('/register')} size="small">
                Register
              </Button>
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', mt: 2 }}>
              <Button onClick={() => navigate('/admin-staff/login')} size="small" sx={{ color: 'text.secondary' }}>
                Admin/Staff Login
              </Button>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;