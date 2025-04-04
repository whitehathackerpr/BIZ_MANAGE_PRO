import React, { useEffect, useState } from 'react';
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
    Tooltip,
    Button
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useSnackbar } from 'notistack';
import apiClient from '../../../services/apiClient';
import { useNotification } from '../../../contexts/NotificationContext';
import { Person as PersonIcon } from '@mui/icons-material';

// Define our own User interface to match what the component expects
interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    status: string;
    branchId: string;
}

interface BranchUsersProps {
    branchId: string;
}

const BranchUsers: React.FC<BranchUsersProps> = ({ branchId }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { showNotification } = useNotification();
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const response = await apiClient.get<User[]>(`/branches/${branchId}/users`);
                setUsers(response);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch users');
                setLoading(false);
                showNotification('Failed to fetch users', 'error');
            }
        };

        fetchUsers();
    }, [branchId, showNotification]);

    const handleDelete = async (userId: string): Promise<void> => {
        try {
            await apiClient.delete(`/users/${userId}`);
            setUsers(users.filter(user => user.id !== userId));
            showNotification('User deleted successfully', 'success');
        } catch (err) {
            showNotification('Failed to delete user', 'error');
        }
    };

    const getRoleColor = (role: string): "error" | "warning" | "info" | "default" => {
        switch (role) {
            case 'admin':
                return 'error';
            case 'manager':
                return 'warning';
            case 'staff':
                return 'info';
            default:
                return 'default';
        }
    };

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5" component="h2">
                    Branch Users
                </Typography>
                <Button 
                    variant="contained" 
                    color="primary"
                    startIcon={<PersonIcon />}
                >
                    Add User
                </Button>
            </Box>

            {loading ? (
                <Box display="flex" justifyContent="center" mt={4}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Typography color="error">{error}</Typography>
            ) : (
                <TableContainer component={Paper}>
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
                            {users.map((user: User) => (
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
            )}
        </Box>
    );
};

export default BranchUsers; 