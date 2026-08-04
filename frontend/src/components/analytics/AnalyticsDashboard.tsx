import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AttachMoney,
  People,
  Assignment
} from '@mui/icons-material';
import api from '../../services/api';

interface DashboardStats {
  totalJobs: number;
  statusCounts: {
    new: number;
    assigned: number;
    in_progress: number;
    completed: number;
    cancelled: number;
  };
  categoryCounts: Record<string, number>;
  ispAvailability: {
    total: number;
    available: number;
    busy: number;
  };
  revenueData: {
    currentRevenue: number;
    projectedRevenue: number;
    growthRate: number;
  };
}

const AnalyticsDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/analytics/dashboard');
      setStats(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!stats) {
    return null;
  }

  const StatCard = ({ title, value, icon, color, trend, trendValue }: any) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color }}>
              {value}
            </Typography>
            {trend && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {trend === 'up' ? (
                  <TrendingUp sx={{ fontSize: 16, color: 'success.main', mr: 0.5 }} />
                ) : (
                  <TrendingDown sx={{ fontSize: 16, color: 'error.main', mr: 0.5 }} />
                )}
                <Typography variant="body2" color={trend === 'up' ? 'success.main' : 'error.main'}>
                  {trendValue}%
                </Typography>
              </Box>
            )}
          </Box>
          <Box sx={{ fontSize: 48, color: color, opacity: 0.2 }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
        Analytics Dashboard
      </Typography>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Jobs"
            value={stats.totalJobs}
            icon={<Assignment />}
            color="primary.main"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Current Revenue"
            value={`₵${stats.revenueData.currentRevenue.toLocaleString()}`}
            icon={<AttachMoney />}
            color="success.main"
            trend="up"
            trendValue={stats.revenueData.growthRate}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Projected Revenue"
            value={`₵${stats.revenueData.projectedRevenue.toLocaleString()}`}
            icon={<TrendingUp />}
            color="info.main"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Available ISPs"
            value={`${stats.ispAvailability.available}/${stats.ispAvailability.total}`}
            icon={<People />}
            color="warning.main"
          />
        </Grid>
      </Grid>

      {/* Job Status Breakdown */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Job Status Breakdown
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Chip label={`New: ${stats.statusCounts.new}`} color="default" />
                <Chip label={`Assigned: ${stats.statusCounts.assigned}`} color="primary" />
                <Chip label={`In Progress: ${stats.statusCounts.in_progress}`} color="info" />
                <Chip label={`Completed: ${stats.statusCounts.completed}`} color="success" />
                <Chip label={`Cancelled: ${stats.statusCounts.cancelled}`} color="error" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Service Categories
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {Object.entries(stats.categoryCounts).map(([category, count]) => (
                  <Chip
                    key={category}
                    label={`${category}: ${count}`}
                    variant="outlined"
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ISP Availability */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            ISP Availability Status
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 4 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main">
                  {stats.ispAvailability.available}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Available
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 4 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="warning.main">
                  {stats.ispAvailability.busy}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Busy
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 4 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="textSecondary">
                  {stats.ispAvailability.total - stats.ispAvailability.available - stats.ispAvailability.busy}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Offline
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AnalyticsDashboard;