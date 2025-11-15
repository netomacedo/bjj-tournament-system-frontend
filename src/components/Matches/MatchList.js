import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import matchService from '../../services/matchService';
import divisionService from '../../services/divisionService';
import ConfirmationModal from '../Divisions/ConfirmationModal';
import './MatchList.css';

const MatchList = () => {
  const [matches, setMatches] = useState([]);
  const [division, setDivision] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalConfig, setModalConfig] = useState({ isOpen: false });
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const divisionId = searchParams.get('divisionId');

  useEffect(() => {
    if (divisionId) {
      fetchData();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [divisionId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [matchesResponse, divisionResponse] = await Promise.all([
        matchService.getMatchesByDivision(divisionId),
        divisionService.getDivisionById(divisionId)
      ]);
      setMatches(matchesResponse.data || []);
      setDivision(divisionResponse.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching matches:', err);
      setError(err.response?.data?.message || 'Failed to load matches');
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStartMatch = async (match) => {
    setModalConfig({
      isOpen: true,
      title: 'Start Match',
      message: `Start Match #${match.matchNumber}?\n${match.athlete1Name} vs ${match.athlete2Name}`,
      confirmText: 'Start Match',
      type: 'primary',
      onConfirm: async () => {
        try {
          await matchService.startMatch(match.id);
          setModalConfig({
            isOpen: true,
            title: 'Success!',
            message: 'Match started successfully!',
            confirmText: 'OK',
            type: 'success',
            onConfirm: () => fetchData()
          });
        } catch (err) {
          setModalConfig({
            isOpen: true,
            title: 'Error',
            message: `Failed to start match: ${err.response?.data?.message || err.message}`,
            confirmText: 'OK',
            type: 'danger',
            onConfirm: () => {}
          });
        }
      }
    });
  };

  const getMatchStatus = (match) => {
    if (match.completed) return 'completed';
    if (match.inProgress) return 'in-progress';
    return 'pending';
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed': return '✓ Completed';
      case 'in-progress': return '⚔️ In Progress';
      case 'pending': return '⏳ Pending';
      default: return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="match-list-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading matches...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="match-list-container">
        <div className="error-state">
          <span className="error-icon">⚠️</span>
          <h3>Error Loading Matches</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => fetchData()}>
            <span className="btn-icon">🔄</span>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!divisionId) {
    return (
      <div className="match-list-container">
        <div className="no-data">
          <span className="empty-icon">⚔️</span>
          <h4>No Division Selected</h4>
          <p>Select a division to view its matches</p>
          <button className="btn btn-primary btn-large" onClick={() => navigate('/tournaments')}>
            <span className="btn-icon">🏆</span>
            View Tournaments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="match-list-container">
      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        type={modalConfig.type}
      />

      <div className="match-list-header">
        <div className="header-info">
          <h2>
            <span className="header-icon">⚔️</span>
            Matches
          </h2>
          {division && (
            <div className="division-info">
              <h3>{division.name}</h3>
              <div className="division-badges">
                <span className="badge">{division.beltRank}</span>
                <span className="badge">{division.ageCategory}</span>
                <span className="badge">{division.gender}</span>
                {division.weightClass && <span className="badge">{division.weightClass}</span>}
              </div>
            </div>
          )}
        </div>
        <button
          className="btn btn-secondary"
          onClick={() => navigate(-1)}
        >
          <span className="btn-icon">←</span>
          Back
        </button>
      </div>

      {matches.length === 0 ? (
        <div className="no-data">
          <span className="empty-icon">⚔️</span>
          <h4>No Matches Yet</h4>
          <p>Matches haven't been generated for this division yet.</p>
          <p className="help-text">
            Go back to the division manager and use "Auto Generate" or "Manual Creation" to create matches.
          </p>
        </div>
      ) : (
        <div className="matches-grid">
          {matches.map((match) => {
            const status = getMatchStatus(match);
            return (
              <div key={match.id} className={`match-card ${status}`}>
                <div className="match-header">
                  <span className="match-number">
                    <span className="match-icon">⚔️</span>
                    Match #{match.matchNumber}
                  </span>
                  <span className={`match-status ${status}`}>
                    {getStatusLabel(status)}
                  </span>
                </div>

                <div className="match-info">
                  {match.roundNumber && (
                    <span className="info-badge">
                      <span className="info-icon">🔄</span>
                      Round {match.roundNumber}
                    </span>
                  )}
                  {match.matNumber && (
                    <span className="info-badge">
                      <span className="info-icon">🥋</span>
                      Mat {match.matNumber}
                    </span>
                  )}
                </div>

                <div className="match-athletes">
                  <div className={`athlete-section ${match.winnerId === match.athlete1Id ? 'winner' : ''}`}>
                    <div className="athlete-name">
                      {match.winnerId === match.athlete1Id && <span className="winner-badge">👑</span>}
                      <span>{match.athlete1Name || 'Athlete 1'}</span>
                    </div>
                    {match.athlete1Team && <div className="athlete-team">{match.athlete1Team}</div>}
                    {status === 'completed' && (
                      <div className="athlete-score">{match.athlete1Score || 0} pts</div>
                    )}
                  </div>

                  <div className="vs-divider">VS</div>

                  <div className={`athlete-section ${match.winnerId === match.athlete2Id ? 'winner' : ''}`}>
                    <div className="athlete-name">
                      {match.winnerId === match.athlete2Id && <span className="winner-badge">👑</span>}
                      <span>{match.athlete2Name || 'Athlete 2'}</span>
                    </div>
                    {match.athlete2Team && <div className="athlete-team">{match.athlete2Team}</div>}
                    {status === 'completed' && (
                      <div className="athlete-score">{match.athlete2Score || 0} pts</div>
                    )}
                  </div>
                </div>

                {match.submissionType && (
                  <div className="match-result">
                    <span className="result-icon">🎯</span>
                    Submission: {match.submissionType}
                  </div>
                )}

                <div className="match-actions">
                  {status === 'pending' && (
                    <button
                      className="btn btn-small btn-primary"
                      onClick={() => handleStartMatch(match)}
                    >
                      <span className="btn-icon">▶️</span>
                      Start Match
                    </button>
                  )}
                  {status === 'in-progress' && (
                    <button
                      className="btn btn-small btn-success"
                      onClick={() => navigate(`/matches/${match.id}/score`)}
                    >
                      <span className="btn-icon">📊</span>
                      Score Match
                    </button>
                  )}
                  {status === 'completed' && (
                    <button
                      className="btn btn-small btn-secondary"
                      onClick={() => navigate(`/matches/${match.id}`)}
                    >
                      <span className="btn-icon">👁️</span>
                      View Details
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MatchList;
