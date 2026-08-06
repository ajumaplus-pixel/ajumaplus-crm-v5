import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, CircularProgress, Fab, Drawer, List, ListItem, ListItemText, Chip, Badge, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { customerService } from '../../services/customerService';
import { Job } from '../../types';
import { 
  Build as BuildIcon,
  Person as PersonIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import ActivityMap from '../maps/ActivityMap';
import api from '../../services/api';

const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isps, setISPs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeJob, setActiveJob] = useState<Job | null>(null);

  useEffect(() => {
    loadCustomerData();
    loadISPs();
  }, [user]);

  const loadCustomerData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      const customer = await customerService.getCustomerByUserId(user.id);
      const customerJobs = await customerService.getCustomerJobs(customer.id);
      setJobs(customerJobs);
      
      // Set active job (first job that's not completed)
      const active = customerJobs.find((job: Job) => 
        job.status !== 'completed' && job.status !== 'cancelled'
      );
      setActiveJob(active || null);
    } catch (err: any) {
      console.error('Failed to load customer data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadISPs = async () => {
    try {
      const response = await api.get('/api/isps/all');
      setISPs(response.data.data || []);
    } catch (error) {
      console.error('Failed to load ISPs:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'info';
      case 'pending_quotes': return 'warning';
      case 'assigned': return 'secondary';
      case 'in_progress': return 'primary';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const handleJobClick = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (job && job.status === 'pending_quotes') {
      navigate(`/customer/jobs/${jobId}/quotes`);
    } else {
      navigate(`/customer/jobs/${jobId}`);
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
        </Box>
        <IconButton onClick={() => navigate('/customer/profile')}>
          <PersonIcon />
        </IconButton>
      </Box>

      {/* Active Job Card */}
      {activeJob && (
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
                {activeJob.category}
              </Typography>
              <Chip 
                label={activeJob.status.replace('_', ' ')} 
                color={getStatusColor(activeJob.status) as any}
                size="small"
              />
            </Box>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              {activeJob.description}
            </Typography>
            <Button
              variant="contained"
              fullWidth
              onClick={() => handleJobClick(activeJob.id)}
              sx={{ bgcolor: '#FFD400', color: '#000', '&:hover': { bgcolor: '#E6BE00' } }}
            >
              View Details
            </Button>
          </Box>
        </Box>
      )}

      {/* Request Service FAB */}
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
        onClick={() => navigate('/request-service')}
      >
        <BuildIcon />
      </Fab>

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
            <ListItem button onClick={() => { navigate('/request-service'); setDrawerOpen(false); }}>
              <BuildIcon sx={{ mr: 2 }} />
              <ListItemText primary="Request Service" />
            </ListItem>
            <ListItem button onClick={() => { navigate('/customer/jobs'); setDrawerOpen(false); }}>
              <HistoryIcon sx={{ mr: 2 }} />
              <ListItemText primary="Job History" />
              {jobs.length > 0 && (
                <Badge badgeContent={jobs.length} color="primary" sx={{ ml: 2 }} />
              )}
            </ListItem>
            <ListItem button onClick={() => { navigate('/customer/profile'); setDrawerOpen(false); }}>
              <PersonIcon sx={{ mr: 2 }} />
              <ListItemText primary="My Profile" />
            </ListItem>
          </List>

          <Box sx={{ mt: 3, pt: 3, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 2 }}>
              Your Jobs
            </Typography>
            {jobs.slice(0, 5).map((job) => (
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
                onClick={() => { handleJobClick(job.id); setDrawerOpen(false); }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {job.category}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                  <Chip 
                    label={job.status} 
                    color={getStatusColor(job.status) as any}
                    size="small"
                  />
                  <Typography variant="caption" color="textSecondary">
                    {new Date(job.created_at).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
};

export default CustomerDashboard;