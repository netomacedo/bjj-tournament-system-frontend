import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import './SessionExpiryPopup.css';

const SessionExpiryPopup = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [countdown, setCountdown] = useState(300); // 5 minutes in seconds
  const [extending, setExtending] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Decode JWT and get expiry time
  const getTokenExpiry = useCallback(() => {
    const token = authService.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000; // Convert to milliseconds
    } catch (err) {
      console.error('Failed to decode token:', err);
      return null;
    }
  }, []);

  // Schedule popup to show 5 minutes before token expires
  const scheduleExpiryWarning = useCallback(() => {
    const expiryTime = getTokenExpiry();
    if (!expiryTime) return;

    const now = Date.now();
    const timeUntilExpiry = expiryTime - now;
    const warningTime = timeUntilExpiry - (5 * 60 * 1000); // 5 min before expiry

    if (warningTime > 0) {
      // Schedule popup for exactly 5 min before expiry
      const timeoutId = setTimeout(() => {
        setShowPopup(true);
        setCountdown(300); // Reset to 5 minutes
      }, warningTime);

      return () => clearTimeout(timeoutId);
    } else if (timeUntilExpiry > 0) {
      // Token expires in less than 5 minutes - show popup now
      const secondsLeft = Math.floor(timeUntilExpiry / 1000);
      setCountdown(secondsLeft);
      setShowPopup(true);
    } else {
      // Token already expired
      handleAutoLogout();
    }
  }, [getTokenExpiry]);

  // Initialize on mount and when token changes
  useEffect(() => {
    const cleanup = scheduleExpiryWarning();
    return cleanup;
  }, [scheduleExpiryWarning]);

  // Countdown timer when popup is visible
  useEffect(() => {
    if (!showPopup) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleAutoLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showPopup]);

  // Format countdown as MM:SS
  const formatCountdown = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle "Stay Logged In" - refresh token
  const handleExtendSession = async () => {
    try {
      setExtending(true);
      await authService.refreshToken();

      // Hide popup and reschedule for new token
      setShowPopup(false);
      setExtending(false);

      // Schedule warning for the new token (23h 55min from now)
      scheduleExpiryWarning();

    } catch (err) {
      console.error('Failed to refresh token:', err);
      alert('Failed to extend session. Please login again.');
      handleLogout();
    }
  };

  // Handle "Logout" button
  const handleLogout = () => {
    setShowPopup(false);
    logout();
    navigate('/login');
  };

  // Auto logout when countdown hits 0
  const handleAutoLogout = () => {
    setShowPopup(false);
    logout();
    navigate('/login');
  };

  if (!showPopup) return null;

  return (
    <div className="session-expiry-overlay">
      <div className="session-expiry-popup">
        <div className="popup-icon">⏰</div>
        <h2>Session Expiring Soon</h2>
        <p>Your session will expire in:</p>

        <div className={`countdown-display ${countdown <= 60 ? 'warning' : ''}`}>
          {formatCountdown(countdown)}
        </div>

        <p className="popup-message">
          Do you want to stay logged in?
        </p>

        <div className="popup-buttons">
          <button
            className="btn btn-primary btn-extend"
            onClick={handleExtendSession}
            disabled={extending}
          >
            {extending ? 'Extending...' : '✓ Stay Logged In'}
          </button>
          <button
            className="btn btn-secondary btn-logout"
            onClick={handleLogout}
            disabled={extending}
          >
            🚪 Logout
          </button>
        </div>

        <p className="popup-footer">
          Session will auto-logout at 0:00
        </p>
      </div>
    </div>
  );
};

export default SessionExpiryPopup;
