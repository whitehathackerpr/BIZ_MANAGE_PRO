import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import DarkModeToggle from '../components/common/DarkModeToggle';

const MainLayout: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isAdmin = user?.role === 'admin';
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleMenu = () => {
    setMenuOpen(prev => !prev);
  };

  return (
    <div className="main-layout">
      <header className="main-header">
        <div className="logo">
          <h1>BIZ MANAGE PRO</h1>
        </div>
        
        <div className="mobile-menu-toggle" onClick={toggleMenu}>
          <span className="menu-icon"></span>
        </div>
        
        <nav className={`main-nav ${menuOpen ? 'open' : ''}`}>
          <ul className="nav-list">
            <li className="nav-item">
              <Link 
                to="/dashboard" 
                className={location.pathname === '/dashboard' ? 'active' : ''}
              >
                Dashboard
              </Link>
            </li>
            
            {isAdmin && (
              <li className="nav-item">
                <Link 
                  to="/admin" 
                  className={location.pathname === '/admin' ? 'active' : ''}
                >
                  Admin
                </Link>
              </li>
            )}
            
            <li className="nav-item">
              <DarkModeToggle />
            </li>
            
            <li className="nav-item user-menu">
              <div className="user-info">
                <span className="user-name">{user?.firstName} {user?.lastName}</span>
                <span className="user-role">{user?.role}</span>
              </div>
              
              <div className="user-dropdown">
                <ul>
                  <li>
                    <Link to="/profile">My Profile</Link>
                  </li>
                  <li>
                    <button onClick={handleLogout} className="logout-button">
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            </li>
          </ul>
        </nav>
      </header>
      
      <main className="main-content">
        <Outlet />
      </main>
      
      <footer className="main-footer">
        <p>&copy; {new Date().getFullYear()} BIZ MANAGE PRO. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default MainLayout; 