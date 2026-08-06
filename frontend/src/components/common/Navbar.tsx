import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Hide navbar on map-centric pages (Landing, CustomerDashboard, ISPDashboard)
  const mapCentricRoutes = ['/', '/customer/dashboard', '/isp/dashboard'];
  const shouldHideNavbar = mapCentricRoutes.includes(location.pathname);

  if (shouldHideNavbar) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <AppBar position="static" sx={{ bgcolor: '#1A1A1A', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 0, 
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '1.4rem',
              letterSpacing: 0.5
            }}
            onClick={() => {
              // Navigate based on user role
              if (user?.role === 'admin' || user?.role === 'staff') {
                navigate('/admin/dashboard');
              } else {
                navigate('/');
              }
            }}
          >
            AJUMAPLUS
          </Typography>
          {(user?.role === 'admin' || user?.role === 'staff') && (
            <Typography 
              variant="caption" 
              sx={{ ml: 1, color: 'primary.main', fontWeight: 600, letterSpacing: 1 }}
            >
              CRM
            </Typography>
          )}
        </Box>
        
        {isAuthenticated && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ color: 'white', fontWeight: 500 }}>
              Welcome, {user?.username}
            </Typography>
            {user?.role === 'admin' || user?.role === 'staff' ? (
              <Button 
                color="inherit" 
                onClick={() => user?.role === 'admin' ? navigate('/admin/dashboard') : navigate('/staff/dashboard')}
                sx={{ fontWeight: 600 }}
              >
                Dashboard
              </Button>
            ) : (
              <Button 
                color="inherit" 
                onClick={() => user?.role === 'customer' ? navigate('/customer/dashboard') : navigate('/isp/dashboard')}
                sx={{ fontWeight: 600 }}
              >
                Dashboard
              </Button>
            )}
            <Button 
              color="inherit" 
              onClick={handleLogout}
              sx={{ fontWeight: 600, color: 'primary.main' }}
            >
              Logout
            </Button>
          </Box>
        )}
        {!isAuthenticated && (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              color="inherit" 
              onClick={() => navigate('/')}
              sx={{ fontWeight: 600 }}
            >
              Home
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;