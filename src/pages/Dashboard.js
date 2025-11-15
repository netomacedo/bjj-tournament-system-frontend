import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import athleteService from '../services/athleteService';
import tournamentService from '../services/tournamentService';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalAthletes: 0,
    totalTournaments: 0,
    upcomingTournaments: 0,
    activeTournaments: 0
  });
  const [loading, setLoading] = useState(true);
  const [upcomingTournaments, setUpcomingTournaments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [athletesRes, tournamentsRes, upcomingRes] = await Promise.all([
        athleteService.getAllAthletes(),
        tournamentService.getAllTournaments(),
        tournamentService.getUpcomingTournaments()
      ]);

      const tournaments = tournamentsRes.data;
      const activeTournaments = tournaments.filter(t => 
        t.status === 'IN_PROGRESS' || t.status === 'REGISTRATION_OPEN'
      );

      setStats({
        totalAthletes: athletesRes.data.length,
        totalTournaments: tournaments.length,
        upcomingTournaments: upcomingRes.data.length,
        activeTournaments: activeTournaments.length
      });

      setUpcomingTournaments(upcomingRes.data.slice(0, 3));
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="dashboard loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>🥋 BJJ Tournament Management Dashboard</h1>
        <p>Welcome to your tournament management system</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalAthletes}</div>
            <div className="stat-label">Total Athletes</div>
          </div>
          <button 
            className="stat-action"
            onClick={() => navigate('/athletes')}
          >
            View All →
          </button>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalTournaments}</div>
            <div className="stat-label">Total Tournaments</div>
          </div>
          <button 
            className="stat-action"
            onClick={() => navigate('/tournaments')}
          >
            View All →
          </button>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <div className="stat-value">{stats.upcomingTournaments}</div>
            <div className="stat-label">Upcoming Tournaments</div>
          </div>
          <button 
            className="stat-action"
            onClick={() => navigate('/tournaments')}
          >
            View All →
          </button>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⚡</div>
          <div className="stat-content">
            <div className="stat-value">{stats.activeTournaments}</div>
            <div className="stat-label">Active Tournaments</div>
          </div>
          <button 
            className="stat-action"
            onClick={() => navigate('/tournaments')}
          >
            View All →
          </button>
        </div>
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/athletes/register')}
          >
            + Register Athlete
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/tournaments/create')}
          >
            + Create Tournament
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => navigate('/matches')}
          >
            View Matches
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => navigate('/brackets')}
          >
            View Brackets
          </button>
        </div>
      </div>

      {upcomingTournaments.length > 0 && (
        <div className="upcoming-section">
          <h2>Upcoming Tournaments</h2>
          <div className="upcoming-list">
            {upcomingTournaments.map(tournament => (
              <div key={tournament.id} className="upcoming-item">
                <div className="upcoming-info">
                  <h3>{tournament.name}</h3>
                  <p>📅 {new Date(tournament.tournamentDate).toLocaleDateString()}</p>
                  <p>📍 {tournament.location}</p>
                </div>
                <button 
                  className="btn btn-small btn-primary"
                  onClick={() => navigate(`/tournaments/${tournament.id}`)}
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
