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
  Chip,
  SelectChangeEvent
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  TransferWithinAStation as TransferIcon
} from '@mui/icons-material';
import apiClient from '../../../services/apiClient';

interface InventoryItem {
  id: string;
  branch_id: string;
  product_id: string;
  product_name: string;
  sku: string;
  quantity: number;
  min_stock_level: number;
  max_stock_level: number;
}

interface Product {
  id: string;
  name: string;
  sku: string;
}

interface Branch {
  id: string;
  name: string;
}

interface InventoryFormData {
  product_id: string;
  quantity: string;
  min_stock_level: string;
  max_stock_level: string;
}

interface TransferFormData {
  target_branch_id: string;
  quantity: string;
}

interface BranchInventoryProps {
  branchId: string;
}

const BranchInventory: React.FC<BranchInventoryProps> = ({ branchId }) => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [openTransferDialog, setOpenTransferDialog] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [formData, setFormData] = useState<InventoryFormData>({
    product_id: '',
    quantity: '',
    min_stock_level: '',
    max_stock_level: ''
  });
  const [transferData, setTransferData] = useState<TransferFormData>({
    target_branch_id: '',
    quantity: ''
  });

  useEffect(() => {
    fetchInventory();
    fetchProducts();
    fetchBranches();
  }, [branchId]);

  const fetchInventory = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await apiClient.get<InventoryItem[]>(`/branches/${branchId}/inventory`);
      setInventory(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch inventory');
      console.error('Error fetching inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async (): Promise<void> => {
    try {
      const response = await apiClient.get<{ products: Product[] }>('/products');
      setProducts(response.data.products);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const fetchBranches = async (): Promise<void> => {
    try {
      const response = await apiClient.get<Branch[]>('/branches');
      setBranches(response.data.filter(branch => branch.id !== branchId));
    } catch (err) {
      console.error('Error fetching branches:', err);
    }
  };

  const handleOpenDialog = (item: InventoryItem | null = null): void => {
    if (item) {
      setFormData({
        product_id: item.product_id,
        quantity: String(item.quantity),
        min_stock_level: String(item.min_stock_level),
        max_stock_level: String(item.max_stock_level)
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

  const handleOpenTransferDialog = (item: InventoryItem): void => {
    setSelectedItem(item);
    setTransferData({
      target_branch_id: '',
      quantity: ''
    });
    setOpenTransferDialog(true);
  };

  const handleCloseDialog = (): void => {
    setOpenDialog(false);
    setSelectedItem(null);
    setFormData({
      product_id: '',
      quantity: '',
      min_stock_level: '',
      max_stock_level: ''
    });
  };

  const handleCloseTransferDialog = (): void => {
    setOpenTransferDialog(false);
    setSelectedItem(null);
    setTransferData({
      target_branch_id: '',
      quantity: ''
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSelectChange = (e: SelectChangeEvent): void => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleTransferChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent): void => {
    setTransferData({
      ...transferData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (): Promise<void> => {
    try {
      if (selectedItem) {
        await apiClient.put(`/branches/${branchId}/inventory/${selectedItem.id}`, formData);
      } else {
        await apiClient.post(`/branches/${branchId}/inventory`, formData);
      }
      fetchInventory();
      handleCloseDialog();
    } catch (err) {
      setError('Failed to save inventory item');
      console.error('Error saving inventory item:', err);
    }
  };

  const handleTransfer = async (): Promise<void> => {
    try {
      if (selectedItem) {
        await apiClient.post(`/branches/${branchId}/inventory/${selectedItem.id}/transfer`, transferData);
      fetchInventory();
      handleCloseTransferDialog();
      }
    } catch (err) {
      setError('Failed to transfer inventory');
      console.error('Error transferring inventory:', err);
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    if (window.confirm('Are you sure you want to delete this inventory item?')) {
      try {
        await apiClient.delete(`/branches/${branchId}/inventory/${id}`);
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
                            size="small"
                            onClick={() => handleOpenDialog(item)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            color="primary"
                            size="small"
                            onClick={() => handleOpenTransferDialog(item)}
                          >
                            <TransferIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => handleDelete(item.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    {inventory.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          No inventory items found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add/Edit Inventory Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedItem ? 'Edit Inventory Item' : 'Add Inventory Item'}
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
              <InputLabel>Product</InputLabel>
              <Select
                name="product_id"
                value={formData.product_id}
              onChange={handleSelectChange}
                label="Product"
              disabled={Boolean(selectedItem)}
              >
                {products.map((product) => (
                  <MenuItem key={product.id} value={product.id}>
                  {product.name} ({product.sku})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
            fullWidth
            label="Quantity"
              name="quantity"
              type="number"
              value={formData.quantity}
            onChange={handleChange}
            margin="normal"
            />

            <TextField
            fullWidth
            label="Minimum Stock Level"
              name="min_stock_level"
              type="number"
              value={formData.min_stock_level}
            onChange={handleChange}
            margin="normal"
            />

            <TextField
            fullWidth
            label="Maximum Stock Level"
              name="max_stock_level"
              type="number"
              value={formData.max_stock_level}
            onChange={handleChange}
            margin="normal"
            />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedItem ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Transfer Inventory Dialog */}
      <Dialog open={openTransferDialog} onClose={handleCloseTransferDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Transfer Inventory</DialogTitle>
        <DialogContent>
          {selectedItem && (
            <Box mb={2}>
              <Typography variant="subtitle1">
                {selectedItem.product_name}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Current Quantity: {selectedItem.quantity}
              </Typography>
            </Box>
          )}

          <FormControl fullWidth margin="normal">
              <InputLabel>Target Branch</InputLabel>
              <Select
                name="target_branch_id"
                value={transferData.target_branch_id}
              onChange={handleTransferChange}
                label="Target Branch"
              >
              {branches.map((branch) => (
                <MenuItem key={branch.id} value={branch.id}>
                  {branch.name}
                </MenuItem>
              ))}
              </Select>
            </FormControl>

            <TextField
            fullWidth
            label="Quantity to Transfer"
              name="quantity"
              type="number"
              value={transferData.quantity}
            onChange={handleTransferChange}
            margin="normal"
            inputProps={{ min: 1, max: selectedItem?.quantity }}
            />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTransferDialog}>Cancel</Button>
          <Button
            onClick={handleTransfer}
            variant="contained"
            color="primary"
            disabled={
              !transferData.target_branch_id ||
              !transferData.quantity ||
              parseInt(transferData.quantity) < 1 ||
              (selectedItem && parseInt(transferData.quantity) > selectedItem.quantity)
            }
          >
            Transfer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BranchInventory; 