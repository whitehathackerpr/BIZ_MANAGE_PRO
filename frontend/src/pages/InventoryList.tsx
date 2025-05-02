import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../app/store';
import {
  getInventory,
  getLowStock,
  getExpired,
  getStockMovements,
} from '../features/inventory';
import { InventoryItem } from '../features/inventory/inventoryAPI';
import { toast } from 'react-toastify';

const PAGE_SIZE = 10;

const InventoryList: React.FC<{ businessId: number }> = ({ businessId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { items, loading, error, lowStock, expired } = useSelector((state: RootState) => state.inventory);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(getInventory(businessId));
  }, [dispatch, businessId]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const filteredItems = items.filter((item) =>
    (!search || item.product_name.toLowerCase().includes(search.toLowerCase())) &&
    (!statusFilter || item.status === statusFilter)
  );

  const totalPages = Math.ceil(filteredItems.length / PAGE_SIZE);
  const paginatedItems = filteredItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search by product name..."
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
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>
      {loading && <div>Loading...</div>}
      <table className="min-w-full bg-white rounded shadow">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Product</th>
            <th className="py-2 px-4 border-b">Stock Level</th>
            <th className="py-2 px-4 border-b">Min Stock</th>
            <th className="py-2 px-4 border-b">Status</th>
            <th className="py-2 px-4 border-b">Last Updated</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedItems.map((item) => (
            <tr key={item.id}>
              <td className="py-2 px-4 border-b">{item.product_name}</td>
              <td className="py-2 px-4 border-b">{item.stock_level}</td>
              <td className="py-2 px-4 border-b">{item.min_stock_level}</td>
              <td className="py-2 px-4 border-b">{item.status.replace('_', ' ')}</td>
              <td className="py-2 px-4 border-b">{new Date(item.last_updated).toLocaleString()}</td>
              <td className="py-2 px-4 border-b">
                {/* Add buttons for stock movement, edit, etc. */}
                <button className="text-blue-600 hover:underline mr-2">Stock Movements</button>
                <button className="text-green-600 hover:underline">Update</button>
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
    </div>
  );
};

export default InventoryList; 