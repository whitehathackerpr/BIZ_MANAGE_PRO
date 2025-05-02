import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../app/store';
import { getOrders, removeOrder } from './ordersSlice';
import { toast } from 'react-toastify';
import { Order } from './ordersAPI';

interface OrderListProps {
  businessId: number;
  onEdit: (order: Order) => void;
  onAdd: () => void;
}

const OrderList: React.FC<OrderListProps> = ({ businessId, onEdit, onAdd }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { orders, loading, error } = useSelector((state: RootState) => state.orders);

  useEffect(() => {
    dispatch(getOrders(businessId));
  }, [dispatch, businessId]);

  const handleDelete = async (order: Order) => {
    if (window.confirm(`Delete order #${order.order_number}?`)) {
      try {
        await dispatch(removeOrder({ business_id: businessId, order_id: order.id })).unwrap();
        toast.success('Order deleted');
      } catch (err: any) {
        toast.error(err.message || 'Failed to delete order');
      }
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Orders</h2>
        <button onClick={onAdd} className="btn btn-primary">Add Order</button>
      </div>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      <table className="min-w-full table-auto border">
        <thead>
          <tr>
            <th className="px-4 py-2 border">Order #</th>
            <th className="px-4 py-2 border">Customer</th>
            <th className="px-4 py-2 border">Status</th>
            <th className="px-4 py-2 border">Total</th>
            <th className="px-4 py-2 border">Created</th>
            <th className="px-4 py-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id}>
              <td className="border px-4 py-2">{order.order_number}</td>
              <td className="border px-4 py-2">{order.customer_id}</td>
              <td className="border px-4 py-2">{order.status}</td>
              <td className="border px-4 py-2">{order.total_amount}</td>
              <td className="border px-4 py-2">{new Date(order.created_at).toLocaleString()}</td>
              <td className="border px-4 py-2">
                <button onClick={() => onEdit(order)} className="btn btn-sm btn-secondary mr-2">Edit</button>
                <button onClick={() => handleDelete(order)} className="btn btn-sm btn-danger">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderList; 