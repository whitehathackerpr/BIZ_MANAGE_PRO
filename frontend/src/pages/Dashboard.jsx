import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  LinearProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  ShoppingCart as SalesIcon,
  Inventory as InventoryIcon,
  People as EmployeesIcon,
  Warning as WarningIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend
);

const StatCard = ({ title, value, icon, color }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box
          sx={{
            backgroundColor: `${color}15`,
            borderRadius: '50%',
            p: 1,
            mr: 2,
          }}
        >
          {icon}
        </Box>
        <Typography variant="h6" component="div">
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" component="div" sx={{ mb: 1 }}>
        {value}
      </Typography>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const { data: salesData, isLoading: salesLoading } = useQuery({
    queryKey: ['sales-analytics'],
    queryFn: async () => {
      const response = await axios.get('/api/analytics/sales');
      return response.data;
    },
  });

  const { data: inventoryData, isLoading: inventoryLoading } = useQuery({
    queryKey: ['inventory-analytics'],
    queryFn: async () => {
      const response = await axios.get('/api/analytics/inventory');
      return response.data;
    },
  });

  const stats = [
    {
      title: 'Total Sales',
      value: '$12,345',
      change: '+12.5%',
      icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
      color: '#00F5FF',
      progress: 75,
    },
    {
      title: 'Orders',
      value: '123',
      change: '+8.2%',
      icon: <SalesIcon sx={{ fontSize: 40 }} />,
      color: '#FF2E63',
      progress: 60,
    },
    {
      title: 'Inventory Items',
      value: '456',
      change: '-3.1%',
      icon: <InventoryIcon sx={{ fontSize: 40 }} />,
      color: '#00F5FF',
      progress: 45,
    },
    {
      title: 'Employees',
      value: '25',
      change: '+5.0%',
      icon: <EmployeesIcon sx={{ fontSize: 40 }} />,
      color: '#FF2E63',
      progress: 90,
    },
  ];

  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Sales',
        data: [12000, 19000, 15000, 25000, 22000, 30000, 28000],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Weekly Sales Trend',
      },
    },
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" className="gradient-text">
          Dashboard
        </Typography>
        <Tooltip title="More options">
          <IconButton>
            <MoreVertIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Grid container spacing={3}>
        {stats.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.title}>
            <Card className="glass">
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" component="div" sx={{ mb: 1 }}>
                      {stat.value}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: stat.change.startsWith('+') ? '#00F5FF' : '#FF2E63',
                      }}
                    >
                      {stat.change}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      color: stat.color,
                      opacity: 0.8,
                    }}
                  >
                    {stat.icon}
                  </Box>
                </Box>
                <Box sx={{ mt: 2 }}>
                  <LinearProgress
                    variant="determinate"
                    value={stat.progress}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: stat.color,
                      },
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* Sales Chart */}
        <Grid item xs={12} md={8}>
          <Paper className="glass" sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Sales Overview
            </Typography>
            <Box sx={{ height: 300 }}>
              <Line options={chartOptions} data={chartData} />
            </Box>
          </Paper>
        </Grid>

        {/* Recent Activities */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Recent Activities
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <SalesIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="New Sale"
                  secondary="Order #1234 - $299.99"
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <InventoryIcon color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="Stock Update"
                  secondary="Product: iPhone 13 - Added 50 units"
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <WarningIcon color="error" />
                </ListItemIcon>
                <ListItemText
                  primary="Low Stock Alert"
                  secondary="Product: MacBook Pro - Only 5 units left"
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <EmployeesIcon color="warning" />
                </ListItemIcon>
                <ListItemText
                  primary="Employee Update"
                  secondary="John Doe marked as present"
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Low Stock Alerts */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Low Stock Alerts
            </Typography>
            <Grid container spacing={2}>
              {inventoryData?.low_stock_items?.map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        {item.name}
                      </Typography>
                      <Typography color="text.secondary">
                        Current Stock: {item.quantity}
                      </Typography>
                      <Typography color="text.secondary">
                        Minimum Required: {item.min_quantity}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 