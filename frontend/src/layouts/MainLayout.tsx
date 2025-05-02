import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../app';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md hidden md:block">
        <div className="p-6 font-bold text-xl border-b">BizManage Pro</div>
        <nav className="mt-6">
          <ul className="space-y-2">
            <li><Link to="/dashboard" className="block px-4 py-2 rounded hover:bg-gray-200">Dashboard</Link></li>
            <li><Link to="/business" className="block px-4 py-2 rounded hover:bg-gray-200">Businesses</Link></li>
            <li><Link to="/products" className="block px-4 py-2 rounded hover:bg-gray-200">Products</Link></li>
            <li><Link to="/employees" className="block px-4 py-2 rounded hover:bg-gray-200">Employees</Link></li>
            <li><Link to="/suppliers" className="block px-4 py-2 rounded hover:bg-gray-200">Suppliers</Link></li>
            <li><Link to="/customers" className="block px-4 py-2 rounded hover:bg-gray-200">Customers</Link></li>
            <li><Link to="/reports" className="block px-4 py-2 rounded hover:bg-gray-200">Reports</Link></li>
            <li><Link to="/inventory" className="block px-4 py-2 rounded hover:bg-gray-200">Inventory</Link></li>
            <li><Link to="/transactions" className="block px-4 py-2 rounded hover:bg-gray-200">Transactions</Link></li>
            <li><Link to="/notifications" className="block px-4 py-2 rounded hover:bg-gray-200">Notifications</Link></li>
          </ul>
        </nav>
      </aside>
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-md p-4 flex items-center justify-between">
          <div className="font-semibold text-lg">Dashboard</div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">{user?.name || 'User'}</span>
            <button className="bg-blue-500 text-white px-3 py-1 rounded">Logout</button>
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
};

export default MainLayout; 