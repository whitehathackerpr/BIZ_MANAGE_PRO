import React from 'react';
import React, { useState, useEffect } from 'react';
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
  Pagination,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
import { useTranslation } from 'react-i18next';
import employeeService from '../services/employeeService';
import branchService from '../services/branchService';
import useStore from '../store/useStore';

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

const EmployeeForm = ({ initialValues, onSubmit, onCancel }) => {
  const { t } = useTranslation();
  const [branches, setBranches] = useState<Type>([]);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await branchService.getBranches();
        setBranches(response.branches);
      } catch (error) {
        console.error('Error fetching branches:', error);
      }
    };
    fetchBranches();
  }, []);

  const validationSchema = yup.object({
    name: yup.string()
      .required(t('employees.nameRequired'))
      .min(2, t('employees.nameMinLength')),
    email: yup.string()
      .required(t('employees.emailRequired'))
      .email(t('employees.emailInvalid')),
    phone: yup.string()
      .required(t('employees.phoneRequired'))
      .matches(/^[0-9+\s-()]+$/, t('employees.phoneInvalid')),
    position: yup.string()
      .required(t('employees.positionRequired')),
    branchId: yup.number()
      .required(t('employees.branchRequired')),
  });

  const formik = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: initialValues || {
      name: '',
      email: '',
      phone: '',
      position: '',
      branchId: '',
    },
  });

  return (
    <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => formik.handleSubmit}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          fullWidth
          id="name"
          name="name"
          label={t('employees.name')}
          value={formik.values.name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.name && Boolean(formik.errors.name)}
          helperText={formik.touched.name && formik.errors.name}
        />
        <TextField
          fullWidth
          id="email"
          name="email"
          label={t('employees.email')}
          value={formik.values.email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.email && Boolean(formik.errors.email)}
          helperText={formik.touched.email && formik.errors.email}
        />
        <TextField
          fullWidth
          id="phone"
          name="phone"
          label={t('employees.phone')}
          value={formik.values.phone}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.phone && Boolean(formik.errors.phone)}
          helperText={formik.touched.phone && formik.errors.phone}
        />
        <TextField
          fullWidth
          id="position"
          name="position"
          label={t('employees.position')}
          value={formik.values.position}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.position && Boolean(formik.errors.position)}
          helperText={formik.touched.position && formik.errors.position}
        />
        <FormControl fullWidth>
          <InputLabel id="branch-label">{t('employees.branch')}</InputLabel>
          <Select
            labelId="branch-label"
            id="branchId"
            name="branchId"
            value={formik.values.branchId}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.branchId && Boolean(formik.errors.branchId)}
            label={t('employees.branch')}
          >
            {branches.map((branch) => (
              <MenuItem key={branch.id} value={branch.id}>
                {branch.name}
              </MenuItem>
            ))}
          </Select>
          {formik.touched.branchId && formik.errors.branchId && (
            <Typography color="error" variant="caption">
              {formik.errors.branchId}
            </Typography>
          )}
        </FormControl>
      </Box>
    </form>
  );
};

const EmployeeList = () => {
  const [page, setPage] = useState<Type>(0);
  const [rowsPerPage, setRowsPerPage] = useState<Type>(10);
  const [selectedEmployee, setSelectedEmployee] = useState<Type>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<Type>(false);
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
                      onClick={(e: React.MouseEvent<HTMLButtonElement>) => () => handleOpenDialog(employee)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={(e: React.MouseEvent<HTMLButtonElement>) => () => handleDelete(employee.id)}
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
            initialValues={selectedEmployee}
            onSubmit={(e: React.FormEvent<HTMLFormElement>) => handleSubmit}
            onCancel={handleCloseDialog}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => () => document.querySelector('form').requestSubmit()}
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
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => () => handleCheckIn(record.employee_id)}
                  >
                    Check In
                  </Button>
                )}
                {record.check_in && !record.check_out && (
                  <Button
                    startIcon={<CancelIcon />}
                    variant="contained"
                    color="error"
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => () => handleCheckOut(record.employee_id)}
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
  const { t } = useTranslation();
  const { user } = useStore();
  const [activeTab, setActiveTab] = useState<Type>(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Employee Management
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleTabChange}>
          <Tab label="Employee List" />
          <Tab label="Attendance Tracking" />
        </Tabs>
      </Paper>

      {activeTab === 0 ? (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
            {user?.role === 'admin' && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => () => handleOpenDialog()}
              >
                {t('employees.add')}
              </Button>
            )}
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