import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ProductForm from '../components/products/ProductForm';
import useFetch from '../hooks/useFetch';
import './ProductForm.css';

const ProductFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Mock data for demonstration
  const mockProducts = [
    {
      id: 1,
      name: 'Laptop Pro X',
      category: 'Electronics',
      price: 1299.99,
      stock: 45,
      status: 'In Stock',
      sku: 'LPX-001',
      description: 'High-performance laptop for professionals',
    },
    {
      id: 2,
      name: 'Wireless Mouse',
      category: 'Electronics',
      price: 29.99,
      stock: 120,
      status: 'In Stock',
      sku: 'WM-002',
      description: 'Ergonomic wireless mouse with long battery life',
    },
    // ... other products
  ];

  const categories = ['Electronics', 'Clothing', 'Home & Kitchen', 'Sports'];

  // In a real application, you would fetch this data from your API
  const { data: product, loading, error } = useFetch(
    () => Promise.resolve(id ? mockProducts.find(p => p.id === parseInt(id)) : null),
    { id },
    { enabled: !!id }
  );

  const handleSubmit = async (data) => {
    try {
      // In a real application, you would make an API call here
      console.log('Form submitted:', data);
      navigate('/products');
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleCancel = () => {
    navigate('/products');
  };

  if (loading) {
    return (
      <div className="product-form-loading">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-form-error">
        <p>Error loading product data. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="product-form-page">
      <div className="page-header">
        <h1>{id ? 'Edit Product' : 'Add New Product'}</h1>
        <p>{id ? 'Update product information' : 'Create a new product'}</p>
      </div>

      <ProductForm
        product={product}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        categories={categories}
      />
    </div>
  );
};

export default ProductFormPage; 