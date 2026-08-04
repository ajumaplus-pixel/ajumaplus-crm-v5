import React from 'react';
import { Box, Container, Typography, Button, Card, CardContent, CardActions } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { 
  Person as PersonIcon,
  Build as BuildIcon
} from '@mui/icons-material';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 8, mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700, color: '#1A1A1A' }}>
          Welcome to AJUMAPLUS CRM
        </Typography>
        <Typography variant="h6" color="textSecondary" gutterBottom sx={{ maxWidth: 600, mx: 'auto' }}>
          Ghana's Premier Service Management Platform - Connecting you with trusted professionals across Accra, Kumasi, and beyond
        </Typography>
        
        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>
            Professional services • Trusted providers • Quality assurance
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap', mt: 6, justifyContent: 'center' }}>
        {/* Customer Login Card */}
        <Card sx={{ width: 320, display: 'flex', flexDirection: 'column', transition: 'transform 0.3s ease-in-out', '&:hover': { transform: 'translateY(-8px)' } }}>
          <CardContent sx={{ flexGrow: 1, textAlign: 'center', pt: 4 }}>
            <PersonIcon sx={{ fontSize: 72, color: 'primary.main', mb: 3 }} />
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
              Customer Portal
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Access trusted service providers across Ghana
            </Typography>
            <Typography variant="caption" color="textSecondary">
              • Request professional services<br/>
              • Track job progress in real-time<br/>
              • Secure payments in GHS
            </Typography>
          </CardContent>
          <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
            <Button 
              variant="contained" 
              size="large"
              onClick={() => navigate('/customer/login')}
              sx={{ px: 4, py: 1.5 }}
            >
              Customer Login
            </Button>
          </CardActions>
        </Card>

        {/* ISP Login Card */}
        <Card sx={{ width: 320, display: 'flex', flexDirection: 'column', transition: 'transform 0.3s ease-in-out', '&:hover': { transform: 'translateY(-8px)' } }}>
          <CardContent sx={{ flexGrow: 1, textAlign: 'center', pt: 4 }}>
            <BuildIcon sx={{ fontSize: 72, color: 'secondary.main', mb: 3 }} />
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
              Service Provider
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Grow your business with AjumaPlus
            </Typography>
            <Typography variant="caption" color="textSecondary">
              • Access thousands of customers<br/>
              • Manage quotations efficiently<br/>
              • Receive payments securely
            </Typography>
          </CardContent>
          <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
            <Button 
              variant="contained" 
              size="large"
              onClick={() => navigate('/isp/login')}
              sx={{ px: 4, py: 1.5, bgcolor: 'secondary.main', '&:hover': { bgcolor: 'secondary.dark' } }}
            >
              ISP Login
            </Button>
          </CardActions>
        </Card>
      </Box>

      <Box sx={{ mt: 12, textAlign: 'center', color: 'textSecondary', pb: 4 }}>
        <Typography variant="body2" sx={{ mb: 2, fontWeight: 500 }}>
          © 2026 AJUMAPLUS CRM. All rights reserved.
        </Typography>
        <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 2 }}>
          Empowering Ghana's Service Industry • Nationwide Coverage • Quality Assured
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Button 
            size="small" 
            sx={{ color: 'text.secondary', fontSize: '0.8rem' }}
            onClick={() => navigate('/admin')}
          >
            Staff/Admin Access
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Landing;