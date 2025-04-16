import React from 'react';
import { Outlet } from 'react-router-dom';
import DarkModeToggle from '../components/common/DarkModeToggle';

const AuthLayout: React.FC = () => {
  return (
    <div className="auth-layout">
      <div className="auth-background"></div>
      <div className="auth-theme-toggle">
        <DarkModeToggle />
      </div>
      <div className="auth-logo">
        <h1>BIZ MANAGE PRO</h1>
      </div>
      <div className="auth-content">
        <Outlet />
      </div>
      <footer className="auth-footer">
        <p>&copy; {new Date().getFullYear()} BIZ MANAGE PRO. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default AuthLayout; 