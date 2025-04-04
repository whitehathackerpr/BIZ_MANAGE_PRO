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
  FormControlLabel,
  Switch,
  FormGroup,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';

const SettingsForm = ({ initialValues, onSubmit, onCancel }) => {
  const { t } = useTranslation();

  const validationSchema = Yup.object({
    language: Yup.string()
      .required(t('settings.languageRequired')),
    theme: Yup.string()
      .required(t('settings.themeRequired')),
    timezone: Yup.string()
      .required(t('settings.timezoneRequired')),
    dateFormat: Yup.string()
      .required(t('settings.dateFormatRequired')),
    currency: Yup.string()
      .required(t('settings.currencyRequired')),
    notifications: Yup.object({
      email: Yup.boolean(),
      push: Yup.boolean(),
      orderUpdates: Yup.boolean(),
      inventoryAlerts: Yup.boolean(),
      marketing: Yup.boolean(),
    }),
    display: Yup.object({
      compactMode: Yup.boolean(),
      showAnimations: Yup.boolean(),
      showTooltips: Yup.boolean(),
    }),
    security: Yup.object({
      twoFactorAuth: Yup.boolean(),
      sessionTimeout: Yup.number()
        .required(t('settings.sessionTimeoutRequired'))
        .min(5, t('settings.sessionTimeoutMin'))
        .max(120, t('settings.sessionTimeoutMax')),
    }),
  });

  const formik = useFormik({
    initialValues: initialValues || {
      language: 'en',
      theme: 'light',
      timezone: 'UTC',
      dateFormat: 'MM/DD/YYYY',
      currency: 'USD',
      notifications: {
        email: true,
        push: true,
        orderUpdates: true,
        inventoryAlerts: true,
        marketing: false,
      },
      display: {
        compactMode: false,
        showAnimations: true,
        showTooltips: true,
      },
      security: {
        twoFactorAuth: false,
        sessionTimeout: 30,
      },
    },
    validationSchema,
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  return (
    <Paper sx={{ p: 3 }}>
      <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => formik.handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              {t('settings.general')}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>{t('settings.language')}</InputLabel>
              <Select
                id="language"
                name="language"
                value={formik.values.language}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.language && Boolean(formik.errors.language)}
              >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="ar">العربية</MenuItem>
                <MenuItem value="he">עברית</MenuItem>
              </Select>
              {formik.touched.language && formik.errors.language && (
                <Typography color="error" variant="caption">
                  {formik.errors.language}
                </Typography>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>{t('settings.theme')}</InputLabel>
              <Select
                id="theme"
                name="theme"
                value={formik.values.theme}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.theme && Boolean(formik.errors.theme)}
              >
                <MenuItem value="light">{t('settings.themes.light')}</MenuItem>
                <MenuItem value="dark">{t('settings.themes.dark')}</MenuItem>
                <MenuItem value="system">{t('settings.themes.system')}</MenuItem>
              </Select>
              {formik.touched.theme && formik.errors.theme && (
                <Typography color="error" variant="caption">
                  {formik.errors.theme}
                </Typography>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>{t('settings.timezone')}</InputLabel>
              <Select
                id="timezone"
                name="timezone"
                value={formik.values.timezone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.timezone && Boolean(formik.errors.timezone)}
              >
                <MenuItem value="UTC">UTC</MenuItem>
                <MenuItem value="EST">EST</MenuItem>
                <MenuItem value="PST">PST</MenuItem>
                <MenuItem value="GMT">GMT</MenuItem>
              </Select>
              {formik.touched.timezone && formik.errors.timezone && (
                <Typography color="error" variant="caption">
                  {formik.errors.timezone}
                </Typography>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>{t('settings.currency')}</InputLabel>
              <Select
                id="currency"
                name="currency"
                value={formik.values.currency}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.currency && Boolean(formik.errors.currency)}
              >
                <MenuItem value="USD">USD ($)</MenuItem>
                <MenuItem value="EUR">EUR (€)</MenuItem>
                <MenuItem value="GBP">GBP (£)</MenuItem>
                <MenuItem value="JPY">JPY (¥)</MenuItem>
              </Select>
              {formik.touched.currency && formik.errors.currency && (
                <Typography color="error" variant="caption">
                  {formik.errors.currency}
                </Typography>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              {t('settings.notifications')}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.notifications.email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => formik.handleChange}
                    name="notifications.email"
                  />
                }
                label={t('settings.notifications.email')}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.notifications.push}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => formik.handleChange}
                    name="notifications.push"
                  />
                }
                label={t('settings.notifications.push')}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.notifications.orderUpdates}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => formik.handleChange}
                    name="notifications.orderUpdates"
                  />
                }
                label={t('settings.notifications.orderUpdates')}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.notifications.inventoryAlerts}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => formik.handleChange}
                    name="notifications.inventoryAlerts"
                  />
                }
                label={t('settings.notifications.inventoryAlerts')}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.notifications.marketing}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => formik.handleChange}
                    name="notifications.marketing"
                  />
                }
                label={t('settings.notifications.marketing')}
              />
            </FormGroup>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              {t('settings.display')}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.display.compactMode}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => formik.handleChange}
                    name="display.compactMode"
                  />
                }
                label={t('settings.display.compactMode')}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.display.showAnimations}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => formik.handleChange}
                    name="display.showAnimations"
                  />
                }
                label={t('settings.display.showAnimations')}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.display.showTooltips}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => formik.handleChange}
                    name="display.showTooltips"
                  />
                }
                label={t('settings.display.showTooltips')}
              />
            </FormGroup>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              {t('settings.security')}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.security.twoFactorAuth}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => formik.handleChange}
                    name="security.twoFactorAuth"
                  />
                }
                label={t('settings.security.twoFactorAuth')}
              />
            </FormGroup>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="security.sessionTimeout"
              name="security.sessionTimeout"
              label={t('settings.security.sessionTimeout')}
              type="number"
              value={formik.values.security.sessionTimeout}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.security?.sessionTimeout && Boolean(formik.errors.security?.sessionTimeout)}
              helperText={formik.touched.security?.sessionTimeout && formik.errors.security?.sessionTimeout}
              InputProps={{
                inputProps: { min: 5, max: 120 },
              }}
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
                {t('settings.save')}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default SettingsForm; 