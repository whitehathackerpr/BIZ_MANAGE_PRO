import React from 'react';
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Alert,
  CircularProgress,
  Grid,
  Chip,
  Tabs,
  Tab
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  LocationOn as LocationIcon,
  Inventory as InventoryIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import { branchApi } from '../../services/api';
import BranchInventory from './branch/BranchInventory';
import BranchPerformance from './branch/BranchPerformance';
import BranchSettings from './branch/BranchSettings';
import BranchUsers from './branch/BranchUsers';
import { useNotification } from '../../contexts/NotificationContext';

const BranchManagement = () => {
  const { showNotification } = useNotification();
  const [branches, setBranches] = useState<Type>([]);
  const [loading, setLoading] = useState<Type>(false);
  const [error, setError] = useState<Type>('');
  const [openDialog, setOpenDialog] = useState<Type>(false);
  const [selectedTab, setSelectedTab] = useState<Type>(0);
  const [selectedBranch, setSelectedBranch] = useState<Type>(null);
  const [formData, setFormData] = useState<Type>({
    name: '',
    address: '',
    phone: '',
    email: '',
    managerId: '',
    status: 'active'
  });

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const response = await branchApi.getAll();
      setBranches(response.data);
    } catch (err) {
      setError('Failed to fetch branches');
      showNotification('Failed to fetch branches', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (branch = null) => {
    if (branch) {
      setFormData(branch);
      setSelectedBranch(branch);
    } else {
      setFormData({
        name: '',
        address: '',
        phone: '',
        email: '',
        managerId: '',
        status: 'active'
      });
      setSelectedBranch(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedBranch(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (selectedBranch) {
        await branchApi.update(selectedBranch.id, formData);
        showNotification('Branch updated successfully', 'success');
      } else {
        await branchApi.create(formData);
        showNotification('Branch created successfully', 'success');
      }
      handleCloseDialog();
      fetchBranches();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save branch');
      showNotification('Failed to save branch', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (branchId) => {
    if (window.confirm('Are you sure you want to delete this branch?')) {
      try {
        setLoading(true);
        await branchApi.delete(branchId);
        showNotification('Branch deleted successfully', 'success');
        fetchBranches();
      } catch (err) {
        setError('Failed to delete branch');
        showNotification('Failed to delete branch', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleBranchSelect = (branch) => {
    setSelectedBranch(branch);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5">Branch Management</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => () => handleOpenDialog()}
          >
            Add Branch
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Tabs
          value={selectedTab}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleTabChange}
          sx={{ mb: 3 }}
        >
          <Tab icon={<LocationIcon />} label="Branches" />
          <Tab icon={<InventoryIcon />} label="Inventory" />
          <Tab icon={<AssessmentIcon />} label="Performance" />
          <Tab icon={<PeopleIcon />} label="Employees" />
        </Tabs>

        {selectedTab === 0 && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {branches.map((branch) => (
                  <TableRow key={branch.id}>
                    <TableCell>{branch.name}</TableCell>
                    <TableCell>{branch.address}</TableCell>
                    <TableCell>{branch.phone}</TableCell>
                    <TableCell>{branch.email}</TableCell>
                    <TableCell>{branch.status}</TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => () => handleOpenDialog(branch)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => () => handleDelete(branch.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {selectedTab === 1 && (
          <BranchInventory
            branchId={selectedBranch?.id}
            onBranchSelect={handleBranchSelect}
          />
        )}

        {selectedTab === 2 && (
          <BranchPerformance
            branchId={selectedBranch?.id}
            onBranchSelect={handleBranchSelect}
          />
        )}

        {selectedTab === 3 && (
          <BranchUsers
            branchId={selectedBranch?.id}
            onBranchSelect={handleBranchSelect}
          />
        )}

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {selectedBranch ? 'Edit Branch' : 'Create New Branch'}
          </DialogTitle>
          <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => handleSubmit}>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Branch Name"
                    name="name"
                    value={formData.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    name="address"
                    value={formData.address}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    name="phone"
                    value={formData.phone}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Manager ID"
                    name="managerId"
                    value={formData.managerId}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    select
                    label="Status"
                    name="status"
                    value={formData.status}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange}
                    SelectProps={{
                      native: true,
                    }}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="maintenance">Maintenance</option>
                  </TextField>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleCloseDialog}>Cancel</Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Save'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default BranchManagement; 