import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import tournamentService from '../services/tournamentService';
import matchService from '../services/matchService';
import './Dashboard.css';

const Dashboard = () => {
  const [activeTournament, setActiveTournament] = useState(null);
  const [matchStats, setMatchStats] = useState({ inProgress: 0, pending: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchTodayActivity();
  }, []);

  const fetchTodayActivity = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get tournaments happening today
      const tournamentsRes = await tournamentService.getAllTournaments();
      const tournaments = tournamentsRes.data || [];

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Find tournament with today's date and started status
      const todayTournament = tournaments.find(t => {
        const tournamentDate = new Date(t.tournamentDate);
        tournamentDate.setHours(0, 0, 0, 0);
        return tournamentDate.getTime() === today.getTime() && t.started;
      });

      if (todayTournament) {
        setActiveTournament(todayTournament);

        // Get match statistics for active tournament
        try {
          const matchesRes = await matchService.getAllMatches();
          const matches = matchesRes.data || [];

          const inProgress = matches.filter(m => m.status === 'IN_PROGRESS').length;
          const pending = matches.filter(m => m.status === 'PENDING').length;
          const completed = matches.filter(m => m.status === 'COMPLETED').length;

          setMatchStats({ inProgress, pending, completed });
        } catch (err) {
          console.error('Error fetching match stats:', err);
          // Don't fail the whole dashboard if matches fail
        }
      }
    } catch (err) {
      console.error('Error fetching today activity:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Show welcome message even while loading or if there's an error
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>🥋 BJJ Tournament System</h1>
        <p>Welcome back, {user?.fullName || user?.username}!</p>
      </div>

      {loading && (
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
        </div>
      )}

      {!loading && activeTournament ? (
        <div className="active-tournament-section">
          <div className="section-header">
            <span className="live-indicator">🔴</span>
            <h2>ACTIVE NOW</h2>
          </div>

          <div className="tournament-card active">
            <div className="tournament-header">
              <h3>🏆 {activeTournament.name}</h3>
              <span className="tournament-date">
                📅 Today • {activeTournament.location}
              </span>
            </div>

            <div className="match-stats">
              <div className="stat-item in-progress">
                <div className="stat-number">{matchStats.inProgress}</div>
                <div className="stat-label">In Progress</div>
              </div>
              <div className="stat-item pending">
                <div className="stat-number">{matchStats.pending}</div>
                <div className="stat-label">Pending</div>
              </div>
              <div className="stat-item completed">
                <div className="stat-number">{matchStats.completed}</div>
                <div className="stat-label">Completed</div>
              </div>
            </div>

            <div className="tournament-actions">
              <button
                className="btn btn-primary"
                onClick={() => navigate('/matches')}
              >
                📊 View Matches
              </button>
              <button
                className="btn btn-success"
                onClick={() => navigate('/brackets')}
              >
                🎯 View Brackets
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => navigate(`/tournaments/${activeTournament.id}`)}
              >
                ℹ️ Tournament Details
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Dashboard;
