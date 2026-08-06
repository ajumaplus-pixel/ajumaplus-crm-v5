import React from 'react';
import { Box, Container, Typography, Button, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const CustomerSupport: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Button onClick={() => navigate('/customer/dashboard')} sx={{ mb: 2 }}>
          ← Back to Dashboard
        </Button>
        <Typography variant="h4" gutterBottom>
          Customer Support
        </Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Get help with your service requests and account
        </Typography>
      </Box>

      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Support Center Coming Soon
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          Our support team is here to help you. You'll be able to submit support requests, track your tickets, and access FAQs here.
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          For immediate assistance, please contact us at:
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
          📧 support@ajumaplus.com | 📞 +233 20 123 4567
        </Typography>
        <Button
          variant="outlined"
          onClick={() => navigate('/customer/dashboard')}
        >
          Return to Dashboard
        </Button>
      </Paper>
    </Container>
  );
};

export default CustomerSupport;