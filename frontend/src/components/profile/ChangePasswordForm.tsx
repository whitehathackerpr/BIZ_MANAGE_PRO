import React from 'react';
import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';

const ChangePasswordForm = ({ onSubmit, onCancel }) => {
  const { t } = useTranslation();
  const [showCurrentPassword, setShowCurrentPassword] = useState<Type>(false);
  const [showNewPassword, setShowNewPassword] = useState<Type>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<Type>(false);

  const validationSchema = Yup.object({
    currentPassword: Yup.string()
      .required(t('profile.currentPasswordRequired')),
    newPassword: Yup.string()
      .required(t('profile.newPasswordRequired'))
      .min(8, t('profile.passwordMinLength'))
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
        t('profile.passwordRequirements')
      ),
    confirmPassword: Yup.string()
      .required(t('profile.confirmPasswordRequired'))
      .oneOf([Yup.ref('newPassword'), null], t('profile.passwordsMustMatch')),
  });

  const formik = useFormik({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema,
    onSubmit: (values) => {
      onSubmit({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
    },
  });

  const togglePasswordVisibility = (field) => {
    switch (field) {
      case 'current':
        setShowCurrentPassword(!showCurrentPassword);
        break;
      case 'new':
        setShowNewPassword(!showNewPassword);
        break;
      case 'confirm':
        setShowConfirmPassword(!showConfirmPassword);
        break;
      default:
        break;
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {t('profile.changePassword')}
      </Typography>
      <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => formik.handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            fullWidth
            id="currentPassword"
            name="currentPassword"
            label={t('profile.currentPassword')}
            type={showCurrentPassword ? 'text' : 'password'}
            value={formik.values.currentPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.currentPassword && Boolean(formik.errors.currentPassword)}
            helperText={formik.touched.currentPassword && formik.errors.currentPassword}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => () => togglePasswordVisibility('current')}
                    edge="end"
                  >
                    {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            id="newPassword"
            name="newPassword"
            label={t('profile.newPassword')}
            type={showNewPassword ? 'text' : 'password'}
            value={formik.values.newPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.newPassword && Boolean(formik.errors.newPassword)}
            helperText={formik.touched.newPassword && formik.errors.newPassword}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => () => togglePasswordVisibility('new')}
                    edge="end"
                  >
                    {showNewPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            id="confirmPassword"
            name="confirmPassword"
            label={t('profile.confirmPassword')}
            type={showConfirmPassword ? 'text' : 'password'}
            value={formik.values.confirmPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
            helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => () => togglePasswordVisibility('confirm')}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Box display="flex" gap={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => onCancel}
              disabled={formik.isSubmitting}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={formik.isSubmitting}
            >
              {t('profile.updatePassword')}
            </Button>
          </Box>
        </Box>
      </form>
    </Paper>
  );
};

export default ChangePasswordForm; 