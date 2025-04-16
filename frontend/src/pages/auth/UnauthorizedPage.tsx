import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const UnauthorizedPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="auth-page unauthorized-page">
      <div className="auth-container">
        <h1>Access Denied</h1>
        <div className="unauthorized-content">
          <p>You don't have permission to access this page.</p>
          <p>This area is restricted to users with higher permission levels.</p>
          
          <div className="action-links">
            {user ? (
              <Link to="/dashboard" className="primary-button">
                Return to Dashboard
              </Link>
            ) : (
              <Link to="/login" className="primary-button">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage; 