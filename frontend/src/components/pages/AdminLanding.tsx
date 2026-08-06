import React from 'react';
import { Box, Container, Typography, Card, CardContent, CardActions, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { 
  AdminPanelSettings as AdminIcon,
  Badge as StaffIcon
} from '@mui/icons-material';

const AdminLanding: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 8, mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700, color: '#FFD400' }}>
          AJUMAPLUS CRM
        </Typography>
        <Typography variant="h6" color="textSecondary" gutterBottom>
          Administrator & Staff Web Portal
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 2, fontStyle: 'italic' }}>
          Web Application for System Administration
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mt: 4, justifyContent: 'center' }}>
        {/* Staff Login Card */}
        <Card sx={{ width: 280, display: 'flex', flexDirection: 'column', bgcolor: 'primary.light' }}>
          <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
            <StaffIcon sx={{ fontSize: 60, color: 'primary.dark', mb: 2 }} />
            <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 600, color: 'primary.dark' }}>
              Staff Portal
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Manage jobs, assign providers, and oversee operations
            </Typography>
          </CardContent>
          <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
            <Button 
              variant="contained" 
              size="large"
              onClick={() => navigate('/admin-staff/login')}
              sx={{ bgcolor: 'primary.dark', '&:hover': { bgcolor: 'primary.main' } }}
            >
              Staff Login
            </Button>
          </CardActions>
        </Card>

        {/* Admin Login Card */}
        <Card sx={{ width: 280, display: 'flex', flexDirection: 'column', bgcolor: 'primary.light' }}>
          <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
            <AdminIcon sx={{ fontSize: 60, color: 'primary.dark', mb: 2 }} />
            <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 600, color: 'primary.dark' }}>
              Admin Portal
            </Typography>
            <Typography variant="body2" color="textSecondary">
              System administration, user management, and settings
            </Typography>
          </CardContent>
          <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
            <Button 
              variant="contained" 
              size="large"
              onClick={() => navigate('/admin-staff/login')}
              sx={{ bgcolor: 'primary.dark', '&:hover': { bgcolor: 'primary.main' } }}
            >
              Admin Login
            </Button>
          </CardActions>
        </Card>
      </Box>

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Button 
          variant="outlined" 
          onClick={() => navigate('/')}
        >
          ← Back to AJUMAPLUS
        </Button>
      </Box>

      <Box sx={{ mt: 8, textAlign: 'center', color: 'textSecondary' }}>
        <Typography variant="body2">
          © 2026 AJUMAPLUS CRM. All rights reserved.
        </Typography>
      </Box>
    </Container>
  );
};

export default AdminLanding;