import React, { useState, useEffect, ChangeEvent, MouseEvent, FormEvent } from 'react';
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
  TableSortLabel,
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  LinearProgress,
  Alert,
  Snackbar,
  Tooltip,
  Chip,
  Grid,
  Card,
  CardContent,
  SelectChangeEvent
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Print as PrintIcon,
  FileDownload as FileDownloadIcon,
  Receipt as ReceiptIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  ShoppingCart as ShoppingCartIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import apiClient from '../../services/apiClient';
import { useSnackbar } from 'notistack';

interface Sale {
  id: string;
  customer_id: string;
  customer_name: string;
  invoice_number: string;
  created_at: string;
  total_amount: number;
  payment_method: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  items: SaleItem[];
  notes?: string;
}

interface SaleItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  total: number;
}

interface SaleFilters {
  status: string;
  paymentMethod: string;
  minAmount: string;
  maxAmount: string;
  startDate: Date | null;
  endDate: Date | null;
}

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

interface SummaryData {
  totalSales: number;
  totalRevenue: number;
  averageOrderValue: number;
  totalCustomers: number;
}

interface SaleFormData {
  customer_id: string;
  items: SaleItem[];
  payment_method: string;
  notes: string;
}

const SalesList: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filters, setFilters] = useState<SaleFilters>({
    status: '',
    paymentMethod: '',
    minAmount: '',
    maxAmount: '',
    startDate: null,
    endDate: null
  });
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'created_at',
    direction: 'desc'
  });
  const [open, setOpen] = useState<boolean>(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [formData, setFormData] = useState<SaleFormData>({
    customer_id: '',
    items: [],
    payment_method: '',
    notes: ''
  });
  const [summary, setSummary] = useState<SummaryData>({
    totalSales: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    totalCustomers: 0
  });
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchSales();
    fetchSummary();
  }, [page, rowsPerPage, searchQuery, filters, sortConfig]);

  const fetchSales = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page: page + 1,
        per_page: rowsPerPage,
        search: searchQuery,
        ...filters,
        sort_by: sortConfig.key,
        sort_direction: sortConfig.direction
      };

      const response = await apiClient.get<{ items: Sale[]; total: number }>('/sales', { params });
      setSales(response.items);
      setTotalCount(response.total);
    } catch (error) {
      setError('Failed to fetch sales');
      enqueueSnackbar('Failed to fetch sales', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async (): Promise<void> => {
    try {
      const summary = await apiClient.get<SummaryData>('/sales/summary');
      setSummary(summary);
    } catch (error) {
      console.error('Failed to fetch sales summary:', error);
    }
  };

  const handleChangePage = (_event: unknown, newPage: number): void => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event: ChangeEvent<HTMLInputElement>): void => {
    setSearchQuery(event.target.value);
    setPage(0);
  };

  const handleFilterChange = (field: keyof SaleFilters, value: any): void => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(0);
  };

  const handleSort = (key: string): void => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleOpen = (sale: Sale | null = null): void => {
    if (sale) {
      setSelectedSale(sale);
      setFormData({
        customer_id: sale.customer_id,
        items: sale.items,
        payment_method: sale.payment_method,
        notes: sale.notes || ''
      });
    } else {
      setSelectedSale(null);
      setFormData({
        customer_id: '',
        items: [],
        payment_method: '',
        notes: ''
      });
    }
    setOpen(true);
  };

  const handleClose = (): void => {
    setOpen(false);
    setSelectedSale(null);
    setFormData({
      customer_id: '',
      items: [],
      payment_method: '',
      notes: ''
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    try {
      if (selectedSale) {
        await apiClient.put(`/sales/${selectedSale.id}`, formData);
        enqueueSnackbar('Sale updated successfully', { variant: 'success' });
      } else {
        await apiClient.post('/sales', formData);
        enqueueSnackbar('Sale created successfully', { variant: 'success' });
      }
      fetchSales();
      fetchSummary();
      handleClose();
    } catch (error) {
      enqueueSnackbar('Failed to save sale', { variant: 'error' });
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    if (window.confirm('Are you sure you want to delete this sale?')) {
      try {
        await apiClient.delete(`/sales/${id}`);
        enqueueSnackbar('Sale deleted successfully', { variant: 'success' });
        fetchSales();
        fetchSummary();
      } catch (error) {
        enqueueSnackbar('Failed to delete sale', { variant: 'error' });
      }
    }
  };

  const handlePrint = (): void => {
    window.print();
  };

  const handleExport = async (): Promise<void> => {
    try {
      const response = await apiClient.get('/sales/export', {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'sales.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      enqueueSnackbar('Failed to export sales', { variant: 'error' });
    }
  };

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Sales</Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
          >
            Add Sale
          </Button>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
          >
            Print
          </Button>
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={handleExport}
          >
            Export
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary">Total Sales</Typography>
              <Box display="flex" alignItems="center">
                <ShoppingCartIcon sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="h5">{summary.totalSales}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary">Total Revenue</Typography>
              <Box display="flex" alignItems="center">
                <TrendingUpIcon sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="h5">${summary.totalRevenue.toFixed(2)}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary">Average Order</Typography>
              <Box display="flex" alignItems="center">
                <ReceiptIcon sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="h5">${summary.averageOrderValue.toFixed(2)}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary">Total Customers</Typography>
              <Box display="flex" alignItems="center">
                <PeopleIcon sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="h5">{summary.totalCustomers}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ mb: 3, p: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <TextField
            placeholder="Search sales..."
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={handleSearch}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
            }}
            sx={{ width: 300 }}
          />

          <Box display="flex" alignItems="center">
            <FilterIcon sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2" color="textSecondary" sx={{ mr: 2 }}>
              Filters:
            </Typography>

            <FormControl size="small" sx={{ minWidth: 120, mr: 2 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="processing">Processing</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150, mr: 2 }}>
              <InputLabel>Payment Method</InputLabel>
              <Select
                value={filters.paymentMethod}
                label="Payment Method"
                onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="cash">Cash</MenuItem>
                <MenuItem value="card">Card</MenuItem>
                <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                <MenuItem value="online">Online</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        <Box display="flex" flexWrap="wrap" gap={2}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Start Date"
              value={filters.startDate}
              onChange={(date) => handleFilterChange('startDate', date)}
              slotProps={{ textField: { size: 'small' } }}
            />
            <DatePicker
              label="End Date"
              value={filters.endDate}
              onChange={(date) => handleFilterChange('endDate', date)}
              slotProps={{ textField: { size: 'small' } }}
            />
          </LocalizationProvider>

          <TextField
            label="Min Amount"
            type="number"
            size="small"
            value={filters.minAmount}
            onChange={(e) => handleFilterChange('minAmount', e.target.value)}
          />

          <TextField
            label="Max Amount"
            type="number"
            size="small"
            value={filters.maxAmount}
            onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
          />
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={sortConfig.key === 'created_at'}
                  direction={sortConfig.key === 'created_at' ? sortConfig.direction : 'asc'}
                  onClick={() => handleSort('created_at')}
                >
                  Date
                </TableSortLabel>
              </TableCell>
              <TableCell>Invoice #</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={sortConfig.key === 'total_amount'}
                  direction={sortConfig.key === 'total_amount' ? sortConfig.direction : 'asc'}
                  onClick={() => handleSort('total_amount')}
                >
                  Amount
                </TableSortLabel>
              </TableCell>
              <TableCell>Payment Method</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sales.map((sale) => (
              <TableRow key={sale.id}>
                <TableCell>
                  {new Date(sale.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>{sale.invoice_number}</TableCell>
                <TableCell>{sale.customer_name}</TableCell>
                <TableCell align="right">${sale.total_amount}</TableCell>
                <TableCell>{sale.payment_method}</TableCell>
                <TableCell>
                  <Chip
                    label={sale.status}
                    color={
                      sale.status === 'completed' ? 'success' :
                      sale.status === 'pending' ? 'warning' :
                      sale.status === 'cancelled' ? 'error' : 'default'
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="View Details">
                    <IconButton onClick={() => handleOpen(sale)}>
                      <ReceiptIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton onClick={() => handleOpen(sale)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton onClick={() => handleDelete(sale.id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={totalCount}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedSale ? 'Edit Sale' : 'New Sale'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Customer</InputLabel>
              <Select
                value={formData.customer_id}
                onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
              >
                {/* Customer options would be populated here */}
                <MenuItem value="customer1">John Doe</MenuItem>
                <MenuItem value="customer2">Jane Smith</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Payment Method</InputLabel>
              <Select
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
              >
                <MenuItem value="cash">Cash</MenuItem>
                <MenuItem value="card">Card</MenuItem>
                <MenuItem value="online">Online</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              margin="normal"
              label="Notes"
              multiline
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              variant="outlined"
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button 
            onClick={(e) => handleSubmit(e as unknown as FormEvent<HTMLFormElement>)} 
            variant="contained" 
            color="primary"
          >
            {selectedSale ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SalesList; 