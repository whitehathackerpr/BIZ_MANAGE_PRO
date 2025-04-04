import React from 'react';
import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    Grid,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    CircularProgress,
    Alert,
    Tooltip,
    Chip,
    MenuItem,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Person as PersonIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { useNotification } from '../../contexts/NotificationContext';
import userApi from '../../services/userApi';

const UserManagement = () => {
    const [users, setUsers] = useState<Type>([]);
    const [loading, setLoading] = useState<Type>(true);
    const [error, setError] = useState<Type>(null);
    const [openDialog, setOpenDialog] = useState<Type>(false);
    const [editingUser, setEditingUser] = useState<Type>(null);
    const [formData, setFormData] = useState<Type>({
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        role: 'user',
        branchId: '',
        status: 'active',
    });
    const { showNotification } = useNotification();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const data = await userApi.getUsers();
            setUsers(data);
        } catch (err) {
            setError('Failed to fetch users');
            showNotification('Failed to fetch users', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (user = null) => {
        if (user) {
            setEditingUser(user);
            setFormData(user);
        } else {
            setEditingUser(null);
            setFormData({
                username: '',
                email: '',
                firstName: '',
                lastName: '',
                role: 'user',
                branchId: '',
                status: 'active',
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingUser(null);
        setFormData({
            username: '',
            email: '',
            firstName: '',
            lastName: '',
            role: 'user',
            branchId: '',
            status: 'active',
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async () => {
        try {
            if (editingUser) {
                await userApi.updateUser(editingUser.id, formData);
                showNotification('User updated successfully', 'success');
            } else {
                await userApi.createUser(formData);
                showNotification('User created successfully', 'success');
            }
            handleCloseDialog();
            fetchUsers();
        } catch (err) {
            showNotification(
                `Failed to ${editingUser ? 'update' : 'create'} user`,
                'error'
            );
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await userApi.deleteUser(id);
                showNotification('User deleted successfully', 'success');
                fetchUsers();
            } catch (err) {
                showNotification('Failed to delete user', 'error');
            }
        }
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'admin':
                return '#FF2E63';
            case 'manager':
                return '#00F5FF';
            default:
                return 'rgba(255, 255, 255, 0.7)';
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h4" className="gradient-text">
                    User Management
                </Typography>
                <Box>
                    <Tooltip title="More options">
                        <IconButton sx={{ mr: 2 }}>
                            <MoreVertIcon />
                        </IconButton>
                    </Tooltip>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => () => handleOpenDialog()}
                        sx={{
                            background: 'linear-gradient(45deg, #00F5FF 30%, #FF2E63 90%)',
                            '&:hover': {
                                background: 'linear-gradient(45deg, #00C2D4 30%, #C4003D 90%)',
                            },
                        }}
                    >
                        Add User
                    </Button>
                </Box>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Paper className="glass">
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>User</TableCell>
                                <TableCell>Contact</TableCell>
                                <TableCell>Role</TableCell>
                                <TableCell>Branch</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <Box display="flex" alignItems="center">
                                            <PersonIcon sx={{ mr: 1, color: '#00F5FF' }} />
                                            <Box>
                                                <Typography variant="body1">
                                                    {user.firstName} {user.lastName}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {user.username}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box display="flex" flexDirection="column">
                                            <Box display="flex" alignItems="center">
                                                <EmailIcon sx={{ mr: 1, color: '#00F5FF', fontSize: 16 }} />
                                                {user.email}
                                            </Box>
                                            <Box display="flex" alignItems="center">
                                                <PhoneIcon sx={{ mr: 1, color: '#00F5FF', fontSize: 16 }} />
                                                {user.phone}
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={user.role}
                                            size="small"
                                            sx={{
                                                backgroundColor: `${getRoleColor(user.role)}20`,
                                                color: getRoleColor(user.role),
                                                fontWeight: 'bold',
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>{user.branchName}</TableCell>
                                    <TableCell>
                                        <Typography
                                            sx={{
                                                color: user.status === 'active' ? '#00F5FF' : '#FF2E63',
                                                fontWeight: 'bold',
                                            }}
                                        >
                                            {user.status}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="Edit user">
                                            <IconButton
                                                onClick={(e: React.MouseEvent<HTMLButtonElement>) => () => handleOpenDialog(user)}
                                                sx={{
                                                    color: 'rgba(255, 255, 255, 0.5)',
                                                    '&:hover': {
                                                        color: '#00F5FF',
                                                    },
                                                }}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete user">
                                            <IconButton
                                                onClick={(e: React.MouseEvent<HTMLButtonElement>) => () => handleDelete(user.id)}
                                                sx={{
                                                    color: 'rgba(255, 255, 255, 0.5)',
                                                    '&:hover': {
                                                        color: '#FF2E63',
                                                    },
                                                }}
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
            </Paper>

            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                PaperProps={{
                    sx: {
                        background: 'rgba(19, 20, 40, 0.95)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
                    },
                }}
            >
                <DialogTitle>
                    <Typography className="gradient-text">
                        {editingUser ? 'Edit User' : 'Add New User'}
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="First Name"
                                name="firstName"
                                value={formData.firstName}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Last Name"
                                name="lastName"
                                value={formData.lastName}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Username"
                                name="username"
                                value={formData.username}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Email"
                                name="email"
                                value={formData.email}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                select
                                label="Role"
                                name="role"
                                value={formData.role}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange}
                                required
                            >
                                <MenuItem value="admin">Admin</MenuItem>
                                <MenuItem value="manager">Manager</MenuItem>
                                <MenuItem value="user">User</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                select
                                label="Branch"
                                name="branchId"
                                value={formData.branchId}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange}
                                required
                            >
                                <MenuItem value="1">Main Branch</MenuItem>
                                <MenuItem value="2">Downtown Branch</MenuItem>
                                <MenuItem value="3">West Branch</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                select
                                label="Status"
                                name="status"
                                value={formData.status}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange}
                                required
                            >
                                <MenuItem value="active">Active</MenuItem>
                                <MenuItem value="inactive">Inactive</MenuItem>
                            </TextField>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleCloseDialog}>Cancel</Button>
                    <Button
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleSubmit}
                        variant="contained"
                        sx={{
                            background: 'linear-gradient(45deg, #00F5FF 30%, #FF2E63 90%)',
                            '&:hover': {
                                background: 'linear-gradient(45deg, #00C2D4 30%, #C4003D 90%)',
                            },
                        }}
                    >
                        {editingUser ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default UserManagement; 