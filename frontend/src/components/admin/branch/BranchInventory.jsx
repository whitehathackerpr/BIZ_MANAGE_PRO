import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Alert,
  CircularProgress,
  Grid,
  Chip
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  TransferWithinAStation as TransferIcon
} from '@mui/icons-material';
import { api } from '../../../services/api';

const BranchInventory = ({ branchId }) => {
  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openTransferDialog, setOpenTransferDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    product_id: '',
    quantity: '',
    min_stock_level: '',
    max_stock_level: ''
  });
  const [transferData, setTransferData] = useState({
    target_branch_id: '',
    quantity: ''
  });

  useEffect(() => {
    fetchInventory();
    fetchProducts();
  }, [branchId]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/branches/${branchId}/inventory`);
      setInventory(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch inventory');
      console.error('Error fetching inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get('/api/products');
      setProducts(response.data);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const handleOpenDialog = (item = null) => {
    if (item) {
      setFormData({
        product_id: item.product_id,
        quantity: item.quantity,
        min_stock_level: item.min_stock_level,
        max_stock_level: item.max_stock_level
      });
      setSelectedItem(item);
    } else {
      setFormData({
        product_id: '',
        quantity: '',
        min_stock_level: '',
        max_stock_level: ''
      });
      setSelectedItem(null);
    }
    setOpenDialog(true);
  };

  const handleOpenTransferDialog = (item) => {
    setSelectedItem(item);
    setTransferData({
      target_branch_id: '',
      quantity: ''
    });
    setOpenTransferDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedItem(null);
    setFormData({
      product_id: '',
      quantity: '',
      min_stock_level: '',
      max_stock_level: ''
    });
  };

  const handleCloseTransferDialog = () => {
    setOpenTransferDialog(false);
    setSelectedItem(null);
    setTransferData({
      target_branch_id: '',
      quantity: ''
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleTransferChange = (e) => {
    setTransferData({
      ...transferData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    try {
      if (selectedItem) {
        await api.put(`/api/branches/${branchId}/inventory/${selectedItem.id}`, formData);
      } else {
        await api.post(`/api/branches/${branchId}/inventory`, formData);
      }
      fetchInventory();
      handleCloseDialog();
    } catch (err) {
      setError('Failed to save inventory item');
      console.error('Error saving inventory item:', err);
    }
  };

  const handleTransfer = async () => {
    try {
      await api.post(`/api/branches/${branchId}/inventory/${selectedItem.id}/transfer`, transferData);
      fetchInventory();
      handleCloseTransferDialog();
    } catch (err) {
      setError('Failed to transfer inventory');
      console.error('Error transferring inventory:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this inventory item?')) {
      try {
        await api.delete(`/api/branches/${branchId}/inventory/${id}`);
        fetchInventory();
      } catch (err) {
        setError('Failed to delete inventory item');
        console.error('Error deleting inventory item:', err);
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5">Branch Inventory</Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Add Item
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Card>
            <CardContent>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell>SKU</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Min Stock</TableCell>
                      <TableCell>Max Stock</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {inventory.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.product_name}</TableCell>
                        <TableCell>{item.sku}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{item.min_stock_level}</TableCell>
                        <TableCell>{item.max_stock_level}</TableCell>
                        <TableCell>
                          <Chip
                            label={item.quantity <= item.min_stock_level ? 'Low Stock' : 'In Stock'}
                            color={item.quantity <= item.min_stock_level ? 'error' : 'success'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton
                            color="primary"
                            onClick={() => handleOpenDialog(item)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            color="primary"
                            onClick={() => handleOpenTransferDialog(item)}
                          >
                            <TransferIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleDelete(item.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {selectedItem ? 'Edit Inventory Item' : 'Add New Item'}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={2}>
            <FormControl fullWidth>
              <InputLabel>Product</InputLabel>
              <Select
                name="product_id"
                value={formData.product_id}
                onChange={handleChange}
                label="Product"
              >
                {products.map((product) => (
                  <MenuItem key={product.id} value={product.id}>
                    {product.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              name="quantity"
              label="Quantity"
              type="number"
              value={formData.quantity}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              name="min_stock_level"
              label="Minimum Stock Level"
              type="number"
              value={formData.min_stock_level}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              name="max_stock_level"
              label="Maximum Stock Level"
              type="number"
              value={formData.max_stock_level}
              onChange={handleChange}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedItem ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openTransferDialog} onClose={handleCloseTransferDialog}>
        <DialogTitle>Transfer Inventory</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={2}>
            <FormControl fullWidth>
              <InputLabel>Target Branch</InputLabel>
              <Select
                name="target_branch_id"
                value={transferData.target_branch_id}
                onChange={handleTransferChange}
                label="Target Branch"
              >
                {/* Add branch options here */}
              </Select>
            </FormControl>
            <TextField
              name="quantity"
              label="Quantity to Transfer"
              type="number"
              value={transferData.quantity}
              onChange={handleTransferChange}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTransferDialog}>Cancel</Button>
          <Button onClick={handleTransfer} variant="contained" color="primary">
            Transfer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BranchInventory; 