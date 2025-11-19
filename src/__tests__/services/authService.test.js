import axios from 'axios';
import authService from '../../services/authService';

jest.mock('axios');

describe('AuthService', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('register', () => {
    const mockUserData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      fullName: 'Test User',
    };

    const mockResponse = {
      data: {
        token: 'mock-jwt-token',
        username: 'testuser',
        email: 'test@example.com',
        fullName: 'Test User',
        id: 1,
      },
    };

    test('should register user and store token in localStorage', async () => {
      axios.post.mockResolvedValue(mockResponse);

      const result = await authService.register(mockUserData);

      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/auth/register'),
        mockUserData
      );
      expect(localStorage.getItem('token')).toBe('mock-jwt-token');
      expect(localStorage.getItem('user')).toBe(JSON.stringify(mockResponse.data));
      expect(result).toEqual(mockResponse.data);
    });

    test('should not store token if response does not contain token', async () => {
      const responseWithoutToken = { data: { username: 'testuser' } };
      axios.post.mockResolvedValue(responseWithoutToken);

      await authService.register(mockUserData);

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });

    test('should throw error when registration fails', async () => {
      const errorMessage = 'Username already exists';
      axios.post.mockRejectedValue({
        response: { data: { message: errorMessage } },
      });

      await expect(authService.register(mockUserData)).rejects.toEqual({
        response: { data: { message: errorMessage } },
      });
    });
  });

  describe('login', () => {
    const mockCredentials = {
      username: 'testuser',
      password: 'password123',
    };

    const mockResponse = {
      data: {
        token: 'mock-jwt-token',
        username: 'testuser',
        email: 'test@example.com',
        fullName: 'Test User',
        id: 1,
      },
    };

    test('should login user and store token in localStorage', async () => {
      axios.post.mockResolvedValue(mockResponse);

      const result = await authService.login(
        mockCredentials.username,
        mockCredentials.password
      );

      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/auth/login'),
        mockCredentials
      );
      expect(localStorage.getItem('token')).toBe('mock-jwt-token');
      expect(localStorage.getItem('user')).toBe(JSON.stringify(mockResponse.data));
      expect(result).toEqual(mockResponse.data);
    });

    test('should not store token if response does not contain token', async () => {
      const responseWithoutToken = { data: { username: 'testuser' } };
      axios.post.mockResolvedValue(responseWithoutToken);

      await authService.login(mockCredentials.username, mockCredentials.password);

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });

    test('should throw error when login fails', async () => {
      const errorMessage = 'Invalid credentials';
      axios.post.mockRejectedValue({
        response: { data: { message: errorMessage } },
      });

      await expect(
        authService.login(mockCredentials.username, mockCredentials.password)
      ).rejects.toEqual({
        response: { data: { message: errorMessage } },
      });
    });
  });

  describe('logout', () => {
    test('should remove token and user from localStorage', () => {
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify({ username: 'testuser' }));

      authService.logout();

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });
  });

  describe('getCurrentUser', () => {
    test('should return user from localStorage', () => {
      const mockUser = { username: 'testuser', email: 'test@example.com' };
      localStorage.setItem('user', JSON.stringify(mockUser));

      const user = authService.getCurrentUser();

      expect(user).toEqual(mockUser);
    });

    test('should return null if no user in localStorage', () => {
      const user = authService.getCurrentUser();

      expect(user).toBeNull();
    });

    test('should return null if user data is invalid JSON', () => {
      localStorage.setItem('user', 'invalid-json');

      expect(() => authService.getCurrentUser()).toThrow();
    });
  });

  describe('getToken', () => {
    test('should return token from localStorage', () => {
      localStorage.setItem('token', 'mock-token');

      const token = authService.getToken();

      expect(token).toBe('mock-token');
    });

    test('should return null if no token in localStorage', () => {
      const token = authService.getToken();

      expect(token).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    test('should return true if token exists', () => {
      localStorage.setItem('token', 'mock-token');

      expect(authService.isAuthenticated()).toBe(true);
    });

    test('should return false if token does not exist', () => {
      expect(authService.isAuthenticated()).toBe(false);
    });

    test('should return false if token is empty string', () => {
      localStorage.setItem('token', '');

      expect(authService.isAuthenticated()).toBe(false);
    });
  });
});
