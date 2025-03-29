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
import { api } from '../../services/api';
import BranchInventory from './branch/BranchInventory';
import BranchPerformance from './branch/BranchPerformance';
import BranchSettings from './branch/BranchSettings';
import BranchUsers from './branch/BranchUsers';

const BranchManagement = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    manager_id: '',
    status: 'active'
  });
  const [activeTab, setActiveTab] = useState(0);
  const [selectedBranchId, setSelectedBranchId] = useState(null);

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/branches');
      setBranches(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch branches');
      console.error('Error fetching branches:', err);
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
        manager_id: '',
        status: 'active'
      });
      setSelectedBranch(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedBranch(null);
    setFormData({
      name: '',
      address: '',
      phone: '',
      email: '',
      manager_id: '',
      status: 'active'
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    try {
      if (selectedBranch) {
        await api.put(`/api/branches/${selectedBranch.id}`, formData);
      } else {
        await api.post('/api/branches', formData);
      }
      fetchBranches();
      handleCloseDialog();
    } catch (err) {
      setError('Failed to save branch');
      console.error('Error saving branch:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this branch?')) {
      try {
        await api.delete(`/api/branches/${id}`);
        fetchBranches();
      } catch (err) {
        setError('Failed to delete branch');
        console.error('Error deleting branch:', err);
      }
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleBranchSelect = (branchId) => {
    setSelectedBranchId(branchId);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5">Branch Management</Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Add Branch
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Card>
            <CardContent>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Address</TableCell>
                      <TableCell>Contact</TableCell>
                      <TableCell>Manager</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {branches.map((branch) => (
                      <TableRow key={branch.id}>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <LocationIcon sx={{ mr: 1 }} />
                            {branch.name}
                          </Box>
                        </TableCell>
                        <TableCell>{branch.address}</TableCell>
                        <TableCell>
                          <Typography variant="body2">{branch.phone}</Typography>
                          <Typography variant="body2" color="textSecondary">
                            {branch.email}
                          </Typography>
                        </TableCell>
                        <TableCell>{branch.manager_name}</TableCell>
                        <TableCell>
                          <Chip
                            label={branch.status}
                            color={branch.status === 'active' ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton
                            color="primary"
                            onClick={() => {
                              handleOpenDialog(branch);
                              handleBranchSelect(branch.id);
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleDelete(branch.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {selectedBranchId && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Tabs
                  value={activeTab}
                  onChange={handleTabChange}
                  sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
                >
                  <Tab
                    icon={<InventoryIcon />}
                    label="Inventory"
                  />
                  <Tab
                    icon={<AssessmentIcon />}
                    label="Performance"
                  />
                  <Tab
                    icon={<PeopleIcon />}
                    label="Users"
                  />
                  <Tab
                    icon={<SettingsIcon />}
                    label="Settings"
                  />
                </Tabs>

                {activeTab === 0 && (
                  <BranchInventory branchId={selectedBranchId} />
                )}
                {activeTab === 1 && (
                  <BranchPerformance branchId={selectedBranchId} />
                )}
                {activeTab === 2 && (
                  <BranchUsers branchId={selectedBranchId} />
                )}
                {activeTab === 3 && (
                  <BranchSettings branchId={selectedBranchId} />
                )}
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {selectedBranch ? 'Edit Branch' : 'Add New Branch'}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={2}>
            <TextField
              name="name"
              label="Branch Name"
              value={formData.name}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              name="address"
              label="Address"
              value={formData.address}
              onChange={handleChange}
              fullWidth
              multiline
              rows={3}
            />
            <TextField
              name="phone"
              label="Phone"
              value={formData.phone}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              name="email"
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              name="manager_id"
              label="Manager ID"
              value={formData.manager_id}
              onChange={handleChange}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedBranch ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BranchManagement; 