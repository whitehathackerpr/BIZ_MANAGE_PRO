import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    Snackbar,
    CircularProgress
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const AdminNotificationPanel = () => {
    const { token } = useAuth();
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        target_type: 'all_users'
    });

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);

        try {
            await axios.post('/api/notifications/send', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setSnackbar({
                open: true,
                message: 'Notification sent successfully',
                severity: 'success'
            });

            setFormData({
                title: '',
                message: '',
                target_type: 'all_users'
            });
        } catch (error) {
            setSnackbar({
                open: true,
                message: error.response?.data?.error || 'Failed to send notification',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    return (
        <Box sx={{ maxWidth: 600, mx: 'auto', p: 2 }}>
            <Card>
                <CardContent>
                    <Typography variant="h5" gutterBottom>
                        Send Notification
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                        Send notifications to different user groups
                    </Typography>

                    <form onSubmit={handleSubmit}>
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Target Group</InputLabel>
                            <Select
                                name="target_type"
                                value={formData.target_type}
                                onChange={handleChange}
                                label="Target Group"
                            >
                                <MenuItem value="all_users">All Users</MenuItem>
                                <MenuItem value="admins">Administrators</MenuItem>
                                <MenuItem value="employees">Employees</MenuItem>
                                <MenuItem value="suppliers">Suppliers</MenuItem>
                                <MenuItem value="customers">Customers</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            fullWidth
                            label="Title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            sx={{ mb: 2 }}
                        />

                        <TextField
                            fullWidth
                            label="Message"
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            required
                            multiline
                            rows={4}
                            sx={{ mb: 3 }}
                        />

                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={loading}
                            startIcon={loading ? <CircularProgress size={20} /> : null}
                        >
                            Send Notification
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default AdminNotificationPanel; 