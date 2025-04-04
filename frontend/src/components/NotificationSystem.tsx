import React from 'react';
import React from 'react';
import { Snackbar, Alert, AlertTitle } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const NotificationSystem = ({ notifications, onClose }) => {
  const theme = useTheme();

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'success':
        return theme.palette.success.main;
      case 'error':
        return theme.palette.error.main;
      case 'warning':
        return theme.palette.warning.main;
      case 'info':
        return theme.palette.info.main;
      default:
        return theme.palette.primary.main;
    }
  };

  return (
    <>
      {notifications.map((notification) => (
        <Snackbar
          key={notification.id}
          open={true}
          autoHideDuration={6000}
          onClose={() => onClose(notification.id)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{
            '& .MuiSnackbarContent-root': {
              backgroundColor: getSeverityColor(notification.severity),
              color: 'white',
              borderRadius: 2,
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            },
          }}
        >
          <Alert
            onClose={() => onClose(notification.id)}
            severity={notification.severity}
            sx={{
              width: '100%',
              '& .MuiAlert-icon': {
                color: 'white',
              },
            }}
          >
            {notification.title && (
              <AlertTitle sx={{ color: 'white' }}>
                {notification.title}
              </AlertTitle>
            )}
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </>
  );
};

export default NotificationSystem; 