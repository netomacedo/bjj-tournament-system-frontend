import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Register from '../../components/Auth/Register';
import { AuthProvider } from '../../context/AuthContext';
import authService from '../../services/authService';

jest.mock('../../services/authService');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const renderRegister = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <Register />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Register Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authService.getCurrentUser.mockReturnValue(null);
  });

  describe('Rendering', () => {
    test('should render registration form', () => {
      renderRegister();

      expect(screen.getByText(/bjj tournament system/i)).toBeInTheDocument();
      expect(screen.getByText(/create your account/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^username/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password \*/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
    });

    test('should render link to login page', () => {
      renderRegister();

      const loginLink = screen.getByText(/login here/i);
      expect(loginLink).toBeInTheDocument();
      expect(loginLink.closest('a')).toHaveAttribute('href', '/login');
    });
  });

  describe('Form Validation', () => {
    test('should require all fields', () => {
      renderRegister();

      expect(screen.getByLabelText(/full name/i)).toBeRequired();
      expect(screen.getByLabelText(/^username/i)).toBeRequired();
      expect(screen.getByLabelText(/^email/i)).toBeRequired();
      expect(screen.getByLabelText(/^password \*/i)).toBeRequired();
      expect(screen.getByLabelText(/confirm password/i)).toBeRequired();
    });

    test('should enforce minimum username length', () => {
      renderRegister();

      const usernameInput = screen.getByLabelText(/^username/i);
      expect(usernameInput).toHaveAttribute('minLength', '3');
      expect(usernameInput).toHaveAttribute('maxLength', '50');
    });

    test('should enforce minimum password length', () => {
      renderRegister();

      const passwordInput = screen.getByLabelText(/^password \*/i);
      expect(passwordInput).toHaveAttribute('minLength', '6');
    });

    test('should validate email format', () => {
      renderRegister();

      const emailInput = screen.getByLabelText(/^email/i);
      expect(emailInput).toHaveAttribute('type', 'email');
    });
  });

  describe('User Interactions', () => {
    test('should update form fields on change', () => {
      renderRegister();

      const fullNameInput = screen.getByLabelText(/full name/i);
      const usernameInput = screen.getByLabelText(/^username/i);
      const emailInput = screen.getByLabelText(/^email/i);
      const passwordInput = screen.getByLabelText(/^password \*/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

      fireEvent.change(fullNameInput, { target: { value: 'Test User' } });
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });

      expect(fullNameInput.value).toBe('Test User');
      expect(usernameInput.value).toBe('testuser');
      expect(emailInput.value).toBe('test@example.com');
      expect(passwordInput.value).toBe('password123');
      expect(confirmPasswordInput.value).toBe('password123');
    });
  });

  describe('Password Validation', () => {
    test('should show error when passwords do not match', async () => {
      renderRegister();

      const fullNameInput = screen.getByLabelText(/full name/i);
      const usernameInput = screen.getByLabelText(/^username/i);
      const emailInput = screen.getByLabelText(/^email/i);
      const passwordInput = screen.getByLabelText(/^password \*/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /register/i });

      fireEvent.change(fullNameInput, { target: { value: 'Test User' } });
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'different' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      });

      expect(authService.register).not.toHaveBeenCalled();
    });

    test('should show error when password is too short', async () => {
      renderRegister();

      const fullNameInput = screen.getByLabelText(/full name/i);
      const usernameInput = screen.getByLabelText(/^username/i);
      const emailInput = screen.getByLabelText(/^email/i);
      const passwordInput = screen.getByLabelText(/^password \*/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /register/i });

      fireEvent.change(fullNameInput, { target: { value: 'Test User' } });
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'abc' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'abc' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
      });

      expect(authService.register).not.toHaveBeenCalled();
    });
  });

  describe('Registration Functionality', () => {
    test('should call register service when form is submitted with valid data', async () => {
      authService.register.mockResolvedValue({
        token: 'mock-token',
        username: 'testuser',
      });

      renderRegister();

      const fullNameInput = screen.getByLabelText(/full name/i);
      const usernameInput = screen.getByLabelText(/^username/i);
      const emailInput = screen.getByLabelText(/^email/i);
      const passwordInput = screen.getByLabelText(/^password \*/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /register/i });

      fireEvent.change(fullNameInput, { target: { value: 'Test User' } });
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(authService.register).toHaveBeenCalledWith({
          fullName: 'Test User',
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
        });
      });
    });

    test('should not include confirmPassword in registration data', async () => {
      authService.register.mockResolvedValue({
        token: 'mock-token',
        username: 'testuser',
      });

      renderRegister();

      const fullNameInput = screen.getByLabelText(/full name/i);
      const usernameInput = screen.getByLabelText(/^username/i);
      const emailInput = screen.getByLabelText(/^email/i);
      const passwordInput = screen.getByLabelText(/^password \*/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /register/i });

      fireEvent.change(fullNameInput, { target: { value: 'Test User' } });
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        const callArg = authService.register.mock.calls[0][0];
        expect(callArg).not.toHaveProperty('confirmPassword');
      });
    });

    test('should navigate to dashboard on successful registration', async () => {
      authService.register.mockResolvedValue({
        token: 'mock-token',
        username: 'testuser',
      });

      renderRegister();

      const fullNameInput = screen.getByLabelText(/full name/i);
      const usernameInput = screen.getByLabelText(/^username/i);
      const emailInput = screen.getByLabelText(/^email/i);
      const passwordInput = screen.getByLabelText(/^password \*/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /register/i });

      fireEvent.change(fullNameInput, { target: { value: 'Test User' } });
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });

    test('should display error message on registration failure', async () => {
      const errorMessage = 'Username already exists';
      authService.register.mockRejectedValue({
        response: { data: { message: errorMessage } },
      });

      renderRegister();

      const fullNameInput = screen.getByLabelText(/full name/i);
      const usernameInput = screen.getByLabelText(/^username/i);
      const emailInput = screen.getByLabelText(/^email/i);
      const passwordInput = screen.getByLabelText(/^password \*/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /register/i });

      fireEvent.change(fullNameInput, { target: { value: 'Test User' } });
      fireEvent.change(usernameInput, { target: { value: 'existinguser' } });
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });
  });

  describe('Loading State', () => {
    test('should show loading text when submitting', async () => {
      authService.register.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      renderRegister();

      const fullNameInput = screen.getByLabelText(/full name/i);
      const usernameInput = screen.getByLabelText(/^username/i);
      const emailInput = screen.getByLabelText(/^email/i);
      const passwordInput = screen.getByLabelText(/^password \*/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /register/i });

      fireEvent.change(fullNameInput, { target: { value: 'Test User' } });
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      expect(screen.getByText(/creating account/i)).toBeInTheDocument();
    });

    test('should disable form fields while loading', async () => {
      authService.register.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      renderRegister();

      const fullNameInput = screen.getByLabelText(/full name/i);
      const usernameInput = screen.getByLabelText(/^username/i);
      const emailInput = screen.getByLabelText(/^email/i);
      const passwordInput = screen.getByLabelText(/^password \*/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /register/i });

      fireEvent.change(fullNameInput, { target: { value: 'Test User' } });
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      expect(fullNameInput).toBeDisabled();
      expect(usernameInput).toBeDisabled();
      expect(emailInput).toBeDisabled();
      expect(passwordInput).toBeDisabled();
      expect(confirmPasswordInput).toBeDisabled();
      expect(submitButton).toBeDisabled();
    });
  });
});
