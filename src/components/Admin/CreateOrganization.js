import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import '../Auth/Login.css';

const CreateOrganization = () => {
  const [formData, setFormData] = useState({
    organizationName: '',
    adminFullName: '',
    adminUsername: '',
    adminEmail: '',
    adminPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.adminPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.adminPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...orgData } = formData;
      const created = await authService.createOrganization(orgData);
      setSuccess(
        `Organization "${created.organizationName}" created, with "${created.adminUsername}" as its admin.`
      );
      setFormData({
        organizationName: '',
        adminFullName: '',
        adminUsername: '',
        adminEmail: '',
        adminPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create organization. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>🥋 BJJ Tournament System</h1>
          <h2>Create Organization</h2>
        </div>

        {error && (
          <div className="alert alert-error">
            <span className="alert-icon">⚠️</span>
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <span className="alert-icon">✅</span>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="organizationName">Organization Name *</label>
            <input
              type="text"
              id="organizationName"
              name="organizationName"
              value={formData.organizationName}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="Gracie Barra Downtown"
              minLength={2}
              maxLength={200}
              autoComplete="off"
            />
          </div>

          <hr style={{ margin: '1.5rem 0', border: 'none', borderTop: '1px solid #e0e0e0' }} />
          <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1rem' }}>
            Their first admin account:
          </p>

          <div className="form-group">
            <label htmlFor="adminFullName">Admin Full Name *</label>
            <input
              type="text"
              id="adminFullName"
              name="adminFullName"
              value={formData.adminFullName}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="John Doe"
              autoComplete="off"
            />
          </div>

          <div className="form-group">
            <label htmlFor="adminUsername">Admin Username *</label>
            <input
              type="text"
              id="adminUsername"
              name="adminUsername"
              value={formData.adminUsername}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="johndoe"
              minLength={3}
              maxLength={50}
              autoComplete="off"
            />
          </div>

          <div className="form-group">
            <label htmlFor="adminEmail">Admin Email *</label>
            <input
              type="email"
              id="adminEmail"
              name="adminEmail"
              value={formData.adminEmail}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="john@example.com"
              autoComplete="off"
            />
          </div>

          <div className="form-group">
            <label htmlFor="adminPassword">Temporary Password *</label>
            <input
              type="password"
              id="adminPassword"
              name="adminPassword"
              value={formData.adminPassword}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="At least 6 characters"
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password *</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="Re-enter the password"
              autoComplete="new-password"
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary btn-block">
            {loading ? 'Creating Organization...' : 'Create Organization'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            <button type="button" className="btn-link" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateOrganization;
