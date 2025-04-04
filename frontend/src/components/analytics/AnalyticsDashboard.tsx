import React from 'react';
import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Paper,
    Alert,
    Snackbar,
    CircularProgress,
    Tabs,
    Tab
} from '@mui/material';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer
} from 'recharts';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const AnalyticsDashboard = () => {
    const { token } = useAuth();
    const [timeRange, setTimeRange] = useState<Type>('30days');
    const [loading, setLoading] = useState<Type>(true);
    const [error, setError] = useState<Type>(null);
    const [activeTab, setActiveTab] = useState<Type>(0);
    const [data, setData] = useState<Type>({
        sales_metrics: {
            total_sales: 0,
            total_orders: 0,
            average_order_value: 0,
            daily_sales: []
        },
        product_metrics: {
            top_products: [],
            sales_by_category: []
        },
        customer_metrics: {
            total_customers: 0,
            new_customers: 0,
            customer_growth_rate: 0
        },
        inventory_metrics: {
            low_stock: 0,
            out_of_stock: 0
        }
    });

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/analytics/dashboard?timeRange=${timeRange}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setData(response.data);
            setError(null);
        } catch (error) {
            console.error('Error fetching analytics:', error);
            setError('Failed to fetch analytics data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, [timeRange]);

    const handleTimeRangeChange = (event) => {
        setTimeRange(event.target.value);
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5">Analytics Dashboard</Typography>
                <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>Time Range</InputLabel>
                    <Select
                        value={timeRange}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleTimeRangeChange}
                        label="Time Range"
                    >
                        <MenuItem value="7days">Last 7 Days</MenuItem>
                        <MenuItem value="30days">Last 30 Days</MenuItem>
                        <MenuItem value="90days">Last 90 Days</MenuItem>
                        <MenuItem value="1year">Last Year</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Tabs value={activeTab} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleTabChange} sx={{ mb: 3 }}>
                <Tab label="Overview" />
                <Tab label="Sales" />
                <Tab label="Products" />
                <Tab label="Customers" />
                <Tab label="Inventory" />
            </Tabs>

            {activeTab === 0 && (
                <Grid container spacing={3}>
                    {/* Sales Overview */}
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Sales Overview
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={4}>
                                        <Typography color="textSecondary">Total Sales</Typography>
                                        <Typography variant="h4">
                                            ${data.sales_metrics.total_sales.toFixed(2)}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <Typography color="textSecondary">Total Orders</Typography>
                                        <Typography variant="h4">
                                            {data.sales_metrics.total_orders}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <Typography color="textSecondary">Average Order</Typography>
                                        <Typography variant="h4">
                                            ${data.sales_metrics.average_order_value.toFixed(2)}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Customer Overview */}
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Customer Overview
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={4}>
                                        <Typography color="textSecondary">Total Customers</Typography>
                                        <Typography variant="h4">
                                            {data.customer_metrics.total_customers}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <Typography color="textSecondary">New Customers</Typography>
                                        <Typography variant="h4">
                                            {data.customer_metrics.new_customers}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <Typography color="textSecondary">Growth Rate</Typography>
                                        <Typography variant="h4">
                                            {data.customer_metrics.customer_growth_rate.toFixed(1)}%
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Sales Trend */}
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Sales Trend
                                </Typography>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={data.sales_metrics.daily_sales}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="total"
                                            stroke="#8884d8"
                                            name="Sales Amount"
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="orders"
                                            stroke="#82ca9d"
                                            name="Number of Orders"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Sales by Category */}
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Sales by Category
                                </Typography>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={data.product_metrics.sales_by_category}
                                            dataKey="total_revenue"
                                            nameKey="category"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            label
                                        >
                                            {data.product_metrics.sales_by_category.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Top Products */}
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Top Products
                                </Typography>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={data.product_metrics.top_products}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="total_revenue" fill="#8884d8" name="Revenue" />
                                        <Bar dataKey="total_quantity" fill="#82ca9d" name="Quantity" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {activeTab === 1 && (
                <Grid container spacing={3}>
                    {/* Sales Analytics */}
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Sales Analytics
                                </Typography>
                                <ResponsiveContainer width="100%" height={400}>
                                    <LineChart data={data.sales_metrics.daily_sales}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="total"
                                            stroke="#8884d8"
                                            name="Sales Amount"
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="orders"
                                            stroke="#82ca9d"
                                            name="Number of Orders"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {activeTab === 2 && (
                <Grid container spacing={3}>
                    {/* Product Analytics */}
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Product Performance
                                </Typography>
                                <ResponsiveContainer width="100%" height={400}>
                                    <BarChart data={data.product_metrics.top_products}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="total_revenue" fill="#8884d8" name="Revenue" />
                                        <Bar dataKey="total_quantity" fill="#82ca9d" name="Quantity" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {activeTab === 3 && (
                <Grid container spacing={3}>
                    {/* Customer Analytics */}
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Customer Growth
                                </Typography>
                                <ResponsiveContainer width="100%" height={400}>
                                    <LineChart data={data.customer_metrics.customer_growth}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="new_customers"
                                            stroke="#8884d8"
                                            name="New Customers"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {activeTab === 4 && (
                <Grid container spacing={3}>
                    {/* Inventory Analytics */}
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Inventory Status
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={4}>
                                        <Typography color="textSecondary">Low Stock Items</Typography>
                                        <Typography variant="h4" color="warning.main">
                                            {data.inventory_metrics.low_stock}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <Typography color="textSecondary">Out of Stock</Typography>
                                        <Typography variant="h4" color="error.main">
                                            {data.inventory_metrics.out_of_stock}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={() => setError(null)}
            >
                <Alert
                    onClose={() => setError(null)}
                    severity="error"
                    sx={{ width: '100%' }}
                >
                    {error}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default AnalyticsDashboard; 