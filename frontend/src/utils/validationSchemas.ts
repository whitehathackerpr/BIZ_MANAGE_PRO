import * as yup from 'yup';

export const loginSchema = yup.object().shape({
  email: yup
    .string()
    .email('Please enter a valid email')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

export const registerSchema = yup.object().shape({
  firstName: yup
    .string()
    .required('First name is required'),
  lastName: yup
    .string()
    .required('Last name is required'),
  email: yup
    .string()
    .email('Please enter a valid email')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
});

export const profileSchema = yup.object().shape({
  name: yup
    .string()
    .min(2, 'Name must be at least 2 characters')
    .required('Name is required'),
  email: yup
    .string()
    .email('Invalid email address')
    .required('Email is required'),
  phone: yup
    .string()
    .matches(/^[0-9]+$/, 'Phone number must contain only digits')
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number must not exceed 15 digits'),
  address: yup
    .string()
    .min(5, 'Address must be at least 5 characters'),
});

export const productSchema = yup.object().shape({
  name: yup
    .string()
    .min(3, 'Name must be at least 3 characters')
    .required('Name is required'),
  description: yup
    .string()
    .min(10, 'Description must be at least 10 characters')
    .required('Description is required'),
  price: yup
    .number()
    .positive('Price must be positive')
    .required('Price is required'),
  stock: yup
    .number()
    .integer('Stock must be an integer')
    .min(0, 'Stock cannot be negative')
    .required('Stock is required'),
  category: yup
    .string()
    .required('Category is required'),
}); 