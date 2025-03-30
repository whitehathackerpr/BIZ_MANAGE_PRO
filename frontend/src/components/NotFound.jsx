import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Home as HomeIcon } from '@mui/icons-material';

const NotFound = () => {
    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                p: 2,
                background: 'linear-gradient(135deg, #0A0B1E 0%, #131428 100%)'
            }}
        >
            <Typography variant="h1" className="gradient-text" gutterBottom>
                404
            </Typography>
            <Typography variant="h4" color="text.primary" gutterBottom>
                Page Not Found
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
                The page you are looking for doesn't exist or has been moved.
            </Typography>
            <Button
                component={RouterLink}
                to="/"
                variant="contained"
                startIcon={<HomeIcon />}
                sx={{
                    mt: 2,
                    background: 'linear-gradient(45deg, #00F5FF 30%, #FF2E63 90%)',
                    '&:hover': {
                        background: 'linear-gradient(45deg, #00C2D4 30%, #C4003D 90%)',
                    },
                }}
            >
                Go to Home
            </Button>
        </Box>
    );
};

export default NotFound; 