import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

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
        <button
          type="button"
          className="hamburger"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(open => !open)}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
        <nav className={`nav-menu ${menuOpen ? 'open' : ''}`}>
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
        <div className={`user-menu ${menuOpen ? 'open' : ''}`}>
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
