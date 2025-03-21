import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  ShoppingCart as ShoppingCartIcon,
  People as PeopleIcon,
  AttachMoney as AttachMoneyIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import './Analytics.css';

const Analytics = () => {
  // Mock data for charts
  const revenueData = [
    { name: 'Jan', value: 4000 },
    { name: 'Feb', value: 3000 },
    { name: 'Mar', value: 5000 },
    { name: 'Apr', value: 4500 },
    { name: 'May', value: 6000 },
    { name: 'Jun', value: 5500 },
  ];

  const salesData = [
    { name: 'Mon', value: 2400 },
    { name: 'Tue', value: 1398 },
    { name: 'Wed', value: 9800 },
    { name: 'Thu', value: 3908 },
    { name: 'Fri', value: 4800 },
    { name: 'Sat', value: 3800 },
    { name: 'Sun', value: 4300 },
  ];

  const stats = [
    {
      title: 'Total Revenue',
      value: '$45,231',
      change: '+12%',
      icon: <TrendingUpIcon />,
      color: '#1976d2',
    },
    {
      title: 'Total Orders',
      value: '1,234',
      change: '+8%',
      icon: <ShoppingCartIcon />,
      color: '#2e7d32',
    },
    {
      title: 'New Customers',
      value: '89',
      change: '+15%',
      icon: <PeopleIcon />,
      color: '#ed6c02',
    },
    {
      title: 'Average Order Value',
      value: '$36.67',
      change: '+5%',
      icon: <AttachMoneyIcon />,
      color: '#9c27b0',
    },
  ];

  return (
    <Box className="analytics-container">
      <Typography variant="h4" component="h1" className="analytics-title">
        Analytics Dashboard
      </Typography>

      <Grid container spacing={3}>
        {stats.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.title}>
            <Card className="stat-card">
              <CardContent>
                <Box className="stat-icon" sx={{ color: stat.color }}>
                  {stat.icon}
                </Box>
                <Typography variant="h6" component="div">
                  {stat.title}
                </Typography>
                <Typography variant="h4" component="div" className="stat-value">
                  {stat.value}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  className="stat-change"
                >
                  {stat.change} from last month
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}

        <Grid item xs={12} md={8}>
          <Paper className="chart-paper">
            <Typography variant="h6" component="h2" className="chart-title">
              Revenue Overview
            </Typography>
            <Box className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#1976d2"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper className="chart-paper">
            <Typography variant="h6" component="h2" className="chart-title">
              Daily Sales
            </Typography>
            <Box className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#2e7d32" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Analytics; 