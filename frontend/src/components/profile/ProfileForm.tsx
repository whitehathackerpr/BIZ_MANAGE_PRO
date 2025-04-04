import React from 'react';
import React from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  Paper,
  Typography,
  Divider,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';

const ProfileForm = ({ initialValues, onSubmit, onCancel }) => {
  const { t } = useTranslation();

  const validationSchema = Yup.object({
    firstName: Yup.string()
      .required(t('profile.firstNameRequired'))
      .min(2, t('profile.firstNameMinLength')),
    lastName: Yup.string()
      .required(t('profile.lastNameRequired'))
      .min(2, t('profile.lastNameMinLength')),
    email: Yup.string()
      .required(t('profile.emailRequired'))
      .email(t('profile.emailInvalid')),
    phone: Yup.string()
      .matches(/^[0-9+\s-()]+$/, t('profile.phoneInvalid')),
    company: Yup.string(),
    position: Yup.string(),
    address: Yup.string(),
    city: Yup.string(),
    state: Yup.string(),
    zipCode: Yup.string(),
    country: Yup.string(),
  });

  const formik = useFormik({
    initialValues: initialValues || {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      company: '',
      position: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
    validationSchema,
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {t('profile.personalInfo')}
      </Typography>
      <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => formik.handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="firstName"
              name="firstName"
              label={t('profile.firstName')}
              value={formik.values.firstName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.firstName && Boolean(formik.errors.firstName)}
              helperText={formik.touched.firstName && formik.errors.firstName}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="lastName"
              name="lastName"
              label={t('profile.lastName')}
              value={formik.values.lastName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.lastName && Boolean(formik.errors.lastName)}
              helperText={formik.touched.lastName && formik.errors.lastName}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="email"
              name="email"
              label={t('profile.email')}
              value={formik.values.email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="phone"
              name="phone"
              label={t('profile.phone')}
              value={formik.values.phone}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.phone && Boolean(formik.errors.phone)}
              helperText={formik.touched.phone && formik.errors.phone}
            />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              {t('profile.workInfo')}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="company"
              name="company"
              label={t('profile.company')}
              value={formik.values.company}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="position"
              name="position"
              label={t('profile.position')}
              value={formik.values.position}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              {t('profile.address')}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              id="address"
              name="address"
              label={t('profile.address')}
              value={formik.values.address}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="city"
              name="city"
              label={t('profile.city')}
              value={formik.values.city}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="state"
              name="state"
              label={t('profile.state')}
              value={formik.values.state}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="zipCode"
              name="zipCode"
              label={t('profile.zipCode')}
              value={formik.values.zipCode}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="country"
              name="country"
              label={t('profile.country')}
              value={formik.values.country}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </Grid>

          <Grid item xs={12}>
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
                {t('profile.save')}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default ProfileForm; 