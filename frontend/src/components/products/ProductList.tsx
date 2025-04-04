import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
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
  CloudUpload as CloudUploadIcon
} from '@mui/icons-material';
import apiClient from '../../services/apiClient';

// Simple snackbar hook implementation
const useSnackbar = () => {
  return {
    enqueueSnackbar: (message: string, options?: { variant: string }) => {
      console.log(message, options);
    }
  };
};

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  category: string;
  sku: string;
  image_url?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface ProductsResponse {
  items: Product[];
  total: number;
}

interface FormData {
  name: string;
  description: string;
  price: string | number;
  quantity: string | number;
  category: string;
  sku: string;
  image: File | null;
}

interface Filters {
  category: string;
  status: string;
  minPrice: string;
  maxPrice: string;
}

interface SortConfig {
  key: keyof Product;
  direction: 'asc' | 'desc';
}

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filters, setFilters] = useState<Filters>({
    category: '',
    status: '',
    minPrice: '',
    maxPrice: ''
  });
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'name',
    direction: 'asc'
  });
  const [open, setOpen] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    price: '',
    quantity: '',
    category: '',
    sku: '',
    image: null
  });
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchProducts();
  }, [page, rowsPerPage, searchQuery, filters, sortConfig]);

  const fetchProducts = async (): Promise<void> => {
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

      const response = await apiClient.get<ProductsResponse>('/products', { params });
      setProducts(response.items);
      setTotalCount(response.total);
    } catch (error) {
      setError('Failed to fetch products');
      enqueueSnackbar('Failed to fetch products', { variant: 'error' });
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

  const handleSearch = (event: ChangeEvent<HTMLInputElement>): void => {
    setSearchQuery(event.target.value);
    setPage(0);
  };

  const handleFilterChange = (field: keyof Filters, value: string): void => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(0);
  };

  const handleSort = (key: keyof Product): void => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleOpen = (product: Product | null = null): void => {
    if (product) {
      setSelectedProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        quantity: product.quantity,
        category: product.category,
        sku: product.sku,
        image: null
      });
    } else {
      setSelectedProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        quantity: '',
        category: '',
        sku: '',
        image: null
      });
    }
    setOpen(true);
  };

  const handleClose = (): void => {
    setOpen(false);
    setSelectedProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      quantity: '',
      category: '',
      sku: '',
      image: null
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        const k = key as keyof FormData;
        if (formData[k] !== null) {
          formDataToSend.append(key, formData[k] as string | Blob);
        }
      });

      if (selectedProduct) {
        await apiClient.put(`/products/${selectedProduct.id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        enqueueSnackbar('Product updated successfully', { variant: 'success' });
      } else {
        await apiClient.post('/products', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        enqueueSnackbar('Product created successfully', { variant: 'success' });
      }
      fetchProducts();
      handleClose();
    } catch (error) {
      enqueueSnackbar('Failed to save product', { variant: 'error' });
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await apiClient.delete(`/products/${id}`);
        enqueueSnackbar('Product deleted successfully', { variant: 'success' });
        fetchProducts();
      } catch (error) {
        enqueueSnackbar('Failed to delete product', { variant: 'error' });
      }
    }
  };

  const handlePrint = (): void => {
    window.print();
  };

  const handleExport = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await apiClient.get('/products/export', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'products.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      enqueueSnackbar('Products exported successfully', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Failed to export products', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>): void => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setFormData(prev => ({
        ...prev,
        image: file
      }));
    }
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (event: SelectChangeEvent): void => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Box sx={{ width: '100%' }}>
      {loading && <LinearProgress />}
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4" gutterBottom>
          Products
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
          >
            Add Product
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
      
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
          <TextField
            label="Search Products"
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={handleSearch}
            sx={{ minWidth: 300 }}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />
            }}
          />
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                label="Category"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="electronics">Electronics</MenuItem>
                <MenuItem value="clothing">Clothing</MenuItem>
                <MenuItem value="food">Food</MenuItem>
                <MenuItem value="furniture">Furniture</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                label="Status"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="in_stock">In Stock</MenuItem>
                <MenuItem value="low_stock">Low Stock</MenuItem>
                <MenuItem value="out_of_stock">Out of Stock</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
        
        <TableContainer>
          <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle" size="medium">
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={sortConfig.key === 'name'}
                    direction={sortConfig.key === 'name' ? sortConfig.direction : 'asc'}
                    onClick={() => handleSort('name')}
                  >
                    Name
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortConfig.key === 'sku'}
                    direction={sortConfig.key === 'sku' ? sortConfig.direction : 'asc'}
                    onClick={() => handleSort('sku')}
                  >
                    SKU
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortConfig.key === 'category'}
                    direction={sortConfig.key === 'category' ? sortConfig.direction : 'asc'}
                    onClick={() => handleSort('category')}
                  >
                    Category
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortConfig.key === 'price'}
                    direction={sortConfig.key === 'price' ? sortConfig.direction : 'asc'}
                    onClick={() => handleSort('price')}
                  >
                    Price
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortConfig.key === 'quantity'}
                    direction={sortConfig.key === 'quantity' ? sortConfig.direction : 'asc'}
                    onClick={() => handleSort('quantity')}
                  >
                    Quantity
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortConfig.key === 'status'}
                    direction={sortConfig.key === 'status' ? sortConfig.direction : 'asc'}
                    onClick={() => handleSort('status')}
                  >
                    Status
                  </TableSortLabel>
                </TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product) => (
                <TableRow hover key={product.id}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>${product.price.toFixed(2)}</TableCell>
                  <TableCell>{product.quantity}</TableCell>
                  <TableCell>
                    <Chip
                      label={product.status}
                      color={
                        product.status === 'in_stock'
                          ? 'success'
                          : product.status === 'low_stock'
                          ? 'warning'
                          : 'error'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex' }}>
                      <Tooltip title="Edit">
                        <IconButton onClick={() => handleOpen(product)} size="small">
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton onClick={() => handleDelete(product.id)} size="small" color="error">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {products.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No products found
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
      </Paper>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{selectedProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                fullWidth
                label="Product Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                margin="normal"
              />
              <TextField
                fullWidth
                label="SKU"
                name="sku"
                value={formData.sku}
                onChange={handleInputChange}
                required
                margin="normal"
              />
              <TextField
                fullWidth
                label="Price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                required
                margin="normal"
                InputProps={{ startAdornment: '$' }}
              />
              <TextField
                fullWidth
                label="Quantity"
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleInputChange}
                required
                margin="normal"
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleSelectChange}
                  label="Category"
                  required
                >
                  <MenuItem value="electronics">Electronics</MenuItem>
                  <MenuItem value="clothing">Clothing</MenuItem>
                  <MenuItem value="food">Food</MenuItem>
                  <MenuItem value="furniture">Furniture</MenuItem>
                </Select>
              </FormControl>
              <Box sx={{ margin: 'normal' }}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUploadIcon />}
                  sx={{ mt: 2 }}
                >
                  Upload Image
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </Button>
                {formData.image && (
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    {formData.image.name}
                  </Typography>
                )}
              </Box>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                margin="normal"
                sx={{ gridColumn: '1 / span 2' }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {selectedProduct ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default ProductList; 