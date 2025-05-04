import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../app';
import { Link } from 'react-router-dom';
import api from '../api';

interface Order {
  id: number;
  date: string;
  total: number;
  status: string;
  items: number;
}

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  rating: number;
}

const CustomerPortalPage: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const [orders, setOrders] = useState<Order[]>([]);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState({
    orders: true,
    recommendations: true,
  });
  const [error, setError] = useState({
    orders: null as string | null,
    recommendations: null as string | null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Mock data for orders - would be replaced with API calls
        const mockOrders: Order[] = [
          { id: 1001, date: '2023-09-10T10:30:00', total: 129.99, status: 'delivered', items: 3 },
          { id: 1002, date: '2023-08-28T14:45:00', total: 79.50, status: 'delivered', items: 2 },
          { id: 1003, date: '2023-08-15T09:20:00', total: 249.99, status: 'delivered', items: 1 },
          { id: 1004, date: '2023-07-30T16:10:00', total: 45.75, status: 'delivered', items: 4 },
        ];
        
        // In real implementation:
        // const ordersResponse = await api.get('/customer/orders');
        // setOrders(ordersResponse.data);
        
        setOrders(mockOrders);
        setLoading(prev => ({ ...prev, orders: false }));
      } catch (err) {
        setError(prev => ({ ...prev, orders: 'Failed to load order history' }));
        setLoading(prev => ({ ...prev, orders: false }));
      }

      try {
        // Mock data for recommended products
        const mockRecommendations: Product[] = [
          { id: 101, name: 'Wireless Headphones', price: 89.99, image: '/assets/headphones.jpg', rating: 4.7 },
          { id: 102, name: 'Smart Watch', price: 199.99, image: '/assets/smartwatch.jpg', rating: 4.5 },
          { id: 103, name: 'Portable Speaker', price: 59.99, image: '/assets/speaker.jpg', rating: 4.3 },
          { id: 104, name: 'USB-C Cable Pack', price: 19.99, image: '/assets/cables.jpg', rating: 4.8 },
        ];
        
        // In real implementation:
        // const recommendationsResponse = await api.get('/recommendations');
        // setRecommendations(recommendationsResponse.data);
        
        setRecommendations(mockRecommendations);
        setLoading(prev => ({ ...prev, recommendations: false }));
      } catch (err) {
        setError(prev => ({ ...prev, recommendations: 'Failed to load recommendations' }));
        setLoading(prev => ({ ...prev, recommendations: false }));
      }
    };

    fetchData();
  }, []);

  if (!user) {
    return <div className="text-center p-8">Please log in to access the customer portal.</div>;
  }

  const userName = typeof user === 'object' && user !== null 
    ? `${(user as any).name || ''}`
    : 'Customer';
    
  const userEmail = typeof user === 'object' && user !== null
    ? (user as any).email || ''
    : '';

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Welcome to Your Customer Portal</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - 2/3 width on large screens */}
        <div className="lg:col-span-2">
          <div className="bg-white p-5 rounded shadow mb-6">
            <h2 className="text-xl font-semibold mb-4">Your Recent Orders</h2>
            
            {loading.orders ? (
              <p className="text-center p-4">Loading your orders...</p>
            ) : error.orders ? (
              <p className="text-center text-red-500 p-4">{error.orders}</p>
            ) : orders.length === 0 ? (
              <div className="text-center p-4">
                <p className="mb-4">You haven't placed any orders yet.</p>
                <Link to="/products" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="py-2 px-4 text-left">Order #</th>
                      <th className="py-2 px-4 text-left">Date</th>
                      <th className="py-2 px-4 text-left">Items</th>
                      <th className="py-2 px-4 text-left">Total</th>
                      <th className="py-2 px-4 text-left">Status</th>
                      <th className="py-2 px-4 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">#{order.id}</td>
                        <td className="py-3 px-4">{new Date(order.date).toLocaleDateString()}</td>
                        <td className="py-3 px-4">{order.items}</td>
                        <td className="py-3 px-4">${order.total.toFixed(2)}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Link to={`/order/${order.id}`} className="text-blue-600 hover:underline">
                            Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          <div className="bg-white p-5 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Recommended for You</h2>
            
            {loading.recommendations ? (
              <p className="text-center p-4">Loading recommendations...</p>
            ) : error.recommendations ? (
              <p className="text-center text-red-500 p-4">{error.recommendations}</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {recommendations.map(product => (
                  <div key={product.id} className="border rounded overflow-hidden hover:shadow-md transition">
                    <div className="h-40 bg-gray-200 flex items-center justify-center">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="max-h-full max-w-full object-cover"
                        onError={e => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://via.placeholder.com/150';
                        }}
                      />
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-sm">{product.name}</h3>
                      <div className="flex justify-between items-center mt-2">
                        <span className="font-bold">${product.price.toFixed(2)}</span>
                        <div className="flex items-center">
                          <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-xs ml-1">{product.rating}</span>
                        </div>
                      </div>
                      <button className="w-full mt-2 bg-blue-600 text-white text-xs py-1 rounded hover:bg-blue-700">
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Sidebar - 1/3 width on large screens */}
        <div>
          <div className="bg-white p-5 rounded shadow mb-6">
            <h2 className="text-xl font-semibold mb-4">Account Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium">{userName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">{userEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Member Since:</span>
                <span className="font-medium">August 2023</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Orders:</span>
                <span className="font-medium">{orders.length}</span>
              </div>
              <div className="pt-2">
                <Link to="/profile" className="text-blue-600 hover:underline text-sm">
                  Edit Profile
                </Link>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-5 rounded shadow mb-6">
            <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
            <ul className="space-y-2">
              <li>
                <Link to="/products" className="flex items-center text-blue-600 hover:underline">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Browse Products
                </Link>
              </li>
              <li>
                <Link to="/cart" className="flex items-center text-blue-600 hover:underline">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  View Cart
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="flex items-center text-blue-600 hover:underline">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  My Wishlist
                </Link>
              </li>
              <li>
                <Link to="/support" className="flex items-center text-blue-600 hover:underline">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="bg-gray-100 p-5 rounded">
            <h2 className="text-lg font-semibold mb-3">Need Help?</h2>
            <p className="text-sm text-gray-600 mb-3">
              Our customer support team is available Monday-Friday, 9am-5pm.
            </p>
            <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerPortalPage; 