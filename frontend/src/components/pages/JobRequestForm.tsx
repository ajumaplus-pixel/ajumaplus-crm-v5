import React, { useState } from 'react';
import { Box, Container, Typography, TextField, Button, MenuItem, CircularProgress, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const JobRequestForm: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    category: '',
    description: '',
    priority: 'normal',
    address: '',
    gps_coords: '',
    scheduled_date: '',
    notes: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      let customerId = null;
      
      // Get customer ID if logged in
      if (user && user.role === 'customer') {
        try {
          const customerResponse = await api.get('/api/customers/me');
          customerId = customerResponse.data.data.id;
        } catch (err) {
          console.error('Failed to get customer:', err);
        }
      }

      // Add default GPS coordinates for Ghana if not set
      const jobData = {
        ...formData,
        gps_coords: formData.gps_coords || JSON.stringify({ lat: 7.9465, lng: -1.0232 })
      };

      const response = await api.post('/api/jobs', {
        ...jobData,
        customer_id: customerId
      });

      // If user is logged in and quotes were auto-generated, redirect to quotes page
      if (user && response.data.data.auto_generated_quotes) {
        navigate(`/customer/jobs/${response.data.data.id}/quotes`);
      } else if (!user) {
        // Guest - redirect to registration/login with job info
        navigate('/login', { state: { jobCreated: true, jobId: response.data.data.id } });
      } else {
        // Logged in but no quotes generated (shouldn't happen)
        navigate('/customer/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create job request');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Submit Service Request
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
          Submit your request and we'll provide you with multiple pricing options to choose from.
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Service Category"
            select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            sx={{ mb: 2 }}
            required
          >
            <MenuItem value="electrical">Electrical</MenuItem>
            <MenuItem value="plumbing">Plumbing</MenuItem>
            <MenuItem value="carpentry">Carpentry</MenuItem>
            <MenuItem value="solar">Solar Installation</MenuItem>
            <MenuItem value="general">General Services</MenuItem>
          </TextField>

          <TextField
            fullWidth
            label="Description"
            multiline
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            sx={{ mb: 2 }}
            required
          />

          <TextField
            fullWidth
            label="Priority"
            select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            sx={{ mb: 2 }}
          >
            <MenuItem value="urgent">Urgent</MenuItem>
            <MenuItem value="high">High</MenuItem>
            <MenuItem value="normal">Normal</MenuItem>
            <MenuItem value="low">Low</MenuItem>
          </TextField>

          <TextField
            fullWidth
            label="Address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            sx={{ mb: 2 }}
            required
          />

          <TextField
            fullWidth
            label="Scheduled Date"
            type="datetime-local"
            value={formData.scheduled_date}
            onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
            sx={{ mb: 2 }}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            fullWidth
            label="Additional Notes"
            multiline
            rows={2}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            sx={{ mb: 2 }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Submit Request'}
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default JobRequestForm;