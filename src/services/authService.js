import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
const AUTH_URL = `${API_URL}/auth`;

class AuthService {
  // Register new user
  async register(userData) {
    const response = await axios.post(`${AUTH_URL}/register`, userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
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
