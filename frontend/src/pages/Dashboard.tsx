import React from 'react';

const Dashboard: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Welcome to BizManage Pro</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded shadow text-center">
          <div className="text-lg font-semibold">Total Sales</div>
          <div className="text-2xl font-bold mt-2">$12,500</div>
        </div>
        <div className="bg-white p-6 rounded shadow text-center">
          <div className="text-lg font-semibold">Active Employees</div>
          <div className="text-2xl font-bold mt-2">34</div>
        </div>
        <div className="bg-white p-6 rounded shadow text-center">
          <div className="text-lg font-semibold">Low Stock Alerts</div>
          <div className="text-2xl font-bold mt-2">5</div>
        </div>
      </div>
      <div className="bg-white p-6 rounded shadow">
        <div className="font-semibold mb-4">Sales Overview</div>
        {/* Chart.js chart will go here */}
        <div className="h-64 flex items-center justify-center text-gray-400">[Chart Placeholder]</div>
      </div>
    </div>
  );
};

export default Dashboard; 