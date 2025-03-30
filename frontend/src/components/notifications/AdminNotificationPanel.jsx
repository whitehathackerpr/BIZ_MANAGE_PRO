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
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import axios from 'axios';
import { useNotification } from '../../contexts/NotificationContext';

const AdminNotificationPanel = () => {
    const { showNotification } = useNotification();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [editingNotification, setEditingNotification] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        type: 'info',
        priority: 'normal',
        targetAudience: 'all',
        startDate: '',
        endDate: '',
        isActive: true,
    });

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/admin/notifications');
            setNotifications(response.data);
        } catch (err) {
            setError('Failed to fetch notifications');
            showNotification('Failed to fetch notifications', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (notification = null) => {
        if (notification) {
            setEditingNotification(notification);
            setFormData(notification);
        } else {
            setEditingNotification(null);
            setFormData({
                title: '',
                message: '',
                type: 'info',
                priority: 'normal',
                targetAudience: 'all',
                startDate: '',
                endDate: '',
                isActive: true,
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingNotification(null);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            if (editingNotification) {
                await axios.put(`/api/admin/notifications/${editingNotification.id}`, formData);
                showNotification('Notification updated successfully', 'success');
            } else {
                await axios.post('/api/admin/notifications', formData);
                showNotification('Notification created successfully', 'success');
            }
            handleCloseDialog();
            fetchNotifications();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save notification');
            showNotification('Failed to save notification', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (notificationId) => {
        if (window.confirm('Are you sure you want to delete this notification?')) {
            try {
                setLoading(true);
                await axios.delete(`/api/admin/notifications/${notificationId}`);
                showNotification('Notification deleted successfully', 'success');
                fetchNotifications();
            } catch (err) {
                setError('Failed to delete notification');
                showNotification('Failed to delete notification', 'error');
            } finally {
                setLoading(false);
            }
        }
    };

    const getPriorityColor = (priority) => {
        const colors = {
            high: 'error',
            normal: 'warning',
            low: 'success',
        };
        return colors[priority] || 'default';
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
                    <Typography variant="h5">System Notifications</Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenDialog()}
                    >
                        Create Notification
                    </Button>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Title</TableCell>
                                <TableCell>Message</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>Priority</TableCell>
                                <TableCell>Target</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {notifications.map((notification) => (
                                <TableRow key={notification.id}>
                                    <TableCell>{notification.title}</TableCell>
                                    <TableCell>{notification.message}</TableCell>
                                    <TableCell>{notification.type}</TableCell>
                                    <TableCell>
                                        <Typography color={getPriorityColor(notification.priority)}>
                                            {notification.priority}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>{notification.targetAudience}</TableCell>
                                    <TableCell>{notification.isActive ? 'Active' : 'Inactive'}</TableCell>
                                    <TableCell>
                                        <IconButton
                                            color="primary"
                                            onClick={() => handleOpenDialog(notification)}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            color="error"
                                            onClick={() => handleDelete(notification.id)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                    <DialogTitle>
                        {editingNotification ? 'Edit Notification' : 'Create New Notification'}
                    </DialogTitle>
                    <form onSubmit={handleSubmit}>
                        <DialogContent>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Title"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        multiline
                                        rows={4}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <FormControl fullWidth required>
                                        <InputLabel>Type</InputLabel>
                                        <Select
                                            name="type"
                                            value={formData.type}
                                            onChange={handleChange}
                                            label="Type"
                                        >
                                            <MenuItem value="info">Info</MenuItem>
                                            <MenuItem value="warning">Warning</MenuItem>
                                            <MenuItem value="error">Error</MenuItem>
                                            <MenuItem value="success">Success</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <FormControl fullWidth required>
                                        <InputLabel>Priority</InputLabel>
                                        <Select
                                            name="priority"
                                            value={formData.priority}
                                            onChange={handleChange}
                                            label="Priority"
                                        >
                                            <MenuItem value="high">High</MenuItem>
                                            <MenuItem value="normal">Normal</MenuItem>
                                            <MenuItem value="low">Low</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12}>
                                    <FormControl fullWidth required>
                                        <InputLabel>Target Audience</InputLabel>
                                        <Select
                                            name="targetAudience"
                                            value={formData.targetAudience}
                                            onChange={handleChange}
                                            label="Target Audience"
                                        >
                                            <MenuItem value="all">All Users</MenuItem>
                                            <MenuItem value="admin">Admins Only</MenuItem>
                                            <MenuItem value="manager">Managers Only</MenuItem>
                                            <MenuItem value="employee">Employees Only</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Start Date"
                                        name="startDate"
                                        type="datetime-local"
                                        value={formData.startDate}
                                        onChange={handleChange}
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="End Date"
                                        name="endDate"
                                        type="datetime-local"
                                        value={formData.endDate}
                                        onChange={handleChange}
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseDialog}>Cancel</Button>
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

export default AdminNotificationPanel; 