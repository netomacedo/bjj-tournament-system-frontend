import axios from 'axios';
import api from './api';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
const AUTH_URL = `${API_URL}/auth`;

class AuthService {
  // Register new user (public self-registration - kept for completeness,
  // but the backend now rejects this unless called with an admin token)
  async register(userData) {
    const response = await axios.post(`${AUTH_URL}/register`, userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  }

  // Create a new user as an admin. Uses the shared `api` instance so the
  // logged-in admin's token is attached, and deliberately does NOT touch
  // localStorage - the response contains the NEW user's token, which must
  // not overwrite the admin's own session.
  async createUser(userData) {
    const response = await api.post('/auth/register', userData);
    return response.data;
  }

  // Platform-admin only: create a brand-new organization and its first
  // org-admin together. No token is returned in the response for this
  // endpoint, so there's nothing to worry about clobbering here.
  async createOrganization(orgData) {
    const response = await api.post('/platform/organizations', orgData);
    return response.data;
  }

  // Change the current user's own password. On success, the old token
  // stays valid (nothing was reissued) - no localStorage changes needed.
  async changePassword(currentPassword, newPassword) {
    const response = await api.post('/auth/change-password', { currentPassword, newPassword });
    return response.data;
  }

  // List users - an admin's own organization, or everyone for a platform admin.
  async getAllUsers() {
    const response = await api.get('/auth/users/all');
    return response.data;
  }

  // Admin-initiated reset of ANOTHER user's password (no current password
  // needed, unlike changePassword above) - for when someone is locked out.
  async resetUserPassword(userId, newPassword) {
    const response = await api.put(`/auth/users/${userId}/reset-password`, { newPassword });
    return response.data;
  }

  // Login user
  async login(username, password) {
    const response = await axios.post(`${AUTH_URL}/login`, {
      username,
      password,
    });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  }

  // Refresh token (extend session)
  async refreshToken() {
    const token = this.getToken();
    if (!token) {
      throw new Error('No token to refresh');
    }

    const response = await axios.post(`${AUTH_URL}/refresh`, {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  }

  // Logout user
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // Get current user
  getCurrentUser() {
    const token = this.getToken();
    const userStr = localStorage.getItem('user');

    // Only return user if we have both token and user data
    if (token && userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        // If user data is corrupted, clear everything
        this.logout();
        return null;
      }
    }

    // If we have user data but no token, or vice versa, clear everything
    if (userStr || token) {
      this.logout();
    }

    return null;
  }

  // Get auth token
  getToken() {
    return localStorage.getItem('token');
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getToken();
  }
}

export default new AuthService();
