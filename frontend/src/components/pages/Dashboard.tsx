import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Card, CardContent, Button } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { jobService } from '../../services/jobService';
import { Job } from '../../types';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const allJobs = await jobService.getAllJobs();
      setJobs(allJobs);
    } catch (error) {
      console.error('Failed to load jobs:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
              {jobs.length}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, minWidth: 200 }}>
          <CardContent>
            <Typography variant="h6" color="success.main">
              New Jobs
            </Typography>
            <Typography variant="h4">
              {jobs.filter(job => job.status === 'new').length}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, minWidth: 200 }}>
          <CardContent>
            <Typography variant="h6" color="warning.main">
              In Progress
            </Typography>
            <Typography variant="h4">
              {jobs.filter(job => job.status === 'in_progress').length}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, minWidth: 200 }}>
          <CardContent>
            <Typography variant="h6" color="info.main">
              Completed
            </Typography>
            <Typography variant="h4">
              {jobs.filter(job => job.status === 'completed').length}
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
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/customer/jobs/new')}
            sx={{ mr: 2 }}
          >
            Create Job Request
          </Button>
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