import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    Grid,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    CircularProgress,
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    Person as PersonIcon,
    Work as WorkIcon,
    Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { branchApi, userApi } from '../../../services/api';
import { useNotification } from '../../../contexts/NotificationContext';

const BranchEmployees = ({ branchId, onBranchSelect }) => {
    const { showNotification } = useNotification();
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [formData, setFormData] = useState({
        userId: '',
        role: '',
        startDate: '',
        endDate: '',
        status: 'active',
        salary: '',
        schedule: '',
        notes: '',
    });

    useEffect(() => {
        if (branchId) {
            fetchEmployees();
        }
    }, [branchId]);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const response = await branchApi.getEmployees(branchId);
            setEmployees(response.data);
        } catch (err) {
            setError('Failed to fetch employees');
            showNotification('Failed to fetch employees', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (employee = null) => {
        if (employee) {
            setEditingEmployee(employee);
            setFormData(employee);
        } else {
            setEditingEmployee(null);
            setFormData({
                userId: '',
                role: '',
                startDate: '',
                endDate: '',
                status: 'active',
                salary: '',
                schedule: '',
                notes: '',
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingEmployee(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            if (editingEmployee) {
                await branchApi.updateEmployee(branchId, editingEmployee.id, formData);
                showNotification('Employee updated successfully', 'success');
            } else {
                await branchApi.addEmployee(branchId, formData);
                showNotification('Employee added successfully', 'success');
            }
            handleCloseDialog();
            fetchEmployees();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save employee');
            showNotification('Failed to save employee', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (employeeId) => {
        if (window.confirm('Are you sure you want to remove this employee from the branch?')) {
            try {
                setLoading(true);
                await branchApi.removeEmployee(branchId, employeeId);
                showNotification('Employee removed successfully', 'success');
                fetchEmployees();
            } catch (err) {
                setError('Failed to remove employee');
                showNotification('Failed to remove employee', 'error');
            } finally {
                setLoading(false);
            }
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return 'success';
            case 'inactive':
                return 'error';
            case 'on_leave':
                return 'warning';
            default:
                return 'default';
        }
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
                <Typography variant="h6">Branch Employees</Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    Add Employee
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
                            <TableCell>Name</TableCell>
                            <TableCell>Role</TableCell>
                            <TableCell>Schedule</TableCell>
                            <TableCell>Start Date</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {employees.map((employee) => (
                            <TableRow key={employee.id}>
                                <TableCell>
                                    <Box display="flex" alignItems="center">
                                        <PersonIcon sx={{ mr: 1 }} />
                                        {employee.name}
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Box display="flex" alignItems="center">
                                        <WorkIcon sx={{ mr: 1 }} />
                                        {employee.role}
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Box display="flex" alignItems="center">
                                        <ScheduleIcon sx={{ mr: 1 }} />
                                        {employee.schedule}
                                    </Box>
                                </TableCell>
                                <TableCell>{new Date(employee.startDate).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={employee.status.replace('_', ' ')}
                                        color={getStatusColor(employee.status)}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <IconButton
                                        color="primary"
                                        onClick={() => handleOpenDialog(employee)}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        color="error"
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

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
                </DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <FormControl fullWidth required>
                                    <InputLabel>Employee</InputLabel>
                                    <Select
                                        name="userId"
                                        value={formData.userId}
                                        onChange={handleChange}
                                        label="Employee"
                                    >
                                        {/* This would be populated with available users */}
                                        <MenuItem value="1">John Doe</MenuItem>
                                        <MenuItem value="2">Jane Smith</MenuItem>
                                        <MenuItem value="3">Mike Johnson</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl fullWidth required>
                                    <InputLabel>Role</InputLabel>
                                    <Select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleChange}
                                        label="Role"
                                    >
                                        <MenuItem value="manager">Manager</MenuItem>
                                        <MenuItem value="supervisor">Supervisor</MenuItem>
                                        <MenuItem value="cashier">Cashier</MenuItem>
                                        <MenuItem value="stock_clerk">Stock Clerk</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Start Date"
                                    name="startDate"
                                    type="date"
                                    value={formData.startDate}
                                    onChange={handleChange}
                                    InputLabelProps={{ shrink: true }}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="End Date"
                                    name="endDate"
                                    type="date"
                                    value={formData.endDate}
                                    onChange={handleChange}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl fullWidth required>
                                    <InputLabel>Status</InputLabel>
                                    <Select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        label="Status"
                                    >
                                        <MenuItem value="active">Active</MenuItem>
                                        <MenuItem value="inactive">Inactive</MenuItem>
                                        <MenuItem value="on_leave">On Leave</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Salary"
                                    name="salary"
                                    type="number"
                                    value={formData.salary}
                                    onChange={handleChange}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Schedule"
                                    name="schedule"
                                    value={formData.schedule}
                                    onChange={handleChange}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Notes"
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    multiline
                                    rows={3}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog}>Cancel</Button>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Save'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
};

export default BranchEmployees; 