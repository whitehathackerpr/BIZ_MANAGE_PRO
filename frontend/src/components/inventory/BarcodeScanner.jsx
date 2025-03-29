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
import { api } from '../../services/api';

const BarcodeScanner = () => {
  const [scanning, setScanning] = useState(false);
  const [scannedCode, setScannedCode] = useState('');
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef(null);
  const [manualInput, setManualInput] = useState('');

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

  const startCamera = async () => {
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

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const handleScan = async (code) => {
    try {
      setLoading(true);
      const response = await api.get(`/api/products/barcode/${code}`);
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

  const handleManualSubmit = async () => {
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
                      <Typography variant="body1">{product.quantity}</Typography>
                    </Grid>
                  </Grid>
                </Box>
              ) : (
                <Typography color="textSecondary">
                  No product scanned yet
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BarcodeScanner; 