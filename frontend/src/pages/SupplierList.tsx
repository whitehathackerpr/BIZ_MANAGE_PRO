import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../app/store';
import {
  getSuppliers,
  addSupplier,
  editSupplier,
  removeSupplier,
} from '../features/suppliers';
import { Supplier, SupplierCreate, SupplierUpdate } from '../features/suppliers/suppliersAPI';
import { toast } from 'react-toastify';

const PAGE_SIZE = 10;

const SupplierList: React.FC<{ businessId: number }> = ({ businessId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { suppliers, loading, error } = useSelector((state: RootState) => state.suppliers);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  useEffect(() => {
    dispatch(getSuppliers(businessId));
  }, [dispatch, businessId]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const handleAdd = () => {
    setSelectedSupplier(null);
    setEditMode(false);
    setModalOpen(true);
  };

  const handleEdit = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setEditMode(true);
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      const result = await dispatch(removeSupplier(id));
      if (removeSupplier.fulfilled.match(result)) {
        toast.success('Supplier deleted successfully.');
      } else {
        toast.error('Failed to delete supplier.');
      }
    }
  };

  // Filtering and search
  const filteredSuppliers = suppliers.filter((s) =>
    (!search || s.name.toLowerCase().includes(search.toLowerCase())) &&
    (!statusFilter || (statusFilter === 'active' ? s.is_active : !s.is_active))
  );

  // Pagination
  const totalPages = Math.ceil(filteredSuppliers.length / PAGE_SIZE);
  const paginatedSuppliers = filteredSuppliers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleAdd}>Add Supplier</button>
      </div>
      {loading && <div>Loading...</div>}
      <table className="min-w-full bg-white rounded shadow">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Name</th>
            <th className="py-2 px-4 border-b">Contact</th>
            <th className="py-2 px-4 border-b">Email</th>
            <th className="py-2 px-4 border-b">Phone</th>
            <th className="py-2 px-4 border-b">Active</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedSuppliers.map((s) => (
            <tr key={s.id}>
              <td className="py-2 px-4 border-b">{s.name}</td>
              <td className="py-2 px-4 border-b">{s.contact_name}</td>
              <td className="py-2 px-4 border-b">{s.email}</td>
              <td className="py-2 px-4 border-b">{s.phone}</td>
              <td className="py-2 px-4 border-b">{s.is_active ? 'Yes' : 'No'}</td>
              <td className="py-2 px-4 border-b">
                <button className="text-blue-600 hover:underline mr-2" onClick={() => handleEdit(s)}>Edit</button>
                <button className="text-red-600 hover:underline" onClick={() => handleDelete(s.id)}>Delete</button>
              </td>
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
      {/* TODO: Add SupplierFormModal here */}
    </div>
  );
};

export default SupplierList; 