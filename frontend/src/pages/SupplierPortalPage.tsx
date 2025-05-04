import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../app/store';
import {
  fetchSupplierProfile,
  fetchSupplierOrderHistory,
  fetchSupplierLoyalty,
  submitSupplierFeedbackThunk,
  clearFeedbackSuccess,
  fetchSupplierMessages,
  sendSupplierMessageThunk,
  clearMessageSendSuccess,
  fetchSupplierAnalytics,
  fetchSupplierNotifications,
} from '../features/supplierPortal/supplierPortalSlice';
import { toast } from 'react-toastify';
import api from '../api';

interface BusinessClient {
  id: number;
  name: string;
  email: string;
  phone: string;
  activeOrders: number;
}

interface PendingOrder {
  id: number;
  businessId: number;
  businessName: string;
  date: string;
  items: {
    id: number;
    name: string;
    quantity: number;
    price: number;
  }[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
}

interface InventoryItem {
  id: number;
  name: string;
  sku: string;
  stock: number;
  price: number;
  category: string;
}

const SupplierPortalPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { profile, orders, loyalty, feedbackSuccess, messages, messageSendSuccess, analytics, notifications } = useSelector((state: RootState) => state.supplierPortal);
  const [feedback, setFeedback] = useState('');
  const [message, setMessage] = useState('');
  const user = useSelector((state: RootState) => state.auth.user);
  const [clients, setClients] = useState<BusinessClient[]>([]);
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState({
    clients: true,
    orders: true,
    inventory: true,
  });
  const [error, setError] = useState({
    clients: null as string | null,
    orders: null as string | null,
    inventory: null as string | null,
  });
  
  const [stats, setStats] = useState({
    totalClients: 0,
    pendingOrdersCount: 0,
    lowStockItems: 0,
    monthlySales: 0,
  });

  useEffect(() => {
    dispatch(fetchSupplierProfile());
    dispatch(fetchSupplierOrderHistory());
    dispatch(fetchSupplierLoyalty());
    dispatch(fetchSupplierMessages());
    dispatch(fetchSupplierAnalytics());
    dispatch(fetchSupplierNotifications());
  }, [dispatch]);

  useEffect(() => {
    if (feedbackSuccess) {
      toast.success('Feedback submitted!');
      setFeedback('');
      dispatch(clearFeedbackSuccess());
    }
  }, [feedbackSuccess, dispatch]);

  useEffect(() => {
    if (messageSendSuccess) {
      toast.success('Message sent!');
      setMessage('');
      dispatch(fetchSupplierMessages());
      dispatch(clearMessageSendSuccess());
    }
  }, [messageSendSuccess, dispatch]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Mock data for clients - would be replaced with API calls
        const mockClients: BusinessClient[] = [
          { id: 1, name: 'Acme Electronics', email: 'orders@acmeelectronics.com', phone: '555-1234', activeOrders: 2 },
          { id: 2, name: 'TechStore', email: 'supply@techstore.com', phone: '555-5678', activeOrders: 1 },
          { id: 3, name: 'Modern Office Supplies', email: 'procurement@modernoffice.com', phone: '555-9012', activeOrders: 0 },
          { id: 4, name: 'Green Leaf Foods', email: 'buying@greenleaf.com', phone: '555-3456', activeOrders: 3 },
        ];
        
        // In real implementation:
        // const clientsResponse = await api.get('/supplier/clients');
        // setClients(clientsResponse.data);
        
        setClients(mockClients);
        setLoading(prev => ({ ...prev, clients: false }));
        setStats(prev => ({ ...prev, totalClients: mockClients.length }));
      } catch (err) {
        setError(prev => ({ ...prev, clients: 'Failed to load client data' }));
        setLoading(prev => ({ ...prev, clients: false }));
      }

      try {
        // Mock data for pending orders
        const mockOrders: PendingOrder[] = [
          {
            id: 101,
            businessId: 1,
            businessName: 'Acme Electronics',
            date: '2023-09-12T09:30:00',
            items: [
              { id: 1, name: 'USB-C Cable (3m)', quantity: 50, price: 9.99 },
              { id: 2, name: 'Wireless Mouse', quantity: 20, price: 24.99 }
            ],
            total: 999.30,
            status: 'pending'
          },
          {
            id: 102,
            businessId: 1,
            businessName: 'Acme Electronics',
            date: '2023-09-11T14:15:00',
            items: [
              { id: 3, name: 'Bluetooth Speaker', quantity: 10, price: 49.99 }
            ],
            total: 499.90,
            status: 'processing'
          },
          {
            id: 103,
            businessId: 2,
            businessName: 'TechStore',
            date: '2023-09-13T11:45:00',
            items: [
              { id: 4, name: 'HDMI Cable (2m)', quantity: 30, price: 14.99 },
              { id: 5, name: 'Wireless Keyboard', quantity: 15, price: 39.99 }
            ],
            total: 1049.55,
            status: 'pending'
          },
          {
            id: 104,
            businessId: 4,
            businessName: 'Green Leaf Foods',
            date: '2023-09-10T16:20:00',
            items: [
              { id: 6, name: 'Eco-friendly Packaging', quantity: 500, price: 0.99 },
              { id: 7, name: 'Bamboo Utensils Set', quantity: 200, price: 7.99 }
            ],
            total: 2093.00,
            status: 'shipped'
          },
        ];
        
        // In real implementation:
        // const ordersResponse = await api.get('/supplier/orders');
        // setPendingOrders(ordersResponse.data);
        
        setPendingOrders(mockOrders);
        setLoading(prev => ({ ...prev, orders: false }));
        setStats(prev => ({ 
          ...prev, 
          pendingOrdersCount: mockOrders.filter(o => o.status === 'pending').length,
          monthlySales: mockOrders.reduce((sum, order) => sum + order.total, 0)
        }));
      } catch (err) {
        setError(prev => ({ ...prev, orders: 'Failed to load order data' }));
        setLoading(prev => ({ ...prev, orders: false }));
      }
      
      try {
        // Mock data for inventory
        const mockInventory: InventoryItem[] = [
          { id: 1, name: 'USB-C Cable (3m)', sku: 'USB-C-3M', stock: 150, price: 9.99, category: 'Cables' },
          { id: 2, name: 'Wireless Mouse', sku: 'WL-MOUSE-1', stock: 75, price: 24.99, category: 'Computer Peripherals' },
          { id: 3, name: 'Bluetooth Speaker', sku: 'BT-SPK-10W', stock: 5, price: 49.99, category: 'Audio' },
          { id: 4, name: 'HDMI Cable (2m)', sku: 'HDMI-2M', stock: 100, price: 14.99, category: 'Cables' },
          { id: 5, name: 'Wireless Keyboard', sku: 'WL-KB-1', stock: 60, price: 39.99, category: 'Computer Peripherals' },
          { id: 6, name: 'Eco-friendly Packaging', sku: 'ECO-PKG-S', stock: 1200, price: 0.99, category: 'Packaging' },
          { id: 7, name: 'Bamboo Utensils Set', sku: 'BAMBOO-UT-4PC', stock: 80, price: 7.99, category: 'Eco Products' },
        ];
        
        // In real implementation:
        // const inventoryResponse = await api.get('/supplier/inventory');
        // setInventory(inventoryResponse.data);
        
        setInventory(mockInventory);
        setLoading(prev => ({ ...prev, inventory: false }));
        setStats(prev => ({ 
          ...prev, 
          lowStockItems: mockInventory.filter(item => item.stock < 10).length
        }));
      } catch (err) {
        setError(prev => ({ ...prev, inventory: 'Failed to load inventory data' }));
        setLoading(prev => ({ ...prev, inventory: false }));
      }
    };

    fetchData();
  }, []);

  const handleFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatch(submitSupplierFeedbackThunk(feedback));
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatch(sendSupplierMessageThunk(message));
  };

  const handleOrderStatusChange = async (orderId: number, newStatus: PendingOrder['status']) => {
    // In a real implementation, this would be:
    // await api.put(`/supplier/orders/${orderId}`, { status: newStatus });
    
    // For this demo, we'll just update the local state
    setPendingOrders(
      pendingOrders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  if (!user) {
    return <div className="text-center p-8">Please log in to access the supplier portal.</div>;
  }

  const supplierName = typeof user === 'object' && user !== null 
    ? (user as any).name || 'Supplier'
    : 'Supplier';

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Supplier Portal: {supplierName}</h1>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-gray-500 text-sm">Businesses</h3>
          <p className="text-2xl font-bold">{stats.totalClients}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-gray-500 text-sm">Pending Orders</h3>
          <p className="text-2xl font-bold">{stats.pendingOrdersCount}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-gray-500 text-sm">Low Stock Items</h3>
          <p className="text-2xl font-bold text-orange-500">{stats.lowStockItems}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-gray-500 text-sm">Monthly Sales</h3>
          <p className="text-2xl font-bold text-green-600">${stats.monthlySales.toFixed(2)}</p>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 width on large screens */}
        <div className="lg:col-span-2">
          {/* Pending Orders */}
          <div className="bg-white p-5 rounded shadow mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Pending Orders</h2>
              <button className="text-blue-600 hover:underline">View All Orders</button>
            </div>
            
            {loading.orders ? (
              <p className="text-center p-4">Loading orders...</p>
            ) : error.orders ? (
              <p className="text-center text-red-500 p-4">{error.orders}</p>
            ) : pendingOrders.filter(o => o.status === 'pending').length === 0 ? (
              <p className="text-center p-4 text-gray-500">No pending orders at this time.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="py-2 px-4 text-left">Order ID</th>
                      <th className="py-2 px-4 text-left">Business</th>
                      <th className="py-2 px-4 text-left">Date</th>
                      <th className="py-2 px-4 text-left">Total</th>
                      <th className="py-2 px-4 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingOrders
                      .filter(order => order.status === 'pending')
                      .map(order => (
                      <tr key={order.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">#{order.id}</td>
                        <td className="py-3 px-4">{order.businessName}</td>
                        <td className="py-3 px-4">{new Date(order.date).toLocaleDateString()}</td>
                        <td className="py-3 px-4">${order.total.toFixed(2)}</td>
                        <td className="py-3 px-4">
                          <button 
                            onClick={() => handleOrderStatusChange(order.id, 'processing')}
                            className="bg-blue-600 text-white py-1 px-3 rounded text-xs hover:bg-blue-700 mr-2"
                          >
                            Process
                          </button>
                          <button className="text-blue-600 hover:underline text-xs">
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          {/* Low Stock Inventory */}
          <div className="bg-white p-5 rounded shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Low Stock Items</h2>
              <button className="text-blue-600 hover:underline">Manage Inventory</button>
            </div>
            
            {loading.inventory ? (
              <p className="text-center p-4">Loading inventory...</p>
            ) : error.inventory ? (
              <p className="text-center text-red-500 p-4">{error.inventory}</p>
            ) : inventory.filter(item => item.stock < 10).length === 0 ? (
              <p className="text-center p-4 text-gray-500">No low stock items at this time.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="py-2 px-4 text-left">SKU</th>
                      <th className="py-2 px-4 text-left">Product</th>
                      <th className="py-2 px-4 text-left">Category</th>
                      <th className="py-2 px-4 text-left">Stock</th>
                      <th className="py-2 px-4 text-left">Price</th>
                      <th className="py-2 px-4 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory
                      .filter(item => item.stock < 10)
                      .map(item => (
                      <tr key={item.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{item.sku}</td>
                        <td className="py-3 px-4">{item.name}</td>
                        <td className="py-3 px-4">{item.category}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-800">
                            {item.stock} left
                          </span>
                        </td>
                        <td className="py-3 px-4">${item.price.toFixed(2)}</td>
                        <td className="py-3 px-4">
                          <button className="bg-green-600 text-white py-1 px-3 rounded text-xs hover:bg-green-700">
                            Restock
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        
        {/* Right Column - 1/3 width on large screens */}
        <div>
          {/* Business Clients */}
          <div className="bg-white p-5 rounded shadow mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Business Clients</h2>
              <button className="text-blue-600 hover:underline">View All</button>
            </div>
            
            {loading.clients ? (
              <p className="text-center p-4">Loading clients...</p>
            ) : error.clients ? (
              <p className="text-center text-red-500 p-4">{error.clients}</p>
            ) : (
              <div className="space-y-4">
                {clients.map(client => (
                  <div key={client.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded">
                    <div>
                      <h3 className="font-medium">{client.name}</h3>
                      <p className="text-xs text-gray-500">{client.email}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded text-xs ${
                        client.activeOrders > 0 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {client.activeOrders} orders
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Quick Actions */}
          <div className="bg-white p-5 rounded shadow mb-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <button className="bg-blue-600 text-white p-3 rounded hover:bg-blue-700 flex flex-col items-center justify-center">
                <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add Product</span>
              </button>
              <button className="bg-gray-200 text-gray-800 p-3 rounded hover:bg-gray-300 flex flex-col items-center justify-center">
                <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>Orders Report</span>
              </button>
              <button className="bg-gray-200 text-gray-800 p-3 rounded hover:bg-gray-300 flex flex-col items-center justify-center">
                <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Schedule Delivery</span>
              </button>
              <button className="bg-gray-200 text-gray-800 p-3 rounded hover:bg-gray-300 flex flex-col items-center justify-center">
                <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Send Notification</span>
              </button>
            </div>
          </div>
          
          {/* Recent Activity */}
          <div className="bg-white p-5 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm">New order <span className="font-medium">#{pendingOrders[0]?.id}</span> received from <span className="font-medium">{pendingOrders[0]?.businessName}</span></p>
                  <p className="text-xs text-gray-500">Just now</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-green-100 text-green-600 p-2 rounded-full">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm">Order <span className="font-medium">#104</span> has been shipped</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-red-100 text-red-600 p-2 rounded-full">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm">Inventory alert: <span className="font-medium">Bluetooth Speaker</span> is low in stock</p>
                  <p className="text-xs text-gray-500">3 hours ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierPortalPage; 