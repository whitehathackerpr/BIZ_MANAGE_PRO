import React from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';

interface ProductFormValues {
  name: string;
  description: string;
  price: number | string;
  quantity: number | string;
  category: string;
  sku: string;
}

interface ProductFormProps {
  initialValues?: ProductFormValues;
  onSubmit: (values: ProductFormValues) => void;
  onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ initialValues, onSubmit, onCancel }) => {
  const { t } = useTranslation();

  const validationSchema = Yup.object({
    name: Yup.string()
      .required(t('products.nameRequired'))
      .min(3, t('products.nameMinLength')),
    description: Yup.string()
      .required(t('products.descriptionRequired'))
      .min(10, t('products.descriptionMinLength')),
    price: Yup.number()
      .required(t('products.priceRequired'))
      .min(0, t('products.priceMinValue')),
    quantity: Yup.number()
      .required(t('products.quantityRequired'))
      .min(0, t('products.quantityMinValue')),
    category: Yup.string()
      .required(t('products.categoryRequired')),
    sku: Yup.string()
      .required(t('products.skuRequired'))
      .matches(/^[A-Z0-9-]+$/, t('products.skuFormat')),
  });

  const formik = useFormik({
    initialValues: initialValues || {
      name: '',
      description: '',
      price: '',
      quantity: '',
      category: '',
      sku: '',
    },
    validationSchema,
    onSubmit: (values) => {
      onSubmit({
        ...values,
        price: parseFloat(values.price.toString()),
        quantity: parseInt(values.quantity.toString(), 10),
      });
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="name"
            name="name"
            label={t('products.name')}
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            id="description"
            name="description"
            label={t('products.description')}
            value={formik.values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.description && Boolean(formik.errors.description)}
            helperText={formik.touched.description && formik.errors.description}
            multiline
            rows={4}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            id="price"
            name="price"
            label={t('products.price')}
            value={formik.values.price}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.price && Boolean(formik.errors.price)}
            helperText={formik.touched.price && formik.errors.price}
            type="number"
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            id="quantity"
            name="quantity"
            label={t('products.quantity')}
            value={formik.values.quantity}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.quantity && Boolean(formik.errors.quantity)}
            helperText={formik.touched.quantity && formik.errors.quantity}
            type="number"
            InputProps={{
              inputProps: { min: 0 },
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel id="category-label">{t('products.category')}</InputLabel>
            <Select
              labelId="category-label"
              id="category"
              name="category"
              value={formik.values.category}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.category && Boolean(formik.errors.category)}
            >
              <MenuItem value="electronics">{t('products.categories.electronics')}</MenuItem>
              <MenuItem value="clothing">{t('products.categories.clothing')}</MenuItem>
              <MenuItem value="books">{t('products.categories.books')}</MenuItem>
              <MenuItem value="food">{t('products.categories.food')}</MenuItem>
              <MenuItem value="other">{t('products.categories.other')}</MenuItem>
            </Select>
            {formik.touched.category && formik.errors.category && (
              <Box component="span" sx={{ color: 'error.main', fontSize: '0.75rem', mt: 1 }}>
                {formik.errors.category}
              </Box>
            )}
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            id="sku"
            name="sku"
            label={t('products.sku')}
            value={formik.values.sku}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.sku && Boolean(formik.errors.sku)}
            helperText={formik.touched.sku && formik.errors.sku}
          />
        </Grid>

        <Grid item xs={12}>
          <Box display="flex" gap={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={onCancel}
              disabled={formik.isSubmitting}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={formik.isSubmitting}
            >
              {initialValues ? t('products.update') : t('products.create')}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </form>
  );
};

export default ProductForm;