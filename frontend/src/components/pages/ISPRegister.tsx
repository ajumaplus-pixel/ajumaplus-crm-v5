import React, { useState } from 'react';
import { Box, Container, TextField, Button, Typography, Paper, Alert, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import LocationPicker from '../maps/LocationPicker';

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
    gps_coords: '',
    skills: '',
    certification: '',
    available_hours: '',
    payment_details: '',
  });
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
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
      await api.post('/api/isps', {
        user_id: authResponse.data.data.user.id,
        phone: formData.phone,
        trade: formData.trade_profession,
        location: formData.location,
        gps_coords: formData.gps_coords,
        skills: formData.skills,
        certification: formData.certification,
        ghana_card_id: formData.ghana_card_id,
        available_hours: formData.available_hours,
        payment_details: formData.payment_details,
        whatsapp: formData.whatsapp,
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
        <Paper elevation={0} sx={{ p: 5, width: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', borderRadius: 3 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography component="h1" variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#FFD400' }}>
              AJUMAPLUS
            </Typography>
            <Typography variant="h6" color="textSecondary" gutterBottom sx={{ fontWeight: 600 }}>
              Service Provider Registration
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 2, maxWidth: 400, mx: 'auto' }}>
              Join our network of trusted service providers across Ghana
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
            
            <Button
              type="button"
              variant="outlined"
              fullWidth
              onClick={() => setShowLocationPicker(!showLocationPicker)}
              sx={{ mb: 2 }}
            >
              {showLocationPicker ? 'Hide Location Picker' : '📍 Select Location on Map'}
            </Button>
            
            {showLocationPicker && (
              <Box sx={{ mb: 2 }}>
                <LocationPicker
                  onLocationSelect={(location) => {
                    setFormData({
                      ...formData,
                      gps_coords: JSON.stringify(location)
                    });
                  }}
                  height="300px"
                />
              </Box>
            )}
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
              sx={{ 
                mt: 3, 
                mb: 3, 
                py: 1.5, 
                fontSize: '1rem', 
                fontWeight: 600,
                bgcolor: '#006B3F',
                color: '#FFF',
                '&:hover': { bgcolor: '#004D2C' }
              }}
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