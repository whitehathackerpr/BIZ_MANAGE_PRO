import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../app';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Inventory as InventoryIcon,
  ShowChart as ShowChartIcon,
  AttachMoney as AttachMoneyIcon,
  Psychology as PsychologyIcon,
  Warning as WarningIcon,
  LocalShipping as LocalShippingIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import api from '../api';

interface SalesPrediction {
  date: string;
  predicted_sales: number;
  confidence: number;
}

interface InventoryAlert {
  product_id: number;
  product_name: string;
  current_stock: number;
  days_until_stockout: number;
  reorder_recommendation: boolean;
}

interface MLAnalyticsData {
  business_id: number;
  sales_prediction: {
    next_7_days: number;
    confidence: number;
    daily: SalesPrediction[];
  };
  financial_forecast: {
    next_30_days_revenue: number;
    confidence: number;
  };
  inventory_alerts: {
    low_stock_count: number;
    products: InventoryAlert[];
  };
}

// Dashboard Statistics Component
const StatsCard: React.FC<{
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down';
  trendValue?: string;
  color?: string;
  confidence?: number;
}> = ({ title, value, icon, trend, trendValue, color = 'primary.main', confidence }) => {
  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>
              {title}
            </Typography>
            <Typography variant="h5" fontWeight={600} sx={{ mb: 1 }}>
              {value}
            </Typography>
            {trend && (
              <Box display="flex" alignItems="center">
                {trend === 'up' ? (
                  <TrendingUpIcon fontSize="small" sx={{ color: 'success.main', mr: 0.5 }} />
                ) : (
                  <TrendingDownIcon fontSize="small" sx={{ color: 'error.main', mr: 0.5 }} />
                )}
                <Typography variant="caption" sx={{ 
                  color: trend === 'up' ? 'success.main' : 'error.main',
                  fontWeight: 500 
                }}>
                  {trendValue}
                </Typography>
              </Box>
            )}
            {confidence !== undefined && (
              <Box mt={1}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', mr: 1 }}>
                    Confidence
                  </Typography>
                  <Typography variant="caption" fontWeight={500} sx={{ 
                    color: confidence >= 0.8 ? 'success.main' : 
                           confidence >= 0.6 ? 'warning.main' : 'error.main'
                  }}>
                    {(confidence * 100).toFixed(0)}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate"
                  value={confidence * 100}
                  sx={{ 
                    height: 4, 
                    borderRadius: 2,
                    bgcolor: 'grey.100',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: confidence >= 0.8 ? 'success.main' : 
                              confidence >= 0.6 ? 'warning.main' : 'error.main'
                    }
                  }}
                />
              </Box>
            )}
          </Box>
          <Avatar 
            sx={{ 
              bgcolor: `${color}15`, 
              color: color,
              width: 48,
              height: 48
            }}
          >
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
};

// Simple Bar Chart Component
const BarChart: React.FC<{
  data: SalesPrediction[];
}> = ({ data }) => {
  const maxSales = Math.max(...data.map(d => d.predicted_sales));
  
  return (
    <Box sx={{ display: 'flex', height: 180, alignItems: 'flex-end', pt: 2 }}>
      {data.map((day, index) => (
        <Box
          key={index}
          sx={{
            flexGrow: 1,
            mx: 0.5,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Box 
            sx={{
              height: `${(day.predicted_sales / maxSales) * 100}%`,
              width: '100%',
              bgcolor: 'primary.main',
              borderRadius: '4px 4px 0 0',
              minHeight: 30,
              transition: 'height 0.3s ease-in-out',
              '&:hover': {
                bgcolor: 'primary.dark',
              }
            }}
          />
          <Tooltip title={`$${day.predicted_sales.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}>
            <Typography variant="caption" sx={{ mt: 1, fontWeight: 500 }}>
              {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
            </Typography>
          </Tooltip>
        </Box>
      ))}
    </Box>
  );
};

const Dashboard: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const [analytics, setAnalytics] = useState<MLAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const businessId = 1; // Use actual business ID from user context in a real application

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // In a real application, replace with actual API call
        // const response = await api.get(`/api/v1/ml-analytics/dashboard-analytics/${businessId}`);
        // setAnalytics(response.data);
        
        // Mock data for demonstration
        const mockData: MLAnalyticsData = {
          business_id: businessId,
          sales_prediction: {
            next_7_days: 8750.25,
            confidence: 0.82,
            daily: [
              { date: '2023-06-01', predicted_sales: 1250.45, confidence: 0.82 },
              { date: '2023-06-02', predicted_sales: 1320.78, confidence: 0.82 },
              { date: '2023-06-03', predicted_sales: 905.12, confidence: 0.82 },
              { date: '2023-06-04', predicted_sales: 1128.33, confidence: 0.82 },
              { date: '2023-06-05', predicted_sales: 1440.21, confidence: 0.82 },
              { date: '2023-06-06', predicted_sales: 1380.90, confidence: 0.82 },
              { date: '2023-06-07', predicted_sales: 1324.46, confidence: 0.82 }
            ]
          },
          financial_forecast: {
            next_30_days_revenue: 35420.75,
            confidence: 0.78
          },
          inventory_alerts: {
            low_stock_count: 5,
            products: [
              { product_id: 1, product_name: 'Premium Headphones', current_stock: 5, days_until_stockout: 3, reorder_recommendation: true },
              { product_id: 2, product_name: 'Wireless Mouse', current_stock: 8, days_until_stockout: 5, reorder_recommendation: true },
              { product_id: 3, product_name: 'USB-C Cable', current_stock: 12, days_until_stockout: 6, reorder_recommendation: true },
              { product_id: 4, product_name: 'Bluetooth Speaker', current_stock: 4, days_until_stockout: 2, reorder_recommendation: true },
              { product_id: 5, product_name: 'Power Bank', current_stock: 7, days_until_stockout: 4, reorder_recommendation: true }
            ]
          }
        };
        
        setAnalytics(mockData);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch analytics data');
        setLoading(false);
      }
    };

    fetchData();
  }, [businessId]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', py: 8 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Error loading dashboard data: {error}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Page Title */}
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 700 }}>
        Business Dashboard
      </Typography>
      
      {/* AI Insights Banner */}
      <Alert 
        severity="info" 
        icon={<PsychologyIcon fontSize="inherit" />}
        sx={{ 
          mb: 4, 
          borderRadius: 2,
          backgroundColor: 'primary.light',
          color: 'white',
          '& .MuiAlert-icon': {
            color: 'white'
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="subtitle1" fontWeight={600} color="white">
              AI-Powered Business Insights
            </Typography>
            <Typography variant="body2" color="white">
              Our machine learning algorithms analyze your data to provide actionable insights and predictions.
            </Typography>
          </Box>
          <Button 
            variant="outlined" 
            size="small" 
            sx={{ 
              borderColor: 'white', 
              color: 'white',
              '&:hover': {
                borderColor: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
            startIcon={<RefreshIcon />}
          >
            Refresh Insights
          </Button>
        </Box>
      </Alert>
      
      {/* Stats Cards */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        <Box sx={{ flex: '1 1 calc(33.333% - 16px)', minWidth: 280 }}>
          <StatsCard 
            title="Weekly Sales Prediction" 
            value={formatCurrency(analytics?.sales_prediction.next_7_days || 0)}
            icon={<ShowChartIcon />}
            trend="up"
            trendValue="7.2% from last week"
            color="primary.main"
            confidence={analytics?.sales_prediction.confidence || 0}
          />
        </Box>
        <Box sx={{ flex: '1 1 calc(33.333% - 16px)', minWidth: 280 }}>
          <StatsCard 
            title="30-Day Revenue Forecast" 
            value={formatCurrency(analytics?.financial_forecast.next_30_days_revenue || 0)}
            icon={<AttachMoneyIcon />}
            trend="up"
            trendValue="4.5% increase expected"
            color="success.main"
            confidence={analytics?.financial_forecast.confidence || 0}
          />
        </Box>
        <Box sx={{ flex: '1 1 calc(33.333% - 16px)', minWidth: 280 }}>
          <StatsCard 
            title="Inventory Alerts" 
            value={analytics?.inventory_alerts.low_stock_count.toString() || '0'}
            icon={<WarningIcon />}
            color="warning.main"
          />
        </Box>
      </Box>
      
      {/* Sales Chart and Recent Activity */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        <Box sx={{ flex: '1 1 calc(66.666% - 12px)', minWidth: 280 }}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardHeader 
              title="Sales Forecast (Next 7 Days)" 
              action={
                <IconButton>
                  <MoreVertIcon />
                </IconButton>
              }
            />
            <Divider />
            <CardContent>
              {analytics?.sales_prediction.daily && (
                <BarChart data={analytics.sales_prediction.daily} />
              )}
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Chip 
                  icon={<InfoIcon fontSize="small" />} 
                  label={`Prediction confidence: ${(analytics?.sales_prediction.confidence || 0) * 100}%`} 
                  size="small" 
                  color={analytics?.sales_prediction.confidence && analytics.sales_prediction.confidence >= 0.8 ? "success" : "warning"}
                />
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 calc(33.333% - 12px)', minWidth: 280 }}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardHeader title="Recent Activity" />
            <Divider />
            <List sx={{ px: 0 }}>
              <ListItem>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'success.light' }}>
                    <AttachMoneyIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary="New sale recorded" 
                  secondary="$1,250.00 - Premium Headphones"
                  primaryTypographyProps={{ fontWeight: 500 }}
                />
              </ListItem>
              <Divider variant="inset" component="li" />
              <ListItem>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'error.light' }}>
                    <InventoryIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary="Inventory alert triggered" 
                  secondary="Bluetooth Speaker - 4 units left"
                  primaryTypographyProps={{ fontWeight: 500 }}
                />
              </ListItem>
              <Divider variant="inset" component="li" />
              <ListItem>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'warning.light' }}>
                    <LocalShippingIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary="Supplier order shipped" 
                  secondary="Order #38492 - Arriving in 3 days"
                  primaryTypographyProps={{ fontWeight: 500 }}
                />
              </ListItem>
            </List>
          </Card>
        </Box>
      </Box>
      
      {/* Inventory Alerts Table */}
      <Card variant="outlined">
        <CardHeader 
          title="Inventory Alerts" 
          subheader="Products that need immediate attention"
          action={
            <Button
              variant="contained"
              size="small"
              color="primary"
              startIcon={<InventoryIcon />}
            >
              Manage Inventory
            </Button>
          }
        />
        <Divider />
        <CardContent sx={{ p: 0 }}>
          {analytics?.inventory_alerts.products && analytics.inventory_alerts.products.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell>Current Stock</TableCell>
                    <TableCell>Days Until Stockout</TableCell>
                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {analytics.inventory_alerts.products.map((product) => (
                    <TableRow 
                      key={product.product_id}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        {product.product_name}
                      </TableCell>
                      <TableCell>{product.current_stock} units</TableCell>
                      <TableCell>
                        <Chip
                          label={`${product.days_until_stockout} days`}
                          size="small"
                          color={product.days_until_stockout <= 3 ? "error" : "warning"}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          variant="contained"
                          size="small"
                          color="primary"
                        >
                          Reorder Now
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No low stock items to display
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Dashboard; 