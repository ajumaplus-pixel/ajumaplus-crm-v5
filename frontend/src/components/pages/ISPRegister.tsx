import React, { useState } from 'react';
import { Box, Container, TextField, Button, Typography, Paper, Alert, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const ISPRegister: React.FC = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    trade_profession: '',
    phone: '',
    whatsapp: '',
    email: '',
    password: '',
    ghana_card_id: '',
    location: '',
    skills: '',
    certification: '',
    available_hours: '',
    payment_details: '',
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
        role: 'isp',
      };

      const authResponse = await api.post('/api/auth/register', registerData);
      
      // Store auth data
      localStorage.setItem('token', authResponse.data.data.token);
      localStorage.setItem('user', JSON.stringify(authResponse.data.data.user));

      // Create ISP profile with additional fields
      await api.post('/api/customers', {
        user_id: authResponse.data.data.user.id,
        phone: formData.phone,
        address: formData.location,
        preferences: {
          trade_profession: formData.trade_profession,
          whatsapp: formData.whatsapp,
          ghana_card_id: formData.ghana_card_id,
          skills: formData.skills,
          certification: formData.certification,
          available_hours: formData.available_hours,
          payment_details: formData.payment_details,
        },
      });

      // Redirect to ISP dashboard
      navigate('/isp/dashboard');
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
            Service Provider Registration
          </Typography>
          <Typography variant="body2" align="center" color="textSecondary" sx={{ mb: 2 }}>
            Join our network of trusted service providers across Ghana
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
              id="trade_profession"
              label="Trade/Profession"
              name="trade_profession"
              value={formData.trade_profession}
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
              required
              fullWidth
              id="ghana_card_id"
              label="Ghana Card ID"
              name="ghana_card_id"
              value={formData.ghana_card_id}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="location"
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="skills"
              label="Skills"
              name="skills"
              multiline
              rows={2}
              value={formData.skills}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              fullWidth
              id="certification"
              label="Certification"
              name="certification"
              value={formData.certification}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              fullWidth
              id="available_hours"
              label="Available Hours"
              name="available_hours"
              value={formData.available_hours}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              fullWidth
              id="payment_details"
              label="Payment Details"
              name="payment_details"
              multiline
              rows={2}
              value={formData.payment_details}
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
              {isLoading ? <CircularProgress size={24} /> : 'Register as Service Provider'}
            </Button>
          </Box>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2">
              Already have an account?{' '}
              <Button onClick={() => navigate('/isp/login')} size="small">
                Login
              </Button>
            </Typography>
          </Box>

          <Box sx={{ mt: 3, textAlign: 'center', pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="body2" color="textSecondary">
              Are you a Customer?{' '}
              <Button onClick={() => navigate('/customer/register')} size="small">
                Customer Register
              </Button>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ISPRegister;