import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import tournamentService from '../../services/tournamentService';

const TournamentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    tournamentDate: '',
    registrationDeadline: '',
    organizer: '',
    contactEmail: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isEditMode) {
      fetchTournament();
    }
  }, [id]);

  const fetchTournament = async () => {
    try {
      const response = await tournamentService.getTournamentById(id);
      const tournament = response.data;
      setFormData({
        name: tournament.name || '',
        description: tournament.description || '',
        location: tournament.location || '',
        tournamentDate: tournament.tournamentDate?.split('T')[0] || '',
        registrationDeadline: tournament.registrationDeadline?.split('T')[0] || '',
        organizer: tournament.organizer || '',
        contactEmail: tournament.contactEmail || '',
      });
    } catch (err) {
      setError('Failed to load tournament');
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditMode) {
        await tournamentService.updateTournament(id, formData);
      } else {
        await tournamentService.createTournament(formData);
      }
      navigate('/tournaments');
    } catch (err) {
      setError('Failed to save tournament');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="athlete-form-container">
      <div className="form-header">
        <h2>{isEditMode ? 'Edit Tournament' : 'Create Tournament'}</h2>
        <button className="btn btn-secondary" onClick={() => navigate('/tournaments')}>
          Back
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="athlete-form">
        <div className="form-section">
          <h3>Tournament Information</h3>
          
          <div className="form-group">
            <label>Tournament Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
              placeholder="Summer BJJ Championship 2025"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Tournament description..."
              rows={4}
              style={{resize: 'vertical', fontFamily: 'inherit', fontSize: '1rem', padding: '0.75rem', borderRadius: '5px', border: '2px solid #ddd'}}
            />
          </div>

          <div className="form-group">
            <label>Location *</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              required
              placeholder="Sports Arena, City Center"
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Schedule</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label>Tournament Date *</label>
              <input
                type="date"
                value={formData.tournamentDate}
                onChange={(e) => setFormData({...formData, tournamentDate: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>Registration Deadline *</label>
              <input
                type="date"
                value={formData.registrationDeadline}
                onChange={(e) => setFormData({...formData, registrationDeadline: e.target.value})}
                required
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Organizer Information</h3>
          
          <div className="form-group">
            <label>Organizer Name *</label>
            <input
              type="text"
              value={formData.organizer}
              onChange={(e) => setFormData({...formData, organizer: e.target.value})}
              required
              placeholder="BJJ Federation"
            />
          </div>

          <div className="form-group">
            <label>Contact Email *</label>
            <input
              type="email"
              value={formData.contactEmail}
              onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
              required
              placeholder="contact@tournament.com"
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/tournaments')}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : (isEditMode ? 'Update' : 'Create')} Tournament
          </button>
        </div>
      </form>
    </div>
  );
};

export default TournamentForm;
