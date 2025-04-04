import React from 'react';
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Divider
} from '@mui/material';
import {
  Security as SecurityIcon,
  Computer as ComputerIcon,
  LocationOn as LocationIcon,
  AccessTime as AccessTimeIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

const SessionManager = () => {
  const [sessions, setSessions] = useState<Type>([]);
  const [loading, setLoading] = useState<Type>(false);
  const [showTerminateDialog, setShowTerminateDialog] = useState<Type>(false);
  const [selectedSession, setSelectedSession] = useState<Type>(null);
  const { getSessions, terminateSession } = useAuth();
  const { showNotification } = useNotification();

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const data = await getSessions();
      setSessions(data);
    } catch (error) {
      showNotification(error.message || 'Failed to load sessions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTerminateSession = async () => {
    if (!selectedSession) return;

    try {
      setLoading(true);
      await terminateSession(selectedSession.id);
      setSessions(sessions.filter(s => s.id !== selectedSession.id));
      setShowTerminateDialog(false);
      setSelectedSession(null);
      showNotification('Session terminated successfully', 'success');
    } catch (error) {
      showNotification(error.message || 'Failed to terminate session', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getLocationInfo = (ip) => {
    // In a real application, you would use a geolocation service
    return 'Location information would be displayed here';
  };

  const getDeviceInfo = (userAgent) => {
    // In a real application, you would parse the user agent string
    return 'Device information would be displayed here';
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SecurityIcon color="primary" />
          <Typography variant="h6">Active Sessions</Typography>
        </Box>
        <Button
          startIcon={<RefreshIcon />}
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => loadSessions}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : sessions.length === 0 ? (
        <Alert severity="info">No active sessions found.</Alert>
      ) : (
        <List>
          {sessions.map((session, index) => (
            <React.Fragment key={session.id}>
              {index > 0 && <Divider />}
              <ListItem>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ComputerIcon color="action" />
                      <Typography variant="subtitle1">
                        {getDeviceInfo(session.userAgent)}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <LocationIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {getLocationInfo(session.ip)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccessTimeIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          Last active: {formatDate(session.lastActive)}
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  {session.isCurrent ? (
                    <Chip
                      label="Current Session"
                      color="primary"
                      size="small"
                    />
                  ) : (
                    <IconButton
                      edge="end"
                      onClick={() => {
                        setSelectedSession(session);
                        setShowTerminateDialog(true);
                      }}
                      disabled={loading}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </ListItemSecondaryAction>
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      )}

      <Dialog
        open={showTerminateDialog}
        onClose={() => setShowTerminateDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Terminate Session</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to terminate this session? This will log out the user from this device.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={(e: React.MouseEvent<HTMLButtonElement>) => () => setShowTerminateDialog(false)}>Cancel</Button>
          <Button
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleTerminateSession}
            variant="contained"
            color="error"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Terminate Session'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default SessionManager; 