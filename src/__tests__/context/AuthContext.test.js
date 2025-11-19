import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';

jest.mock('../../services/authService');

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

  describe('Initial State', () => {
    test('should start with loading true', () => {
      authService.getCurrentUser.mockReturnValue(null);

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.loading).toBe(true);
    });

    test('should set user from localStorage on mount', async () => {
      const mockUser = { username: 'testuser', email: 'test@example.com' };
      authService.getCurrentUser.mockReturnValue(mockUser);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    test('should have no user if localStorage is empty', async () => {
      authService.getCurrentUser.mockReturnValue(null);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('login', () => {
    test('should login user and update state', async () => {
      const mockUserData = {
        token: 'mock-token',
        username: 'testuser',
        email: 'test@example.com',
        fullName: 'Test User',
      };

      authService.getCurrentUser.mockReturnValue(null);
      authService.login.mockResolvedValue(mockUserData);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.login('testuser', 'password123');
      });

      expect(authService.login).toHaveBeenCalledWith('testuser', 'password123');
      expect(result.current.user).toEqual(mockUserData);
      expect(result.current.isAuthenticated).toBe(true);
    });

    test('should throw error when login fails', async () => {
      const errorMessage = 'Invalid credentials';
      authService.getCurrentUser.mockReturnValue(null);
      authService.login.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(
        act(async () => {
          await result.current.login('testuser', 'wrongpassword');
        })
      ).rejects.toThrow(errorMessage);
    });
  });

  describe('register', () => {
    test('should register user and update state', async () => {
      const mockRegistrationData = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123',
        fullName: 'New User',
      };

      const mockUserData = {
        token: 'mock-token',
        ...mockRegistrationData,
        id: 1,
      };

      authService.getCurrentUser.mockReturnValue(null);
      authService.register.mockResolvedValue(mockUserData);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.register(mockRegistrationData);
      });

      expect(authService.register).toHaveBeenCalledWith(mockRegistrationData);
      expect(result.current.user).toEqual(mockUserData);
      expect(result.current.isAuthenticated).toBe(true);
    });

    test('should throw error when registration fails', async () => {
      const errorMessage = 'Username already exists';
      authService.getCurrentUser.mockReturnValue(null);
      authService.register.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(
        act(async () => {
          await result.current.register({
            username: 'existinguser',
            email: 'test@example.com',
            password: 'password123',
          });
        })
      ).rejects.toThrow(errorMessage);
    });
  });

  describe('logout', () => {
    test('should logout user and clear state', async () => {
      const mockUser = { username: 'testuser', email: 'test@example.com' };
      authService.getCurrentUser.mockReturnValue(mockUser);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);

      act(() => {
        result.current.logout();
      });

      expect(authService.logout).toHaveBeenCalled();
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('useAuth hook', () => {
    test('should throw error when used outside AuthProvider', () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = jest.fn();

      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');

      console.error = originalError;
    });
  });
});
