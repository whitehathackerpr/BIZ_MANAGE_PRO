import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home as HomeIcon } from '@mui/icons-material';

const NotFound = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          textAlign: 'center',
        }}
      >
        <Typography variant="h1" component="h1" gutterBottom>
          404
        </Typography>
        <Typography variant="h4" component="h2" gutterBottom>
          {t('notFound.title')}
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          {t('notFound.message')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<HomeIcon />}
          onClick={() => navigate('/dashboard')}
          sx={{ mt: 2 }}
        >
          {t('notFound.backToHome')}
        </Button>
      </Box>
    </Container>
  );
};

export default NotFound; 