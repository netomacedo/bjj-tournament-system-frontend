import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <Link to="/">
            <h1>🥋 BJJ Tournament System</h1>
          </Link>
        </div>
        <nav className="nav-menu">
          <Link to="/" className={isActive('/')}>
            Dashboard
          </Link>
          <Link to="/athletes" className={isActive('/athletes')}>
            Athletes
          </Link>
          <Link to="/tournaments" className={isActive('/tournaments')}>
            Tournaments
          </Link>
          <Link to="/matches" className={isActive('/matches')}>
            Matches
          </Link>
          <Link to="/brackets" className={isActive('/brackets')}>
            Brackets
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
