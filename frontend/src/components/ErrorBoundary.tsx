import React from 'react';
import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { Error as ErrorIcon } from '@mui/icons-material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });
    // Log error to error reporting service
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
            background: 'linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 100%)',
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              maxWidth: 600,
              width: '100%',
              textAlign: 'center',
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <ErrorIcon
              sx={{
                fontSize: 64,
                color: '#FF2E63',
                mb: 2,
              }}
            />
            <Typography
              variant="h4"
              gutterBottom
              sx={{
                background: 'linear-gradient(45deg, #00F5FF 30%, #FF2E63 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 700,
              }}
            >
              Oops! Something went wrong
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              We apologize for the inconvenience. An error has occurred in the application.
            </Typography>
            {process.env.NODE_ENV === 'development' && (
              <Box
                sx={{
                  mt: 3,
                  p: 2,
                  bgcolor: 'rgba(0, 0, 0, 0.2)',
                  borderRadius: 1,
                  maxHeight: 200,
                  overflow: 'auto',
                }}
              >
                <Typography variant="body2" color="error" component="pre">
                  {this.state.error?.toString()}
                </Typography>
                <Typography variant="body2" color="text.secondary" component="pre">
                  {this.state.errorInfo?.componentStack}
                </Typography>
              </Box>
            )}
            <Box sx={{ mt: 4 }}>
              <Button
                variant="contained"
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => () => window.location.reload()}
                sx={{
                  mr: 2,
                  background: 'linear-gradient(45deg, #00F5FF 30%, #FF2E63 90%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #00A3A6 30%, #B21F45 90%)',
                  },
                }}
              >
                Reload Page
              </Button>
              <Button
                variant="outlined"
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => () => window.location.href = '/'}
                sx={{
                  borderColor: '#00F5FF',
                  color: '#00F5FF',
                  '&:hover': {
                    borderColor: '#00A3A6',
                    color: '#00A3A6',
                  },
                }}
              >
                Go to Home
              </Button>
            </Box>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 