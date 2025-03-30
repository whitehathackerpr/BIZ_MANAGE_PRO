import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    Alert,
    Chip,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Person as PersonIcon
} from '@mui/icons-material';
import userApi from '../../../services/userApi';
import { useNotification } from '../../../contexts/NotificationContext';

const BranchUsers = ({ branchId }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { showNotification } = useNotification();

    useEffect(() => {
        fetchUsers();
    }, [branchId]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await userApi.getUsers();
            // Filter users for this branch
            const branchUsers = response.filter(user => user.branchId === branchId);
            setUsers(branchUsers);
        } catch (err) {
            setError('Failed to fetch users');
            showNotification('Failed to fetch users', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (userId) => {
        try {
            await userApi.deleteUser(userId);
            showNotification('User deleted successfully', 'success');
            fetchUsers();
        } catch (err) {
            showNotification('Failed to delete user', 'error');
        }
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'admin':
                return 'error';
            case 'manager':
                return 'warning';
            case 'employee':
                return 'info';
            default:
                return 'default';
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box p={2}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    return (
        <Box>
            <Box display="flex" alignItems="center" mb={2}>
                <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" className="gradient-text">
                    Branch Users
                </Typography>
            </Box>
            <TableContainer component={Paper} className="glass">
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Role</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>{user.firstName} {user.lastName}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={user.role}
                                        color={getRoleColor(user.role)}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={user.status}
                                        color={user.status === 'active' ? 'success' : 'default'}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Tooltip title="Edit User">
                                        <IconButton size="small" color="primary">
                                            <EditIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete User">
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => handleDelete(user.id)}
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
        </Box>
    );
};

export default BranchUsers; 