import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef(null);

  useEffect(() => {
    setMenuOpen(false);
    setAccountMenuOpen(false);
  }, [location.pathname]);

  // Close the account dropdown on an outside click, same convention as any
  // standard header menu (GitHub, Gmail, etc.)
  useEffect(() => {
    if (!accountMenuOpen) return;
    const handleClickOutside = (e) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target)) {
        setAccountMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [accountMenuOpen]);

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

        {/* Core sections only - role-specific actions and account items
            live in the account dropdown below, so this never grows past
            a handful of items regardless of how many roles/actions exist. */}
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
        </nav>

        {user && (
          <div className={`account-menu ${menuOpen ? 'open' : ''}`} ref={accountMenuRef}>
            <button
              type="button"
              className="account-trigger"
              aria-haspopup="true"
              aria-expanded={accountMenuOpen}
              onClick={() => setAccountMenuOpen(open => !open)}
            >
              <span className="user-name">👤 {user.fullName || user.username}</span>
              <span className="account-caret">{accountMenuOpen ? '▲' : '▼'}</span>
            </button>

            <div className={`account-dropdown ${accountMenuOpen ? 'open' : ''}`}>
              {user?.role === 'ROLE_ADMIN' && (
                <Link to="/admin/users/new" className={isActive('/admin/users/new')}>
                  ➕ Add User
                </Link>
              )}
              {user?.role === 'ROLE_PLATFORM_ADMIN' && (
                <Link to="/platform/organizations/new" className={isActive('/platform/organizations/new')}>
                  🏢 Create Organization
                </Link>
              )}
              <div className="account-dropdown-divider" />
              <Link to="/account/change-password" className={isActive('/account/change-password')}>
                🔑 Change Password
              </Link>
              <button type="button" onClick={handleLogout} className="account-dropdown-logout">
                🚪 Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
