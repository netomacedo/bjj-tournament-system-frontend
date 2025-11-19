# Authentication Implementation Guide

This document explains the authentication system implemented in the BJJ Tournament Management System.

## Overview

The application now includes a complete authentication system with:
- User registration
- User login
- Protected routes
- JWT token management
- Automatic logout on token expiration
- User display in header with logout functionality

## Files Created

### 1. Auth Service (`src/services/authService.js`)
Handles all authentication API calls:
- `register(userData)` - Register new user
- `login(username, password)` - Login user
- `logout()` - Logout user and clear tokens
- `getCurrentUser()` - Get logged-in user info
- `getToken()` - Get JWT token
- `isAuthenticated()` - Check if user is logged in

### 2. Auth Context (`src/context/AuthContext.js`)
React context for managing authentication state across the app:
- Provides `user`, `login`, `register`, `logout`, `isAuthenticated`, `loading`
- Automatically checks for existing session on app load
- Wraps entire application

### 3. Login Component (`src/components/Auth/Login.js`)
Beautiful login page with:
- Username and password fields
- Error handling with user-friendly messages
- Loading states
- Link to registration page
- Gradient background design

### 4. Register Component (`src/components/Auth/Register.js`)
Registration page with:
- Full name, username, email, password fields
- Password confirmation with validation
- Minimum password length (6 characters)
- Error handling
- Link to login page

### 5. Protected Route Component (`src/components/Auth/ProtectedRoute.js`)
Wrapper for routes that require authentication:
- Redirects to login if not authenticated
- Shows loading state while checking auth
- Protects all dashboard and app routes

### 6. Styling (`src/components/Auth/Login.css`)
Shared styles for Login and Register pages:
- Modern gradient background
- Clean card-based layout
- Responsive design
- Error alert styling
- Mobile-friendly

## Updated Files

### 1. App.js
- Wrapped with `AuthProvider`
- Added public routes: `/login`, `/register`
- Protected all existing routes
- Redirects `/` to `/dashboard`

### 2. Header.js
- Added user display (name or username)
- Added logout button
- Uses `useAuth` hook for user info
- Logout redirects to login page

### 3. Header.css
- Added `.user-menu` styles
- Added `.user-name` styles
- Added `.btn-logout` styles
- Responsive design for mobile

### 4. api.js (Already existed - no changes needed)
- Already had JWT token interceptor
- Already handled 401 errors with redirect to login

## User Flow

### First Time User
1. Visit app → Redirected to `/login`
2. Click "Register here" → `/register`
3. Fill form and submit
4. Automatically logged in → Redirected to `/dashboard`
5. JWT token stored in localStorage
6. User info stored in localStorage

### Returning User
1. Visit app
2. AuthContext checks localStorage for token
3. If token exists → Redirected to `/dashboard`
4. If no token → Redirected to `/login`

### Logout
1. Click "Logout" button in header
2. Token and user info removed from localStorage
3. Redirected to `/login`
4. All protected routes now inaccessible

## Backend Requirements

The backend must implement these endpoints:

### POST `/api/auth/register`
**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "fullName": "John Doe"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "username": "johndoe",
  "email": "john@example.com",
  "fullName": "John Doe",
  "id": 1
}
```

### POST `/api/auth/login`
**Request Body:**
```json
{
  "username": "johndoe",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "username": "johndoe",
  "email": "john@example.com",
  "fullName": "John Doe",
  "id": 1
}
```

### All Protected Endpoints
Must accept JWT token in header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Return 401 if token is invalid or expired.

## Security Features

1. **JWT Token Storage**: Tokens stored in localStorage (consider httpOnly cookies for production)
2. **Automatic Token Injection**: All API requests automatically include JWT token
3. **401 Handling**: Invalid/expired tokens trigger automatic logout
4. **Protected Routes**: Unauthorized users redirected to login
5. **Password Validation**: Minimum 6 characters, confirmation required

## Testing the Authentication

### Manual Testing

1. **Start the app:**
   ```bash
   npm start
   ```

2. **Test Registration:**
   - Navigate to http://localhost:3000
   - Should redirect to login page
   - Click "Register here"
   - Fill out the form
   - Submit → Should redirect to dashboard

3. **Test Logout:**
   - Click "Logout" in header
   - Should redirect to login page
   - Try accessing `/dashboard` → Should redirect to login

4. **Test Login:**
   - Enter credentials on login page
   - Submit → Should redirect to dashboard
   - Refresh page → Should stay logged in

5. **Test Token Expiration:**
   - Open DevTools → Application → Local Storage
   - Delete `token` key
   - Try navigating → Should redirect to login

### Unit Testing

Create tests for:
- `authService.js` methods
- `AuthContext` provider
- `Login` component user interactions
- `Register` component validation
- `ProtectedRoute` redirect logic

## Environment Variables

Make sure `.env` has:
```env
REACT_APP_API_URL=http://localhost:8080/api
```

## Common Issues & Solutions

### Issue: "Login failed. Please check your credentials"
- **Cause**: Backend not running or wrong credentials
- **Solution**: Ensure backend is running on port 8080

### Issue: Redirected to login after successful login
- **Cause**: Backend not returning token in response
- **Solution**: Check backend response format matches expected format

### Issue: 401 errors on API calls
- **Cause**: Token not being sent or expired
- **Solution**: Check browser DevTools → Network → Request Headers

### Issue: User info not displaying in header
- **Cause**: Backend not returning `fullName` or `username`
- **Solution**: Check user object structure from backend

## Future Enhancements

1. **Remember Me**: Add checkbox to persist login longer
2. **Password Reset**: Add forgot password flow
3. **Email Verification**: Verify email before allowing login
4. **2FA**: Add two-factor authentication
5. **Role-Based Access**: Different permissions for roles (Admin, Coach, Referee)
6. **Session Timeout Warning**: Warn user before token expires
7. **Refresh Tokens**: Implement refresh token flow
8. **OAuth**: Add Google/Facebook login options

## Code Examples

### Using Auth in Components

```javascript
import { useAuth } from '../../context/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>Please login</div>;
  }

  return (
    <div>
      <h1>Welcome {user.fullName}!</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Making Authenticated API Calls

All existing service calls already work with authentication because `api.js` automatically adds the token:

```javascript
import athleteService from '../services/athleteService';

// This automatically includes JWT token
const athletes = await athleteService.getAllAthletes();
```

## Summary

The authentication system is now fully integrated into the BJJ Tournament Management System. Users must login to access any functionality, providing security and user tracking capabilities. The system is ready for backend integration once the auth endpoints are implemented.

**Next Steps:**
1. Implement backend auth endpoints
2. Test full authentication flow
3. Add unit tests for auth components
4. Consider implementing refresh tokens
5. Add role-based access control if needed
