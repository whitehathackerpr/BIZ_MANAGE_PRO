import React, { useState, useEffect, ChangeEvent } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Switch,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  SelectChangeEvent
} from '@mui/material';
import apiClient from '../../services/apiClient';

interface Branch {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
}

interface ProductAvailability {
  product_id: string;
  product_name: string;
  sku: string;
  is_available: boolean;
  last_updated: string;
}

const ProductAvailability: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [availability, setAvailability] = useState<ProductAvailability[]>([]);
  const [open, setOpen] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchBranches();
    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedBranch) {
      fetchAvailability();
    }
  }, [selectedBranch]);

  const fetchBranches = async (): Promise<void> => {
    try {
      const branches = await apiClient.get<Branch[]>('/branches');
      setBranches(branches);
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const fetchProducts = async (): Promise<void> => {
    try {
      const response = await apiClient.get<{ products: Product[] }>('/products');
      setProducts(response.products);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchAvailability = async (): Promise<void> => {
    try {
      const availability = await apiClient.get<ProductAvailability[]>(`/products/availability?branch_id=${selectedBranch}`);
      setAvailability(availability);
    } catch (error) {
      console.error('Error fetching availability:', error);
    }
  };

  const handleBranchChange = (event: SelectChangeEvent): void => {
    setSelectedBranch(event.target.value);
  };

  const handleAvailabilityChange = async (productId: string, isAvailable: boolean): Promise<void> => {
    try {
      await apiClient.put(`/products/${productId}/availability`, {
        branch_id: selectedBranch,
        is_available: isAvailable
      });
      fetchAvailability();
    } catch (error) {
      console.error('Error updating availability:', error);
    }
  };

  const handleOpen = (product: Product | null = null): void => {
    setSelectedProduct(product);
    setOpen(true);
  };

  const handleClose = (): void => {
    setOpen(false);
    setSelectedProduct(null);
  };

  const handleSubmit = async (): Promise<void> => {
    if (!selectedProduct) return;
    
    try {
      await apiClient.post('/products/availability', {
        product_id: selectedProduct.id,
        branch_id: selectedBranch,
        is_available: true
      });
      fetchAvailability();
      handleClose();
    } catch (error) {
      console.error('Error adding availability:', error);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Product Availability</Typography>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Select Branch</InputLabel>
          <Select
            value={selectedBranch}
            onChange={handleBranchChange}
            label="Select Branch"
          >
            {branches.map((branch) => (
              <MenuItem key={branch.id} value={branch.id}>
                {branch.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {selectedBranch && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product Name</TableCell>
                <TableCell>SKU</TableCell>
                <TableCell>Available</TableCell>
                <TableCell>Last Updated</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {availability.map((item) => (
                <TableRow key={item.product_id}>
                  <TableCell>{item.product_name}</TableCell>
                  <TableCell>{item.sku}</TableCell>
                  <TableCell>
                    <Switch
                      checked={item.is_available}
                      onChange={(e) => handleAvailabilityChange(item.product_id, e.target.checked)}
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(item.last_updated).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add Product Availability</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Product</InputLabel>
            <Select
              value={selectedProduct?.id || ''}
              onChange={(e: SelectChangeEvent) => {
                const product = products.find(p => p.id === e.target.value) || null;
                setSelectedProduct(product);
              }}
            >
              {products.map((product) => (
                <MenuItem key={product.id} value={product.id}>
                  {product.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary" disabled={!selectedProduct}>
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductAvailability; 