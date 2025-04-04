import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Snackbar, Alert } from '@mui/material';

interface NotificationContextProps {
  showNotification: (message: string, severity?: 'success' | 'info' | 'warning' | 'error') => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
}

interface NotificationProviderProps {
  children: ReactNode;
}

interface NotificationState {
  open: boolean;
  message: string;
  severity: 'success' | 'info' | 'warning' | 'error';
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export const useNotification = (): NotificationContextProps => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const [notification, setNotification] = useState<NotificationState>({
        open: false,
        message: '',
        severity: 'info',
    });

    const showNotification = (message: string, severity: 'success' | 'info' | 'warning' | 'error' = 'info'): void => {
        setNotification({
            open: true,
            message,
            severity,
        });
    };

    const showSuccess = (message: string): void => showNotification(message, 'success');
    const showError = (message: string): void => showNotification(message, 'error');
    const showWarning = (message: string): void => showNotification(message, 'warning');
    const showInfo = (message: string): void => showNotification(message, 'info');

    const handleClose = (): void => {
        setNotification((prev) => ({
            ...prev,
            open: false,
        }));
    };

    return (
        <NotificationContext.Provider
            value={{
                showNotification,
                showSuccess,
                showError,
                showWarning,
                showInfo,
            }}
        >
            {children}
            <Snackbar
                open={notification.open}
                autoHideDuration={6000}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert
                    onClose={handleClose}
                    severity={notification.severity}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {notification.message}
                </Alert>
            </Snackbar>
        </NotificationContext.Provider>
    );
}; 