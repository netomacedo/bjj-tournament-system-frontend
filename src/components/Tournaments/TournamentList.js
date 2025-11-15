import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import tournamentService from '../../services/tournamentService';
import { TOURNAMENT_STATUS } from '../../constants';
import './TournamentList.css';

const TournamentList = () => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('ALL'); // ALL, UPCOMING, COMPLETED
  const navigate = useNavigate();

  useEffect(() => {
    fetchTournaments();
  }, [filter]);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      let response;
      
      if (filter === 'UPCOMING') {
        response = await tournamentService.getUpcomingTournaments();
      } else {
        response = await tournamentService.getAllTournaments();
      }
      
      let data = response.data;
      
      if (filter === 'COMPLETED') {
        data = data.filter(t => t.status === 'COMPLETED');
      }
      
      setTournaments(data);
      setError(null);
    } catch (err) {
      setError('Failed to load tournaments. Please try again.');
      console.error('Error fetching tournaments:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const statusObj = TOURNAMENT_STATUS.find(s => s.value === status);
    return statusObj ? statusObj.color : '#808080';
  };

  const getStatusLabel = (status) => {
    const statusObj = TOURNAMENT_STATUS.find(s => s.value === status);
    return statusObj ? statusObj.label : status;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleStartTournament = async (id) => {
    if (window.confirm('Are you sure you want to start this tournament?')) {
      try {
        await tournamentService.startTournament(id);
        fetchTournaments();
      } catch (err) {
        alert('Failed to start tournament');
        console.error('Error starting tournament:', err);
      }
    }
  };

  const handleCloseRegistration = async (id) => {
    if (window.confirm('Are you sure you want to close registration?')) {
      try {
        await tournamentService.closeRegistration(id);
        fetchTournaments();
      } catch (err) {
        alert('Failed to close registration');
        console.error('Error closing registration:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="tournament-list">
        <div className="loading">Loading tournaments...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tournament-list">
        <div className="error">{error}</div>
        <button onClick={fetchTournaments} className="btn btn-primary">Retry</button>
      </div>
    );
  }

  return (
    <div className="tournament-list">
      <div className="list-header">
        <h2>Tournaments</h2>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/tournaments/create')}
        >
          + Create New Tournament
        </button>
      </div>

      <div className="filter-tabs">
        <button 
          className={`tab ${filter === 'ALL' ? 'active' : ''}`}
          onClick={() => setFilter('ALL')}
        >
          All Tournaments
        </button>
        <button 
          className={`tab ${filter === 'UPCOMING' ? 'active' : ''}`}
          onClick={() => setFilter('UPCOMING')}
        >
          Upcoming
        </button>
        <button 
          className={`tab ${filter === 'COMPLETED' ? 'active' : ''}`}
          onClick={() => setFilter('COMPLETED')}
        >
          Completed
        </button>
      </div>

      {tournaments.length === 0 ? (
        <div className="no-data">
          <p>No tournaments found. Create your first tournament!</p>
        </div>
      ) : (
        <div className="tournament-grid">
          {tournaments.map(tournament => (
            <div key={tournament.id} className="tournament-card">
              <div 
                className="status-bar"
                style={{ backgroundColor: getStatusColor(tournament.status) }}
              >
                <span className="status-label">{getStatusLabel(tournament.status)}</span>
              </div>
              
              <div className="tournament-content">
                <h3>{tournament.name}</h3>
                
                {tournament.description && (
                  <p className="description">{tournament.description}</p>
                )}
                
                <div className="tournament-details">
                  <div className="detail-item">
                    <span className="icon">📅</span>
                    <span>{formatDate(tournament.tournamentDate)}</span>
                  </div>
                  
                  {tournament.location && (
                    <div className="detail-item">
                      <span className="icon">📍</span>
                      <span>{tournament.location}</span>
                    </div>
                  )}
                  
                  {tournament.organizer && (
                    <div className="detail-item">
                      <span className="icon">👤</span>
                      <span>{tournament.organizer}</span>
                    </div>
                  )}
                  
                  <div className="detail-item">
                    <span className="icon">📝</span>
                    <span>Registration: {formatDate(tournament.registrationDeadline)}</span>
                  </div>
                </div>

                <div className="tournament-actions">
                  <button 
                    className="btn btn-small btn-secondary"
                    onClick={() => navigate(`/tournaments/${tournament.id}`)}
                  >
                    View Details
                  </button>
                  
                  {tournament.status === 'REGISTRATION_OPEN' && (
                    <>
                      <button 
                        className="btn btn-small btn-warning"
                        onClick={() => handleCloseRegistration(tournament.id)}
                      >
                        Close Registration
                      </button>
                    </>
                  )}
                  
                  {tournament.status === 'REGISTRATION_CLOSED' && (
                    <button 
                      className="btn btn-small btn-primary"
                      onClick={() => handleStartTournament(tournament.id)}
                    >
                      Start Tournament
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TournamentList;
