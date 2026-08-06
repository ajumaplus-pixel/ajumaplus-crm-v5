import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Paper, Tabs, Tab, Card, CardContent, Button, Grid, CircularProgress } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import AnalyticsDashboard from '../analytics/AnalyticsDashboard';
import JobMap from '../maps/JobMap';
import ISPMap from '../maps/ISPMap';
import api from '../../services/api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const AdminDashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const { user } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [isps, setISPs] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Get all jobs
      const jobsResponse = await api.get('/api/jobs');
      setJobs(jobsResponse.data.data || []);
      
      // Get all ISPs
      const ispsResponse = await api.get('/api/isps/all');
      setISPs(ispsResponse.data.data || []);
      
      // Get assignment suggestions
      const suggestionsResponse = await api.get('/api/matching/suggestions');
      setSuggestions(suggestionsResponse.data.data || []);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveAssignment = async (jobId: string, ispId: string) => {
    try {
      await api.post('/api/matching/approve', { job_id: jobId, isp_id });
      loadDashboardData();
    } catch (error) {
      console.error('Failed to approve assignment:', error);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Mock data for demonstration
  const stats = {
    totalJobs: 45,
    inProgress: 12,
    completed: 28,
    pending: 5,
    totalCustomers: 156,
    totalISPs: 23,
    totalPayments: 89,
    revenue: 45670, // in GHS
  };

  const recentJobs = [
    { id: 1, customer: 'Kwame Mensah', service: 'Electrical', location: 'Accra', status: 'In Progress', date: '2026-08-04' },
    { id: 2, customer: 'Ama Serwah', service: 'Plumbing', location: 'Kumasi', status: 'Pending', date: '2026-08-04' },
    { id: 3, customer: 'Kojo Asante', service: 'Solar Installation', location: 'Takoradi', status: 'Completed', date: '2026-08-03' },
  ];

  const recentPayments = [
    { id: 1, customer: 'Kwame Mensah', amount: 450, currency: 'GHS', status: 'Completed', date: '2026-08-04' },
    { id: 2, customer: 'Ama Serwah', amount: 320, currency: 'GHS', status: 'Pending', date: '2026-08-04' },
  ];

  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#1A1A1A' }}>
          Admin Dashboard
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Welcome, {user?.username} | Role: {user?.role} | System: AjumaPlus CRM Ghana
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 4 }}>
        <Card sx={{ flex: 1, minWidth: 200 }}>
          <CardContent>
            <Typography variant="h6" color="textSecondary" sx={{ fontWeight: 500 }}>
              Total Jobs
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {stats.totalJobs}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, minWidth: 200 }}>
          <CardContent>
            <Typography variant="h6" color="textSecondary" sx={{ fontWeight: 500 }}>
              In Progress
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
              {stats.inProgress}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, minWidth: 200 }}>
          <CardContent>
            <Typography variant="h6" color="textSecondary" sx={{ fontWeight: 500 }}>
              Total Customers
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {stats.totalCustomers}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, minWidth: 200 }}>
          <CardContent>
            <Typography variant="h6" color="textSecondary" sx={{ fontWeight: 500 }}>
              Total ISPs
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {stats.totalISPs}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, minWidth: 200 }}>
          <CardContent>
            <Typography variant="h6" color="textSecondary" sx={{ fontWeight: 500 }}>
              Total Revenue
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>
              GHS {stats.revenue.toLocaleString()}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Main Content Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Job Map View" />
          <Tab label="ISP Availability Map" />
          <Tab label="Auto Assignments" />
          <Tab label="Analytics Dashboard" />
          <Tab label="Jobs Management" />
          <Tab label="Customer Profiles" />
          <Tab label="ISP Profiles" />
          <Tab label="Payments" />
          <Tab label="User Management" />
          <Tab label="Reports" />
        </Tabs>

        {/* Job Map Tab */}
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>
            Job Requests Map
          </Typography>
          {isLoading ? (
            <CircularProgress />
          ) : (
            <JobMap jobs={jobs} isps={isps} />
          )}
        </TabPanel>

        {/* ISP Availability Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            ISP Service Coverage Map
          </Typography>
          {isLoading ? (
            <CircularProgress />
          ) : (
            <ISPMap isps={isps} showServiceAreas={true} />
          )}
        </TabPanel>

        {/* Auto Assignments Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Suggested Job Assignments
          </Typography>
          {isLoading ? (
            <CircularProgress />
          ) : suggestions.length === 0 ? (
            <Typography variant="body2" color="textSecondary">
              No pending jobs for assignment
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {suggestions.map((suggestion) => (
                <Grid item xs={12} key={suggestion.job.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {suggestion.job.job_number} - {suggestion.job.category}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {suggestion.job.description}
                      </Typography>
                      
                      <Typography variant="h6" sx={{ mt: 2 }}>
                        Top Matching ISPs:
                      </Typography>
                      {suggestion.matches.map((match) => (
                        <Box
                          key={match.isp_id}
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 1,
                            p: 2,
                            bgcolor: 'grey.50',
                            borderRadius: 1
                          }}
                        >
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {match.isp_name}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              Score: {match.score}/100 | Distance: {match.distance ? match.distance.toFixed(1) : 'N/A'}km
                            </Typography>
                          </Box>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleApproveAssignment(suggestion.job.id, match.isp_id)}
                          >
                            Assign
                          </Button>
                        </Box>
                      ))}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        {/* Analytics Dashboard Tab */}
        <TabPanel value={tabValue} index={3}>
          <AnalyticsDashboard />
        </TabPanel>

        {/* Jobs Management Tab */}
        <TabPanel value={tabValue} index={4}>
          <Typography variant="h6" gutterBottom>
            Jobs Management
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Button variant="contained" sx={{ mr: 2 }}>
              View All Jobs
            </Button>
            <Button variant="outlined">
              Create Job
            </Button>
          </Box>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Recent Jobs
            </Typography>
            {recentJobs.map((job) => (
              <Box key={job.id} sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 2, borderLeft: 4, borderColor: 'primary.main' }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {job.customer} - {job.service}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Location: {job.location} | Status: {job.status} | Date: {job.date}
                </Typography>
              </Box>
            ))}
          </Paper>
        </TabPanel>

        {/* Customer Profiles Tab */}
        <TabPanel value={tabValue} index={5}>
          <Typography variant="h6" gutterBottom>
            Customer Profiles
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Button variant="contained" sx={{ mr: 2 }}>
              View All Customers
            </Button>
            <Button variant="outlined">
              Add Customer
            </Button>
          </Box>
          <Paper sx={{ p: 2 }}>
            <Typography variant="body2" color="textSecondary">
              Customer management features coming soon...
            </Typography>
          </Paper>
        </TabPanel>

        {/* ISP Profiles Tab */}
        <TabPanel value={tabValue} index={6}>
          <Typography variant="h6" gutterBottom>
            ISP Profiles
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Button variant="contained" sx={{ mr: 2 }}>
              View All ISPs
            </Button>
            <Button variant="outlined">
              Add ISP
            </Button>
          </Box>
          <Paper sx={{ p: 2 }}>
            <Typography variant="body2" color="textSecondary">
              ISP management features coming soon...
            </Typography>
          </Paper>
        </TabPanel>

        {/* Payments Tab */}
        <TabPanel value={tabValue} index={7}>
          <Typography variant="h6" gutterBottom>
            Payments
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Button variant="contained" sx={{ mr: 2 }}>
              View All Payments
            </Button>
            <Button variant="outlined">
              Add Payment
            </Button>
          </Box>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Recent Payments
            </Typography>
            {recentPayments.map((payment) => (
              <Box key={payment.id} sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 2, borderLeft: 4, borderColor: 'secondary.main' }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {payment.customer} - {payment.amount} {payment.currency}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Status: {payment.status} | Date: {payment.date}
                </Typography>
              </Box>
            ))}
          </Paper>
        </TabPanel>

        {/* User Management Tab */}
        <TabPanel value={tabValue} index={8}>
          <Typography variant="h6" gutterBottom>
            User Management
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Button variant="contained" sx={{ mr: 2 }}>
              View All Users
            </Button>
            <Button variant="outlined">
              Add User
            </Button>
          </Box>
          <Paper sx={{ p: 2 }}>
            <Typography variant="body2" color="textSecondary">
              User management features coming soon...
            </Typography>
          </Paper>
        </TabPanel>

        {/* Reports Tab */}
        <TabPanel value={tabValue} index={9}>
          <Typography variant="h6" gutterBottom>
            Reports
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Button variant="contained" sx={{ mr: 2 }}>
              Generate Report
            </Button>
            <Button variant="outlined">
              Export Data
            </Button>
          </Box>
          <Paper sx={{ p: 2 }}>
            <Typography variant="body2" color="textSecondary">
              Reporting features coming soon...
            </Typography>
          </Paper>
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default AdminDashboard;