import { render, screen } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../../components/Auth/ProtectedRoute';
import { AuthProvider } from '../../context/AuthContext';
import authService from '../../services/authService';

jest.mock('../../services/authService');

const TestComponent = () => <div>Protected Content</div>;
const LoginComponent = () => <div>Login Page</div>;

const renderProtectedRoute = (isAuthenticated = false) => {
  authService.getCurrentUser.mockReturnValue(
    isAuthenticated ? { username: 'testuser' } : null
  );

  return render(
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginComponent />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <TestComponent />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('ProtectedRoute Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('When user is authenticated', () => {
    test('should render protected content', async () => {
      renderProtectedRoute(true);

      // Wait for loading to complete
      await screen.findByText('Protected Content');

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
      expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
    });
  });

  describe('When user is not authenticated', () => {
    test('should redirect to login page', async () => {
      renderProtectedRoute(false);

      // Wait for redirect
      await screen.findByText('Login Page');

      expect(screen.getByText('Login Page')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });

  describe('Loading state', () => {
    test('should show loading indicator while checking authentication', () => {
      authService.getCurrentUser.mockReturnValue(null);

      const { container } = render(
        <BrowserRouter>
          <AuthProvider>
            <ProtectedRoute>
              <TestComponent />
            </ProtectedRoute>
          </AuthProvider>
        </BrowserRouter>
      );

      // Initially should show loading
      expect(container.textContent).toContain('Loading');
    });
  });

  describe('Nested children', () => {
    test('should render complex nested children when authenticated', async () => {
      const ComplexComponent = () => (
        <div>
          <h1>Header</h1>
          <main>
            <p>Main Content</p>
          </main>
          <footer>Footer</footer>
        </div>
      );

      authService.getCurrentUser.mockReturnValue({ username: 'testuser' });

      render(
        <BrowserRouter>
          <AuthProvider>
            <ProtectedRoute>
              <ComplexComponent />
            </ProtectedRoute>
          </AuthProvider>
        </BrowserRouter>
      );

      await screen.findByText('Header');

      expect(screen.getByText('Header')).toBeInTheDocument();
      expect(screen.getByText('Main Content')).toBeInTheDocument();
      expect(screen.getByText('Footer')).toBeInTheDocument();
    });
  });
});
