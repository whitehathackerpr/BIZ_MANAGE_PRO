import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../app';
import {
  getProducts,
  addProduct,
  editProduct,
  removeProduct,
  Product,
  ProductCreate,
  ProductUpdate,
} from '../features/products';
import ProductFormModal from './ProductFormModal';
import { toast } from 'react-toastify';

const PAGE_SIZE = 10;

const ProductList: React.FC<{ businessId: number }> = ({ businessId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { products, loading, error } = useSelector((state: RootState) => state.products);
  const { user } = useSelector((state: RootState) => state.auth);

  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(getProducts(businessId));
  }, [dispatch, businessId]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleAdd = () => {
    setSelectedProduct(null);
    setEditMode(false);
    setModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setEditMode(true);
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      const result = await dispatch(removeProduct(id));
      if (removeProduct.fulfilled.match(result)) {
        toast.success('Product deleted successfully.');
      } else {
        toast.error('Failed to delete product.');
      }
    }
  };

  const handleSubmit = async (data: ProductCreate | ProductUpdate) => {
    if (!user) return;
    if (editMode && selectedProduct) {
      const result = await dispatch(editProduct({ id: selectedProduct.id, data: data as ProductUpdate }));
      if (editProduct.fulfilled.match(result)) {
        toast.success('Product updated successfully.');
      } else {
        toast.error('Failed to update product.');
      }
    } else {
      const result = await dispatch(addProduct({ ...(data as ProductCreate), business_id: businessId }));
      if (addProduct.fulfilled.match(result)) {
        toast.success('Product added successfully.');
      } else {
        toast.error('Failed to add product.');
      }
    }
    setModalOpen(false);
  };

  // Filtering and search
  const filteredProducts = products.filter((p) =>
    (!search || p.name.toLowerCase().includes(search.toLowerCase())) &&
    (!categoryFilter || (p.category || '').toLowerCase() === categoryFilter.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / PAGE_SIZE);
  const paginatedProducts = filteredProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Unique categories for filter dropdown
  const categories = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));

  // Role-based UI: Only allow add/edit/delete for owner/manager
  const canEdit = user && (user.role === 'owner' || user.role === 'manager');

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 border rounded"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border rounded"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat!}>{cat}</option>
            ))}
          </select>
        </div>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={handleAdd}
          disabled={!canEdit}
        >
          Add Product
        </button>
      </div>
      {loading && <div>Loading...</div>}
      <table className="min-w-full bg-white rounded shadow">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Name</th>
            <th className="py-2 px-4 border-b">Price</th>
            <th className="py-2 px-4 border-b">Stock</th>
            <th className="py-2 px-4 border-b">Expiry</th>
            <th className="py-2 px-4 border-b">Category</th>
            {canEdit && <th className="py-2 px-4 border-b">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {paginatedProducts.map((p) => (
            <tr key={p.id}>
              <td className="py-2 px-4 border-b">{p.name}</td>
              <td className="py-2 px-4 border-b">${p.price.toFixed(2)}</td>
              <td className="py-2 px-4 border-b">{p.stock_level}</td>
              <td className="py-2 px-4 border-b">{p.expiry_date ? new Date(p.expiry_date).toLocaleDateString() : '-'}</td>
              <td className="py-2 px-4 border-b">{p.category || '-'}</td>
              {canEdit && (
                <td className="py-2 px-4 border-b">
                  <button className="text-blue-600 hover:underline mr-2" onClick={() => handleEdit(p)}>Edit</button>
                  <button className="text-red-600 hover:underline" onClick={() => handleDelete(p.id)}>Delete</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {/* Pagination controls */}
      <div className="flex justify-center mt-4 gap-2">
        <button
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Prev
        </button>
        <span className="px-2 py-1">Page {page} of {totalPages || 1}</span>
        <button
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages || totalPages === 0}
        >
          Next
        </button>
      </div>
      <ProductFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editMode && selectedProduct ? selectedProduct : undefined}
        isEdit={editMode}
      />
    </div>
  );
};

export default ProductList; 