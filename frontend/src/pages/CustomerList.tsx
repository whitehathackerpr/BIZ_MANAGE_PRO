import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../app/store';
import {
  getCustomers,
  addCustomer,
  editCustomer,
  removeCustomer,
} from '../features/customers';
import { Customer, CustomerCreate, CustomerUpdate } from '../features/customers/customersAPI';
import { toast } from 'react-toastify';

const PAGE_SIZE = 10;

const CustomerList: React.FC<{ businessId: number }> = ({ businessId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { customers, loading, error } = useSelector((state: RootState) => state.customers);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    dispatch(getCustomers(businessId));
  }, [dispatch, businessId]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const handleAdd = () => {
    setSelectedCustomer(null);
    setEditMode(false);
    setModalOpen(true);
  };

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setEditMode(true);
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      const result = await dispatch(removeCustomer(id));
      if (removeCustomer.fulfilled.match(result)) {
        toast.success('Customer deleted successfully.');
      } else {
        toast.error('Failed to delete customer.');
      }
    }
  };

  // Filtering and search
  const filteredCustomers = customers.filter((c) =>
    !search || c.name.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / PAGE_SIZE);
  const paginatedCustomers = filteredCustomers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleAdd}>Add Customer</button>
      </div>
      {loading && <div>Loading...</div>}
      <table className="min-w-full bg-white rounded shadow">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Name</th>
            <th className="py-2 px-4 border-b">Email</th>
            <th className="py-2 px-4 border-b">Phone</th>
            <th className="py-2 px-4 border-b">Address</th>
            <th className="py-2 px-4 border-b">Loyalty Points</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedCustomers.map((c) => (
            <tr key={c.id}>
              <td className="py-2 px-4 border-b">{c.name}</td>
              <td className="py-2 px-4 border-b">{c.email}</td>
              <td className="py-2 px-4 border-b">{c.phone}</td>
              <td className="py-2 px-4 border-b">{c.address}</td>
              <td className="py-2 px-4 border-b">{c.loyalty_points}</td>
              <td className="py-2 px-4 border-b">
                <button className="text-blue-600 hover:underline mr-2" onClick={() => handleEdit(c)}>Edit</button>
                <button className="text-red-600 hover:underline" onClick={() => handleDelete(c.id)}>Delete</button>
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
      {/* TODO: Add CustomerFormModal here */}
    </div>
  );
};

export default CustomerList; 