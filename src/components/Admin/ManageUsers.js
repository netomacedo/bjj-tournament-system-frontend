import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import './ManageUsers.css';

const ManageUsers = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Which user row has its reset-password mini-form open, and its fields
  const [resetTargetId, setResetTargetId] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSuccessId, setResetSuccessId] = useState(null);
  const [resetLoading, setResetLoading] = useState(false);

  const navigate = useNavigate();
  const isPlatformAdmin = currentUser?.role === 'ROLE_PLATFORM_ADMIN';

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await authService.getAllUsers();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError('Failed to load users. Please try again.');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const openResetForm = (userId) => {
    setResetTargetId(userId);
    setNewPassword('');
    setConfirmPassword('');
    setResetError('');
    setResetSuccessId(null);
  };

  const closeResetForm = () => {
    setResetTargetId(null);
    setNewPassword('');
    setConfirmPassword('');
    setResetError('');
  };

  const handleResetSubmit = async (e, userId) => {
    e.preventDefault();
    setResetError('');

    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setResetError('Password must be at least 6 characters');
      return;
    }

    setResetLoading(true);
    try {
      await authService.resetUserPassword(userId, newPassword);
      setResetTargetId(null);
      setNewPassword('');
      setConfirmPassword('');
      setResetSuccessId(userId);
    } catch (err) {
      setResetError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setResetLoading(false);
    }
  };

  const formatRole = (role) => {
    switch (role) {
      case 'ROLE_PLATFORM_ADMIN': return 'Platform Admin';
      case 'ROLE_ADMIN': return 'Admin';
      case 'ROLE_USER': return 'User';
      default: return role;
    }
  };

  if (loading) {
    return (
      <div className="manage-users">
        <div className="loading">Loading users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="manage-users">
        <div className="error">{error}</div>
        <button onClick={fetchUsers} className="btn btn-primary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="manage-users">
      <div className="list-header">
        <h2>Manage Users</h2>
        <button className="btn btn-primary" onClick={() => navigate('/admin/users/new')}>
          + Add User
        </button>
      </div>

      {users.length === 0 ? (
        <div className="no-data">
          <p>No users found.</p>
        </div>
      ) : (
        <div className="users-table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                {isPlatformAdmin && <th>Org ID</th>}
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <React.Fragment key={u.id}>
                  <tr>
                    <td>{u.fullName}</td>
                    <td>{u.username}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`role-badge role-${u.role?.replace('ROLE_', '').toLowerCase()}`}>
                        {formatRole(u.role)}
                      </span>
                    </td>
                    {isPlatformAdmin && <td>{u.organizationId ?? '—'}</td>}
                    <td>
                      <span className={u.enabled ? 'status-enabled' : 'status-disabled'}>
                        {u.enabled ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td>
                      {resetSuccessId === u.id ? (
                        <span className="reset-success">✅ Password reset</span>
                      ) : (
                        <button
                          className="btn btn-small btn-secondary"
                          onClick={() => openResetForm(u.id)}
                          disabled={resetTargetId === u.id}
                        >
                          Reset Password
                        </button>
                      )}
                    </td>
                  </tr>
                  {resetTargetId === u.id && (
                    <tr className="reset-row">
                      <td colSpan={isPlatformAdmin ? 7 : 6}>
                        <form className="reset-form" onSubmit={(e) => handleResetSubmit(e, u.id)}>
                          {resetError && <div className="reset-error">{resetError}</div>}
                          <input
                            type="password"
                            placeholder="New password (min 6 chars)"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            minLength={6}
                            required
                            disabled={resetLoading}
                            autoComplete="new-password"
                          />
                          <input
                            type="password"
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            disabled={resetLoading}
                            autoComplete="new-password"
                          />
                          <button type="submit" className="btn btn-small btn-primary" disabled={resetLoading}>
                            {resetLoading ? 'Resetting...' : 'Confirm'}
                          </button>
                          <button
                            type="button"
                            className="btn btn-small btn-secondary"
                            onClick={closeResetForm}
                            disabled={resetLoading}
                          >
                            Cancel
                          </button>
                        </form>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
