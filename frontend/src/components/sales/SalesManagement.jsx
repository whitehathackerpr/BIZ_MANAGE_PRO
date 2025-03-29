import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    Snackbar,
    Grid,
    InputAdornment,
    Chip
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    Receipt as ReceiptIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const SalesManagement = () => {
    const { token } = useAuth();
    const [sales, setSales] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedSale, setSelectedSale] = useState(null);
    const [formData, setFormData] = useState({
        customer_id: '',
        items: [{ product_id: '', quantity: 1, price: 0 }],
        payment_method: 'cash',
        status: 'completed',
        notes: ''
    });
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    const fetchSales = async () => {
        try {
            const response = await axios.get('/api/sales', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSales(response.data);
        } catch (error) {
            console.error('Error fetching sales:', error);
            showSnackbar('Failed to fetch sales', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await axios.get('/api/inventory/products', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
            showSnackbar('Failed to fetch products', 'error');
        }
    };

    useEffect(() => {
        Promise.all([fetchSales(), fetchProducts()]);
    }, []);

    const handleOpenDialog = (sale = null) => {
        if (sale) {
            setSelectedSale(sale);
            setFormData({
                customer_id: sale.customer_id,
                items: sale.items,
                payment_method: sale.payment_method,
                status: sale.status,
                notes: sale.notes
            });
        } else {
            setSelectedSale(null);
            setFormData({
                customer_id: '',
                items: [{ product_id: '', quantity: 1, price: 0 }],
                payment_method: 'cash',
                status: 'completed',
                notes: ''
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedSale(null);
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index] = {
            ...newItems[index],
            [field]: value
        };
        setFormData(prev => ({
            ...prev,
            items: newItems
        }));
    };

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { product_id: '', quantity: 1, price: 0 }]
        }));
    };

    const removeItem = (index) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            if (selectedSale) {
                await axios.put(`/api/sales/${selectedSale.id}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                showSnackbar('Sale updated successfully', 'success');
            } else {
                await axios.post('/api/sales', formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                showSnackbar('Sale created successfully', 'success');
            }
            handleCloseDialog();
            fetchSales();
        } catch (error) {
            showSnackbar(
                error.response?.data?.error || 'Failed to save sale',
                'error'
            );
        }
    };

    const handleDelete = async (saleId) => {
        if (window.confirm('Are you sure you want to delete this sale?')) {
            try {
                await axios.delete(`/api/sales/${saleId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                showSnackbar('Sale deleted successfully', 'success');
                fetchSales();
            } catch (error) {
                showSnackbar('Failed to delete sale', 'error');
            }
        }
    };

    const showSnackbar = (message, severity) => {
        setSnackbar({
            open: true,
            message,
            severity
        });
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const calculateTotal = (items) => {
        return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    const getStatusColor = (status) => {
        const colors = {
            completed: 'success',
            pending: 'warning',
            cancelled: 'error',
            refunded: 'default'
        };
        return colors[status] || 'default';
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5">Sales Management</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    New Sale
                </Button>
            </Box>

            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Total Sales
                            </Typography>
                            <Typography variant="h4">
                                ${sales.reduce((sum, sale) => sum + calculateTotal(sale.items), 0).toFixed(2)}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Total Transactions
                            </Typography>
                            <Typography variant="h4">
                                {sales.length}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Average Sale
                            </Typography>
                            <Typography variant="h4">
                                ${(sales.reduce((sum, sale) => sum + calculateTotal(sale.items), 0) / (sales.length || 1)).toFixed(2)}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Customer</TableCell>
                            <TableCell>Items</TableCell>
                            <TableCell>Total</TableCell>
                            <TableCell>Payment Method</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sales.map((sale) => (
                            <TableRow key={sale.id}>
                                <TableCell>{new Date(sale.created_at).toLocaleDateString()}</TableCell>
                                <TableCell>{sale.customer_name}</TableCell>
                                <TableCell>{sale.items.length} items</TableCell>
                                <TableCell>${calculateTotal(sale.items).toFixed(2)}</TableCell>
                                <TableCell>{sale.payment_method}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={sale.status}
                                        color={getStatusColor(sale.status)}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleOpenDialog(sale)}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleDelete(sale.id)}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>
                    {selectedSale ? 'Edit Sale' : 'New Sale'}
                </DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Customer ID"
                                    name="customer_id"
                                    value={formData.customer_id}
                                    onChange={handleChange}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Payment Method</InputLabel>
                                    <Select
                                        name="payment_method"
                                        value={formData.payment_method}
                                        onChange={handleChange}
                                        label="Payment Method"
                                    >
                                        <MenuItem value="cash">Cash</MenuItem>
                                        <MenuItem value="card">Card</MenuItem>
                                        <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                                        <MenuItem value="other">Other</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="subtitle1" gutterBottom>
                                    Items
                                </Typography>
                                {formData.items.map((item, index) => (
                                    <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                                        <Grid item xs={12} md={4}>
                                            <FormControl fullWidth>
                                                <InputLabel>Product</InputLabel>
                                                <Select
                                                    value={item.product_id}
                                                    onChange={(e) => handleItemChange(index, 'product_id', e.target.value)}
                                                    label="Product"
                                                >
                                                    {products.map((product) => (
                                                        <MenuItem key={product.id} value={product.id}>
                                                            {product.name}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={12} md={3}>
                                            <TextField
                                                fullWidth
                                                label="Quantity"
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                                required
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={3}>
                                            <TextField
                                                fullWidth
                                                label="Price"
                                                type="number"
                                                value={item.price}
                                                onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                                                required
                                                InputProps={{
                                                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                                }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={2}>
                                            <Button
                                                fullWidth
                                                variant="outlined"
                                                color="error"
                                                onClick={() => removeItem(index)}
                                                disabled={formData.items.length === 1}
                                            >
                                                Remove
                                            </Button>
                                        </Grid>
                                    </Grid>
                                ))}
                                <Button
                                    variant="outlined"
                                    onClick={addItem}
                                    startIcon={<AddIcon />}
                                >
                                    Add Item
                                </Button>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Notes"
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    multiline
                                    rows={3}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog}>Cancel</Button>
                        <Button type="submit" variant="contained" color="primary">
                            {selectedSale ? 'Update' : 'Create'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default SalesManagement; 