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
    age: '',
    gender: 'MALE',
    beltRank: 'WHITE',
    weight: '',
    team: 'Takedown Martial Arts',
    coachName: 'Pedro Monteiro',
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

      setFormData({
        name: athlete.name || '',
        age: athlete.age || '',
        gender: athlete.gender || 'MALE',
        beltRank: athlete.beltRank || 'WHITE',
        weight: athlete.weight || '',
        team: athlete.team || 'Takedown Martial Arts',
        coachName: athlete.coachName || 'Pedro Monteiro',
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
        age: parseInt(formData.age),
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
              <label htmlFor="age">Age *</label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleChange}
                required
                min="4"
                max="150"
                placeholder="Enter age (4-150)"
              />
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
                min="10"
                max="250"
                placeholder="Enter weight in kg"
              />
            </div>
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
              placeholder="Takedown Martial Arts"
            />
            <small className="helper-text">Default: Takedown Martial Arts</small>
          </div>

          <div className="form-group">
            <label htmlFor="coachName">Coach Name</label>
            <input
              type="text"
              id="coachName"
              name="coachName"
              value={formData.coachName}
              onChange={handleChange}
              placeholder="Pedro Monteiro"
            />
            <small className="helper-text">Default: Pedro Monteiro</small>
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
