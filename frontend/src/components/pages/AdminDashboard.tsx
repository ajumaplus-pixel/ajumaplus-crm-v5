import React, { useState } from 'react';
import { Box, Container, Typography, Paper, Tabs, Tab, Card, CardContent, Button } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import AnalyticsDashboard from '../analytics/AnalyticsDashboard';

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
          <Tab label="Analytics Dashboard" />
          <Tab label="Jobs Management" />
          <Tab label="Customer Profiles" />
          <Tab label="ISP Profiles" />
          <Tab label="Payments" />
          <Tab label="User Management" />
          <Tab label="Reports" />
        </Tabs>

        {/* Analytics Dashboard Tab */}
        <TabPanel value={tabValue} index={0}>
          <AnalyticsDashboard />
        </TabPanel>

        {/* Jobs Management Tab */}
        <TabPanel value={tabValue} index={1}>
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
        <TabPanel value={tabValue} index={2}>
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
        <TabPanel value={tabValue} index={3}>
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
        <TabPanel value={tabValue} index={4}>
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
                  {payment.customer} - {payment.currency} {payment.amount.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Status: {payment.status} | Date: {payment.date}
                </Typography>
              </Box>
            ))}
          </Paper>
        </TabPanel>

        {/* User Management Tab */}
        <TabPanel value={tabValue} index={5}>
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
        <TabPanel value={tabValue} index={6}>
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
              Report generation features coming soon...
            </Typography>
          </Paper>
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default AdminDashboard;