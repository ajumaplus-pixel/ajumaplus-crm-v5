import React, { useState } from 'react';
import { Box, Container, TextField, Button, Typography, Paper, Alert, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoginCredentials } from '../../types';

const CustomerLogin: React.FC = () => {
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
      // Redirect to customer dashboard
      navigate('/customer/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 6, mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Button onClick={() => navigate('/')} sx={{ mb: 2, color: 'text.secondary' }}>
          ← Back to Home
        </Button>
        <Paper elevation={0} sx={{ p: 5, width: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', borderRadius: 3 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography component="h1" variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#1A1A1A' }}>
              AJUMAPLUS CRM
            </Typography>
            <Typography variant="h6" align="center" color="textSecondary" gutterBottom sx={{ fontWeight: 500 }}>
              Customer Login
            </Typography>
            <Typography variant="body2" align="center" color="textSecondary" sx={{ mt: 2, maxWidth: 400, mx: 'auto' }}>
              Access Ghana's trusted service providers. Log in to request professional services across the country.
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

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2">
              New to AjumaPlus?{' '}
              <Button onClick={() => navigate('/customer/register')} size="small" sx={{ fontWeight: 600 }}>
                Create Account
              </Button>
            </Typography>
          </Box>

          <Box sx={{ mt: 4, textAlign: 'center', pt: 3, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="body2" color="textSecondary">
              Service Provider?{' '}
              <Button onClick={() => navigate('/isp/login')} size="small" sx={{ fontWeight: 600 }}>
                ISP Login
              </Button>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default CustomerLogin;