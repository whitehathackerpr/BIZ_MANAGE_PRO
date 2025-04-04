import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Grid,
  Paper
} from '@mui/material';
import { BarcodeScanner as BarcodeScannerIcon } from '@mui/icons-material';
import apiClient from '../../services/apiClient';

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  barcode: string;
  description?: string;
  image_url?: string;
}

const BarcodeScanner: React.FC = () => {
  const [scanning, setScanning] = useState<boolean>(false);
  const [scannedCode, setScannedCode] = useState<string>('');
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [manualInput, setManualInput] = useState<string>('');

  useEffect(() => {
    if (scanning) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [scanning]);

  const startCamera = async (): Promise<void> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError('Failed to access camera');
      console.error('Error accessing camera:', err);
    }
  };

  const stopCamera = (): void => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const handleScan = async (code: string): Promise<void> => {
    try {
      setLoading(true);
      const response = await apiClient.get<Product>(`/products/barcode/${code}`);
      setProduct(response.data);
      setScannedCode(code);
      setError(null);
    } catch (err) {
      setError('Product not found');
      console.error('Error fetching product:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async (): Promise<void> => {
    if (manualInput.trim()) {
      await handleScan(manualInput.trim());
      setManualInput('');
    }
  };

  return (
    <Box p={3}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Barcode Scanner
              </Typography>
              <Box mb={3}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<BarcodeScannerIcon />}
                  onClick={() => setScanning(!scanning)}
                  fullWidth
                >
                  {scanning ? 'Stop Scanning' : 'Start Scanning'}
                </Button>
              </Box>

              {scanning && (
                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    height: 300,
                    overflow: 'hidden',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  <video
                    ref={videoRef}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    autoPlay
                    playsInline
                  />
                </Box>
              )}

              <Box mt={3}>
                <Typography variant="subtitle1" gutterBottom>
                  Manual Entry
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs>
                    <TextField
                      fullWidth
                      label="Enter Barcode"
                      value={manualInput}
                      onChange={(e) => setManualInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleManualSubmit();
                        }
                      }}
                    />
                  </Grid>
                  <Grid item>
                    <Button
                      variant="contained"
                      onClick={handleManualSubmit}
                      disabled={!manualInput.trim()}
                    >
                      Submit
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Scanned Product
              </Typography>

              {loading ? (
                <Box display="flex" justifyContent="center" p={3}>
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Alert severity="error">{error}</Alert>
              ) : product ? (
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Product Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="textSecondary">
                        Name
                      </Typography>
                      <Typography variant="body1">{product.name}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="textSecondary">
                        SKU
                      </Typography>
                      <Typography variant="body1">{product.sku}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="textSecondary">
                        Price
                      </Typography>
                      <Typography variant="body1">
                        ${product.price.toFixed(2)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="textSecondary">
                        Stock
                      </Typography>
                      <Typography variant="body1">
                        {product.stock} units
                      </Typography>
                    </Grid>
                    {product.description && (
                      <Grid item xs={12}>
                        <Typography variant="body2" color="textSecondary">
                          Description
                        </Typography>
                        <Typography variant="body1">
                          {product.description}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              ) : (
                <Typography>Scan a barcode to see product details</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BarcodeScanner; 