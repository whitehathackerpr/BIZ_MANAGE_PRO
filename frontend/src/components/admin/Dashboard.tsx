import React from 'react';
import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Paper,
    Typography,
    CircularProgress,
    Alert,
    Card,
    CardContent,
    LinearProgress
} from '@mui/material';
import {
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    Money as MoneyIcon,
    ShoppingCart as CartIcon,
    People as PeopleIcon,
    Assessment as AssessmentIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import branchApi from '../../services/branchApi';

const Dashboard = () => {
    const [loading, setLoading] = useState<Type>(true);
    const [error, setError] = useState<Type>(null);
    const [stats, setStats] = useState<Type>({
        totalRevenue: 0,
        totalOrders: 0,
        totalCustomers: 0,
        conversionRate: 0,
        salesTarget: 0,
        salesProgress: 0,
        topProducts: [],
        performanceMetrics: []
    });
    const { user } = useAuth();
    const { showNotification } = useNotification();

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await branchApi.getBranchPerformance(user.branchId);
            setStats(response);
        } catch (err) {
            setError('Failed to fetch dashboard data');
            showNotification('Failed to fetch dashboard data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ title, value, icon, trend, color }) => (
        <Card className="glass" sx={{ height: '100%' }}>
            <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                    {icon}
                    <Typography variant="h6" sx={{ ml: 1 }}>
                        {title}
                    </Typography>
                </Box>
                <Typography variant="h4" className="gradient-text" gutterBottom>
                    {value}
                </Typography>
                <Box display="flex" alignItems="center">
                    {trend > 0 ? (
                        <TrendingUpIcon color="success" />
                    ) : (
                        <TrendingDownIcon color="error" />
                    )}
                    <Typography
                        variant="body2"
                        color={trend > 0 ? 'success.main' : 'error.main'}
                        sx={{ ml: 1 }}
                    >
                        {Math.abs(trend)}% from last month
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box p={2}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    return (
        <Box>
            <Box display="flex" alignItems="center" mb={4}>
                <AssessmentIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h5" className="gradient-text">
                    Dashboard
                </Typography>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Revenue"
                        value={`$${stats.totalRevenue.toLocaleString()}`}
                        icon={<MoneyIcon sx={{ color: 'primary.main' }} />}
                        trend={12.5}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Orders"
                        value={stats.totalOrders.toLocaleString()}
                        icon={<CartIcon sx={{ color: 'primary.main' }} />}
                        trend={8.2}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Customers"
                        value={stats.totalCustomers.toLocaleString()}
                        icon={<PeopleIcon sx={{ color: 'primary.main' }} />}
                        trend={-3.1}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Conversion Rate"
                        value={`${stats.conversionRate}%`}
                        icon={<TrendingUpIcon sx={{ color: 'primary.main' }} />}
                        trend={5.7}
                    />
                </Grid>

                <Grid item xs={12}>
                    <Paper className="glass" sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Sales Target Progress
                        </Typography>
                        <Box display="flex" alignItems="center" mb={1}>
                            <Typography variant="body2" sx={{ mr: 1 }}>
                                Progress:
                            </Typography>
                            <Typography variant="body2" color="primary">
                                {stats.salesProgress}%
                            </Typography>
                        </Box>
                        <LinearProgress
                            variant="determinate"
                            value={stats.salesProgress}
                            sx={{
                                height: 10,
                                borderRadius: 5,
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                '& .MuiLinearProgress-bar': {
                                    background: 'linear-gradient(45deg, #00F5FF 30%, #FF2E63 90%)',
                                },
                            }}
                        />
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper className="glass" sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Top Products
                        </Typography>
                        <Box component="table" sx={{ width: '100%' }}>
                            <Box component="thead">
                                <Box component="tr" sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                    <Box component="th" sx={{ textAlign: 'left', py: 2, px: 1 }}>Product</Box>
                                    <Box component="th" sx={{ textAlign: 'right', py: 2, px: 1 }}>Sales</Box>
                                    <Box component="th" sx={{ textAlign: 'right', py: 2, px: 1 }}>Revenue</Box>
                                </Box>
                            </Box>
                            <Box component="tbody">
                                {stats.topProducts.map((product, index) => (
                                    <Box
                                        component="tr"
                                        key={index}
                                        sx={{
                                            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                                            '&:last-child': { borderBottom: 'none' }
                                        }}
                                    >
                                        <Box component="td" sx={{ py: 2, px: 1 }}>{product.name}</Box>
                                        <Box component="td" sx={{ textAlign: 'right', py: 2, px: 1 }}>{product.sales}</Box>
                                        <Box component="td" sx={{ textAlign: 'right', py: 2, px: 1 }}>${product.revenue}</Box>
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper className="glass" sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Performance Metrics
                        </Typography>
                        <Box component="table" sx={{ width: '100%' }}>
                            <Box component="thead">
                                <Box component="tr" sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                    <Box component="th" sx={{ textAlign: 'left', py: 2, px: 1 }}>Metric</Box>
                                    <Box component="th" sx={{ textAlign: 'right', py: 2, px: 1 }}>Value</Box>
                                    <Box component="th" sx={{ textAlign: 'right', py: 2, px: 1 }}>Change</Box>
                                </Box>
                            </Box>
                            <Box component="tbody">
                                {stats.performanceMetrics.map((metric, index) => (
                                    <Box
                                        component="tr"
                                        key={index}
                                        sx={{
                                            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                                            '&:last-child': { borderBottom: 'none' }
                                        }}
                                    >
                                        <Box component="td" sx={{ py: 2, px: 1 }}>{metric.name}</Box>
                                        <Box component="td" sx={{ textAlign: 'right', py: 2, px: 1 }}>{metric.value}</Box>
                                        <Box
                                            component="td"
                                            sx={{
                                                textAlign: 'right',
                                                py: 2,
                                                px: 1,
                                                color: metric.change >= 0 ? 'success.main' : 'error.main'
                                            }}
                                        >
                                            {metric.change >= 0 ? '+' : ''}{metric.change}%
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Dashboard; 