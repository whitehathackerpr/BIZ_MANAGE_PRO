import React, { useState, useEffect, ChangeEvent, KeyboardEvent } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  LinearProgress
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import apiClient from '../../services/apiClient';

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
}

interface Barcode {
  id: string;
  barcode: string;
  is_active: boolean;
}

const BarcodeScanner: React.FC = () => {
  const [scannedBarcode, setScannedBarcode] = useState<string>('');
  const [product, setProduct] = useState<Product | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [barcodes, setBarcodes] = useState<Barcode[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (scannedBarcode) {
      handleScan();
    }
  }, [scannedBarcode]);

  const handleScan = async (): Promise<void> => {
    try {
      setLoading(true);
      setError('');
      const response = await apiClient.post<Product>('/api/products/scan-barcode', {
        barcode: scannedBarcode
      });
      setProduct(response);
      setOpen(true);
    } catch (error) {
      setError('Product not found');
      console.error('Error scanning barcode:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManualInput = (event: ChangeEvent<HTMLInputElement>): void => {
    setScannedBarcode(event.target.value);
  };

  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter') {
      handleScan();
    }
  };

  const handleClose = (): void => {
    setOpen(false);
    setProduct(null);
    setScannedBarcode('');
    setError('');
  };

  const handleAddBarcode = async (): Promise<void> => {
    if (!product) return;
    
    try {
      setLoading(true);
      await apiClient.post(`/api/products/${product.id}/barcodes`, {
        barcode: scannedBarcode
      });
      fetchBarcodes();
      handleClose();
    } catch (error) {
      setError('Error adding barcode');
      console.error('Error adding barcode:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBarcode = async (barcodeId: string): Promise<void> => {
    if (!product) return;
    
    try {
      setLoading(true);
      await apiClient.delete(`/api/products/${product.id}/barcodes/${barcodeId}`);
      fetchBarcodes();
    } catch (error) {
      setError('Error deleting barcode');
      console.error('Error deleting barcode:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBarcodes = async (): Promise<void> => {
    if (!product) return;
    
    try {
      const response = await apiClient.get<Barcode[]>(`/api/products/${product.id}/barcodes`);
      setBarcodes(response);
    } catch (error) {
      console.error('Error fetching barcodes:', error);
    }
  };

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Barcode Scanner</Typography>
        <Box display="flex" gap={2}>
          <TextField
            label="Enter Barcode"
            value={scannedBarcode}
            onChange={handleManualInput}
            onKeyPress={handleKeyPress}
            variant="outlined"
            size="small"
          />
          <Button
            variant="contained"
            color="primary"
            startIcon={<QrCodeScannerIcon />}
            onClick={handleScan}
          >
            Scan
          </Button>
        </Box>
      </Box>

      {error && (
        <Typography color="error" gutterBottom>
          {error}
        </Typography>
      )}

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Scanned Product</DialogTitle>
        <DialogContent>
          {product && (
            <Box>
              <Typography variant="h6">{product.name}</Typography>
              <Typography>SKU: {product.sku}</Typography>
              <Typography>Price: ${product.price}</Typography>
              <Typography>Quantity: {product.quantity}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
          <Button onClick={handleAddBarcode} variant="contained" color="primary">
            Add Barcode
          </Button>
        </DialogActions>
      </Dialog>

      {product && (
        <Paper sx={{ mt: 3 }}>
          <Box p={2}>
            <Typography variant="h6" gutterBottom>
              Associated Barcodes
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Barcode</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {barcodes.map((barcode) => (
                    <TableRow key={barcode.id}>
                      <TableCell>{barcode.barcode}</TableCell>
                      <TableCell>{barcode.is_active ? 'Active' : 'Inactive'}</TableCell>
                      <TableCell>
                        <IconButton
                          onClick={() => handleDeleteBarcode(barcode.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default BarcodeScanner; 