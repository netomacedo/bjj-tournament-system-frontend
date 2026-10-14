import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Like AdminRoute, but requires the platform-admin role instead of an
// ordinary org admin - gates onboarding a brand-new organization, which
// no org-scoped admin can do regardless of their own ROLE_ADMIN status.
const PlatformRoute = ({ children }) => {
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

  if (user?.role !== 'ROLE_PLATFORM_ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PlatformRoute;
