import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, CircularProgress, Drawer, Divider, Chip, Card, CardContent, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { 
  Build as BuildIcon,
  Person as PersonIcon,
  MyLocation as MyLocationIcon,
  Menu as MenuIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import ActivityMap from '../maps/ActivityMap';
import api from '../../services/api';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [isps, setISPs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearbyISPs, setNearbyISPs] = useState<any[]>([]);

  // Sample data for display
  const sampleJobs = [
    { category: 'Plumbing', description: 'Fix leaking pipe', location: 'Accra' },
    { category: 'Electrical', description: 'Install ceiling fan', location: 'Kumasi' },
    { category: 'Carpentry', description: 'Build furniture', location: 'Tamale' },
  ];

  const sampleCustomers = [
    { name: 'Kwame Mensah', location: 'Accra', jobs: 5 },
    { name: 'Ama Darko', location: 'Kumasi', jobs: 3 },
    { name: 'Kojo Asante', location: 'Tamale', jobs: 2 },
  ];

  useEffect(() => {
    loadAvailableISPs();
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          filterNearbyISPs(location);
        },
        (error) => {
          console.error('Geolocation error:', error);
          // Default to Ghana center if geolocation fails
          const defaultLocation = { lat: 7.9465, lng: -1.0232 };
          setUserLocation(defaultLocation);
          filterNearbyISPs(defaultLocation);
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    } else {
      // Default to Ghana center if geolocation not supported
      const defaultLocation = { lat: 7.9465, lng: -1.0232 };
      setUserLocation(defaultLocation);
      filterNearbyISPs(defaultLocation);
    }
  };

  const filterNearbyISPs = (location: { lat: number; lng: number }) => {
    // Filter ISPs within 50km radius
    const nearby = isps.filter(isp => {
      if (!isp.current_location && !isp.gps_coords) return false;
      
      const ispLocation = isp.current_location || isp.gps_coords;
      const coords = typeof ispLocation === 'string' ? JSON.parse(ispLocation) : ispLocation;
      
      if (!coords || !coords.lat || !coords.lng) return false;
      
      const distance = calculateDistance(
        location.lat,
        location.lng,
        coords.lat,
        coords.lng
      );
      
      return distance <= 50; // 50km radius
    });
    
    setNearbyISPs(nearby);
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const loadAvailableISPs = async () => {
    try {
      const response = await api.get('/api/isps/all');
      setISPs(response.data.data || []);
      
      // If user location is already set, filter nearby ISPs
      if (userLocation) {
        filterNearbyISPs(userLocation);
      }
    } catch (error) {
      console.error('Failed to load ISPs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationRefresh = () => {
    getUserLocation();
  };

  return (
    <Box sx={{ position: 'relative', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {/* Full-screen Map */}
      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : (
          <ActivityMap isps={nearbyISPs} showActiveOnly={true} center={userLocation || undefined} />
        )}
      </Box>

      {/* Branding Header */}
      <Box sx={{ 
        position: 'absolute', 
        top: 20, 
        left: 20, 
        zIndex: 10,
        bgcolor: 'white',
        p: 2,
        borderRadius: 2,
        boxShadow: 3,
        display: 'flex',
        alignItems: 'center',
        gap: 2
      }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700, color: '#FFD400' }}>
            AJUMAPLUS
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Professional Services Across Ghana
          </Typography>
        </Box>
        <IconButton onClick={handleLocationRefresh} size="small" title="Refresh location">
          <MyLocationIcon />
        </IconButton>
      </Box>

      {/* Quick Actions */}
      <Box sx={{ 
        position: 'absolute', 
        bottom: 100, 
        left: 20, 
        right: 20,
        zIndex: 10,
        display: 'flex',
        gap: 2,
        flexWrap: 'wrap'
      }}>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/request-service')}
          sx={{ 
            flex: 1,
            minWidth: 200,
            bgcolor: '#FFD400',
            color: '#000',
            '&:hover': { bgcolor: '#E6BE00' }
          }}
          startIcon={<BuildIcon />}
        >
          Request Service
        </Button>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/login')}
          sx={{ 
            flex: 1,
            minWidth: 200,
            bgcolor: 'white',
            color: '#000',
            '&:hover': { bgcolor: '#f5f5f5' }
          }}
          startIcon={<PersonIcon />}
        >
          Sign In
        </Button>
      </Box>

      {/* Admin/Staff Login Link */}
      <Box sx={{ 
        position: 'absolute', 
        bottom: 20, 
        left: 20, 
        zIndex: 10
      }}>
        <Button 
          variant="text" 
          size="small"
          onClick={() => navigate('/admin-staff/login')}
          sx={{ color: 'white', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
        >
          Admin/Staff Login
        </Button>
      </Box>

      {/* ISP Count Indicator */}
      <Box sx={{ 
        position: 'absolute', 
        top: 20, 
        right: 20, 
        zIndex: 10,
        bgcolor: 'white',
        p: 2,
        borderRadius: 2,
        boxShadow: 3,
        textAlign: 'center',
        cursor: 'pointer'
      }}
      onClick={() => setDrawerOpen(true)}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#006B3F' }}>
          {nearbyISPs.length}
        </Typography>
        <Typography variant="caption" color="textSecondary">
          Nearby ISPs
        </Typography>
      </Box>

      {/* Menu Button */}
      <IconButton
        sx={{ 
          position: 'absolute', 
          top: 80, 
          right: 20, 
          zIndex: 10,
          bgcolor: 'white',
          color: '#000',
          '&:hover': { bgcolor: '#f5f5f5' }
        }}
        onClick={() => setDrawerOpen(true)}
      >
        <MenuIcon />
      </IconButton>

      {/* Side Drawer with Samples */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 350, p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Platform Info
            </Typography>
            <IconButton onClick={() => setDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Sample Jobs */}
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
            Recent Job Requests
          </Typography>
          {sampleJobs.map((job, index) => (
            <Card key={index} sx={{ mb: 2, bgcolor: 'grey.50' }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {job.category}
                  </Typography>
                  <Chip label={job.location} size="small" />
                </Box>
                <Typography variant="caption" color="textSecondary">
                  {job.description}
                </Typography>
              </CardContent>
            </Card>
          ))}

          <Divider sx={{ my: 3 }} />

          {/* Sample Customers */}
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
            Active Customers
          </Typography>
          {sampleCustomers.map((customer, index) => (
            <Box
              key={index}
              sx={{ 
                p: 2, 
                mb: 1, 
                bgcolor: 'grey.100',
                borderRadius: 1
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {customer.name}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="caption" color="textSecondary">
                  {customer.location}
                </Typography>
                <Chip label={`${customer.jobs} jobs`} size="small" />
              </Box>
            </Box>
          ))}
        </Box>
      </Drawer>
    </Box>
  );
};

export default Landing;