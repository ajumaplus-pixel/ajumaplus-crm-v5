import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

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
            onClick={() => navigate('/')}
          >
            AJUMAPLUS
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ ml: 1, color: 'primary.main', fontWeight: 600, letterSpacing: 1 }}
          >
            CRM
          </Typography>
        </Box>
        
        {isAuthenticated && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ color: 'white', fontWeight: 500 }}>
              Welcome, {user?.username}
            </Typography>
            <Button 
              color="inherit" 
              onClick={() => navigate('/dashboard')}
              sx={{ fontWeight: 600 }}
            >
              Dashboard
            </Button>
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