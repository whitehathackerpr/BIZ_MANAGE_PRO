import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Rating,
  TextField,
  Button,
  Grid,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import apiClient from '../../services/apiClient';

interface Customer {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
}

interface FeedbackItem {
  id: string;
  customer_id: string;
  customer_name: string;
  product_id: string;
  product_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface FeedbackFormData {
  customer_id: string;
  product_id: string;
  rating: number;
  comment: string;
}

interface FeedbackResponse {
  items: FeedbackItem[];
  pages: number;
}

const CustomerFeedback: React.FC = () => {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [open, setOpen] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [formData, setFormData] = useState<FeedbackFormData>({
    customer_id: '',
    product_id: '',
    rating: 0,
    comment: ''
  });

  useEffect(() => {
    fetchFeedback();
    fetchProducts();
    fetchCustomers();
  }, [page]);

  const fetchFeedback = async (): Promise<void> => {
    try {
      const response = await apiClient.get<FeedbackResponse>(`/customers/feedback`, {
        params: { page }
      });
      setFeedback(response.items);
      setTotalPages(response.pages);
    } catch (error) {
      console.error('Error fetching feedback:', error);
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

  const fetchCustomers = async (): Promise<void> => {
    try {
      const response = await apiClient.get<{ customers: Customer[] }>('/customers');
      setCustomers(response.customers);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const handleOpen = (): void => {
    setOpen(true);
  };

  const handleClose = (): void => {
    setOpen(false);
    setFormData({
      customer_id: '',
      product_id: '',
      rating: 0,
      comment: ''
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    try {
      await apiClient.post('/customers/feedback', formData);
      fetchFeedback();
      handleClose();
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const handleRatingChange = (_event: React.SyntheticEvent, newValue: number | null): void => {
    setFormData(prev => ({
      ...prev,
      rating: newValue || 0
    }));
  };

  const handleSelectChange = (field: keyof FeedbackFormData) => (event: SelectChangeEvent): void => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleTextFieldChange = (field: keyof FeedbackFormData) => (event: ChangeEvent<HTMLInputElement>): void => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number): void => {
    setPage(value);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Customer Feedback</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpen}
        >
          Add Feedback
        </Button>
      </Box>

      <Grid container spacing={3}>
        {feedback.map((item) => (
          <Grid item xs={12} md={6} key={item.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{item.customer_name}</Typography>
                <Box display="flex" alignItems="center">
                  <Rating value={item.rating} readOnly />
                  <Typography variant="body2" color="textSecondary" sx={{ ml: 1 }}>
                    ({item.rating.toFixed(1)})
                  </Typography>
                </Box>
                <Typography variant="subtitle2" color="primary" sx={{ mt: 1 }}>
                  {item.product_name}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {item.comment}
                </Typography>
                <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 1 }}>
                  {new Date(item.created_at).toLocaleDateString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {feedback.length === 0 && (
          <Grid item xs={12}>
            <Typography variant="body1" textAlign="center">
              No feedback available yet.
            </Typography>
          </Grid>
        )}
      </Grid>

      <Box display="flex" justifyContent="center" mt={3}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Feedback</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Customer</InputLabel>
                <Select
                  value={formData.customer_id}
                  onChange={handleSelectChange('customer_id')}
                  label="Customer"
                  required
                >
                  {customers.map((customer) => (
                    <MenuItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth margin="normal">
                <InputLabel>Product</InputLabel>
                <Select
                  value={formData.product_id}
                  onChange={handleSelectChange('product_id')}
                  label="Product"
                  required
                >
                  {products.map((product) => (
                    <MenuItem key={product.id} value={product.id}>
                      {product.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box sx={{ mt: 2 }}>
                <Typography component="legend">Rating</Typography>
                <Rating
                  value={formData.rating}
                  onChange={handleRatingChange}
                  precision={0.5}
                />
              </Box>

              <TextField
                fullWidth
                label="Comment"
                multiline
                rows={3}
                value={formData.comment}
                onChange={handleTextFieldChange('comment')}
                margin="normal"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              Submit
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default CustomerFeedback; 