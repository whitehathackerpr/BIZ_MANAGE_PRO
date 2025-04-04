import React from 'react';
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { Box, CircularProgress, Typography, Paper } from '@mui/material';

const LoadingScreen = () => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0A0B1E 0%, #131428 100%)',
      color: 'white'
    }}
  >
    <Paper
      elevation={3}
      sx={{
        p: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: 'rgba(19, 20, 40, 0.95)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}
    >
      <CircularProgress size={60} sx={{ color: 'primary.main', mb: 2 }} />
      <Typography variant="h6" gutterBottom>
        Loading...
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Please wait while we verify your session
      </Typography>
    </Paper>
  </Box>
);

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute; 