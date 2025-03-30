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
    Tooltip,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    LocationOn as LocationIcon,
    Phone as PhoneIcon,
    Email as EmailIcon,
    MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { useNotification } from '../../../contexts/NotificationContext';
import branchApi from '../../../services/branchApi';
import BranchUsers from './BranchUsers';

const BranchManagement = () => {
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingBranch, setEditingBranch] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        phone: '',
        email: '',
        manager: '',
        status: 'active',
    });
    const { showNotification } = useNotification();
    const [selectedBranch, setSelectedBranch] = useState(null);

    useEffect(() => {
        fetchBranches();
    }, []);

    const fetchBranches = async () => {
        try {
            const data = await branchApi.getBranches();
            setBranches(data);
        } catch (err) {
            setError('Failed to fetch branches');
            showNotification('Failed to fetch branches', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (branch = null) => {
        if (branch) {
            setEditingBranch(branch);
            setFormData(branch);
        } else {
            setEditingBranch(null);
            setFormData({
                name: '',
                address: '',
                phone: '',
                email: '',
                manager: '',
                status: 'active',
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingBranch(null);
        setFormData({
            name: '',
            address: '',
            phone: '',
            email: '',
            manager: '',
            status: 'active',
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async () => {
        try {
            if (editingBranch) {
                await branchApi.updateBranch(editingBranch.id, formData);
                showNotification('Branch updated successfully', 'success');
            } else {
                await branchApi.createBranch(formData);
                showNotification('Branch created successfully', 'success');
            }
            handleCloseDialog();
            fetchBranches();
        } catch (err) {
            showNotification(
                `Failed to ${editingBranch ? 'update' : 'create'} branch`,
                'error'
            );
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this branch?')) {
            try {
                await branchApi.deleteBranch(id);
                showNotification('Branch deleted successfully', 'success');
                fetchBranches();
            } catch (err) {
                showNotification('Failed to delete branch', 'error');
            }
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box display="flex" alignItems="center">
                    <LocationIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h5" className="gradient-text">
                        Branch Management
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                    sx={{
                        background: 'linear-gradient(45deg, #00F5FF 30%, #FF2E63 90%)',
                        '&:hover': {
                            background: 'linear-gradient(45deg, #00C2D4 30%, #C4003D 90%)',
                        },
                    }}
                >
                    Add Branch
                </Button>
            </Box>

            {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Alert severity="error">{error}</Alert>
            ) : (
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <TableContainer component={Paper} className="glass">
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Name</TableCell>
                                        <TableCell>Address</TableCell>
                                        <TableCell>Contact</TableCell>
                                        <TableCell>Manager</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {branches.map((branch) => (
                                        <TableRow key={branch.id}>
                                            <TableCell>{branch.name}</TableCell>
                                            <TableCell>{branch.address}</TableCell>
                                            <TableCell>
                                                <Box display="flex" alignItems="center">
                                                    <PhoneIcon sx={{ mr: 1, fontSize: 'small' }} />
                                                    {branch.phone}
                                                </Box>
                                                <Box display="flex" alignItems="center">
                                                    <EmailIcon sx={{ mr: 1, fontSize: 'small' }} />
                                                    {branch.email}
                                                </Box>
                                            </TableCell>
                                            <TableCell>{branch.manager}</TableCell>
                                            <TableCell>
                                                <Typography
                                                    sx={{
                                                        color: branch.status === 'active' ? '#00F5FF' : '#FF2E63',
                                                        fontWeight: 'bold',
                                                    }}
                                                >
                                                    {branch.status}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Tooltip title="Edit Branch">
                                                    <IconButton
                                                        size="small"
                                                        color="primary"
                                                        onClick={() => handleOpenDialog(branch)}
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete Branch">
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => handleDelete(branch.id)}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="View Users">
                                                    <IconButton
                                                        size="small"
                                                        color="info"
                                                        onClick={() => setSelectedBranch(branch.id)}
                                                    >
                                                        <MoreVertIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid>
                    {selectedBranch && (
                        <Grid item xs={12}>
                            <BranchUsers branchId={selectedBranch} />
                        </Grid>
                    )}
                </Grid>
            )}

            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    className: 'glass',
                }}
            >
                <DialogTitle>
                    {editingBranch ? 'Edit Branch' : 'Add New Branch'}
                </DialogTitle>
                <DialogContent>
                    <Box display="flex" flexDirection="column" gap={2} mt={2}>
                        <TextField
                            label="Branch Name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            fullWidth
                        />
                        <TextField
                            label="Address"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            fullWidth
                            multiline
                            rows={2}
                        />
                        <TextField
                            label="Phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            fullWidth
                        />
                        <TextField
                            label="Email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            fullWidth
                        />
                        <TextField
                            label="Manager"
                            name="manager"
                            value={formData.manager}
                            onChange={handleChange}
                            fullWidth
                        />
                        <TextField
                            select
                            label="Status"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            fullWidth
                            SelectProps={{
                                native: true,
                            }}
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </TextField>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        sx={{
                            background: 'linear-gradient(45deg, #00F5FF 30%, #FF2E63 90%)',
                            '&:hover': {
                                background: 'linear-gradient(45deg, #00C2D4 30%, #C4003D 90%)',
                            },
                        }}
                    >
                        {editingBranch ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default BranchManagement; 