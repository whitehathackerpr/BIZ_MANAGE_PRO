import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  LinearProgress
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  Receipt as ReceiptIcon,
  Warning as WarningIcon,
  Star as StarIcon
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import api from '../services/api';
import { Metrics, Sale, StockItem, Feedback, SalesData } from '../types';

const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [lowStock, setLowStock] = useState<StockItem[]>([]);
  const [recentFeedback, setRecentFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [metricsResponse, salesResponse, stockResponse, feedbackResponse] = await Promise.all([
        api.get<{ data: Metrics }>('/api/analytics/metrics'),
        api.get<{ data: Sale[] }>('/api/sales/recent'),
        api.get<{ data: StockItem[] }>('/api/products/low-stock'),
        api.get<{ data: Feedback[] }>('/api/customers/feedback/recent')
      ]);

      setMetrics(metricsResponse.data.data);
      setRecentSales(salesResponse.data.data);
      setLowStock(stockResponse.data.data);
      setRecentFeedback(feedbackResponse.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LinearProgress />;
  }

  const salesData: SalesData[] = recentSales.map(sale => ({
    date: new Date(sale.created_at).toLocaleDateString(),
    amount: sale.total_amount
  }));

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
            <TrendingUpIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
            <Box>
              <Typography variant="h6">Total Revenue</Typography>
              <Typography variant="h4">${metrics?.total_revenue || 0}</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
            <PeopleIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
            <Box>
              <Typography variant="h6">Total Customers</Typography>
              <Typography variant="h4">{metrics?.total_customers || 0}</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
            <InventoryIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
            <Box>
              <Typography variant="h6">Total Products</Typography>
              <Typography variant="h4">{metrics?.total_products || 0}</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
            <ReceiptIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
            <Box>
              <Typography variant="h6">Total Sales</Typography>
              <Typography variant="h4">{metrics?.total_sales || 0}</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Sales Chart */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Recent Sales
        </Typography>
        <Box sx={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="amount" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </Paper>

      {/* Recent Activities */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Low Stock Items
            </Typography>
            <List>
              {lowStock.map((item) => (
                <React.Fragment key={item.id}>
                  <ListItem>
                    <ListItemIcon>
                      <WarningIcon color="warning" />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.name}
                      secondary={`Quantity: ${item.quantity} (Threshold: ${item.min_quantity})`}
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Customer Feedback
            </Typography>
            <List>
              {recentFeedback.map((feedback) => (
                <React.Fragment key={feedback.id}>
                  <ListItem>
                    <ListItemIcon>
                      <StarIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={feedback.product_name}
                      secondary={`Rating: ${feedback.rating}/5 - ${feedback.comment}`}
                    />
                  </ListItem>
                  <Divider />
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