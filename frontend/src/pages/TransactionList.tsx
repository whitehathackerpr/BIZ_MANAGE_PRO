import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../app/store';
import {
  getTransactions,
  addTransaction,
  editTransaction,
  removeTransaction,
} from '../features/transactions';
import { Transaction, TransactionCreate, TransactionUpdate } from '../features/transactions/transactionsAPI';
import { toast } from 'react-toastify';

const PAGE_SIZE = 10;

const TransactionList: React.FC<{ businessId: number }> = ({ businessId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { transactions, loading, error } = useSelector((state: RootState) => state.transactions);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    dispatch(getTransactions(businessId));
  }, [dispatch, businessId]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  useEffect(() => {
    setPage(1);
  }, [search, typeFilter, statusFilter]);

  const handleAdd = () => {
    setSelectedTransaction(null);
    setEditMode(false);
    setModalOpen(true);
  };

  const handleEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setEditMode(true);
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      const result = await dispatch(removeTransaction(id));
      if (removeTransaction.fulfilled.match(result)) {
        toast.success('Transaction deleted successfully.');
      } else {
        toast.error('Failed to delete transaction.');
      }
    }
  };

  // Filtering and search
  const filteredTransactions = transactions.filter((t) =>
    (!search || t.id.toString().includes(search)) &&
    (!typeFilter || t.type === typeFilter) &&
    (!statusFilter || t.status === statusFilter)
  );

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / PAGE_SIZE);
  const paginatedTransactions = filteredTransactions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search by ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 border rounded"
          />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border rounded"
          >
            <option value="">All Types</option>
            <option value="sale">Sale</option>
            <option value="purchase">Purchase</option>
            <option value="return">Return</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded"
          >
            <option value="">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleAdd}>Add Transaction</button>
      </div>
      {loading && <div>Loading...</div>}
      <table className="min-w-full bg-white rounded shadow">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">ID</th>
            <th className="py-2 px-4 border-b">Type</th>
            <th className="py-2 px-4 border-b">Date</th>
            <th className="py-2 px-4 border-b">Amount</th>
            <th className="py-2 px-4 border-b">Status</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedTransactions.map((t) => (
            <tr key={t.id}>
              <td className="py-2 px-4 border-b">{t.id}</td>
              <td className="py-2 px-4 border-b">{t.type}</td>
              <td className="py-2 px-4 border-b">{new Date(t.date).toLocaleString()}</td>
              <td className="py-2 px-4 border-b">{t.amount}</td>
              <td className="py-2 px-4 border-b">{t.status}</td>
              <td className="py-2 px-4 border-b">
                <button className="text-blue-600 hover:underline mr-2" onClick={() => handleEdit(t)}>Edit</button>
                <button className="text-red-600 hover:underline" onClick={() => handleDelete(t.id)}>Delete</button>
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
      {/* TODO: Add TransactionFormModal here */}
    </div>
  );
};

export default TransactionList; 