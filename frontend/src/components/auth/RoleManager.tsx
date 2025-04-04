import React from 'react';
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Security as SecurityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Check as CheckIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

const roles = {
  ADMIN: {
    name: 'Admin',
    permissions: [
      'manage_users',
      'manage_roles',
      'manage_products',
      'manage_sales',
      'manage_employees',
      'manage_suppliers',
      'view_analytics',
      'manage_settings'
    ]
  },
  EMPLOYEE: {
    name: 'Employee',
    permissions: [
      'view_products',
      'manage_sales',
      'view_analytics',
      'manage_time_tracking'
    ]
  },
  SUPPLIER: {
    name: 'Supplier',
    permissions: [
      'view_products',
      'manage_inventory',
      'view_orders'
    ]
  },
  CUSTOMER: {
    name: 'Customer',
    permissions: [
      'view_products',
      'make_purchases',
      'view_order_history'
    ]
  }
};

const RoleManager = () => {
  const [loading, setLoading] = useState<Type>(false);
  const [users, setUsers] = useState<Type>([]);
  const [showEditDialog, setShowEditDialog] = useState<Type>(false);
  const [selectedUser, setSelectedUser] = useState<Type>(null);
  const [formData, setFormData] = useState<Type>({
    role: '',
    permissions: []
  });
  const { getUsers, updateUserRole, deleteUser } = useAuth();
  const { showNotification } = useNotification();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      showNotification(error.message || 'Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setFormData({
      role: user.role,
      permissions: user.permissions || []
    });
    setShowEditDialog(true);
  };

  const handleUpdateRole = async () => {
    if (!selectedUser) return;

    try {
      setLoading(true);
      await updateUserRole(selectedUser.id, formData);
      setUsers(users.map(user => 
        user.id === selectedUser.id 
          ? { ...user, role: formData.role, permissions: formData.permissions }
          : user
      ));
      setShowEditDialog(false);
      setSelectedUser(null);
      showNotification('User role updated successfully', 'success');
    } catch (error) {
      showNotification(error.message || 'Failed to update user role', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      setLoading(true);
      await deleteUser(userId);
      setUsers(users.filter(user => user.id !== userId));
      showNotification('User deleted successfully', 'success');
    } catch (error) {
      showNotification(error.message || 'Failed to delete user', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getPermissionChips = (permissions) => {
    return permissions.map(permission => (
      <Chip
        key={permission}
        label={permission.replace(/_/g, ' ')}
        size="small"
        sx={{ mr: 0.5, mb: 0.5 }}
      />
    ));
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SecurityIcon color="primary" />
          <Typography variant="h6">Role Management</Typography>
        </Box>
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => () => setShowEditDialog(true)}
          disabled={loading}
        >
          Add User
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : users.length === 0 ? (
        <Alert severity="info">No users found.</Alert>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Permissions</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{roles[user.role]?.name || user.role}</TableCell>
                  <TableCell>
                    {getPermissionChips(user.permissions || [])}
                  </TableCell>
                  <TableCell>
                    {user.isActive ? (
                      <Chip
                        icon={<CheckIcon />}
                        label="Active"
                        color="success"
                        size="small"
                      />
                    ) : (
                      <Chip
                        icon={<CloseIcon />}
                        label="Inactive"
                        color="error"
                        size="small"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => () => handleEditUser(user)}
                        disabled={loading}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => () => handleDeleteUser(user.id)}
                        disabled={loading}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog
        open={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedUser ? 'Edit User Role' : 'Add New User'}
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Role</InputLabel>
            <Select
              value={formData.role}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => (e) => setFormData({ ...formData, role: e.target.value })}
              label="Role"
            >
              {Object.entries(roles).map(([key, role]) => (
                <MenuItem key={key} value={key}>
                  {role.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {formData.role && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Permissions:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {roles[formData.role]?.permissions.map(permission => (
                  <Chip
                    key={permission}
                    label={permission.replace(/_/g, ' ')}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={(e: React.MouseEvent<HTMLButtonElement>) => () => setShowEditDialog(false)}>Cancel</Button>
          <Button
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleUpdateRole}
            variant="contained"
            disabled={loading || !formData.role}
          >
            {loading ? <CircularProgress size={24} /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default RoleManager; 