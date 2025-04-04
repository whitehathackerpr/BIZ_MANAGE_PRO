import React from 'react';
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  MonetizationOn as MoneyIcon,
  ShoppingCart as CartIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { useNotification } from '../../../contexts/NotificationContext';
import branchApi from '../../../services/branchApi';

const BranchPerformance = ({ branchId }) => {
  const [performance, setPerformance] = useState<Type>(null);
  const [loading, setLoading] = useState<Type>(true);
  const [error, setError] = useState<Type>(null);
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchPerformance();
  }, [branchId]);

  const fetchPerformance = async () => {
    try {
      const data = await branchApi.getBranchPerformance(branchId);
      setPerformance(data);
    } catch (err) {
      setError('Failed to fetch branch performance data');
      showNotification('Failed to fetch branch performance data', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  const metrics = [
    {
      title: 'Total Revenue',
      value: performance?.totalRevenue || 0,
      change: performance?.revenueChange || 0,
      icon: <MoneyIcon sx={{ fontSize: 40 }} />,
      color: '#00F5FF',
      progress: 75,
    },
    {
      title: 'Orders',
      value: performance?.totalOrders || 0,
      change: performance?.ordersChange || 0,
      icon: <CartIcon sx={{ fontSize: 40 }} />,
      color: '#FF2E63',
      progress: 60,
    },
    {
      title: 'Customers',
      value: performance?.totalCustomers || 0,
      change: performance?.customersChange || 0,
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      color: '#00F5FF',
      progress: 45,
    },
    {
      title: 'Conversion Rate',
      value: `${performance?.conversionRate || 0}%`,
      change: performance?.conversionChange || 0,
      icon: <AssessmentIcon sx={{ fontSize: 40 }} />,
      color: '#FF2E63',
      progress: 90,
    },
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" className="gradient-text">
          Branch Performance
        </Typography>
        <Tooltip title="More options">
          <IconButton>
            <MoreVertIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Grid container spacing={3}>
        {metrics.map((metric) => (
          <Grid item xs={12} sm={6} md={3} key={metric.title}>
            <Card className="glass">
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      {metric.title}
                    </Typography>
                    <Typography variant="h4" component="div" sx={{ mb: 1 }}>
                      {metric.value}
                    </Typography>
                    <Box display="flex" alignItems="center">
                      {metric.change >= 0 ? (
                        <TrendingUpIcon sx={{ color: '#00F5FF', mr: 0.5 }} />
                      ) : (
                        <TrendingDownIcon sx={{ color: '#FF2E63', mr: 0.5 }} />
                      )}
                      <Typography
                        variant="body2"
                        sx={{
                          color: metric.change >= 0 ? '#00F5FF' : '#FF2E63',
                        }}
                      >
                        {Math.abs(metric.change)}%
                        {metric.change >= 0 ? ' increase' : ' decrease'}
                      </Typography>
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      color: metric.color,
                      opacity: 0.8,
                    }}
                  >
                    {metric.icon}
                  </Box>
                </Box>
                <Box sx={{ mt: 2 }}>
                  <LinearProgress
                    variant="determinate"
                    value={metric.progress}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: metric.color,
                      },
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

        <Grid item xs={12}>
          <Paper className="glass" sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Sales Target Progress
            </Typography>
            <Box sx={{ height: 300 }}>
              <Line
                data={{
                  labels: performance?.salesData?.labels || [],
                  datasets: [
                    {
                      label: 'Actual Sales',
                      data: performance?.salesData?.actual || [],
                      borderColor: '#00F5FF',
                      backgroundColor: 'rgba(0, 245, 255, 0.1)',
                      tension: 0.4,
                      fill: true,
                    },
                    {
                      label: 'Target',
                      data: performance?.salesData?.target || [],
                      borderColor: '#FF2E63',
                      backgroundColor: 'rgba(255, 46, 99, 0.1)',
                      tension: 0.4,
                      fill: true,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top',
                      labels: {
                        color: 'rgba(255, 255, 255, 0.7)',
                      },
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                      },
                      ticks: {
                        color: 'rgba(255, 255, 255, 0.7)',
                      },
                    },
                    x: {
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                      },
                      ticks: {
                        color: 'rgba(255, 255, 255, 0.7)',
                      },
                    },
                  },
                }}
              />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper className="glass" sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Top Products
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell align="right">Sales</TableCell>
                    <TableCell align="right">Revenue</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {performance?.topProducts?.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell align="right">{product.sales}</TableCell>
                      <TableCell align="right">${product.revenue}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper className="glass" sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Performance Metrics
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Metric</TableCell>
                    <TableCell align="right">Value</TableCell>
                    <TableCell align="right">Change</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {performance?.metrics?.map((metric) => (
                    <TableRow key={metric.name}>
                      <TableCell>{metric.name}</TableCell>
                      <TableCell align="right">{metric.value}</TableCell>
                      <TableCell align="right">
                        <Typography
                          sx={{
                            color: metric.change >= 0 ? '#00F5FF' : '#FF2E63',
                          }}
                        >
                          {metric.change >= 0 ? '+' : ''}{metric.change}%
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BranchPerformance; 