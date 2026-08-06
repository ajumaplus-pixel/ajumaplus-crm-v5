import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, CircularProgress, Fab, Drawer, List, ListItem, ListItemText, Chip, Badge, IconButton, Switch, FormControlLabel } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { 
  Menu as MenuIcon,
  Close as CloseIcon,
  Work as WorkIcon,
  CheckCircle as CheckCircleIcon,
  PlayArrow as PlayArrowIcon,
  LocationOn as LocationIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import ActivityMap from '../maps/ActivityMap';

const ISPDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeJobs, setActiveJobs] = useState<any[]>([]);
  const [availableJobs, setAvailableJobs] = useState<any[]>([]);
  const [isps, setISPs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    loadDashboardData();
    // Get browser location for ISP
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          // Update ISP location in backend
          updateISPLocation(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error('Geolocation error:', error);
          // Set default Ghana location if geolocation fails
          setCurrentLocation({ lat: 7.9465, lng: -1.0232 });
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    } else {
      // Set default Ghana location if geolocation not supported
      setCurrentLocation({ lat: 7.9465, lng: -1.0232 });
    }
    const interval = setInterval(loadDashboardData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Get active jobs
      const activeJobsResponse = await api.get('/api/isps/jobs');
      setActiveJobs(activeJobsResponse.data.data || []);
      
      // Get available jobs
      const availableJobsResponse = await api.get('/api/isps/jobs/available');
      setAvailableJobs(availableJobsResponse.data.data || []);
      
      // Get all ISPs for map
      const ispsResponse = await api.get('/api/isps/all');
      setISPs(ispsResponse.data.data || []);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateISPLocation = async (lat: number, lng: number) => {
    try {
      await api.put('/api/isps/location', { lat, lng });
    } catch (error) {
      console.error('Failed to update location:', error);
    }
  };

  const handleToggleOnline = async () => {
    try {
      await api.put('/api/isps/availability', { availability: isOnline ? 'offline' : 'available' });
      setIsOnline(!isOnline);
    } catch (error) {
      console.error('Failed to update availability:', error);
    }
  };

  const handleStartJob = async (jobId: string) => {
    try {
      if (currentLocation) {
        await api.put(`/api/jobs/${jobId}/status/location`, {
          status: 'en_route',
          lat: currentLocation.lat,
          lng: currentLocation.lng
        });
      } else {
        await api.put(`/api/jobs/${jobId}/status`, { status: 'en_route' });
      }
      loadDashboardData();
    } catch (error) {
      console.error('Failed to start job:', error);
    }
  };

  const handleUpdateJobStatus = async (jobId: string, status: string) => {
    try {
      if (currentLocation) {
        await api.put(`/api/jobs/${jobId}/status/location`, {
          status,
          lat: currentLocation.lat,
          lng: currentLocation.lng
        });
      } else {
        await api.put(`/api/jobs/${jobId}/status`, { status });
      }
      loadDashboardData();
    } catch (error) {
      console.error('Failed to update job status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned': return 'warning';
      case 'en_route': return 'info';
      case 'in_progress': return 'primary';
      case 'completed': return 'success';
      default: return 'default';
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {/* Full-screen Map */}
      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
        <ActivityMap isps={isps} showActiveOnly={true} />
      </Box>

      {/* Header */}
      <Box sx={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        right: 0,
        zIndex: 10,
        bgcolor: 'white',
        p: 2,
        boxShadow: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => setDrawerOpen(true)}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#FFD400' }}>
            AJUMAPLUS
          </Typography>
          <Chip 
            label={isOnline ? 'Online' : 'Offline'} 
            color={isOnline ? 'success' : 'default'}
            size="small"
          />
        </Box>
        <IconButton onClick={() => { /* Navigate to profile when implemented */ }}>
          <LocationIcon />
        </IconButton>
      </Box>

      {/* Online/Offline Toggle */}
      <Box sx={{ 
        position: 'absolute', 
        top: 80, 
        right: 20,
        zIndex: 10,
        bgcolor: 'white',
        p: 2,
        borderRadius: 2,
        boxShadow: 3
      }}>
        <FormControlLabel
          control={
            <Switch
              checked={isOnline}
              onChange={handleToggleOnline}
              color="success"
            />
          }
          label="Available"
        />
      </Box>

      {/* Active Job Card */}
      {activeJobs.length > 0 && (
        <Box sx={{ 
          position: 'absolute', 
          bottom: 80, 
          left: 20, 
          right: 20,
          zIndex: 10
        }}>
          <Box sx={{ 
            bgcolor: 'white',
            p: 3,
            borderRadius: 2,
            boxShadow: 3
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Active Job
              </Typography>
              <Chip 
                label={activeJobs[0].status.replace('_', ' ')} 
                color={getStatusColor(activeJobs[0].status) as any}
                size="small"
              />
            </Box>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              {activeJobs[0].category} - {activeJobs[0].address}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {activeJobs[0].status === 'assigned' && (
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => handleStartJob(activeJobs[0].id)}
                  startIcon={<PlayArrowIcon />}
                  sx={{ bgcolor: '#006B3F', '&:hover': { bgcolor: '#004D2C' } }}
                >
                  Start Job
                </Button>
              )}
              {activeJobs[0].status === 'en_route' && (
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => handleUpdateJobStatus(activeJobs[0].id, 'in_progress')}
                  sx={{ bgcolor: '#006B3F', '&:hover': { bgcolor: '#004D2C' } }}
                >
                  Arrived
                </Button>
              )}
              {activeJobs[0].status === 'in_progress' && (
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => handleUpdateJobStatus(activeJobs[0].id, 'completed')}
                  startIcon={<CheckCircleIcon />}
                  sx={{ bgcolor: '#006B3F', '&:hover': { bgcolor: '#004D2C' } }}
                >
                  Complete
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      )}

      {/* Available Jobs Badge */}
      {availableJobs.length > 0 && (
        <Fab
          color="primary"
          sx={{ 
            position: 'absolute', 
            bottom: 20, 
            right: 20, 
            zIndex: 10,
            bgcolor: '#FFD400',
            color: '#000',
            '&:hover': { bgcolor: '#E6BE00' }
          }}
          onClick={() => setDrawerOpen(true)}
        >
          <Badge badgeContent={availableJobs.length} color="error">
            <WorkIcon />
          </Badge>
        </Fab>
      )}

      {/* Side Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 300, p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Menu
            </Typography>
            <IconButton onClick={() => setDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          <List>
            <ListItem button onClick={() => { setDrawerOpen(false); }}>
              <WorkIcon sx={{ mr: 2 }} />
              <ListItemText primary="Available Jobs" />
              {availableJobs.length > 0 && (
                <Badge badgeContent={availableJobs.length} color="primary" sx={{ ml: 2 }} />
              )}
            </ListItem>
            <ListItem button onClick={() => { navigate('/isp/profile'); setDrawerOpen(false); }}>
              <LocationIcon sx={{ mr: 2 }} />
              <ListItemText primary="My Profile" />
            </ListItem>
            <ListItem button onClick={() => { navigate('/isp/quotations'); setDrawerOpen(false); }}>
              <NotificationsIcon sx={{ mr: 2 }} />
              <ListItemText primary="Quotations" />
            </ListItem>
          </List>

          <Box sx={{ mt: 3, pt: 3, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 2 }}>
              Available Jobs
            </Typography>
            {availableJobs.slice(0, 5).map((job) => (
              <Box
                key={job.id}
                sx={{ 
                  p: 2, 
                  mb: 1, 
                  bgcolor: 'grey.100',
                  borderRadius: 1,
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'grey.200' }
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {job.category}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {job.address}
                </Typography>
                <Chip 
                  label={job.priority} 
                  size="small"
                  sx={{ mt: 1 }}
                />
              </Box>
            ))}
          </Box>

          <Box sx={{ mt: 3, pt: 3, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 2 }}>
              Active Jobs
            </Typography>
            {activeJobs.map((job) => (
              <Box
                key={job.id}
                sx={{ 
                  p: 2, 
                  mb: 1, 
                  bgcolor: 'grey.100',
                  borderRadius: 1
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {job.category}
                </Typography>
                <Chip 
                  label={job.status} 
                  color={getStatusColor(job.status) as any}
                  size="small"
                  sx={{ mt: 1 }}
                />
              </Box>
            ))}
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
};

export default ISPDashboard;