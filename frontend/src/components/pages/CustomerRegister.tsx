import React, { useState } from 'react';
import { Box, Container, TextField, Button, Typography, Paper, Alert, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const CustomerRegister: React.FC = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    whatsapp: '',
    email: '',
    password: '',
    address: '',
    ghana_post_gps: '',
    customer_type: '',
    referral_source: '',
  });
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Register user with basic info
      const registerData = {
        username: formData.full_name.replace(/\s+/g, '_').toLowerCase(),
        email: formData.email,
        password: formData.password,
        role: 'customer',
      };

      const authResponse = await api.post('/api/auth/register', registerData);
      
      // Store auth data
      localStorage.setItem('token', authResponse.data.data.token);
      localStorage.setItem('user', JSON.stringify(authResponse.data.data.user));

      // Create customer profile with additional fields
      await api.post('/api/customers', {
        user_id: authResponse.data.data.user.id,
        phone: formData.phone,
        address: formData.address,
        preferences: {
          whatsapp: formData.whatsapp,
          ghana_post_gps: formData.ghana_post_gps,
          customer_type: formData.customer_type,
          referral_source: formData.referral_source,
        },
      });

      // Redirect to customer dashboard
      navigate('/customer/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            AJUMAPLUS CRM
          </Typography>
          <Typography variant="h6" align="center" color="textSecondary" gutterBottom>
            Customer Registration
          </Typography>
          <Typography variant="body2" align="center" color="textSecondary" sx={{ mb: 2 }}>
            Register as a customer to receive updates and offers across Ghana
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
              id="full_name"
              label="Full Name"
              name="full_name"
              autoComplete="name"
              autoFocus
              value={formData.full_name}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="phone"
              label="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="whatsapp"
              label="WhatsApp Number"
              name="whatsapp"
              value={formData.whatsapp}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              fullWidth
              id="ghana_post_gps"
              label="GhanaPost GPS"
              name="ghana_post_gps"
              value={formData.ghana_post_gps}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="address"
              label="Address"
              name="address"
              multiline
              rows={2}
              value={formData.address}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              fullWidth
              id="customer_type"
              label="Customer Type"
              name="customer_type"
              value={formData.customer_type}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              fullWidth
              id="referral_source"
              label="Referral Source"
              name="referral_source"
              value={formData.referral_source}
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
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Register as Customer'}
            </Button>
          </Box>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2">
              Already have an account?{' '}
              <Button onClick={() => navigate('/customer/login')} size="small">
                Login
              </Button>
            </Typography>
          </Box>

          <Box sx={{ mt: 3, textAlign: 'center', pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="body2" color="textSecondary">
              Are you a Service Provider?{' '}
              <Button onClick={() => navigate('/isp/register')} size="small">
                ISP Register
              </Button>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default CustomerRegister;