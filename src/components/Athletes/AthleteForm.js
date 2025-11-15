import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import athleteService from '../../services/athleteService';
import { BELT_RANKS, GENDER_OPTIONS } from '../../constants';
import './AthleteForm.css';

const AthleteForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: '',
    gender: 'MALE',
    beltRank: 'WHITE',
    weight: '',
    team: '',
    coachName: '',
    email: '',
    phone: '',
    experienceNotes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isEditMode) {
      fetchAthlete();
    }
  }, [id]);

  const fetchAthlete = async () => {
    try {
      setLoading(true);
      const response = await athleteService.getAthleteById(id);
      const athlete = response.data;
      
      // Format date for input field
      const formattedDate = athlete.dateOfBirth ? 
        new Date(athlete.dateOfBirth).toISOString().split('T')[0] : '';
      
      setFormData({
        name: athlete.name || '',
        dateOfBirth: formattedDate,
        gender: athlete.gender || 'MALE',
        beltRank: athlete.beltRank || 'WHITE',
        weight: athlete.weight || '',
        team: athlete.team || '',
        coachName: athlete.coachName || '',
        email: athlete.email || '',
        phone: athlete.phone || '',
        experienceNotes: athlete.experienceNotes || '',
      });
    } catch (err) {
      setError('Failed to load athlete data');
      console.error('Error fetching athlete:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        weight: parseFloat(formData.weight)
      };

      if (isEditMode) {
        await athleteService.updateAthlete(id, payload);
      } else {
        await athleteService.registerAthlete(payload);
      }

      navigate('/athletes');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save athlete');
      console.error('Error saving athlete:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = () => {
    if (!formData.dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(formData.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="athlete-form-container">
      <div className="form-header">
        <h2>{isEditMode ? 'Edit Athlete' : 'Register New Athlete'}</h2>
        <button 
          className="btn btn-secondary"
          onClick={() => navigate('/athletes')}
        >
          Back to List
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="athlete-form">
        <div className="form-section">
          <h3>Personal Information</h3>
          
          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter athlete's full name"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="dateOfBirth">Date of Birth *</label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                required
              />
              {calculateAge() !== null && (
                <small className="helper-text">Age: {calculateAge()} years old</small>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="gender">Gender *</label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
              >
                {GENDER_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Competition Information</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="beltRank">Belt Rank *</label>
              <select
                id="beltRank"
                name="beltRank"
                value={formData.beltRank}
                onChange={handleChange}
                required
              >
                {BELT_RANKS.map(belt => (
                  <option key={belt.value} value={belt.value}>
                    {belt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="weight">Weight (kg) *</label>
              <input
                type="number"
                id="weight"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                required
                step="0.1"
                min="0"
                placeholder="Enter weight in kg"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="experienceNotes">Experience Notes</label>
            <textarea
              id="experienceNotes"
              name="experienceNotes"
              value={formData.experienceNotes}
              onChange={handleChange}
              rows="3"
              maxLength="500"
              placeholder="Optional notes about experience, competition history, or special considerations for fair match creation (max 500 characters)"
            />
            <small className="helper-text">
              {formData.experienceNotes.length}/500 characters
            </small>
          </div>
        </div>

        <div className="form-section">
          <h3>Team & Coach</h3>
          
          <div className="form-group">
            <label htmlFor="team">Team/Academy</label>
            <input
              type="text"
              id="team"
              name="team"
              value={formData.team}
              onChange={handleChange}
              placeholder="Enter team or academy name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="coachName">Coach Name</label>
            <input
              type="text"
              id="coachName"
              name="coachName"
              value={formData.coachName}
              onChange={handleChange}
              placeholder="Enter coach's name"
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Contact Information</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="athlete@example.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1234567890"
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={() => navigate('/athletes')}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : (isEditMode ? 'Update Athlete' : 'Register Athlete')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AthleteForm;
