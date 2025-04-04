import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  LinearProgress,
  Alert,
  Tooltip,
  Chip,
  Grid,
  Card,
  CardContent,
  Divider,
  SelectChangeEvent
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Print as PrintIcon,
  FileDownload as FileDownloadIcon,
  AccessTime as AccessTimeIcon,
  Person as PersonIcon,
  CalendarToday as CalendarTodayIcon,
  Timer as TimerIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import apiClient from '../../services/apiClient';

// Simple snackbar implementation since notistack may not be available
const useSnackbar = () => {
  return {
    enqueueSnackbar: (message: string, options?: { variant: string }) => {
      console.log(message, options);
    }
  };
};

interface TimeLog {
  id: string;
  employee_id: string;
  employee_name: string;
  check_in_time: string;
  check_out_time: string | null;
  hours_worked: number | null;
  status: 'checked_in' | 'checked_out' | 'absent';
  notes?: string;
}

interface TimeLogResponse {
  items: TimeLog[];
  total: number;
}

interface TimeLogFormData {
  employee_id: string;
  check_in_time: Date | null;
  check_out_time: Date | null;
  notes: string;
}

interface TimeLogFilters {
  status: string;
  employeeId: string;
  startDate: Date | null;
  endDate: Date | null;
}

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

interface SummaryData {
  totalEmployees: number;
  presentToday: number;
  absentToday: number;
  averageHoursWorked: number;
}

interface Employee {
  id: string;
  name: string;
}

const EmployeeTimeTracking: React.FC = () => {
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filters, setFilters] = useState<TimeLogFilters>({
    status: '',
    employeeId: '',
    startDate: null,
    endDate: null
  });
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'check_in_time',
    direction: 'desc'
  });
  const [open, setOpen] = useState<boolean>(false);
  const [selectedLog, setSelectedLog] = useState<TimeLog | null>(null);
  const [formData, setFormData] = useState<TimeLogFormData>({
    employee_id: '',
    check_in_time: null,
    check_out_time: null,
    notes: ''
  });
  const [summary, setSummary] = useState<SummaryData>({
    totalEmployees: 0,
    presentToday: 0,
    absentToday: 0,
    averageHoursWorked: 0
  });
  const [employees, setEmployees] = useState<Employee[]>([]);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchTimeLogs();
    fetchSummary();
    fetchEmployees();
  }, [page, rowsPerPage, searchQuery, filters, sortConfig]);

  const fetchTimeLogs = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page: page + 1,
        per_page: rowsPerPage,
        search: searchQuery,
        ...filters,
        sort_by: sortConfig.key,
        sort_direction: sortConfig.direction
      };

      const response = await apiClient.get<TimeLogResponse>('/time-logs', { params });
      setTimeLogs(response.data.items);
      setTotalCount(response.data.total);
    } catch (error) {
      setError('Failed to fetch time logs');
      enqueueSnackbar('Failed to fetch time logs', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async (): Promise<void> => {
    try {
      const response = await apiClient.get<SummaryData>('/time-logs/summary');
      setSummary(response.data);
    } catch (error) {
      console.error('Failed to fetch time logs summary:', error);
    }
  };

  const fetchEmployees = async (): Promise<void> => {
    try {
      const response = await apiClient.get<Employee[]>('/employees/list');
      setEmployees(response.data);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    }
  };

  const handleChangePage = (_event: unknown, newPage: number): void => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event: ChangeEvent<HTMLInputElement>): void => {
    setSearchQuery(event.target.value);
    setPage(0);
  };

  const handleFilterChange = (field: keyof TimeLogFilters, value: any): void => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(0);
  };

  const handleSort = (key: string): void => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleOpen = (log: TimeLog | null = null): void => {
    if (log) {
      setSelectedLog(log);
      setFormData({
        employee_id: log.employee_id,
        check_in_time: new Date(log.check_in_time),
        check_out_time: log.check_out_time ? new Date(log.check_out_time) : null,
        notes: log.notes || ''
      });
    } else {
      setSelectedLog(null);
      setFormData({
        employee_id: '',
        check_in_time: null,
        check_out_time: null,
        notes: ''
      });
    }
    setOpen(true);
  };

  const handleClose = (): void => {
    setOpen(false);
    setSelectedLog(null);
    setFormData({
      employee_id: '',
      check_in_time: null,
      check_out_time: null,
      notes: ''
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    try {
      if (selectedLog) {
        await apiClient.put(`/time-logs/${selectedLog.id}`, formData);
        enqueueSnackbar('Time log updated successfully', { variant: 'success' });
      } else {
        await apiClient.post('/time-logs', formData);
        enqueueSnackbar('Time log created successfully', { variant: 'success' });
      }
      fetchTimeLogs();
      fetchSummary();
      handleClose();
    } catch (error) {
      enqueueSnackbar('Failed to save time log', { variant: 'error' });
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    if (window.confirm('Are you sure you want to delete this time log?')) {
      try {
        await apiClient.delete(`/time-logs/${id}`);
        enqueueSnackbar('Time log deleted successfully', { variant: 'success' });
        fetchTimeLogs();
        fetchSummary();
      } catch (error) {
        enqueueSnackbar('Failed to delete time log', { variant: 'error' });
      }
    }
  };

  const handleCheckIn = async (employeeId: string): Promise<void> => {
    try {
      await apiClient.post('/time-logs/check-in', { employee_id: employeeId });
      enqueueSnackbar('Employee checked in successfully', { variant: 'success' });
      fetchTimeLogs();
      fetchSummary();
    } catch (error) {
      enqueueSnackbar('Failed to check in employee', { variant: 'error' });
    }
  };

  const handleCheckOut = async (employeeId: string): Promise<void> => {
    try {
      await apiClient.post('/time-logs/check-out', { employee_id: employeeId });
      enqueueSnackbar('Employee checked out successfully', { variant: 'success' });
      fetchTimeLogs();
      fetchSummary();
    } catch (error) {
      enqueueSnackbar('Failed to check out employee', { variant: 'error' });
    }
  };

  const handlePrint = (): void => {
    window.print();
  };

  const handleExport = async (): Promise<void> => {
    try {
      const response = await apiClient.get('/time-logs/export', {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'time_logs.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      enqueueSnackbar('Failed to export time logs', { variant: 'error' });
    }
  };

  const handleDateChange = (field: 'check_in_time' | 'check_out_time', date: Date | null): void => {
    setFormData(prev => ({
      ...prev,
      [field]: date
    }));
  };

  const handleEmployeeChange = (event: SelectChangeEvent): void => {
    setFormData(prev => ({
      ...prev,
      employee_id: event.target.value
    }));
  };

  const handleNotesChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setFormData(prev => ({
      ...prev,
      notes: event.target.value
    }));
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Employee Time Tracking</Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AccessTimeIcon />}
            onClick={() => handleOpen()}
          >
            New Time Entry
          </Button>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
          >
            Print
          </Button>
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={handleExport}
          >
            Export
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary">Total Employees</Typography>
              <Box display="flex" alignItems="center">
                <PersonIcon sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="h5">{summary.totalEmployees}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary">Present Today</Typography>
              <Box display="flex" alignItems="center">
                <CheckCircleIcon sx={{ color: 'success.main', mr: 1 }} />
                <Typography variant="h5">{summary.presentToday}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary">Absent Today</Typography>
              <Box display="flex" alignItems="center">
                <CancelIcon sx={{ color: 'error.main', mr: 1 }} />
                <Typography variant="h5">{summary.absentToday}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary">Avg. Hours Worked</Typography>
              <Box display="flex" alignItems="center">
                <TimerIcon sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="h5">{summary.averageHoursWorked.toFixed(1)}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ mb: 3, p: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <TextField
            placeholder="Search employees..."
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={handleSearch}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
            }}
            sx={{ width: 300 }}
          />

          <Box display="flex" alignItems="center">
            <FilterIcon sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2" color="textSecondary" sx={{ mr: 2 }}>
              Filters:
            </Typography>

            <FormControl size="small" sx={{ minWidth: 120, mr: 2 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="checked_in">Checked In</MenuItem>
                <MenuItem value="checked_out">Checked Out</MenuItem>
                <MenuItem value="absent">Absent</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150, mr: 2 }}>
              <InputLabel>Employee</InputLabel>
              <Select
                value={filters.employeeId}
                label="Employee"
                onChange={(e) => handleFilterChange('employeeId', e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                {employees.map((employee) => (
                  <MenuItem key={employee.id} value={employee.id}>{employee.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>

        <Box display="flex" flexWrap="wrap" gap={2}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Start Date"
              value={filters.startDate}
              onChange={(date) => handleFilterChange('startDate', date)}
              slotProps={{ textField: { size: 'small' } }}
            />
            <DatePicker
              label="End Date"
              value={filters.endDate}
              onChange={(date) => handleFilterChange('endDate', date)}
              slotProps={{ textField: { size: 'small' } }}
            />
          </LocalizationProvider>
        </Box>
      </Paper>

      {loading && <LinearProgress />}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={sortConfig.key === 'employee_name'}
                  direction={sortConfig.key === 'employee_name' ? sortConfig.direction : 'asc'}
                  onClick={() => handleSort('employee_name')}
                >
                  Employee
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortConfig.key === 'check_in_time'}
                  direction={sortConfig.key === 'check_in_time' ? sortConfig.direction : 'asc'}
                  onClick={() => handleSort('check_in_time')}
                >
                  Check In
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortConfig.key === 'check_out_time'}
                  direction={sortConfig.key === 'check_out_time' ? sortConfig.direction : 'asc'}
                  onClick={() => handleSort('check_out_time')}
                >
                  Check Out
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortConfig.key === 'hours_worked'}
                  direction={sortConfig.key === 'hours_worked' ? sortConfig.direction : 'asc'}
                  onClick={() => handleSort('hours_worked')}
                >
                  Hours
                </TableSortLabel>
              </TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Notes</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {timeLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{log.employee_name}</TableCell>
                <TableCell>
                  {log.check_in_time ? new Date(log.check_in_time).toLocaleString() : 'N/A'}
                </TableCell>
                <TableCell>
                  {log.check_out_time ? new Date(log.check_out_time).toLocaleString() : 'N/A'}
                </TableCell>
                <TableCell>{log.hours_worked?.toFixed(2) || 'N/A'}</TableCell>
                <TableCell>
                  <Chip
                    label={log.status}
                    color={
                      log.status === 'checked_in' ? 'success' :
                      log.status === 'checked_out' ? 'primary' :
                      'error'
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                    {log.notes || ''}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    {log.status === 'checked_in' && (
                      <Tooltip title="Check Out">
                        <IconButton onClick={() => handleCheckOut(log.employee_id)} color="primary">
                          <AccessTimeIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Edit">
                      <IconButton onClick={() => handleOpen(log)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton onClick={() => handleDelete(log.id)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {timeLogs.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No time logs found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={totalCount}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedLog ? 'Edit Time Log' : 'New Time Log'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Employee</InputLabel>
                  <Select
                    value={formData.employee_id}
                    onChange={handleEmployeeChange}
                    label="Employee"
                    required
                  >
                    {employees.map((employee) => (
                      <MenuItem key={employee.id} value={employee.id}>{employee.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Check In Time"
                    value={formData.check_in_time}
                    onChange={(date) => handleDateChange('check_in_time', date)}
                    slotProps={{ textField: { fullWidth: true, margin: 'normal' } }}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Check Out Time"
                    value={formData.check_out_time}
                    onChange={(date) => handleDateChange('check_out_time', date)}
                    slotProps={{ textField: { fullWidth: true, margin: 'normal' } }}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  name="notes"
                  multiline
                  rows={3}
                  value={formData.notes}
                  onChange={handleNotesChange}
                  margin="normal"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {selectedLog ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default EmployeeTimeTracking; 