import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Link,
    CircularProgress,
    Alert,
    InputAdornment,
    IconButton
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    Email as EmailIcon,
    Lock as LockIcon
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const { showNotification } = useNotification();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await login(formData.email, formData.password);
            showNotification('Login successful', 'success');
            navigate('/dashboard');
        } catch (error) {
            showNotification(error.message || 'Login failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #0A0B1E 0%, #131428 100%)',
                p: 2
            }}
        >
            <Paper
                elevation={3}
                sx={{
                    p: 4,
                    width: '100%',
                    maxWidth: 400,
                    background: 'rgba(19, 20, 40, 0.95)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
                }}
            >
                <Box textAlign="center" mb={4}>
                    <Typography variant="h4" className="gradient-text" gutterBottom>
                        Welcome Back
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Sign in to continue to your account
                    </Typography>
                </Box>

                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        margin="normal"
                        required
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <EmailIcon sx={{ color: 'primary.main' }} />
                                </InputAdornment>
                            ),
                        }}
                    />

                    <TextField
                        fullWidth
                        label="Password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={handleChange}
                        margin="normal"
                        required
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <LockIcon sx={{ color: 'primary.main' }} />
                                </InputAdornment>
                            ),
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => setShowPassword(!showPassword)}
                                        edge="end"
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        disabled={loading}
                        sx={{
                            mt: 3,
                            mb: 2,
                            py: 1.5,
                            background: 'linear-gradient(45deg, #00F5FF 30%, #FF2E63 90%)',
                            '&:hover': {
                                background: 'linear-gradient(45deg, #00C2D4 30%, #C4003D 90%)',
                            },
                        }}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Sign In'}
                    </Button>

                    <Box textAlign="center">
                        <Typography variant="body2" color="text.secondary">
                            Don't have an account?{' '}
                            <Link
                                component={RouterLink}
                                to="/register"
                                sx={{
                                    color: 'primary.main',
                                    textDecoration: 'none',
                                    '&:hover': {
                                        textDecoration: 'underline',
                                    },
                                }}
                            >
                                Sign up
                            </Link>
                        </Typography>
                    </Box>
                </form>
            </Paper>
        </Box>
    );
};

export default Login; 