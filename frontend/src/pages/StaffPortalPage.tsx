import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../app';
import api from '../api';

interface Transaction {
  id: number;
  amount: number;
  date: string;
  customer_name: string;
  status: string;
}

const StaffPortalPage: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // For now we're using mock data, but this would be replaced with API calls
        const mockTransactions: Transaction[] = [
          { id: 1, amount: 45.99, date: '2023-09-15T14:30:00', customer_name: 'John Smith', status: 'completed' },
          { id: 2, amount: 129.50, date: '2023-09-15T12:15:00', customer_name: 'Sarah Johnson', status: 'completed' },
          { id: 3, amount: 78.25, date: '2023-09-15T10:45:00', customer_name: 'Michael Brown', status: 'pending' },
          { id: 4, amount: 199.99, date: '2023-09-14T16:20:00', customer_name: 'Emily Davis', status: 'completed' },
          { id: 5, amount: 35.50, date: '2023-09-14T09:10:00', customer_name: 'Robert Wilson', status: 'completed' },
        ];
        
        // In a real implementation, this would be:
        // const response = await api.get('/transactions/recent');
        // setRecentTransactions(response.data);
        
        setRecentTransactions(mockTransactions);
        setLoading(false);
      } catch (err: any) {
        setError('Failed to load transactions');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (!user) {
    return <div className="text-center p-8">Please log in to access the staff portal.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Staff Portal</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Today's Sales</h2>
          <p className="text-3xl font-bold text-blue-600">$254.24</p>
        </div>
        
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Customers Served</h2>
          <p className="text-3xl font-bold text-green-600">12</p>
        </div>
        
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Pending Orders</h2>
          <p className="text-3xl font-bold text-orange-600">3</p>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
        
        {loading ? (
          <p className="text-center p-4">Loading transactions...</p>
        ) : error ? (
          <p className="text-center text-red-500 p-4">{error}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 text-left">ID</th>
                  <th className="py-2 px-4 text-left">Customer</th>
                  <th className="py-2 px-4 text-left">Date</th>
                  <th className="py-2 px-4 text-left">Amount</th>
                  <th className="py-2 px-4 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map(transaction => (
                  <tr key={transaction.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-4">#{transaction.id}</td>
                    <td className="py-2 px-4">{transaction.customer_name}</td>
                    <td className="py-2 px-4">{new Date(transaction.date).toLocaleString()}</td>
                    <td className="py-2 px-4">${transaction.amount.toFixed(2)}</td>
                    <td className="py-2 px-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        transaction.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <button className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
              New Transaction
            </button>
            <button className="bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300">
              Check Inventory
            </button>
            <button className="bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300">
              Customer Lookup
            </button>
            <button className="bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300">
              End of Day Report
            </button>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-4">Announcements</h2>
          <div className="border-l-4 border-blue-500 pl-3 mb-3">
            <p className="text-sm text-gray-600">September 15, 2023</p>
            <p>New promotion starts today! 20% off all electronics.</p>
          </div>
          <div className="border-l-4 border-green-500 pl-3">
            <p className="text-sm text-gray-600">September 14, 2023</p>
            <p>Staff meeting tomorrow at 9:00 AM.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffPortalPage; 