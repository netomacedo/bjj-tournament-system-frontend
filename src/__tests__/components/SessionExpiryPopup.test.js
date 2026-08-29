import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SessionExpiryPopup from '../../components/SessionExpiryPopup/SessionExpiryPopup';
import { AuthContext } from '../../context/AuthContext';
import authService from '../../services/authService';

// Mock authService
jest.mock('../../services/authService');

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }) => <div>{children}</div>,
  useNavigate: () => mockNavigate,
}));

describe('SessionExpiryPopup', () => {
  let mockLogout;
  let mockAuthContext;

  beforeEach(() => {
    jest.useFakeTimers();
    mockLogout = jest.fn();
    mockAuthContext = {
      user: { username: 'testuser' },
      logout: mockLogout,
    };

    // Clear localStorage
    localStorage.clear();

    // Reset mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <AuthContext.Provider value={mockAuthContext}>
          <SessionExpiryPopup />
        </AuthContext.Provider>
      </BrowserRouter>
    );
  };

  const createToken = (expiresInSeconds) => {
    const now = Math.floor(Date.now() / 1000);
    const exp = now + expiresInSeconds;
    const payload = { sub: 'testuser', exp };
    const encodedPayload = btoa(JSON.stringify(payload));
    return `header.${encodedPayload}.signature`;
  };

  test('should not show popup when token has more than 5 minutes left', () => {
    // Token expires in 10 minutes
    const token = createToken(600);
    authService.getToken = jest.fn(() => token);

    renderComponent();

    expect(screen.queryByText(/Session Expiring Soon/i)).not.toBeInTheDocument();
  });

  test('should show popup when token expires in less than 5 minutes', () => {
    // Token expires in 4 minutes
    const token = createToken(240);
    authService.getToken = jest.fn(() => token);

    renderComponent();

    expect(screen.getByText(/Session Expiring Soon/i)).toBeInTheDocument();
    expect(screen.getByText(/Do you want to stay logged in/i)).toBeInTheDocument();
  });

  test('should display countdown timer', () => {
    // Token expires in 4 minutes (240 seconds)
    const token = createToken(240);
    authService.getToken = jest.fn(() => token);

    renderComponent();

    // Should show 4:00 initially
    expect(screen.getByText(/4:00|3:5[0-9]/)).toBeInTheDocument();
  });

  test('should update countdown every second', () => {
    // Token expires in 300 seconds (5 minutes)
    const token = createToken(300);
    authService.getToken = jest.fn(() => token);

    renderComponent();

    expect(screen.getByText(/5:00/)).toBeInTheDocument();

    // Advance 1 second
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(screen.getByText(/4:59/)).toBeInTheDocument();

    // Advance 59 more seconds (total 1 minute)
    act(() => {
      jest.advanceTimersByTime(59000);
    });

    expect(screen.getByText(/4:00/)).toBeInTheDocument();
  });

  test('should call refreshToken when "Stay Logged In" is clicked', async () => {
    const token = createToken(300);
    authService.getToken = jest.fn(() => token);
    authService.refreshToken = jest.fn(() => Promise.resolve({ token: 'new-token' }));

    renderComponent();

    const stayLoggedInButton = screen.getByText(/Stay Logged In/i);

    await act(async () => {
      fireEvent.click(stayLoggedInButton);
    });

    await waitFor(() => {
      expect(authService.refreshToken).toHaveBeenCalled();
    });
  });

  test('should hide popup after successful token refresh', async () => {
    const token = createToken(300);
    authService.getToken = jest.fn(() => token);
    authService.refreshToken = jest.fn(() => Promise.resolve({ token: 'new-token' }));

    renderComponent();

    const stayLoggedInButton = screen.getByText(/Stay Logged In/i);

    await act(async () => {
      fireEvent.click(stayLoggedInButton);
    });

    await waitFor(() => {
      expect(screen.queryByText(/Session Expiring Soon/i)).not.toBeInTheDocument();
    });
  });

  test('should logout when "Logout" button is clicked', async () => {
    const token = createToken(300);
    authService.getToken = jest.fn(() => token);

    renderComponent();

    const logoutButton = screen.getByText(/Logout/i);

    await act(async () => {
      fireEvent.click(logoutButton);
    });

    expect(mockLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('should auto-logout when countdown reaches 0', () => {
    // Token expires in 2 seconds
    const token = createToken(2);
    authService.getToken = jest.fn(() => token);

    renderComponent();

    // Advance timer past expiration
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(mockLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('should show warning style when countdown is less than 60 seconds', () => {
    // Token expires in 59 seconds
    const token = createToken(59);
    authService.getToken = jest.fn(() => token);

    renderComponent();

    const countdown = screen.getByText(/0:59|0:5[0-8]/);
    expect(countdown.parentElement).toHaveClass('warning');
  });

  test('should handle refresh token error gracefully', async () => {
    const token = createToken(300);
    authService.getToken = jest.fn(() => token);
    authService.refreshToken = jest.fn(() => Promise.reject(new Error('Refresh failed')));

    // Mock alert
    global.alert = jest.fn();

    renderComponent();

    const stayLoggedInButton = screen.getByText(/Stay Logged In/i);

    await act(async () => {
      fireEvent.click(stayLoggedInButton);
    });

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith(
        expect.stringContaining('Failed to extend session')
      );
      expect(mockLogout).toHaveBeenCalled();
    });
  });

  test('should not show popup when no token exists', () => {
    authService.getToken = jest.fn(() => null);

    renderComponent();

    expect(screen.queryByText(/Session Expiring Soon/i)).not.toBeInTheDocument();
  });

  test('should disable buttons while extending session', async () => {
    const token = createToken(300);
    authService.getToken = jest.fn(() => token);
    authService.refreshToken = jest.fn(() => new Promise(() => {})); // Never resolves

    renderComponent();

    const stayLoggedInButton = screen.getByText(/Stay Logged In/i);

    await act(async () => {
      fireEvent.click(stayLoggedInButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/Extending/i)).toBeInTheDocument();
      expect(stayLoggedInButton).toBeDisabled();
      expect(screen.getByText(/Logout/i)).toBeDisabled();
    });
  });
});
