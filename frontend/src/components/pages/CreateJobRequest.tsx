import React, { useState } from 'react';
import { Box, Container, TextField, Button, Typography, Paper, Alert, CircularProgress, MenuItem } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { jobService } from '../../services/jobService';

const CreateJobRequest: React.FC = () => {
  const [formData, setFormData] = useState({
    customer_name: '',
    phone: '',
    email: '',
    address: '',
    service_category: '',
    description: '',
    priority: 'normal' as 'normal' | 'low' | 'high' | 'urgent',
    preferred_date: '',
  });
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
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
      // Convert priority to match backend values
      const priorityMap: Record<string, 'normal' | 'low' | 'high' | 'urgent'> = {
        'normal': 'normal',
        'high': 'high',
        'urgent': 'urgent',
      };
      
      // Submit job request through the job service
      const jobData = {
        category: formData.service_category,
        description: formData.description,
        priority: priorityMap[formData.priority] || 'normal',
        address: formData.address,
        customer_id: user?.id || '', // This would normally come from customer profile
        notes: `Submitted by ${formData.customer_name} (${formData.email}) - Phone: ${formData.phone} - Preferred Date: ${formData.preferred_date}`,
      };
      
      await jobService.createJob(jobData);
      setSuccess(true);
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/customer/dashboard');
      }, 2000);
      
    } catch (err: any) {
      console.error('Job request error:', err);
      setError(err.response?.data?.message || 'Failed to submit request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Button onClick={() => navigate('/customer/dashboard')} sx={{ mb: 2 }}>
          ← Back to Dashboard
        </Button>
        <Typography variant="h4" gutterBottom>
          Create Service Request
        </Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Submit a service request. Our team will review and contact you.
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 4 }}>
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Your service request has been submitted successfully! Redirecting to dashboard...
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Typography variant="h6" gutterBottom>
            Service Details
          </Typography>

          <TextField
            margin="normal"
            required
            fullWidth
            id="customer_name"
            label="Customer Name"
            name="customer_name"
            value={formData.customer_name}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
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
            id="address"
            label="Service Address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            multiline
            rows={2}
            helperText="Enter the full address where service is needed"
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="preferred_date"
            label="Preferred Date"
            name="preferred_date"
            type="date"
            value={formData.preferred_date}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            select
            name="service_category"
            label="Service Category"
            value={formData.service_category}
            onChange={handleChange}
          >
            <MenuItem value="electrical">Electrical & Electrical Works</MenuItem>
            <MenuItem value="plumbing">Plumbing & Water Systems</MenuItem>
            <MenuItem value="carpentry">Carpentry & Furniture</MenuItem>
            <MenuItem value="painting">Painting & Decoration</MenuItem>
            <MenuItem value="cleaning">Cleaning & Sanitation</MenuItem>
            <MenuItem value="air_conditioning">Air Conditioning & Cooling</MenuItem>
            <MenuItem value="masonry">Masonry & Construction</MenuItem>
            <MenuItem value="roofing">Roofing & Sheet Metal</MenuItem>
            <MenuItem value="aluminium">Aluminium & Fabrication</MenuItem>
            <MenuItem value="general_repairs">General Home Repairs</MenuItem>
            <MenuItem value="generator">Generator Installation & Repair</MenuItem>
            <MenuItem value="solar">Solar System Installation</MenuItem>
            <MenuItem value="security">Security Systems Installation</MenuItem>
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
            <MenuItem value="normal">Normal</MenuItem>
            <MenuItem value="high">High</MenuItem>
            <MenuItem value="urgent">Emergency</MenuItem>
          </TextField>
          <TextField
            margin="normal"
            required
            fullWidth
            name="description"
            label="Description"
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
        </Box>
      </Paper>
    </Container>
  );
};

export default CreateJobRequest;