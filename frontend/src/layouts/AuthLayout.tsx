import React from 'react';
import { Outlet } from 'react-router-dom';
import DarkModeToggle from '../components/common/DarkModeToggle';

const AuthLayout: React.FC = () => {
  return (
    <div className="auth-layout">
      <div className=""></div>
      {/* <div className="auth-theme-toggle">
        <DarkModeToggle />
      </div> */}
      <div className="auth-content">
        <Outlet />
      </div>
      <footer className="">
      </footer>
    </div>
  );
};

export default AuthLayout;

