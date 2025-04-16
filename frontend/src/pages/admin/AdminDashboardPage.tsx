import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="admin-dashboard-page">
      <div className="admin-dashboard-header">
        <h1>Admin Dashboard</h1>
        <p className="welcome-message">
          Welcome, Admin {user?.firstName || 'User'}
        </p>
      </div>

      <div className="admin-dashboard-content">
        <div className="admin-dashboard-card">
          <h2>System Overview</h2>
          <div className="metrics-grid">
            <div className="metric-item">
              <h3>Users</h3>
              <p className="metric-value">0</p>
            </div>
            <div className="metric-item">
              <h3>Active Sessions</h3>
              <p className="metric-value">1</p>
            </div>
            <div className="metric-item">
              <h3>Server Status</h3>
              <p className="metric-value">Online</p>
            </div>
            <div className="metric-item">
              <h3>Database Status</h3>
              <p className="metric-value">Connected</p>
            </div>
          </div>
        </div>
        
        <div className="admin-dashboard-card">
          <h2>Admin Actions</h2>
          <div className="action-buttons">
            <button className="admin-action-button">Manage Users</button>
            <button className="admin-action-button">System Settings</button>
            <button className="admin-action-button">Logs</button>
            <button className="admin-action-button">Backup Database</button>
          </div>
        </div>
        
        <div className="admin-dashboard-card">
          <h2>Recent System Events</h2>
          <div className="events-list">
            <div className="event-item">
              <p className="event-time">Now</p>
              <p className="event-description">Admin logged in</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage; 