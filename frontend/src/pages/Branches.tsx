import React from 'react';
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
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
  Typography,
  Pagination,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  CardHeader,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import branchService from '../services/branchService';
import useStore from '../store/useStore';

const BranchForm = ({ initialValues, onSubmit, onCancel }) => {
  const { t } = useTranslation();

  const validationSchema = Yup.object({
    name: Yup.string()
      .required(t('branches.nameRequired'))
      .min(3, t('branches.nameMinLength')),
    address: Yup.string()
      .required(t('branches.addressRequired')),
    phone: Yup.string()
      .required(t('branches.phoneRequired'))
      .matches(/^[0-9+\s-()]+$/, t('branches.phoneInvalid')),
    managerId: Yup.number()
      .required(t('branches.managerRequired')),
  });

  const formik = useFormik({
    initialValues: initialValues || {
      name: '',
      address: '',
      phone: '',
      managerId: '',
    },
    validationSchema,
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  return (
    <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => formik.handleSubmit}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="name"
            name="name"
            label={t('branches.name')}
            value={formik.values.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="address"
            name="address"
            label={t('branches.address')}
            value={formik.values.address}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.address && Boolean(formik.errors.address)}
            helperText={formik.touched.address && formik.errors.address}
            multiline
            rows={3}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="phone"
            name="phone"
            label={t('branches.phone')}
            value={formik.values.phone}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.phone && Boolean(formik.errors.phone)}
            helperText={formik.touched.phone && formik.errors.phone}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="managerId"
            name="managerId"
            label={t('branches.manager')}
            value={formik.values.managerId}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.managerId && Boolean(formik.errors.managerId)}
            helperText={formik.touched.managerId && formik.errors.managerId}
            type="number"
          />
        </Grid>
      </Grid>
    </form>
  );
};

const BranchCard = ({ branch, onEdit, onDelete }) => {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader
        title={branch.name}
        action={
          <>
            <IconButton size="small" onClick={(e: React.MouseEvent<HTMLButtonElement>) => () => onEdit(branch)}>
              <EditIcon />
            </IconButton>
            <IconButton size="small" color="error" onClick={(e: React.MouseEvent<HTMLButtonElement>) => () => onDelete(branch.id)}>
              <DeleteIcon />
            </IconButton>
          </>
        }
      />
      <CardContent>
        <Box display="flex" alignItems="center" mb={1}>
          <LocationIcon sx={{ mr: 1 }} />
          <Typography variant="body2">{branch.address}</Typography>
        </Box>
        <Box display="flex" alignItems="center" mb={1}>
          <PhoneIcon sx={{ mr: 1 }} />
          <Typography variant="body2">{branch.phone}</Typography>
        </Box>
        <Box display="flex" alignItems="center">
          <PersonIcon sx={{ mr: 1 }} />
          <Typography variant="body2">
            {t('branches.manager')}: {branch.manager?.name || t('branches.noManager')}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

const Branches = () => {
  const { t } = useTranslation();
  const { user } = useStore();
  const [branches, setBranches] = useState<Type>([]);
  const [loading, setLoading] = useState<Type>(false);
  const [error, setError] = useState<Type>(null);
  const [page, setPage] = useState<Type>(1);
  const [totalPages, setTotalPages] = useState<Type>(1);
  const [openDialog, setOpenDialog] = useState<Type>(false);
  const [selectedBranch, setSelectedBranch] = useState<Type>(null);
  const [formError, setFormError] = useState<Type>(null);
  const [viewMode, setViewMode] = useState<Type>('table'); // 'table' or 'grid'

  const fetchBranches = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await branchService.getBranches(page);
      setBranches(response.branches);
      setTotalPages(response.pages);
    } catch (error) {
      setError(error.response?.data?.message || t('branches.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, [page]);

  const handleOpenDialog = (branch = null) => {
    setSelectedBranch(branch);
    setFormError(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setSelectedBranch(null);
    setFormError(null);
    setOpenDialog(false);
  };

  const handleSubmit = async (values) => {
    try {
      setFormError(null);
      if (selectedBranch) {
        await branchService.updateBranch(selectedBranch.id, values);
      } else {
        await branchService.createBranch(values);
      }
      handleCloseDialog();
      fetchBranches();
    } catch (error) {
      setFormError(error.response?.data?.message || t('branches.saveError'));
    }
  };

  const handleDelete = async (branchId) => {
    if (window.confirm(t('branches.deleteConfirm'))) {
      try {
        await branchService.deleteBranch(branchId);
        fetchBranches();
      } catch (error) {
        setError(error.response?.data?.message || t('branches.deleteError'));
      }
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
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
        <Typography variant="h5">{t('branches.title')}</Typography>
        {user?.role === 'admin' && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => () => handleOpenDialog()}
          >
            {t('branches.add')}
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {viewMode === 'table' ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('branches.name')}</TableCell>
                <TableCell>{t('branches.address')}</TableCell>
                <TableCell>{t('branches.phone')}</TableCell>
                <TableCell>{t('branches.manager')}</TableCell>
                <TableCell align="right">{t('common.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {branches.map((branch) => (
                <TableRow key={branch.id}>
                  <TableCell>{branch.name}</TableCell>
                  <TableCell>{branch.address}</TableCell>
                  <TableCell>{branch.phone}</TableCell>
                  <TableCell>{branch.manager?.name || t('branches.noManager')}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={(e: React.MouseEvent<HTMLButtonElement>) => () => handleOpenDialog(branch)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={(e: React.MouseEvent<HTMLButtonElement>) => () => handleDelete(branch.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Grid container spacing={3}>
          {branches.map((branch) => (
            <Grid item xs={12} sm={6} md={4} key={branch.id}>
              <BranchCard
                branch={branch}
                onEdit={handleOpenDialog}
                onDelete={handleDelete}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <Box display="flex" justifyContent="center" mt={3}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePageChange}
          color="primary"
        />
      </Box>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedBranch ? t('branches.edit') : t('branches.add')}
        </DialogTitle>
        <DialogContent>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}
          <BranchForm
            initialValues={selectedBranch}
            onSubmit={(e: React.FormEvent<HTMLFormElement>) => handleSubmit}
            onCancel={handleCloseDialog}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleCloseDialog}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => () => document.querySelector('form').requestSubmit()}
          >
            {selectedBranch ? t('common.save') : t('common.create')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Branches; 