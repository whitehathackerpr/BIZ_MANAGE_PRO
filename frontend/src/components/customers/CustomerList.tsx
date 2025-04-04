import React, { useState, useEffect, ChangeEvent } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Button,
  IconButton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  Grid,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Chip,
  InputAdornment,
  Alert,
  LinearProgress,
  SelectChangeEvent
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import apiClient from '../../services/apiClient';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  type: 'retail' | 'wholesale' | 'corporate';
  status: 'active' | 'inactive';
  loyalty_points: number;
  created_at: string;
  last_purchase_date: string | null;
  notes: string;
}

interface CustomerResponse {
  items: Customer[];
  total: number;
}

interface CustomerFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  type: 'retail' | 'wholesale' | 'corporate';
  status: 'active' | 'inactive';
  notes: string;
}

const CustomerList: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState<CustomerFormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    type: 'retail',
    status: 'active',
    notes: ''
  });

  useEffect(() => {
    fetchCustomers();
  }, [page, rowsPerPage, searchQuery]);

  const fetchCustomers = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.get<CustomerResponse>('/customers', {
        params: {
          page: page + 1,
          per_page: rowsPerPage,
          search: searchQuery
        }
      });
      
      setCustomers(response.items);
      setTotalCount(response.total);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError('Failed to fetch customers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (_event: unknown, newPage: number): void => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setSearchQuery(e.target.value);
    setPage(0);
  };

  const handleOpenDialog = (customer: Customer | null = null): void => {
    if (customer) {
      setSelectedCustomer(customer);
      setFormData({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        type: customer.type,
        status: customer.status,
        notes: customer.notes
      });
    } else {
      setSelectedCustomer(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        type: 'retail',
        status: 'active',
        notes: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = (): void => {
    setOpenDialog(false);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSwitchChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked ? 'active' : 'inactive'
    }));
  };

  const handleSubmit = async (): Promise<void> => {
    try {
      setLoading(true);
      
      if (selectedCustomer) {
        await apiClient.put(`/customers/${selectedCustomer.id}`, formData);
      } else {
        await apiClient.post('/customers', formData);
      }
      
      fetchCustomers();
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving customer:', err);
      setError('Failed to save customer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        setLoading(true);
        await apiClient.delete(`/customers/${id}`);
        fetchCustomers();
      } catch (err) {
        console.error('Error deleting customer:', err);
        setError('Failed to delete customer. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Customers</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Customer
        </Button>
      </Box>

      <Paper sx={{ mb: 3, p: 2 }}>
        <TextField
          placeholder="Search customers..."
          fullWidth
          variant="outlined"
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Loyalty Points</TableCell>
              <TableCell>Last Purchase</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>{customer.name}</TableCell>
                <TableCell>
                  <Box display="flex" flexDirection="column">
                    <Box display="flex" alignItems="center">
                      <EmailIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">{customer.email}</Typography>
                    </Box>
                    <Box display="flex" alignItems="center">
                      <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">{customer.phone}</Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={customer.type.charAt(0).toUpperCase() + customer.type.slice(1)} 
                    color={
                      customer.type === 'retail' ? 'default' : 
                      customer.type === 'wholesale' ? 'primary' : 
                      'secondary'
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={customer.status === 'active' ? 'Active' : 'Inactive'} 
                    color={customer.status === 'active' ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>{customer.loyalty_points}</TableCell>
                <TableCell>
                  {customer.last_purchase_date 
                    ? new Date(customer.last_purchase_date).toLocaleDateString() 
                    : 'Never'}
                </TableCell>
                <TableCell>
                  <IconButton color="primary" size="small" onClick={() => handleOpenDialog(customer)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" size="small" onClick={() => handleDelete(customer.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {customers.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No customers found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={totalCount}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedCustomer ? 'Edit Customer' : 'Add New Customer'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                name="name"
                label="Name"
                value={formData.name}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="email"
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="phone"
                label="Phone"
                value={formData.phone}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Customer Type</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  label="Customer Type"
                >
                  <MenuItem value="retail">Retail</MenuItem>
                  <MenuItem value="wholesale">Wholesale</MenuItem>
                  <MenuItem value="corporate">Corporate</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="address"
                label="Address"
                value={formData.address}
                onChange={handleChange}
                fullWidth
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.status === 'active'}
                    onChange={handleSwitchChange}
                    name="status"
                    color="primary"
                  />
                }
                label="Active Customer"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="notes"
                label="Notes"
                value={formData.notes}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedCustomer ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomerList; 