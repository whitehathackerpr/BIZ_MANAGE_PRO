import React from 'react';
import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Grid,
    CircularProgress,
    Alert,
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

const BusinessProfile = () => {
    const { user } = useAuth();
    const { showNotification } = useNotification();
    const [loading, setLoading] = useState<Type>(false);
    const [error, setError] = useState<Type>('');
    const [formData, setFormData] = useState<Type>({
        businessName: '',
        address: '',
        phone: '',
        email: '',
        taxId: '',
        website: '',
        description: '',
    });

    useEffect(() => {
        fetchBusinessProfile();
    }, []);

    const fetchBusinessProfile = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/business/profile');
            setFormData(response.data);
        } catch (err) {
            setError('Failed to fetch business profile');
            showNotification('Failed to fetch business profile', 'error');
        } finally {
            setLoading(false);
        }
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
            setError('');
            await axios.put('/api/business/profile', formData);
            showNotification('Business profile updated successfully', 'success');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update business profile');
            showNotification('Failed to update business profile', 'error');
        } finally {
            setLoading(false);
        }
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
                <Typography variant="h5" gutterBottom>
                    Business Profile
                </Typography>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
                <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Business Name"
                                name="businessName"
                                value={formData.businessName}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Tax ID"
                                name="taxId"
                                value={formData.taxId}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Address"
                                name="address"
                                value={formData.address}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange}
                                multiline
                                rows={2}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Phone"
                                name="phone"
                                value={formData.phone}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
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
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Website"
                                name="website"
                                value={formData.website}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Description"
                                name="description"
                                value={formData.description}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange}
                                multiline
                                rows={4}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                disabled={loading}
                                sx={{ mt: 2 }}
                            >
                                {loading ? <CircularProgress size={24} /> : 'Save Changes'}
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Box>
    );
};

export default BusinessProfile; 