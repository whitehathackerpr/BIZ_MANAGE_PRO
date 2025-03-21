import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts';
import ProductForm from '../components/products/ProductForm';
import ConfirmDialog from '../components/common/ConfirmDialog';
import CacheManager from '../components/common/CacheManager';
import productService from '../services/productService';
import ProductCard from '../components/products/ProductCard';
import ViewToggle from '../components/common/ViewToggle';
import Pagination from '../components/common/Pagination';
import PageSizeSelector from '../components/common/PageSizeSelector';
import GoToPage from '../components/common/GoToPage';
import JumpButtons from '../components/common/JumpButtons';
import './Products.css';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Initialize state from URL parameters
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || 'all');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'name');
  const [sortOrder, setSortOrder] = useState(searchParams.get('sortOrder') || 'asc');
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1);
  const [pageSize, setPageSize] = useState(Number(searchParams.get('pageSize')) || 10);
  const [viewMode, setViewMode] = useState(searchParams.get('view') || 'table');
  const [pageInput, setPageInput] = useState(searchParams.get('page') || '');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [lastSelectedIndex, setLastSelectedIndex] = useState(null);
  const tableRef = useRef(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [optimisticProducts, setOptimisticProducts] = useState(null);
  const goToPageRef = useRef(null);

  const { data, loading, error, refetch } = useFetch(
    () => productService.getAllProducts({
      page: currentPage,
      limit: pageSize,
      search: searchTerm,
      category: categoryFilter,
      sortBy,
      sortOrder
    }),
    [currentPage, pageSize, searchTerm, categoryFilter, sortBy, sortOrder]
  );

  useEffect(() => {
    if (data) {
      setOptimisticProducts(data.products);
    }
  }, [data]);

  const categories = ['all', ...new Set(optimisticProducts?.map(p => p.category) || [])];

  const filteredProducts = optimisticProducts
    ?.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      const order = sortOrder === 'asc' ? 1 : -1;
      return a[sortBy] > b[sortBy] ? order : -order;
    });

  // Update URL when state changes
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (searchTerm) params.set('search', searchTerm);
    if (categoryFilter !== 'all') params.set('category', categoryFilter);
    if (sortBy !== 'name') params.set('sortBy', sortBy);
    if (sortOrder !== 'asc') params.set('sortOrder', sortOrder);
    if (currentPage > 1) params.set('page', currentPage);
    if (pageSize !== 10) params.set('pageSize', pageSize);
    if (viewMode !== 'table') params.set('view', viewMode);
    if (pageInput) params.set('pageInput', pageInput);
    
    navigate({ search: params.toString() }, { replace: true });
  }, [searchTerm, categoryFilter, sortBy, sortOrder, currentPage, pageSize, viewMode, pageInput, navigate]);

  // Update state when URL changes
  useEffect(() => {
    setSearchTerm(searchParams.get('search') || '');
    setCategoryFilter(searchParams.get('category') || 'all');
    setSortBy(searchParams.get('sortBy') || 'name');
    setSortOrder(searchParams.get('sortOrder') || 'asc');
    setCurrentPage(Number(searchParams.get('page')) || 1);
    setPageSize(Number(searchParams.get('pageSize')) || 10);
    setViewMode(searchParams.get('view') || 'table');
    setPageInput(searchParams.get('pageInput') || '');
  }, [searchParams]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
        event.preventDefault();
        if (filteredProducts?.length > 0) {
          setSelectedProducts(new Set(filteredProducts.map(p => p.id)));
        }
      }

      if (event.key === 'Delete' && selectedProducts.size > 0) {
        event.preventDefault();
        setIsDeleteDialogOpen(true);
      }

      if (event.key === 'Escape') {
        setSelectedProducts(new Set());
        setLastSelectedIndex(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedProducts.size, filteredProducts]);

  const handleSelectProduct = (productId, index) => {
    const newSelected = new Set(selectedProducts);
    
    if (event.shiftKey && lastSelectedIndex !== null) {
      const start = Math.min(lastSelectedIndex, index);
      const end = Math.max(lastSelectedIndex, index);
      const range = filteredProducts.slice(start, end + 1);
      range.forEach(product => newSelected.add(product.id));
    } else {
      if (newSelected.has(productId)) {
        newSelected.delete(productId);
      } else {
        newSelected.add(productId);
      }
    }
    
    setSelectedProducts(newSelected);
    setLastSelectedIndex(index);
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedProducts(new Set(filteredProducts?.map(p => p.id) || []));
    } else {
      setSelectedProducts(new Set());
      setLastSelectedIndex(null);
    }
  };

  const handleError = (error) => {
    setErrorMessage(error.response?.data?.message || 'An error occurred. Please try again.');
    setTimeout(() => setErrorMessage(''), 5000);
  };

  const handleBulkDelete = async () => {
    const selectedIds = Array.from(selectedProducts);
    const productsToDelete = filteredProducts.filter(p => selectedIds.includes(p.id));
    
    setOptimisticProducts(prev => prev.filter(p => !selectedIds.includes(p.id)));
    
    try {
      setIsLoading(true);
      await productService.bulkDeleteProducts(selectedIds);
      setSelectedProducts(new Set());
      setIsDeleteDialogOpen(false);
      refetch();
    } catch (error) {
      setOptimisticProducts(prev => [...prev, ...productsToDelete]);
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    const productToDelete = filteredProducts.find(p => p.id === productId);
    
    setOptimisticProducts(prev => prev.filter(p => p.id !== productId));
    
    try {
      setIsLoading(true);
      await productService.deleteProduct(productId);
      setIsDeleteDialogOpen(false);
      refetch();
    } catch (error) {
      setOptimisticProducts(prev => [...prev, productToDelete]);
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setSelectedProduct(null);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedProduct(null);
  };

  const handleFormSubmit = async (formData) => {
    const isEdit = !!selectedProduct;
    const optimisticProduct = {
      id: selectedProduct?.id || Date.now(),
      ...formData,
      status: formData.stock > 10 ? 'In Stock' : formData.stock > 0 ? 'Low Stock' : 'Out of Stock'
    };

    setOptimisticProducts(prev => {
      if (isEdit) {
        return prev.map(p => p.id === selectedProduct.id ? optimisticProduct : p);
      }
      return [...prev, optimisticProduct];
    });

    try {
      setIsLoading(true);
      if (isEdit) {
        await productService.updateProduct(selectedProduct.id, formData);
      } else {
        const newProduct = await productService.createProduct(formData);
        setOptimisticProducts(prev => 
          prev.map(p => p.id === optimisticProduct.id ? newProduct : p)
        );
      }
      setIsFormOpen(false);
      setSelectedProduct(null);
      refetch();
    } catch (error) {
      setOptimisticProducts(prev => {
        if (isEdit) {
          return prev.map(p => p.id === selectedProduct.id ? selectedProduct : p);
        }
        return prev.filter(p => p.id !== optimisticProduct.id);
      });
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const statusOptions = ['In Stock', 'Low Stock', 'Out of Stock'];

  const handleBulkStatusUpdate = async () => {
    const selectedIds = Array.from(selectedProducts);
    const productsToUpdate = filteredProducts.filter(p => selectedIds.includes(p.id));
    
    setOptimisticProducts(prev => 
      prev.map(p => selectedIds.includes(p.id) ? { ...p, status: newStatus } : p)
    );
    
    try {
      setIsLoading(true);
      await productService.bulkUpdateStatus(selectedIds, newStatus);
      setSelectedProducts(new Set());
      setIsStatusDialogOpen(false);
      setNewStatus('');
      refetch();
    } catch (error) {
      setOptimisticProducts(prev => 
        prev.map(p => selectedIds.includes(p.id) ? 
          productsToUpdate.find(original => original.id === p.id) : p
        )
      );
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setSelectedProducts(new Set());
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (e) => {
    setCategoryFilter(e.target.value);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const handleViewChange = (view) => {
    setViewMode(view);
  };

  const handleNextPage = () => {
    if (currentPage < Math.ceil(data?.total / pageSize)) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleFirstPage = () => {
    setCurrentPage(1);
  };

  const handleLastPage = () => {
    setCurrentPage(Math.ceil(data?.total / pageSize));
  };

  const handleFocusGoToPage = () => {
    goToPageRef.current?.focus();
  };

  useKeyboardShortcuts({
    onNextPage: handleNextPage,
    onPrevPage: handlePrevPage,
    onFirstPage: handleFirstPage,
    onLastPage: handleLastPage,
    onSort: handleSort,
    sortBy,
    sortOrder,
    currentPage,
    totalPages: Math.ceil(data?.total / pageSize),
    onFocusGoToPage: handleFocusGoToPage
  });

  if (loading) {
    return (
      <div className="products-loading">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="products-error">
        <p>Error loading products. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="products">
      {errorMessage && (
        <div className="error-toast">
          {errorMessage}
        </div>
      )}

      <div className="products-header">
        <div>
          <h1>Products</h1>
          <p>Manage your product inventory</p>
        </div>
        <div className="header-actions">
          <ViewToggle 
            view={viewMode} 
            onViewChange={handleViewChange} 
          />
          <button 
            className="button button-secondary" 
            onClick={refetch}
            disabled={isLoading}
          >
            {isLoading ? 'Refreshing...' : 'Refresh Data'}
          </button>
          {selectedProducts.size > 0 && (
            <>
              <div className="bulk-actions">
                <select
                  value={newStatus}
                  onChange={(e) => {
                    setNewStatus(e.target.value);
                    if (e.target.value) {
                      setIsStatusDialogOpen(true);
                    }
                  }}
                  className="status-select"
                >
                  <option value="">Update Status</option>
                  {statusOptions.map(status => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <button
                  className="button button-danger"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  Delete Selected ({selectedProducts.size})
                </button>
              </div>
            </>
          )}
          <Link to="/products/new" className="button button-primary" onClick={handleAdd}>
            Add New Product
          </Link>
        </div>
      </div>

      <div className="products-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={handleSearch}
          />
          <span className="search-icon">🔍</span>
        </div>

        <select
          value={categoryFilter}
          onChange={handleCategoryChange}
          className="category-filter"
        >
          <option value="all">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className="products-content">
        {isLoading && (
          <div className="loading-overlay">
            <div className="loading-spinner" />
          </div>
        )}

        {viewMode === 'table' ? (
          <div className="products-table-container" ref={tableRef}>
            <table className="products-table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={selectedProducts.size === filteredProducts?.length}
                      onChange={handleSelectAll}
                      title="Select All (Ctrl+A)"
                    />
                  </th>
                  <th 
                    onClick={() => handleSort('name')} 
                    className={`sortable ${sortBy === 'name' ? 'active' : ''}`}
                  >
                    Name
                    {sortBy === 'name' && (
                      <span className="sort-icon">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                  <th 
                    onClick={() => handleSort('category')} 
                    className={`sortable ${sortBy === 'category' ? 'active' : ''}`}
                  >
                    Category
                    {sortBy === 'category' && (
                      <span className="sort-icon">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                  <th 
                    onClick={() => handleSort('price')} 
                    className={`sortable ${sortBy === 'price' ? 'active' : ''}`}
                  >
                    Price
                    {sortBy === 'price' && (
                      <span className="sort-icon">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                  <th 
                    onClick={() => handleSort('stock')} 
                    className={`sortable ${sortBy === 'stock' ? 'active' : ''}`}
                  >
                    Stock
                    {sortBy === 'stock' && (
                      <span className="sort-icon">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                  <th 
                    onClick={() => handleSort('status')} 
                    className={`sortable ${sortBy === 'status' ? 'active' : ''}`}
                  >
                    Status
                    {sortBy === 'status' && (
                      <span className="sort-icon">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts?.map((product, index) => (
                  <tr 
                    key={product.id} 
                    className={selectedProducts.has(product.id) ? 'selected' : ''}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSelectProduct(product.id, index);
                      }
                    }}
                  >
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedProducts.has(product.id)}
                        onChange={() => handleSelectProduct(product.id, index)}
                        title="Click to select, Shift+Click for range"
                      />
                    </td>
                    <td>
                      <div className="product-info">
                        <span className="product-name">{product.name}</span>
                        <span className="product-sku">{product.sku}</span>
                      </div>
                    </td>
                    <td>{product.category}</td>
                    <td>${product.price.toFixed(2)}</td>
                    <td>{product.stock}</td>
                    <td>
                      <span className={`status-badge ${product.status.toLowerCase().replace(' ', '-')}`}>
                        {product.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="button-icon" title="Edit" onClick={() => handleEdit(product)}>
                          ✏️
                        </button>
                        <button className="button-icon" title="Delete" onClick={() => {
                          setSelectedProduct(product);
                          setIsDeleteDialogOpen(true);
                        }}>
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="products-grid">
            {filteredProducts?.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={handleEdit}
                onDelete={(id) => {
                  setSelectedProduct({ id, name: product.name });
                  setIsDeleteDialogOpen(true);
                }}
                isSelected={selectedProducts.has(product.id)}
                onSelect={() => handleSelectProduct(product.id, index)}
              />
            ))}
          </div>
        )}
      </div>

      {isFormOpen && (
        <ProductForm
          product={selectedProduct}
          onSubmit={handleFormSubmit}
          onCancel={handleFormClose}
        />
      )}

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title={selectedProduct ? "Delete Product" : "Delete Selected Products"}
        message={selectedProduct 
          ? `Are you sure you want to delete "${selectedProduct.name}"? This action cannot be undone.`
          : `Are you sure you want to delete ${selectedProducts.size} products? This action cannot be undone.`
        }
        onConfirm={selectedProduct ? () => handleDelete(selectedProduct.id) : handleBulkDelete}
        onCancel={() => {
          setIsDeleteDialogOpen(false);
          setSelectedProduct(null);
        }}
        isLoading={isLoading}
      />

      <ConfirmDialog
        isOpen={isStatusDialogOpen}
        title="Update Product Status"
        message={`Are you sure you want to update ${selectedProducts.size} products to "${newStatus}"?`}
        onConfirm={handleBulkStatusUpdate}
        onCancel={() => {
          setIsStatusDialogOpen(false);
          setNewStatus('');
        }}
        isLoading={isLoading}
      />

      {selectedProducts.size > 0 && (
        <div className="bulk-actions-hint">
          <span>Press Delete to remove selected items</span>
          <span>Press Esc to clear selection</span>
        </div>
      )}

      {data && (
        <div className="pagination-container">
          <div className="pagination-controls">
            <PageSizeSelector
              pageSize={pageSize}
              onPageSizeChange={handlePageSizeChange}
            />
            <JumpButtons
              onFirstPage={handleFirstPage}
              onLastPage={handleLastPage}
              currentPage={currentPage}
              totalPages={Math.ceil(data.total / pageSize)}
            />
            <GoToPage
              ref={goToPageRef}
              currentPage={currentPage}
              totalPages={Math.ceil(data.total / pageSize)}
              onPageChange={handlePageChange}
              initialValue={pageInput}
            />
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(data.total / pageSize)}
            onPageChange={handlePageChange}
            pageSize={pageSize}
            totalItems={data.total}
          />
        </div>
      )}

      <div className="keyboard-shortcuts-hint">
        <span>Alt + ←/→: Previous/Next Page</span>
        <span>Alt + Home/End: First/Last Page</span>
        <span>Alt + G: Focus Go to Page</span>
        <span>Alt + N/C/P/S/T: Sort by Name/Category/Price/Stock/Status</span>
      </div>

      <CacheManager storageKey="product_cache" />
    </div>
  );
};

export default Products; 