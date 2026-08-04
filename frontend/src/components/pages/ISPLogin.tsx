import React, { useState } from 'react';
import { Box, Container, TextField, Button, Typography, Paper, Alert, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoginCredentials } from '../../types';

const ISPLogin: React.FC = () => {
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
      // Redirect to ISP dashboard
      navigate('/isp/dashboard');
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
        <Paper elevation={0} sx={{ p: 5, width: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', borderRadius: 3 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography component="h1" variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#1A1A1A' }}>
              AJUMAPLUS CRM
            </Typography>
            <Typography variant="h6" align="center" color="textSecondary" gutterBottom sx={{ fontWeight: 500 }}>
              Service Provider Login
            </Typography>
            <Typography variant="body2" align="center" color="textSecondary" sx={{ mt: 2, maxWidth: 400, mx: 'auto' }}>
              Grow your business with Ghana's leading service platform. Access thousands of customers nationwide.
            </Typography>
          </Box>
          
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
              sx={{ mt: 2, mb: 3, py: 1.5, fontSize: '1rem', fontWeight: 600, bgcolor: 'secondary.main', '&:hover': { bgcolor: 'secondary.dark' } }}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>
          </Box>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2">
              Don't have an account?{' '}
              <Button onClick={() => navigate('/isp/register')} size="small">
                Register as Service Provider
              </Button>
            </Typography>
          </Box>

          <Box sx={{ mt: 3, textAlign: 'center', pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="body2" color="textSecondary">
              Are you a Customer?{' '}
              <Button onClick={() => navigate('/customer/login')} size="small">
                Customer Login
              </Button>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ISPLogin;