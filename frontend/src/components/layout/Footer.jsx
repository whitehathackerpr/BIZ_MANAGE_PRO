import React from 'react';
import { Box, Typography, Link, useTheme } from '@mui/material';

const Footer = () => {
  const theme = useTheme();

  return (
    <Box
      component="footer"
      sx={{
        py: 2,
        px: 3,
        mt: 'auto',
        backgroundColor: theme.palette.background.paper,
        borderTop: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} BizManage Pro. All rights reserved.
        </Typography>
        <Box sx={{ display: 'flex', gap: 3 }}>
          <Link
            href="/privacy"
            color="text.secondary"
            underline="hover"
            sx={{ fontSize: '0.875rem' }}
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            color="text.secondary"
            underline="hover"
            sx={{ fontSize: '0.875rem' }}
          >
            Terms of Service
          </Link>
          <Link
            href="/contact"
            color="text.secondary"
            underline="hover"
            sx={{ fontSize: '0.875rem' }}
          >
            Contact Us
          </Link>
        </Box>
      </Box>
    </Box>
  );
};

export default Footer; 