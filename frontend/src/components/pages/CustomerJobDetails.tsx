import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Card, CardContent, Button, Chip, Grid, CircularProgress, Alert, Paper } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { jobService } from '../../services/jobService';
import { Job, Quotation } from '../../types';
import LiveTrackingMap from '../maps/LiveTrackingMap';

const CustomerJobDetails: React.FC = () => {
  const navigate = useNavigate();
  const { jobId } = useParams<{ jobId: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadJobDetails();
  }, [jobId]);

  const loadJobDetails = async () => {
    if (!jobId) return;

    try {
      setIsLoading(true);
      setError('');
      
      const jobData = await jobService.getJobById(jobId);
      setJob(jobData);
      
      // Extract quotations from job data if available
      if (jobData.quotations) {
        setQuotations(jobData.quotations);
      }
    } catch (err: any) {
      console.error('Failed to load job details:', err);
      setError(err.response?.data?.message || 'Failed to load job details. Please try again.');
    } finally {
      setIsLoading(false);
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'normal': return 'info';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const handleViewQuotation = (quotationId: string) => {
    navigate(`/customer/quotations/${quotationId}`);
  };

  const handleViewQuotes = () => {
    navigate(`/customer/jobs/${jobId}/quotes`);
  };

  const handleRateJob = () => {
    navigate(`/customer/jobs/${jobId}/rate`);
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !job) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Button onClick={() => navigate('/customer/jobs')} sx={{ mb: 2 }}>
            ← Back to My Jobs
          </Button>
          <Alert severity="error">
            {error || 'Job not found'}
          </Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Button onClick={() => navigate('/customer/jobs')} sx={{ mb: 2 }}>
          ← Back to My Jobs
        </Button>
        <Typography variant="h4" gutterBottom>
          Job Details
        </Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          {job.job_number}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Job Information */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Job Information
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Chip
                  label={job.status}
                  color={getStatusColor(job.status) as any}
                  size="medium"
                />
                <Chip
                  label={job.priority}
                  color={getPriorityColor(job.priority) as any}
                  size="medium"
                  variant="outlined"
                />
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">
                    <strong>Category:</strong>
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {job.category}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">
                    <strong>Created:</strong>
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {new Date(job.created_at).toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary">
                    <strong>Description:</strong>
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {job.description}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary">
                    <strong>Address:</strong>
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {job.address}
                  </Typography>
                </Grid>
                {job.scheduled_date && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">
                      <strong>Scheduled Date:</strong>
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {new Date(job.scheduled_date).toLocaleString()}
                    </Typography>
                  </Grid>
                )}
                {job.gps_coords && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">
                      <strong>GPS Coordinates:</strong>
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {job.gps_coords}
                    </Typography>
                  </Grid>
                )}
                {job.notes && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">
                      <strong>Notes:</strong>
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-line' }}>
                      {job.notes}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>

          {/* Assigned ISP Information - Only show after quote accepted */}
          {job.isp_id && job.status !== 'pending_quotes' && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Service Provider
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">
                      <strong>Trade:</strong>
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {job.isp_trade || 'N/A'}
                    </Typography>
                  </Grid>
                  
                  {/* Contact info only visible after job is assigned (quote accepted) */}
                  {job.status === 'assigned' || job.status === 'in_progress' || job.status === 'completed' ? (
                    <>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="textSecondary">
                          <strong>Phone:</strong>
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                          {job.isp_phone || 'Contact via platform'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="textSecondary">
                          <strong>Email:</strong>
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                          {job.isp_email || 'Contact via platform'}
                        </Typography>
                      </Grid>
                    </>
                  ) : (
                    <Grid item xs={12}>
                      <Alert severity="info" sx={{ mt: 1 }}>
                        Contact information will be available after you accept a quote.
                      </Alert>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          )}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Quotations
              </Typography>
              
              {job.status === 'pending_quotes' && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleViewQuotes}
                  sx={{ mb: 2 }}
                >
                  View Available Quotes
                </Button>
              )}
              
              {quotations.length === 0 && job.status !== 'pending_quotes' ? (
                <Typography variant="body2" color="textSecondary">
                  No quotations received yet.
                </Typography>
              ) : (
                <Grid container spacing={2}>
                  {quotations.map((quotation) => (
                    <Grid item xs={12} key={quotation.id}>
                      <Paper sx={{ p: 2, border: 1, borderColor: 'divider' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {quotation.quotation_number}
                          </Typography>
                          <Chip
                            label={quotation.status}
                            color={quotation.status === 'approved' ? 'success' : quotation.status === 'rejected' ? 'error' : 'info'}
                            size="small"
                          />
                        </Box>
                        
                        <Grid container spacing={2}>
                          <Grid item xs={6} sm={3}>
                            <Typography variant="body2" color="textSecondary">
                              Labour Cost
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              GHS {quotation.labour_cost}
                            </Typography>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Typography variant="body2" color="textSecondary">
                              Materials Cost
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              GHS {quotation.materials_cost}
                            </Typography>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Typography variant="body2" color="textSecondary">
                              Travel Cost
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              GHS {quotation.travel_cost}
                            </Typography>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Typography variant="body2" color="textSecondary">
                              Total
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                              GHS {quotation.total}
                            </Typography>
                          </Grid>
                        </Grid>

                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleViewQuotation(quotation.id)}
                          sx={{ mt: 2 }}
                        >
                          View Details
                        </Button>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Quick Actions
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {job.status === 'completed' && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleRateJob}
                    fullWidth
                  >
                    Rate Service Provider
                  </Button>
                )}
                
                {quotations.length > 0 && (
                  <Button
                    variant="outlined"
                    onClick={() => handleViewQuotation(quotations[0].id)}
                    fullWidth
                  >
                    View Latest Quotation
                  </Button>
                )}
                
                <Button
                  variant="outlined"
                  onClick={() => navigate('/customer/jobs/new')}
                  fullWidth
                >
                  Create New Job
                </Button>
                
                <Button
                  variant="outlined"
                  onClick={() => navigate('/customer/dashboard')}
                  fullWidth
                >
                  Back to Dashboard
                </Button>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Status Timeline
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'success.main' }} />
                  <Typography variant="body2">
                    Created: {new Date(job.created_at).toLocaleString()}
                  </Typography>
                </Box>
                
                {job.scheduled_date && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: job.status !== 'new' ? 'success.main' : 'grey.300' }} />
                    <Typography variant="body2">
                      Scheduled: {new Date(job.scheduled_date).toLocaleString()}
                    </Typography>
                  </Box>
                )}
                
                {job.status !== 'new' && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'success.main' }} />
                    <Typography variant="body2">
                      {job.status === 'assigned' ? 'Assigned to ISP' : job.status === 'in_progress' ? 'In Progress' : job.status === 'completed' ? 'Completed' : 'Updated'}
                    </Typography>
                  </Box>
                )}
                
                {job.completed_date && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'success.main' }} />
                    <Typography variant="body2">
                      Completed: {new Date(job.completed_date).toLocaleString()}
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Live Tracking for active jobs */}
          {(job.status === 'en_route' || job.status === 'in_progress') && (
            <Card>
              <CardContent>
                <LiveTrackingMap 
                  jobId={job.id} 
                  customerLocation={job.gps_coords ? (typeof job.gps_coords === 'string' ? JSON.parse(job.gps_coords) : job.gps_coords) : undefined}
                />
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default CustomerJobDetails;