import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Dialog, DialogTitle, DialogContent, Alert } from '@mui/material';
import { productService } from '../services/api';
import ProductForm from '../components/products/ProductForm';
import ProductCard from '../components/products/ProductCard';
import Pagination from '../components/common/Pagination';
import type { Product, ApiResponse } from '../types';

interface FormValues {
  name: string;
  description: string;
  price: number | string;
  quantity: number | string;
  category: string;
  sku: string;
}

type CreateProductData = {
  name: string;
  description: string;
  price: number;
  quantity: number;
  category: string;
  status: 'active' | 'inactive';
  branch_id: string;
  cost: number;
  stock: number;
  min_stock: number;
};

const Products = () => {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await productService.getAll({ page });
      const { data, status } = response.data as unknown as ApiResponse<Product[]>;
      if (status === 200) {
        setProducts(data);
        setTotalPages(Math.ceil(data.length / 10));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('products.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: FormValues) => {
    try {
      setFormError(null);
      const productData: CreateProductData = {
        name: values.name,
        description: values.description,
        price: parseFloat(values.price.toString()),
        quantity: parseInt(values.quantity.toString(), 10),
        category: values.category,
        status: 'active',
        branch_id: selectedProduct?.branch_id || '',
        cost: selectedProduct?.cost || 0,
        stock: parseInt(values.quantity.toString(), 10),
        min_stock: 5
      };
      
      if (selectedProduct) {
        await productService.update(selectedProduct.id, productData);
      } else {
        await productService.create(productData);
      }
      handleCloseDialog();
      fetchProducts();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : t('products.saveError'));
    }
  };

  const handleOpenDialog = (product: Product | null = null) => {
    setSelectedProduct(product);
    setFormError(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setSelectedProduct(null);
    setFormError(null);
    setOpenDialog(false);
  };

  const handleDelete = async (productId: string) => {
    if (window.confirm(t('products.deleteConfirm'))) {
      try {
        await productService.delete(productId);
        fetchProducts();
      } catch (err) {
        setError(err instanceof Error ? err.message : t('products.deleteError'));
      }
    }
  };

  const handlePageChange = (page: number) => {
    setPage(page);
  };

  const handleSelect = (productId: string) => {
    const newSelectedIds = new Set(selectedIds);
    if (newSelectedIds.has(productId)) {
      newSelectedIds.delete(productId);
    } else {
      newSelectedIds.add(productId);
    }
    setSelectedIds(newSelectedIds);
  };

  useEffect(() => {
    fetchProducts();
  }, [page]);

  return (
    <div className="products-container">
      <Box sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onEdit={() => handleOpenDialog(product)}
            onDelete={handleDelete}
            isSelected={selectedIds.has(product.id)}
            onSelect={handleSelect}
          />
        ))}

        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            pageSize={10}
            totalItems={products.length}
          />
        </Box>

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            {selectedProduct ? t('products.edit') : t('products.add')}
          </DialogTitle>
          <DialogContent>
            {formError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {formError}
              </Alert>
            )}
            <ProductForm
              initialValues={selectedProduct ? {
                name: selectedProduct.name,
                description: selectedProduct.description,
                price: selectedProduct.price,
                quantity: selectedProduct.quantity,
                category: selectedProduct.category,
                sku: ''
              } : undefined}
              onSubmit={handleSubmit}
              onCancel={handleCloseDialog}
            />
          </DialogContent>
        </Dialog>
      </Box>
    </div>
  );
};

export default Products; 