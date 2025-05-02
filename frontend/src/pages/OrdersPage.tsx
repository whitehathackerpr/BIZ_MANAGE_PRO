import React, { useState } from 'react';
import OrderList from '../features/orders/OrderList';
import OrderForm from '../features/orders/OrderForm';
import { Order } from '../features/orders/ordersAPI';
// If businessId comes from Redux, import useSelector and select it from state
// import { useSelector } from 'react-redux';
// import { RootState } from '../app/store';

const OrdersPage: React.FC = () => {
  // Replace this with actual businessId from Redux or props
  const businessId = 1;
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  const handleAdd = () => {
    setEditingOrder(null);
    setShowForm(true);
  };

  const handleEdit = (order: Order) => {
    setEditingOrder(order);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingOrder(null);
  };

  return (
    <div className="container mx-auto py-6">
      <OrderList businessId={businessId} onEdit={handleEdit} onAdd={handleAdd} />
      {showForm && (
        <OrderForm
          businessId={businessId}
          order={editingOrder}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
};

export default OrdersPage; 