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
  Chip,
  Pagination,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import userService from '../services/userService';
import useStore from '../store/useStore';

const UserForm = ({ initialValues, onSubmit, onCancel }) => {
  const { t } = useTranslation();

  const validationSchema = Yup.object({
    username: Yup.string()
      .required(t('users.usernameRequired'))
      .min(3, t('users.usernameMinLength')),
    email: Yup.string()
      .required(t('users.emailRequired'))
      .email(t('users.emailInvalid')),
    firstName: Yup.string()
      .required(t('users.firstNameRequired')),
    lastName: Yup.string()
      .required(t('users.lastNameRequired')),
    role: Yup.string()
      .required(t('users.roleRequired')),
    isActive: Yup.boolean(),
  });

  const formik = useFormik({
    initialValues: initialValues || {
      username: '',
      email: '',
      firstName: '',
      lastName: '',
      role: '',
      isActive: true,
    },
    validationSchema,
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  return (
    <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => formik.handleSubmit}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          fullWidth
          id="username"
          name="username"
          label={t('users.username')}
          value={formik.values.username}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.username && Boolean(formik.errors.username)}
          helperText={formik.touched.username && formik.errors.username}
        />
        <TextField
          fullWidth
          id="email"
          name="email"
          label={t('users.email')}
          value={formik.values.email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.email && Boolean(formik.errors.email)}
          helperText={formik.touched.email && formik.errors.email}
        />
        <TextField
          fullWidth
          id="firstName"
          name="firstName"
          label={t('users.firstName')}
          value={formik.values.firstName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.firstName && Boolean(formik.errors.firstName)}
          helperText={formik.touched.firstName && formik.errors.firstName}
        />
        <TextField
          fullWidth
          id="lastName"
          name="lastName"
          label={t('users.lastName')}
          value={formik.values.lastName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.lastName && Boolean(formik.errors.lastName)}
          helperText={formik.touched.lastName && formik.errors.lastName}
        />
        <FormControl fullWidth>
          <InputLabel id="role-label">{t('users.role')}</InputLabel>
          <Select
            labelId="role-label"
            id="role"
            name="role"
            value={formik.values.role}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.role && Boolean(formik.errors.role)}
            label={t('users.role')}
          >
            <MenuItem value="admin">{t('users.roles.admin')}</MenuItem>
            <MenuItem value="manager">{t('users.roles.manager')}</MenuItem>
            <MenuItem value="user">{t('users.roles.user')}</MenuItem>
          </Select>
          {formik.touched.role && formik.errors.role && (
            <Typography color="error" variant="caption">
              {formik.errors.role}
            </Typography>
          )}
        </FormControl>
        <FormControlLabel
          control={
            <Switch
              id="isActive"
              name="isActive"
              checked={formik.values.isActive}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => formik.handleChange}
            />
          }
          label={t('users.isActive')}
        />
      </Box>
    </form>
  );
};

const Users = () => {
  const { t } = useTranslation();
  const { user } = useStore();
  const [users, setUsers] = useState<Type>([]);
  const [loading, setLoading] = useState<Type>(false);
  const [error, setError] = useState<Type>(null);
  const [page, setPage] = useState<Type>(1);
  const [totalPages, setTotalPages] = useState<Type>(1);
  const [openDialog, setOpenDialog] = useState<Type>(false);
  const [selectedUser, setSelectedUser] = useState<Type>(null);
  const [formError, setFormError] = useState<Type>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userService.getUsers(page);
      setUsers(response.users);
      setTotalPages(response.pages);
    } catch (error) {
      setError(error.response?.data?.message || t('users.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const handleOpenDialog = (user = null) => {
    setSelectedUser(user);
    setFormError(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setSelectedUser(null);
    setFormError(null);
    setOpenDialog(false);
  };

  const handleSubmit = async (values) => {
    try {
      setFormError(null);
      if (selectedUser) {
        await userService.updateUser(selectedUser.id, values);
      } else {
        await userService.createUser(values);
      }
      handleCloseDialog();
      fetchUsers();
    } catch (error) {
      setFormError(error.response?.data?.message || t('users.saveError'));
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm(t('users.deleteConfirm'))) {
      try {
        await userService.deleteUser(userId);
        fetchUsers();
      } catch (error) {
        setError(error.response?.data?.message || t('users.deleteError'));
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
        <Typography variant="h5">{t('users.title')}</Typography>
        {user?.role === 'admin' && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => () => handleOpenDialog()}
          >
            {t('users.add')}
          </Button>
        )}
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
              <TableCell>{t('users.username')}</TableCell>
              <TableCell>{t('users.email')}</TableCell>
              <TableCell>{t('users.firstName')}</TableCell>
              <TableCell>{t('users.lastName')}</TableCell>
              <TableCell>{t('users.role')}</TableCell>
              <TableCell>{t('users.status')}</TableCell>
              <TableCell align="right">{t('common.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.firstName}</TableCell>
                <TableCell>{user.lastName}</TableCell>
                <TableCell>{t(`users.roles.${user.role}`)}</TableCell>
                <TableCell>
                  <Chip
                    label={user.isActive ? t('users.active') : t('users.inactive')}
                    color={user.isActive ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => () => handleOpenDialog(user)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => () => handleDelete(user.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

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
          {selectedUser ? t('users.edit') : t('users.add')}
        </DialogTitle>
        <DialogContent>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}
          <UserForm
            initialValues={selectedUser}
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
            {selectedUser ? t('common.save') : t('common.create')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Users; 