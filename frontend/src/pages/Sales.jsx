import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const schema = yup.object().shape({
  customer_name: yup.string().required('Customer name is required'),
  items: yup.array().of(
    yup.object().shape({
      product_id: yup.number().required('Product is required'),
      quantity: yup.number().required('Quantity is required').min(1, 'Quantity must be at least 1'),
    })
  ),
});

const POSForm = ({ onSubmit, onCancel }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [cart, setCart] = useState([]);

  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await axios.get('/api/products');
      return response.data;
    },
  });

  const filteredProducts = products?.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddToCart = () => {
    if (selectedProduct && quantity > 0) {
      const existingItem = cart.find(item => item.product_id === selectedProduct.id);
      if (existingItem) {
        setCart(cart.map(item =>
          item.product_id === selectedProduct.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        ));
      } else {
        setCart([...cart, { product_id: selectedProduct.id, quantity }]);
      }
      setSelectedProduct(null);
      setQuantity(1);
    }
  };

  const handleRemoveFromCart = (productId) => {
    setCart(cart.filter(item => item.product_id !== productId));
  };

  const handleSubmit = () => {
    onSubmit({ items: cart });
    setCart([]);
  };

  const total = cart.reduce((sum, item) => {
    const product = products?.find(p => p.id === item.product_id);
    return sum + (product?.price || 0) * item.quantity;
  }, 0);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 2 }}>
          <TextField
            fullWidth
            label="Search Products"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Box sx={{ mt: 2, maxHeight: 400, overflow: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>SKU</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="right">Stock</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProducts?.map((product) => (
                  <TableRow
                    key={product.id}
                    hover
                    selected={selectedProduct?.id === product.id}
                    onClick={() => setSelectedProduct(product)}
                  >
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.sku}</TableCell>
                    <TableCell align="right">${product.price.toFixed(2)}</TableCell>
                    <TableCell align="right">{product.quantity}</TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => {
                          setSelectedProduct(product);
                          setQuantity(1);
                        }}
                      >
                        Add
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </Paper>
      </Grid>

      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Current Sale
          </Typography>
          {selectedProduct && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1">{selectedProduct.name}</Typography>
              <TextField
                fullWidth
                type="number"
                label="Quantity"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                InputProps={{
                  inputProps: { min: 1, max: selectedProduct.quantity }
                }}
              />
              <Button
                fullWidth
                variant="contained"
                onClick={handleAddToCart}
                sx={{ mt: 1 }}
              >
                Add to Cart
              </Button>
            </Box>
          )}
          <Divider sx={{ my: 2 }} />
          <List>
            {cart.map((item) => {
              const product = products?.find(p => p.id === item.product_id);
              return (
                <ListItem key={item.product_id}>
                  <ListItemText
                    primary={product?.name}
                    secondary={`${item.quantity} x $${product?.price.toFixed(2)}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => handleRemoveFromCart(item.product_id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              );
            })}
          </List>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" align="right">
              Total: ${total.toFixed(2)}
            </Typography>
          </Box>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={cart.length === 0}
          >
            Complete Sale
          </Button>
        </Paper>
      </Grid>
    </Grid>
  );
};

const SalesHistory = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { data: sales, isLoading } = useQuery({
    queryKey: ['sales'],
    queryFn: async () => {
      const response = await axios.get('/api/sales');
      return response.data;
    },
  });

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Invoice #</TableCell>
            <TableCell>Customer</TableCell>
            <TableCell>Date</TableCell>
            <TableCell align="right">Total</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sales
            ?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((sale) => (
              <TableRow key={sale.id}>
                <TableCell>{sale.invoice_number}</TableCell>
                <TableCell>{sale.customer_name}</TableCell>
                <TableCell>
                  {new Date(sale.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell align="right">
                  ${sale.total_amount.toFixed(2)}
                </TableCell>
                <TableCell>
                  <Chip
                    label={sale.status}
                    color={
                      sale.status === 'completed'
                        ? 'success'
                        : sale.status === 'pending'
                        ? 'warning'
                        : 'error'
                    }
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
      <TablePagination
        component="div"
        count={sales?.length || 0}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </TableContainer>
  );
};

const Sales = () => {
  const [isPOSOpen, setIsPOSOpen] = useState(false);
  const queryClient = useQueryClient();

  const createSaleMutation = useMutation({
    mutationFn: async (saleData) => {
      const response = await axios.post('/api/sales', saleData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['sales']);
      setIsPOSOpen(false);
    },
  });

  const handleSubmit = (data) => {
    createSaleMutation.mutate(data);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Sales Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsPOSOpen(true)}
        >
          New Sale
        </Button>
      </Box>

      <Dialog
        open={isPOSOpen}
        onClose={() => setIsPOSOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>New Sale</DialogTitle>
        <DialogContent>
          <POSForm
            onSubmit={handleSubmit}
            onCancel={() => setIsPOSOpen(false)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsPOSOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Sales History
      </Typography>
      <SalesHistory />
    </Box>
  );
};

export default Sales; 