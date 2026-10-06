import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth tokens if needed
api.interceptors.request.use(
  (config) => {
    // Add token from localStorage if exists
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;

    // TEMPORARY: Log all auth errors for debugging
    if (status === 401 || status === 403) {
      console.error('🔴 AUTH ERROR:', {
        status,
        url,
        message: error.response?.data,
        hadToken: !!localStorage.getItem('token')
      });
    }

    // Handle authentication errors (401 Unauthorized or 403 Forbidden)
    if (status === 401 || status === 403) {
      // Don't handle auth errors for login/register endpoints (those are expected)
      if (url?.includes('/auth/login') || url?.includes('/auth/register')) {
        return Promise.reject(error);
      }

      // Check if token exists - if yes, it's expired or invalid
      const hadToken = !!localStorage.getItem('token');

      // Clear invalid/expired token
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Only show alert and redirect if user was logged in
      if (hadToken) {
        alert('Your session has expired. Please login again.');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
