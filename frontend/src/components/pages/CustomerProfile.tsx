import React, { useState } from 'react';
import { Box, Container, Typography, Card, CardContent, Button, TextField, Alert, CircularProgress, Divider, Grid, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { customerService } from '../../services/customerService';
import { Customer } from '../../types';
import { GhanaValidation } from '../../utils/ghanaValidation';
import {
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Save as SaveIcon,
} from '@mui/icons-material';

const CustomerProfile: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    phone: '',
    address: '',
    whatsapp: '',
    ghana_post_gps: '',
  });

  const loadCustomerProfile = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError('');
      
      const customerData = await customerService.getCustomerByUserId(user.id);
      setCustomer(customerData);
      
      // Format phone number for display
      let formattedPhone = customerData.phone || '';
      if (customerData.phone) {
        const phoneValidation = GhanaValidation.validatePhoneNumber(customerData.phone);
        if (phoneValidation.isValid && phoneValidation.formatted) {
          formattedPhone = phoneValidation.formatted;
        }
      }
      
      // Populate form with existing data
      setFormData({
        phone: formattedPhone,
        address: customerData.address || '',
        whatsapp: customerData.preferences?.whatsapp || '',
        ghana_post_gps: customerData.preferences?.ghana_post_gps || '',
      });
    } catch (err: any) {
      console.error('Failed to load customer profile:', err);
      setError(err.response?.data?.message || 'Failed to load profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCustomerProfile();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const validateForm = () => {
    // Validate phone number using Ghana validation
    const phoneValidation = GhanaValidation.validatePhoneNumber(formData.phone);
    if (!phoneValidation.isValid) {
      setError(phoneValidation.error || 'Invalid phone number');
      return false;
    }

    // Validate GhanaPost GPS format if provided
    if (formData.ghana_post_gps) {
      const gpsValidation = GhanaValidation.validateGhanaPostGPS(formData.ghana_post_gps);
      if (!gpsValidation.isValid) {
        setError(gpsValidation.error || 'Invalid GhanaPost GPS code');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customer || !validateForm()) return;

    try {
      setIsSaving(true);
      setError('');

      const updateData = {
        phone: formData.phone,
        address: formData.address,
        preferences: {
          ...customer.preferences,
          whatsapp: formData.whatsapp,
          ghana_post_gps: formData.ghana_post_gps,
        },
      };

      const updatedCustomer = await customerService.updateCustomer(customer.id, updateData);
      setCustomer(updatedCustomer);
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Button onClick={() => navigate('/customer/dashboard')} sx={{ mb: 2 }}>
          ← Back to Dashboard
        </Button>
        <Typography variant="h4" gutterBottom>
          My Profile
        </Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Manage your account information and preferences
        </Typography>
      </Box>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Profile updated successfully!
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* User Information */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <PersonIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  {user?.username}
                </Typography>
                <Chip
                  label={user?.role?.toUpperCase()}
                  color="primary"
                  size="small"
                />
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2">
                  {user?.email}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2">
                  {formData.phone || 'Not set'}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Account Status
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Status
                </Typography>
                <Chip
                  label={user?.status || 'active'}
                  color={user?.status === 'active' ? 'success' : 'warning'}
                  size="small"
                />
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="textSecondary">
                  Member Since
                </Typography>
                <Typography variant="body2">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Profile Form */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Contact Information
              </Typography>
              
              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      helperText="Ghana phone number (e.g., 0241234567)"
                      InputProps={{
                        startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="WhatsApp Number"
                      name="whatsapp"
                      value={formData.whatsapp}
                      onChange={handleChange}
                      helperText="Optional, if different from phone"
                      InputProps={{
                        startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      multiline
                      rows={3}
                      helperText="Your full service address"
                      InputProps={{
                        startAdornment: <LocationIcon sx={{ mr: 1, color: 'text.secondary', mt: 1 }} />,
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="GhanaPost GPS Code"
                      name="ghana_post_gps"
                      value={formData.ghana_post_gps}
                      onChange={handleChange}
                      helperText="Optional format: AA-123-4567"
                      placeholder="AA-123-4567"
                    />
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Quick Actions
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/customer/jobs/new')}
                  >
                    Create Job Request
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/customer/jobs')}
                  >
                    View My Jobs
                  </Button>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => loadCustomerProfile()}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    type="submit"
                    startIcon={<SaveIcon />}
                    disabled={isSaving}
                  >
                    {isSaving ? <CircularProgress size={24} /> : 'Save Changes'}
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CustomerProfile;