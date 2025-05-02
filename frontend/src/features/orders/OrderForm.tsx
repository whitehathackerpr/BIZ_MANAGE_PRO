import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../app/store';
import { addOrder, editOrder } from './ordersSlice';
import { Order, OrderCreate } from './ordersAPI';
import { toast } from 'react-toastify';

interface OrderFormProps {
  businessId: number;
  order?: Order | null;
  onClose: () => void;
}

const OrderForm: React.FC<OrderFormProps> = ({ businessId, order, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [form, setForm] = useState<OrderCreate>({
    order_number: '',
    customer_id: 0,
    business_id: businessId,
    branch_id: 0,
    status: '',
    total_amount: 0,
  });

  useEffect(() => {
    if (order) {
      setForm({
        order_number: order.order_number,
        customer_id: order.customer_id,
        business_id: order.business_id,
        branch_id: order.branch_id,
        status: order.status,
        total_amount: order.total_amount,
      });
    } else {
      setForm({
        order_number: '',
        customer_id: 0,
        business_id: businessId,
        branch_id: 0,
        status: '',
        total_amount: 0,
      });
    }
  }, [order, businessId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === 'customer_id' || name === 'branch_id' || name === 'total_amount' ? Number(value) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (order) {
        await dispatch(
          editOrder({ business_id: businessId, order_id: order.id, data: form })
        ).unwrap();
        toast.success('Order updated');
      } else {
        await dispatch(
          addOrder({ business_id: businessId, data: form })
        ).unwrap();
        toast.success('Order created');
      }
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save order');
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white p-6 rounded shadow w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">{order ? 'Edit Order' : 'Add Order'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="block mb-1">Order Number</label>
            <input
              type="text"
              name="order_number"
              value={form.order_number}
              onChange={handleChange}
              className="input input-bordered w-full"
              required
            />
          </div>
          <div className="mb-3">
            <label className="block mb-1">Customer ID</label>
            <input
              type="number"
              name="customer_id"
              value={form.customer_id}
              onChange={handleChange}
              className="input input-bordered w-full"
              required
            />
          </div>
          <div className="mb-3">
            <label className="block mb-1">Branch ID</label>
            <input
              type="number"
              name="branch_id"
              value={form.branch_id}
              onChange={handleChange}
              className="input input-bordered w-full"
              required
            />
          </div>
          <div className="mb-3">
            <label className="block mb-1">Status</label>
            <input
              type="text"
              name="status"
              value={form.status}
              onChange={handleChange}
              className="input input-bordered w-full"
              required
            />
          </div>
          <div className="mb-3">
            <label className="block mb-1">Total Amount</label>
            <input
              type="number"
              name="total_amount"
              value={form.total_amount}
              onChange={handleChange}
              className="input input-bordered w-full"
              required
            />
          </div>
          {/* Optionally add more fields here */}
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">{order ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderForm; 