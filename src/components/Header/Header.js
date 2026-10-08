import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <Link to="/dashboard">
            <h1>🥋 BJJ Tournament System</h1>
          </Link>
        </div>
        <nav className="nav-menu">
          <Link to="/dashboard" className={isActive('/dashboard')}>
            Dashboard
          </Link>
          <Link to="/athletes" className={isActive('/athletes')}>
            Athletes
          </Link>
          <Link to="/tournaments" className={isActive('/tournaments')}>
            Tournaments
          </Link>
          {user?.role === 'ROLE_ADMIN' && (
            <Link to="/admin/users/new" className={isActive('/admin/users/new')}>
              Add User
            </Link>
          )}
        </nav>
        <div className="user-menu">
          {user && (
            <>
              <span className="user-name">👤 {user.fullName || user.username}</span>
              <button onClick={handleLogout} className="btn-logout">
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
