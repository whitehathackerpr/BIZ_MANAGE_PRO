import React from 'react';
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { QrCodeScanner as QrCodeScannerIcon } from '@mui/icons-material';

function Scanner() {
  const [scanResult, setScanResult] = useState<Type>(null);
  const [openDialog, setOpenDialog] = useState<Type>(false);
  const [formData, setFormData] = useState<Type>({
    productId: '',
    quantity: '',
    notes: '',
  });

  useEffect(() => {
    // TODO: Initialize camera and QR code scanner
    // This is a placeholder for the actual scanner implementation
  }, []);

  const handleScan = (result) => {
    if (result) {
      setScanResult(result);
      setFormData({ ...formData, productId: result });
      setOpenDialog(true);
    }
  };

  const handleError = (error) => {
    console.error(error);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setScanResult(null);
    setFormData({
      productId: '',
      quantity: '',
      notes: '',
    });
  };

  const handleSubmit = () => {
    // TODO: Handle the scanned data submission
    console.log('Scanned data:', formData);
    handleDialogClose();
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        QR Code Scanner
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Scanner View
            </Typography>
            <Box
              sx={{
                height: 400,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'grey.100',
                borderRadius: 1,
              }}
            >
              <QrCodeScannerIcon sx={{ fontSize: 100, color: 'grey.500' }} />
            </Box>
            <Button
              variant="contained"
              color="primary"
              startIcon={<QrCodeScannerIcon />}
              sx={{ mt: 2 }}
            >
              Start Scanning
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Scanning Instructions
              </Typography>
              <Typography variant="body1" paragraph>
                1. Position the QR code within the scanner view
              </Typography>
              <Typography variant="body1" paragraph>
                2. Hold steady until the code is detected
              </Typography>
              <Typography variant="body1" paragraph>
                3. Enter additional information if prompted
              </Typography>
              <Typography variant="body1" paragraph>
                4. Submit the scanned data
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>Scanned Product Details</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Product ID"
              value={formData.productId}
              disabled
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Quantity"
              type="number"
              value={formData.quantity}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => (e) => setFormData({ ...formData, quantity: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Notes"
              multiline
              rows={3}
              value={formData.notes}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => (e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleDialogClose}>Cancel</Button>
          <Button onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleSubmit} variant="contained" color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Scanner; 