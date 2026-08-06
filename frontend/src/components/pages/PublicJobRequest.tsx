import React, { useState } from 'react';
import { Box, Container, TextField, Button, Typography, Paper, Alert, CircularProgress, MenuItem } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { guestService } from '../../services/guestService';
import { GhanaValidation } from '../../utils/ghanaValidation';

const PublicJobRequest: React.FC = () => {
  const [formData, setFormData] = useState({
    customer_name: '',
    phone: '',
    email: '',
    address: '',
    category: '',
    description: '',
    priority: 'normal',
  });
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);
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
      // Validate phone number using Ghana validation
      const phoneValidation = GhanaValidation.validatePhoneNumber(formData.phone);
      if (!phoneValidation.isValid) {
        setError(phoneValidation.error || 'Invalid Ghana phone number');
        setIsLoading(false);
        return;
      }

      // Submit guest request through the guest service
      const result = await guestService.submitGuestRequest({
        ...formData,
        phone: phoneValidation.formatted || formData.phone,
      });
      
      if (result.success) {
        setSuccess(true);
        
        // Reset form after 3 seconds
        setTimeout(() => {
          setSuccess(false);
          setFormData({
            customer_name: '',
            phone: '',
            email: '',
            address: '',
            category: '',
            description: '',
            priority: 'normal',
          });
        }, 3000);
      }
      
    } catch (err: any) {
      console.error('Guest request error:', err);
      setError(err.response?.data?.message || 'Failed to submit request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Button onClick={() => navigate('/')} sx={{ mb: 2 }}>
          ← Back to Home
        </Button>
        <Typography variant="h4" gutterBottom>
          Request Service (No Login Required)
        </Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Submit a service request as a guest. You can create an account later to track your requests.
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 4 }}>
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Your service request has been submitted successfully! Our team will contact you shortly.
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Typography variant="h6" gutterBottom>
            Contact Information
          </Typography>
          
          <TextField
            margin="normal"
            required
            fullWidth
            name="customer_name"
            label="Full Name"
            value={formData.customer_name}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="phone"
            label="Phone Number"
            value={formData.phone}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="email"
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="address"
            label="Service Address"
            value={formData.address}
            onChange={handleChange}
            multiline
            rows={2}
          />

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Service Details
          </Typography>

          <TextField
            margin="normal"
            required
            fullWidth
            select
            name="category"
            label="Service Category"
            value={formData.category}
            onChange={handleChange}
          >
            <MenuItem value="electrical">Electrical</MenuItem>
            <MenuItem value="plumbing">Plumbing</MenuItem>
            <MenuItem value="carpentry">Carpentry</MenuItem>
            <MenuItem value="painting">Painting</MenuItem>
            <MenuItem value="cleaning">Cleaning</MenuItem>
            <MenuItem value="air_conditioning">Air Conditioning</MenuItem>
            <MenuItem value="masonry">Masonry</MenuItem>
            <MenuItem value="roofing">Roofing</MenuItem>
            <MenuItem value="aluminium">Aluminium Works</MenuItem>
            <MenuItem value="general_repairs">General Repairs</MenuItem>
          </TextField>

          <TextField
            margin="normal"
            required
            fullWidth
            select
            name="priority"
            label="Priority"
            value={formData.priority}
            onChange={handleChange}
          >
            <MenuItem value="low">Low</MenuItem>
            <MenuItem value="normal">Normal</MenuItem>
            <MenuItem value="high">High</MenuItem>
            <MenuItem value="urgent">Urgent</MenuItem>
          </TextField>

          <TextField
            margin="normal"
            required
            fullWidth
            name="description"
            label="Service Description"
            value={formData.description}
            onChange={handleChange}
            multiline
            rows={4}
            helperText="Please describe the service you need in detail"
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isLoading}
            size="large"
          >
            {isLoading ? <CircularProgress size={24} /> : 'Submit Request'}
          </Button>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="textSecondary">
              Want to track your requests?{' '}
              <Button onClick={() => navigate('/customer/register')} size="small">
                Create an Account
              </Button>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default PublicJobRequest;