import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Like AdminRoute, but also admits the platform admin - for pages like
// Manage Users where both an org admin and the platform admin have
// legitimate (if differently-scoped) access.
const AdminOrPlatformRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontSize: '1.2rem',
        color: '#666'
      }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'ROLE_ADMIN' && user?.role !== 'ROLE_PLATFORM_ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default AdminOrPlatformRoute;
