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
      const matchData = matchesResponse.data || [];

      // Debug logging - check match properties
      if (matchData.length > 0) {
        console.log('Sample match object:', matchData[0]);
        console.log('Match properties:', Object.keys(matchData[0]));
      }

      setMatches(matchData);
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
    const matchNumber = match.matchNumber || match.id || 'N/A';
    setModalConfig({
      isOpen: true,
      title: 'Start Match',
      message: `Start Match #${matchNumber}?\n${match.athlete1Name} vs ${match.athlete2Name}`,
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
            onConfirm: () => {
              setModalConfig({ isOpen: false });
              fetchData();
            }
          });
        } catch (err) {
          console.error('Start match error:', err);
          console.error('Error response:', err.response);
          console.error('Error response data:', err.response?.data);
          console.error('Token in localStorage:', localStorage.getItem('token'));

          let errorMessage = 'Failed to start match';

          if (err.response?.status === 400) {
            const backendMessage = err.response?.data?.message || err.response?.data?.error || 'Invalid request';
            errorMessage = `Bad Request: ${backendMessage}`;
          } else if (err.response?.status === 403) {
            const backendMessage = err.response?.data?.message || err.response?.data?.error || '';
            errorMessage = `Permission denied: ${backendMessage}\n\nThis is likely a backend configuration issue. The endpoint may require specific roles or permissions.`;
          } else if (err.response?.data?.message) {
            errorMessage = err.response.data.message;
          } else if (err.message) {
            errorMessage = err.message;
          }

          setModalConfig({
            isOpen: true,
            title: 'Error',
            message: errorMessage,
            confirmText: 'OK',
            type: 'danger',
            onConfirm: () => setModalConfig({ isOpen: false })
          });
        }
      }
    });
  };

  const handleRestartMatch = async (match) => {
    const matchNumber = match.matchNumber || match.id || 'N/A';
    setModalConfig({
      isOpen: true,
      title: 'Restart Match',
      message: `Reset Match #${matchNumber}?\n${match.athlete1Name} vs ${match.athlete2Name}\n\nThis will clear all scores and reset the match to pending status.`,
      confirmText: 'Restart Match',
      type: 'warning',
      onConfirm: async () => {
        try {
          await matchService.resetMatch(match.id);
          setModalConfig({
            isOpen: true,
            title: 'Success!',
            message: 'Match has been reset successfully!',
            confirmText: 'OK',
            type: 'success',
            onConfirm: () => {
              setModalConfig({ isOpen: false });
              fetchData();
            }
          });
        } catch (err) {
          console.error('Reset match error:', err);

          let errorMessage = 'Failed to reset match';
          if (err.response?.status === 403) {
            errorMessage = 'Permission denied. You may not have permission to reset matches.';
          } else if (err.response?.data?.message) {
            errorMessage = err.response.data.message;
          } else if (err.message) {
            errorMessage = err.message;
          }

          setModalConfig({
            isOpen: true,
            title: 'Error',
            message: errorMessage,
            confirmText: 'OK',
            type: 'danger',
            onConfirm: () => setModalConfig({ isOpen: false })
          });
        }
      }
    });
  };

  const getMatchStatus = (match) => {
    // Backend uses status property with uppercase values: PENDING, IN_PROGRESS, COMPLETED
    if (match.status) {
      const status = match.status.toUpperCase();
      if (status === 'COMPLETED') return 'completed';
      if (status === 'IN_PROGRESS') return 'in-progress';
      if (status === 'PENDING') return 'pending';
    }

    // Fallback to checking boolean properties (for backwards compatibility)
    if (match.completed) return 'completed';
    if (match.inProgress || match.in_progress || match.started || match.startTime) return 'in-progress';
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
            const matchNumber = match.matchNumber || match.id || 'N/A';
            return (
              <div key={match.id} className={`match-card ${status}`}>
                <div className="match-header">
                  <span className="match-number">
                    <span className="match-icon">⚔️</span>
                    Match #{matchNumber}
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
                      <div className="athlete-score">
                        <div className="score-points">{match.athlete1Points || 0} pts</div>
                        {(match.athlete1Advantages > 0 || match.athlete1Penalties > 0) && (
                          <div className="score-details">
                            {match.athlete1Advantages > 0 && <span>Adv: {match.athlete1Advantages}</span>}
                            {match.athlete1Penalties > 0 && <span>Pen: {match.athlete1Penalties}</span>}
                          </div>
                        )}
                      </div>
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
                      <div className="athlete-score">
                        <div className="score-points">{match.athlete2Points || 0} pts</div>
                        {(match.athlete2Advantages > 0 || match.athlete2Penalties > 0) && (
                          <div className="score-details">
                            {match.athlete2Advantages > 0 && <span>Adv: {match.athlete2Advantages}</span>}
                            {match.athlete2Penalties > 0 && <span>Pen: {match.athlete2Penalties}</span>}
                          </div>
                        )}
                      </div>
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
                    <>
                      <button
                        className="btn btn-small btn-secondary"
                        onClick={() => navigate(`/matches/${match.id}/score`)}
                      >
                        <span className="btn-icon">👁️</span>
                        View Details
                      </button>
                      <button
                        className="btn btn-small btn-warning"
                        onClick={() => handleRestartMatch(match)}
                      >
                        <span className="btn-icon">🔄</span>
                        Restart Match
                      </button>
                    </>
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
