import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import tournamentService from '../../services/tournamentService';
import DivisionManager from '../Divisions/DivisionManager';
import './TournamentDetail.css';

const TournamentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTournament();
  }, [id]);

  const fetchTournament = async () => {
    try {
      const response = await tournamentService.getTournamentById(id);
      setTournament(response.data);
    } catch (err) {
      console.error('Error fetching tournament:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading tournament details...</div>;
  if (!tournament) return <div className="error">Tournament not found</div>;

  return (
    <div className="tournament-detail-container">
      <div className="detail-header">
        <h2>{tournament.name}</h2>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => navigate(`/tournaments/edit/${id}`)}>
            Edit Tournament
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/tournaments')}>
            Back to List
          </button>
        </div>
      </div>

      <div className="detail-content">
        <div className="info-sections">
          <div className="info-section">
            <h3>Tournament Information</h3>
            <div className="info-row">
              <span className="label">Description:</span>
              <span className="value">{tournament.description || 'N/A'}</span>
            </div>
            <div className="info-row">
              <span className="label">Location:</span>
              <span className="value">{tournament.location}</span>
            </div>
            <div className="info-row">
              <span className="label">Registration:</span>
              <span className="value">{tournament.registrationOpen ? 'Open' : 'Closed'}</span>
            </div>
          </div>

          <div className="info-section">
            <h3>Schedule</h3>
            <div className="info-row">
              <span className="label">Tournament Date:</span>
              <span className="value">{new Date(tournament.tournamentDate).toLocaleDateString()}</span>
            </div>
            <div className="info-row">
              <span className="label">Registration Deadline:</span>
              <span className="value">{new Date(tournament.registrationDeadline).toLocaleDateString()}</span>
            </div>
            <div className="info-row">
              <span className="label">Started:</span>
              <span className="value">{tournament.started ? 'Yes' : 'No'}</span>
            </div>
            <div className="info-row">
              <span className="label">Completed:</span>
              <span className="value">{tournament.completed ? 'Yes' : 'No'}</span>
            </div>
          </div>

          <div className="info-section">
            <h3>Organizer</h3>
            <div className="info-row">
              <span className="label">Organizer:</span>
              <span className="value">{tournament.organizer || 'N/A'}</span>
            </div>
            <div className="info-row">
              <span className="label">Email:</span>
              <span className="value">{tournament.contactEmail || 'N/A'}</span>
            </div>
            {tournament.rules && (
              <div className="info-row rules">
                <span className="label">Rules:</span>
                <span className="value">{tournament.rules}</span>
              </div>
            )}
          </div>
        </div>

        <div className="divisions-section">
          <DivisionManager tournamentId={id} />
        </div>
      </div>
    </div>
  );
};

export default TournamentDetail;
