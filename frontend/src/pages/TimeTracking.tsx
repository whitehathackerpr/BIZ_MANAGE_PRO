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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  PlayArrow as ClockInIcon,
  Stop as ClockOutIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

function TimeTracking() {
  const [timeEntries, setTimeEntries] = useState<Type>([]);
  const [openDialog, setOpenDialog] = useState<Type>(false);
  const [selectedEntry, setSelectedEntry] = useState<Type>(null);
  const [formData, setFormData] = useState<Type>({
    date: '',
    clockIn: '',
    clockOut: '',
    notes: '',
  });
  const { user } = useAuth();

  useEffect(() => {
    // TODO: Fetch time entries from API
    // This is mock data for now
    setTimeEntries([
      {
        id: 1,
        date: '2024-03-31',
        clockIn: '09:00',
        clockOut: '17:00',
        notes: 'Regular work day',
      },
      {
        id: 2,
        date: '2024-03-30',
        clockIn: '08:30',
        clockOut: '16:30',
        notes: 'Overtime work',
      },
    ]);
  }, []);

  const handleClockIn = () => {
    const now = new Date();
    const newEntry = {
      id: timeEntries.length + 1,
      date: now.toISOString().split('T')[0],
      clockIn: now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      clockOut: '',
      notes: '',
    };
    setTimeEntries([...timeEntries, newEntry]);
  };

  const handleClockOut = (entryId) => {
    const now = new Date();
    setTimeEntries(
      timeEntries.map((entry) =>
        entry.id === entryId
          ? { ...entry, clockOut: now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }) }
          : entry
      )
    );
  };

  const handleEdit = (entry) => {
    setSelectedEntry(entry);
    setFormData({
      date: entry.date,
      clockIn: entry.clockIn,
      clockOut: entry.clockOut,
      notes: entry.notes,
    });
    setOpenDialog(true);
  };

  const handleDelete = (entryId) => {
    setTimeEntries(timeEntries.filter((entry) => entry.id !== entryId));
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setSelectedEntry(null);
    setFormData({
      date: '',
      clockIn: '',
      clockOut: '',
      notes: '',
    });
  };

  const handleSubmit = () => {
    if (selectedEntry) {
      setTimeEntries(
        timeEntries.map((entry) =>
          entry.id === selectedEntry.id ? { ...entry, ...formData } : entry
        )
      );
    }
    handleDialogClose();
  };

  const calculateHours = (clockIn, clockOut) => {
    if (!clockIn || !clockOut) return 0;
    const [inHour, inMinute] = clockIn.split(':').map(Number);
    const [outHour, outMinute] = clockOut.split(':').map(Number);
    return ((outHour - inHour) * 60 + (outMinute - inMinute)) / 60;
  };

  const totalHours = timeEntries.reduce(
    (sum, entry) => sum + calculateHours(entry.clockIn, entry.clockOut),
    0
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Time Tracking
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Today's Summary
              </Typography>
              <Typography variant="h3">{totalHours.toFixed(1)} hrs</Typography>
              <Typography color="textSecondary">Total Hours This Week</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <Box display="flex" justifyContent="flex-end" mb={3}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<ClockInIcon />}
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleClockIn}
              sx={{ mr: 2 }}
            >
              Clock In
            </Button>
          </Box>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Clock In</TableCell>
              <TableCell>Clock Out</TableCell>
              <TableCell>Hours</TableCell>
              <TableCell>Notes</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {timeEntries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>{entry.date}</TableCell>
                <TableCell>{entry.clockIn}</TableCell>
                <TableCell>
                  {entry.clockOut ? (
                    entry.clockOut
                  ) : (
                    <Button
                      variant="outlined"
                      color="secondary"
                      startIcon={<ClockOutIcon />}
                      onClick={(e: React.MouseEvent<HTMLButtonElement>) => () => handleClockOut(entry.id)}
                    >
                      Clock Out
                    </Button>
                  )}
                </TableCell>
                <TableCell>{calculateHours(entry.clockIn, entry.clockOut).toFixed(1)}</TableCell>
                <TableCell>{entry.notes}</TableCell>
                <TableCell>
                  <IconButton onClick={(e: React.MouseEvent<HTMLButtonElement>) => () => handleEdit(entry)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={(e: React.MouseEvent<HTMLButtonElement>) => () => handleDelete(entry.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>Edit Time Entry</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => (e) => setFormData({ ...formData, date: e.target.value })}
              sx={{ mb: 2 }}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Clock In"
              type="time"
              value={formData.clockIn}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => (e) => setFormData({ ...formData, clockIn: e.target.value })}
              sx={{ mb: 2 }}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Clock Out"
              type="time"
              value={formData.clockOut}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => (e) => setFormData({ ...formData, clockOut: e.target.value })}
              sx={{ mb: 2 }}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Notes"
              multiline
              rows={3}
              value={formData.notes}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => (e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleDialogClose}>Cancel</Button>
          <Button onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleSubmit} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default TimeTracking; 