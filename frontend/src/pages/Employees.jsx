import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  Chip,
  Tabs,
  Tab,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const schema = yup.object().shape({
  first_name: yup.string().required('First name is required'),
  last_name: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup.string(),
  role: yup.string().required('Role is required'),
  department: yup.string(),
  hire_date: yup.date(),
  salary: yup.number().min(0, 'Salary must be positive'),
});

const EmployeeForm = ({ employee, onSubmit, onCancel }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: employee || {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      role: '',
      department: '',
      hire_date: '',
      salary: 0,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="First Name"
            {...register('first_name')}
            error={!!errors.first_name}
            helperText={errors.first_name?.message}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Last Name"
            {...register('last_name')}
            error={!!errors.last_name}
            helperText={errors.last_name?.message}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Email"
            {...register('email')}
            error={!!errors.email}
            helperText={errors.email?.message}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Phone"
            {...register('phone')}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Role"
            {...register('role')}
            error={!!errors.role}
            helperText={errors.role?.message}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Department"
            {...register('department')}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Hire Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            {...register('hire_date')}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Salary"
            type="number"
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
            {...register('salary')}
            error={!!errors.salary}
            helperText={errors.salary?.message}
          />
        </Grid>
      </Grid>
    </form>
  );
};

const EmployeeList = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: employees, isLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const response = await axios.get('/api/employees');
      return response.data;
    },
  });

  const createEmployeeMutation = useMutation({
    mutationFn: async (employeeData) => {
      const response = await axios.post('/api/employees', employeeData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['employees']);
      setIsDialogOpen(false);
    },
  });

  const updateEmployeeMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await axios.put(`/api/employees/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['employees']);
      setIsDialogOpen(false);
    },
  });

  const deleteEmployeeMutation = useMutation({
    mutationFn: async (id) => {
      await axios.delete(`/api/employees/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['employees']);
    },
  });

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (employee = null) => {
    setSelectedEmployee(employee);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setSelectedEmployee(null);
    setIsDialogOpen(false);
  };

  const handleSubmit = (data) => {
    if (selectedEmployee) {
      updateEmployeeMutation.mutate({ id: selectedEmployee.id, data });
    } else {
      createEmployeeMutation.mutate(data);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      deleteEmployeeMutation.mutate(id);
    }
  };

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employees
              ?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    {employee.first_name} {employee.last_name}
                  </TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>{employee.role}</TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>
                    <Chip
                      label={employee.is_active ? 'Active' : 'Inactive'}
                      color={employee.is_active ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(employee)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(employee.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={employees?.length || 0}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />

      <Dialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedEmployee ? 'Edit Employee' : 'Add New Employee'}
        </DialogTitle>
        <DialogContent>
          <EmployeeForm
            employee={selectedEmployee}
            onSubmit={handleSubmit}
            onCancel={handleCloseDialog}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={createEmployeeMutation.isLoading || updateEmployeeMutation.isLoading}
          >
            {selectedEmployee ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const AttendanceTracker = () => {
  const { data: attendance, isLoading } = useQuery({
    queryKey: ['attendance'],
    queryFn: async () => {
      const response = await axios.get('/api/attendance');
      return response.data;
    },
  });

  const checkInMutation = useMutation({
    mutationFn: async (employeeId) => {
      const response = await axios.post('/api/attendance/check-in', { employee_id: employeeId });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['attendance']);
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: async (employeeId) => {
      const response = await axios.post('/api/attendance/check-out', { employee_id: employeeId });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['attendance']);
    },
  });

  const handleCheckIn = (employeeId) => {
    checkInMutation.mutate(employeeId);
  };

  const handleCheckOut = (employeeId) => {
    checkOutMutation.mutate(employeeId);
  };

  return (
    <Grid container spacing={3}>
      {attendance?.map((record) => (
        <Grid item xs={12} sm={6} md={4} key={record.id}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ListItemIcon>
                  <AccessTimeIcon color="primary" />
                </ListItemIcon>
                <Typography variant="h6">
                  {record.employee.first_name} {record.employee.last_name}
                </Typography>
              </Box>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Date"
                    secondary={new Date(record.date).toLocaleDateString()}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Check In"
                    secondary={record.check_in ? new Date(record.check_in).toLocaleTimeString() : 'Not checked in'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Check Out"
                    secondary={record.check_out ? new Date(record.check_out).toLocaleTimeString() : 'Not checked out'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Status"
                    secondary={
                      <Chip
                        label={record.status}
                        color={
                          record.status === 'present'
                            ? 'success'
                            : record.status === 'late'
                            ? 'warning'
                            : 'error'
                        }
                        size="small"
                      />
                    }
                  />
                </ListItem>
              </List>
              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                {!record.check_in && (
                  <Button
                    startIcon={<CheckCircleIcon />}
                    variant="contained"
                    color="success"
                    onClick={() => handleCheckIn(record.employee_id)}
                  >
                    Check In
                  </Button>
                )}
                {record.check_in && !record.check_out && (
                  <Button
                    startIcon={<CancelIcon />}
                    variant="contained"
                    color="error"
                    onClick={() => handleCheckOut(record.employee_id)}
                  >
                    Check Out
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

const Employees = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Employee Management
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Employee List" />
          <Tab label="Attendance Tracking" />
        </Tabs>
      </Paper>

      {activeTab === 0 ? (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Add Employee
            </Button>
          </Box>
          <EmployeeList />
        </>
      ) : (
        <AttendanceTracker />
      )}
    </Box>
  );
};

export default Employees; 