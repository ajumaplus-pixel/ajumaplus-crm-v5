import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Card, CardContent, Button } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { customerService } from '../../services/customerService';
import { Job } from '../../types';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    completedJobs: 0,
    totalSpent: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const loadCustomerData = async () => {
    if (!user) return;

    try {
      // Get customer profile
      const customer = await customerService.getCustomerByUserId(user.id);
      
      // Get customer jobs
      const customerJobs = await customerService.getCustomerJobs(customer.id);
      setJobs(customerJobs);
      
      // Get customer statistics
      const customerStats = await customerService.getCustomerStats(customer.id);
      setStats(customerStats);
    } catch (error) {
      console.error('Failed to load customer data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCustomerData();
  }, [loadCustomerData]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {getGreeting()}, {user?.username}!
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" gutterBottom>
          Role: {user?.role?.toUpperCase()}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 4 }}>
        <Card sx={{ flex: 1, minWidth: 200 }}>
          <CardContent>
            <Typography variant="h6" color="primary">
              Total Jobs
            </Typography>
            <Typography variant="h4">
              {stats.totalJobs}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, minWidth: 200 }}>
          <CardContent>
            <Typography variant="h6" color="warning.main">
              Active Jobs
            </Typography>
            <Typography variant="h4">
              {stats.activeJobs}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, minWidth: 200 }}>
          <CardContent>
            <Typography variant="h6" color="success.main">
              Completed
            </Typography>
            <Typography variant="h4">
              {stats.completedJobs}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, minWidth: 200 }}>
          <CardContent>
            <Typography variant="h6" color="info.main">
              Total Spent
            </Typography>
            <Typography variant="h4">
              GHS {stats.totalSpent.toFixed(2)}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Recent Jobs
        </Typography>
        {isLoading ? (
          <Typography>Loading jobs...</Typography>
        ) : jobs.length === 0 ? (
          <Typography>No jobs found</Typography>
        ) : (
          jobs.slice(0, 5).map((job) => (
            <Card key={job.id} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6">{job.job_number}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {job.category} - {job.description}
                </Typography>
                <Typography variant="body2" color="primary">
                  Status: {job.status}
                </Typography>
              </CardContent>
            </Card>
          ))
        )}
      </Box>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Quick Actions
        </Typography>
        
        {user?.role === 'customer' && (
          <>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/customer/jobs/new')}
              sx={{ mr: 2 }}
            >
              Create Job Request
            </Button>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => navigate('/customer/jobs')}
              sx={{ mr: 2 }}
            >
              View My Jobs
            </Button>
          </>
        )}
        
        {user?.role === 'isp' && (
          <Button
            variant="contained"
            color="secondary"
            onClick={() => navigate('/isp/dashboard')}
            sx={{ mr: 2 }}
          >
            View Available Jobs
          </Button>
        )}
        
        {user?.role === 'staff' && (
          <Button
            variant="contained"
            color="info"
            onClick={() => navigate('/staff/dashboard')}
            sx={{ mr: 2 }}
          >
            Manage Jobs
          </Button>
        )}
      </Box>
    </Container>
  );
};

export default Dashboard;