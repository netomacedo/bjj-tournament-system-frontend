import { useEffect, useRef, useState } from 'react';
import api from '../services/api';

/**
 * Hook to automatically refresh JWT token before expiration
 * - Checks token expiration every minute
 * - Shows warning popup 5 minutes before expiration
 * - Auto-refreshes token when < 5 minutes remaining
 */
const useTokenRefresh = () => {
  const [showExpiryWarning, setShowExpiryWarning] = useState(false);
  const refreshIntervalRef = useRef(null);
  const hasShownWarningRef = useRef(false);

  const getTokenExpiry = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000; // Convert to milliseconds
    } catch (e) {
      console.error('Failed to parse token:', e);
      return null;
    }
  };

  const refreshToken = async () => {
    try {
      console.log('🔄 Refreshing token...');
      const response = await api.post('/auth/refresh');

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        console.log('✅ Token refreshed successfully');
        hasShownWarningRef.current = false;
        setShowExpiryWarning(false);
        return true;
      }
    } catch (error) {
      console.error('❌ Failed to refresh token:', error);

      // If refresh fails, logout
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return false;
    }
  };

  const checkTokenExpiry = async () => {
    const expiry = getTokenExpiry();
    if (!expiry) {
      // No token, stop checking
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      return;
    }

    const now = Date.now();
    const timeUntilExpiry = expiry - now;
    const minutesUntilExpiry = Math.floor(timeUntilExpiry / 1000 / 60);

    console.log(`⏰ Token expires in ${minutesUntilExpiry} minutes`);

    // Token already expired
    if (timeUntilExpiry <= 0) {
      console.log('❌ Token expired - logging out');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return;
    }

    // Less than 5 minutes - auto refresh
    if (timeUntilExpiry < 5 * 60 * 1000) {
      // Show warning popup once
      if (!hasShownWarningRef.current) {
        setShowExpiryWarning(true);
        hasShownWarningRef.current = true;
      }

      // Auto-refresh immediately
      await refreshToken();
    }
  };

  useEffect(() => {
    // Only run if user is logged in
    const token = localStorage.getItem('token');
    if (!token) return;

    // Check immediately on mount
    checkTokenExpiry();

    // Check every minute
    refreshIntervalRef.current = setInterval(checkTokenExpiry, 60 * 1000);

    // Cleanup
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  return {
    showExpiryWarning,
    closeWarning: () => setShowExpiryWarning(false),
  };
};

export default useTokenRefresh;
