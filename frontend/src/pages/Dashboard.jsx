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
  useTheme,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  ShoppingCart as OrdersIcon,
  People as CustomersIcon,
  Inventory as InventoryIcon,
  AttachMoney as RevenueIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock data for the dashboard
const metrics = [
  { title: 'Total Revenue', value: '$45,231', change: '+12%', icon: <RevenueIcon />, color: '#1976d2' },
  { title: 'Total Orders', value: '1,234', change: '+8%', icon: <OrdersIcon />, color: '#2e7d32' },
  { title: 'Total Customers', value: '856', change: '+15%', icon: <CustomersIcon />, color: '#ed6c02' },
  { title: 'Low Stock Items', value: '12', change: '-3%', icon: <WarningIcon />, color: '#d32f2f' },
];

const recentOrders = [
  { id: 1, customer: 'John Doe', amount: '$123.45', status: 'Completed', date: '2024-02-20' },
  { id: 2, customer: 'Jane Smith', amount: '$234.56', status: 'Processing', date: '2024-02-19' },
  { id: 3, customer: 'Mike Johnson', amount: '$345.67', status: 'Pending', date: '2024-02-18' },
  { id: 4, customer: 'Sarah Williams', amount: '$456.78', status: 'Completed', date: '2024-02-17' },
];

const salesData = [
  { name: 'Jan', sales: 4000 },
  { name: 'Feb', sales: 3000 },
  { name: 'Mar', sales: 5000 },
  { name: 'Apr', sales: 4500 },
  { name: 'May', sales: 6000 },
  { name: 'Jun', sales: 5500 },
];

const Dashboard = () => {
  const theme = useTheme();

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed':
        return <CheckCircleIcon color="success" />;
      case 'Processing':
        return <ScheduleIcon color="warning" />;
      case 'Pending':
        return <WarningIcon color="error" />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      {/* Metrics Grid */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {metrics.map((metric) => (
          <Grid item xs={12} sm={6} md={3} key={metric.title}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      backgroundColor: metric.color + '20',
                      borderRadius: 1,
                      p: 1,
                      mr: 2,
                    }}
                  >
                    {React.cloneElement(metric.icon, { sx: { color: metric.color } })}
                  </Box>
                  <Box>
                    <Typography variant="h6" component="div">
                      {metric.value}
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                      {metric.title}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TrendingUpIcon
                    sx={{
                      color: metric.change.startsWith('+') ? 'success.main' : 'error.main',
                      mr: 0.5,
                    }}
                  />
                  <Typography
                    variant="body2"
                    color={metric.change.startsWith('+') ? 'success.main' : 'error.main'}
                  >
                    {metric.change}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts and Recent Orders */}
      <Grid container spacing={3}>
        {/* Sales Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Sales Overview
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke={theme.palette.primary.main}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Recent Orders */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Recent Orders
            </Typography>
            <List>
              {recentOrders.map((order, index) => (
                <React.Fragment key={order.id}>
                  <ListItem>
                    <ListItemIcon>{getStatusIcon(order.status)}</ListItemIcon>
                    <ListItemText
                      primary={order.customer}
                      secondary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">
                            {order.amount}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {order.date}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < recentOrders.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 