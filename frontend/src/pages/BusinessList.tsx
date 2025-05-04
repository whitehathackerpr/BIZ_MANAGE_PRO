import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../app';
import { getBusinesses, addBusiness, editBusiness, removeBusiness, Business, BusinessCreate, BusinessUpdate } from '../features/business';
import BusinessFormModal from './BusinessFormModal';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const PAGE_SIZE = 10;

const BusinessList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { businesses, loading, error } = useSelector((state: RootState) => state.business);
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(getBusinesses());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Reset page to 1 on search/filter change
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const handleAdd = () => {
    setSelectedBusiness(null);
    setEditMode(false);
    setModalOpen(true);
  };

  const handleEdit = (business: Business) => {
    setSelectedBusiness(business);
    setEditMode(true);
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this business?')) {
      const result = await dispatch(removeBusiness(id));
      if (removeBusiness.fulfilled.match(result)) {
        toast.success('Business deleted successfully.');
      } else {
        toast.error('Failed to delete business.');
      }
    }
  };

  const handleSubmit = async (data: BusinessCreate | BusinessUpdate) => {
    if (!user) return;
    if (editMode && selectedBusiness) {
      const result = await dispatch(editBusiness({ id: selectedBusiness.id, data: data as BusinessUpdate }));
      if (editBusiness.fulfilled.match(result)) {
        toast.success('Business updated successfully.');
      } else {
        toast.error('Failed to update business.');
      }
    } else {
      const result = await dispatch(addBusiness({ ...(data as BusinessCreate), owner_id: user.id }));
      if (addBusiness.fulfilled.match(result)) {
        toast.success('Business added successfully.');
      } else {
        toast.error('Failed to add business.');
      }
    }
    setModalOpen(false);
  };

  // Filtering and search
  const filteredBusinesses = businesses.filter((b) =>
    (!search || b.name.toLowerCase().includes(search.toLowerCase())) &&
    (!statusFilter || (statusFilter === 'active' ? b.is_active : !b.is_active))
  );

  // Pagination
  const totalPages = Math.ceil(filteredBusinesses.length / PAGE_SIZE);
  const paginatedBusinesses = filteredBusinesses.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleAdd} disabled={!canEdit}>Add Business</button>
      </div>
      {loading && <div>Loading...</div>}
      <table className="min-w-full bg-white rounded shadow">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Name</th>
            <th className="py-2 px-4 border-b">Description</th>
            <th className="py-2 px-4 border-b">Registration #</th>
            <th className="py-2 px-4 border-b">Tax ID</th>
            <th className="py-2 px-4 border-b">Active</th>
            <th className="py-2 px-4 border-b">Branches</th>
            {canEdit && <th className="py-2 px-4 border-b">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {paginatedBusinesses.map((b) => (
            <tr key={b.id}>
              <td className="py-2 px-4 border-b">{b.name}</td>
              <td className="py-2 px-4 border-b">{b.description}</td>
              <td className="py-2 px-4 border-b">{b.registration_number}</td>
              <td className="py-2 px-4 border-b">{b.tax_id}</td>
              <td className="py-2 px-4 border-b">{b.is_active ? 'Yes' : 'No'}</td>
              <td className="py-2 px-4 border-b">
                <button className="text-green-600 hover:underline" onClick={() => navigate(`/branches/${b.id}`)}>Branches</button>
              </td>
              {canEdit && (
                <td className="py-2 px-4 border-b">
                  <button className="text-blue-600 hover:underline mr-2" onClick={() => handleEdit(b)}>Edit</button>
                  <button className="text-red-600 hover:underline mr-2" onClick={() => handleDelete(b.id)}>Delete</button>
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
      <BusinessFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editMode && selectedBusiness ? selectedBusiness : undefined}
        isEdit={editMode}
      />
    </div>
  );
};

export default BusinessList; 