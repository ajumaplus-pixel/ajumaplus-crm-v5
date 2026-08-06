import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Card, CardContent, Button, Chip, Grid, TextField, MenuItem, CircularProgress, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { customerService } from '../../services/customerService';
import { Job } from '../../types';

const CustomerJobs: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const loadCustomerJobs = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError('');
      
      // Get customer profile first
      const customer = await customerService.getCustomerByUserId(user.id);
      
      // Get customer jobs
      const customerJobs = await customerService.getCustomerJobs(customer.id);
      setJobs(customerJobs);
    } catch (err: any) {
      console.error('Failed to load customer jobs:', err);
      setError(err.response?.data?.message || 'Failed to load jobs. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const filterJobs = () => {
    let filtered = [...jobs];

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(job => job.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(job =>
        job.job_number.toLowerCase().includes(term) ||
        job.category.toLowerCase().includes(term) ||
        job.description.toLowerCase().includes(term)
      );
    }

    setFilteredJobs(filtered);
  };

  useEffect(() => {
    loadCustomerJobs();
  }, [user]);

  useEffect(() => {
    filterJobs();
  }, [jobs, statusFilter, searchTerm]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'info';
      case 'assigned': return 'warning';
      case 'in_progress': return 'secondary';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'normal': return 'info';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const handleJobClick = (jobId: string) => {
    navigate(`/customer/jobs/${jobId}`);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Button onClick={() => navigate('/customer/dashboard')} sx={{ mb: 2 }}>
          ← Back to Dashboard
        </Button>
        <Typography variant="h4" gutterBottom>
          My Jobs
        </Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          View and manage your service requests
        </Typography>
      </Box>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            label="Search Jobs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by job number, category, or description"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            select
            label="Filter by Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="new">New</MenuItem>
            <MenuItem value="assigned">Assigned</MenuItem>
            <MenuItem value="in_progress">In Progress</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} sm={12} md={4}>
          <Button
            variant="contained"
            fullWidth
            onClick={() => navigate('/customer/jobs/new')}
            sx={{ height: '56px' }}
          >
            Create New Job
          </Button>
        </Grid>
      </Grid>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : filteredJobs.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="textSecondary">
            {jobs.length === 0 ? 'No jobs found. Create your first job request!' : 'No jobs match your filters.'}
          </Typography>
          {jobs.length === 0 && (
            <Button
              variant="contained"
              onClick={() => navigate('/customer/jobs/new')}
              sx={{ mt: 2 }}
            >
              Create Job Request
            </Button>
          )}
        </Box>
      ) : (
        <Grid container spacing={2}>
          {filteredJobs.map((job) => (
            <Grid item xs={12} md={6} key={job.id}>
              <Card
                sx={{
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
                onClick={() => handleJobClick(job.id)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {job.job_number}
                    </Typography>
                    <Chip
                      label={job.status}
                      color={getStatusColor(job.status) as any}
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                    <strong>Category:</strong> {job.category}
                  </Typography>
                  
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                    <strong>Description:</strong> {job.description.substring(0, 100)}...
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Chip
                      label={job.priority}
                      color={getPriorityColor(job.priority) as any}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      label={new Date(job.created_at).toLocaleDateString()}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    {job.status === 'completed' && (
                      <Button
                        size="small"
                        variant="contained"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/customer/jobs/${job.id}/rate`);
                        }}
                      >
                        Rate
                      </Button>
                    )}
                    {job.quotations && job.quotations.length > 0 && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/customer/quotations/${job.quotations[0].id}`);
                        }}
                      >
                        View Quote
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default CustomerJobs;