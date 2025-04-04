import React from 'react';
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Computer as ComputerIcon,
  PhoneAndroid as MobileIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext.jsx';

function SessionManager() {
  const { user, getSessions, terminateSession } = useAuth();
  const [sessions, setSessions] = useState<Type>([]);
  const [openDialog, setOpenDialog] = useState<Type>(false);
  const [selectedSession, setSelectedSession] = useState<Type>(null);
  const [loading, setLoading] = useState<Type>(true);
  const [error, setError] = useState<Type>(null);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSessions();
      setSessions(data);
    } catch (err) {
      setError('Failed to fetch sessions. Please try again.');
      console.error('Error fetching sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleTerminateSession = (sessionId) => {
    setSelectedSession(sessions.find(session => session.id === sessionId));
    setOpenDialog(true);
  };

  const handleConfirmTerminate = async () => {
    try {
      await terminateSession(selectedSession.id);
      setSessions(sessions.filter(session => session.id !== selectedSession.id));
      setOpenDialog(false);
      setSelectedSession(null);
    } catch (err) {
      setError('Failed to terminate session. Please try again.');
      console.error('Error terminating session:', err);
    }
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setSelectedSession(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getDeviceIcon = (device) => {
    return device.toLowerCase().includes('iphone') || device.toLowerCase().includes('android') ? (
      <MobileIcon />
    ) : (
      <ComputerIcon />
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Session Manager</Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => fetchSessions}
          disabled={loading}
        >
          Refresh Sessions
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Device</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>IP Address</TableCell>
              <TableCell>Last Active</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sessions.map((session) => (
              <TableRow key={session.id}>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    {getDeviceIcon(session.device)}
                    <Typography sx={{ ml: 1 }}>{session.device}</Typography>
                  </Box>
                </TableCell>
                <TableCell>{session.location}</TableCell>
                <TableCell>{session.ipAddress}</TableCell>
                <TableCell>{formatDate(session.lastActive)}</TableCell>
                <TableCell>
                  {session.current ? (
                    <Chip label="Current" color="primary" size="small" />
                  ) : (
                    <Chip label="Active" color="success" size="small" />
                  )}
                </TableCell>
                <TableCell>
                  {!session.current && (
                    <IconButton
                      color="error"
                      onClick={(e: React.MouseEvent<HTMLButtonElement>) => () => handleTerminateSession(session.id)}
                      disabled={loading}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>Terminate Session</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to terminate this session? This will log out the user from this device.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleDialogClose}>Cancel</Button>
          <Button 
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleConfirmTerminate} 
            color="error" 
            variant="contained"
            disabled={loading}
          >
            Terminate
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default SessionManager; 