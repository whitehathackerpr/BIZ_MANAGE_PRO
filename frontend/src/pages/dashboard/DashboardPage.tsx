import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p className="welcome-message">
          Welcome back, {user?.firstName || 'User'}!
        </p>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-card">
          <h2>Overview</h2>
          <p>This is your main dashboard. Your business metrics and summaries will appear here.</p>
        </div>
        
        <div className="dashboard-card">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <button className="action-button">Create Invoice</button>
            <button className="action-button">Add Customer</button>
            <button className="action-button">View Reports</button>
          </div>
        </div>
        
        <div className="dashboard-card">
          <h2>Recent Activity</h2>
          <div className="activity-feed">
            <p>No recent activities found.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 