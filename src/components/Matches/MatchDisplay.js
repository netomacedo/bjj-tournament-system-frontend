import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import matchService from '../../services/matchService';
import './MatchDisplay.css';

const MatchDisplay = () => {
  const { id } = useParams();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    fetchMatch();
    const interval = setInterval(() => {
      fetchMatch();
    }, 3000); // Poll every 3 seconds for live updates
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    // Timer to calculate elapsed time since match start
    const timerInterval = setInterval(() => {
      if (match?.startTime && match?.status?.toUpperCase() === 'IN_PROGRESS') {
        const startTime = new Date(match.startTime).getTime();
        const now = new Date().getTime();
        const elapsed = Math.floor((now - startTime) / 1000); // seconds
        setElapsedTime(elapsed);
      }
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [match]);

  const fetchMatch = async () => {
    try {
      const response = await matchService.getMatchById(id);
      setMatch(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching match:', err);
      setError('Failed to load match data');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getMatchStatus = () => {
    if (!match?.status) return 'PENDING';
    return match.status.toUpperCase();
  };

  if (loading) {
    return (
      <div className="display-container">
        <div className="display-loading">
          <div className="display-spinner"></div>
          <p>Loading Match...</p>
        </div>
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="display-container">
        <div className="display-error">
          <h1>⚠️</h1>
          <p>{error || 'Match not found'}</p>
        </div>
      </div>
    );
  }

  const status = getMatchStatus();
  const isInProgress = status === 'IN_PROGRESS';
  const isCompleted = status === 'COMPLETED';

  return (
    <div className={`display-container ${status.toLowerCase()}`}>
      {/* Header with Division Info */}
      <div className="display-header">
        <div className="division-name">{match.divisionName || 'Division'}</div>
        <div className="match-number-display">Match #{match.matchNumber || match.id}</div>
        {match.matNumber && <div className="mat-number">Mat {match.matNumber}</div>}
      </div>

      {/* Match Status Banner */}
      <div className={`status-banner ${status.toLowerCase()}`}>
        {isInProgress && '⚔️ IN PROGRESS'}
        {isCompleted && '✓ COMPLETED'}
        {status === 'PENDING' && '⏳ PENDING'}
      </div>

      {/* Timer (only show when in progress) */}
      {isInProgress && (
        <div className="display-timer">
          <div className="timer-label">Fight Time</div>
          <div className="timer-value">{formatTime(elapsedTime)}</div>
        </div>
      )}

      {/* Scoreboard */}
      <div className="display-scoreboard">
        {/* Athlete 1 - Red Corner */}
        <div className={`display-athlete athlete-red ${match.winnerId === match.athlete1Id ? 'winner' : ''}`}>
          <div className="athlete-header">
            {match.winnerId === match.athlete1Id && <span className="winner-crown">👑</span>}
            <div className="athlete-name-display">{match.athlete1Name || 'Athlete 1'}</div>
            {match.athlete1Team && <div className="athlete-team-display">{match.athlete1Team}</div>}
          </div>

          <div className="score-section">
            <div className="main-score">
              <div className="score-label">POINTS</div>
              <div className="score-value">{match.athlete1Points || 0}</div>
            </div>

            <div className="secondary-scores">
              <div className="score-item">
                <div className="score-label-small">Advantages</div>
                <div className="score-value-small">{match.athlete1Advantages || 0}</div>
              </div>
              <div className="score-item">
                <div className="score-label-small">Penalties</div>
                <div className="score-value-small penalties">{match.athlete1Penalties || 0}</div>
              </div>
            </div>
          </div>
        </div>

        {/* VS Divider */}
        <div className="display-vs">VS</div>

        {/* Athlete 2 - Blue Corner */}
        <div className={`display-athlete athlete-blue ${match.winnerId === match.athlete2Id ? 'winner' : ''}`}>
          <div className="athlete-header">
            {match.winnerId === match.athlete2Id && <span className="winner-crown">👑</span>}
            <div className="athlete-name-display">{match.athlete2Name || 'Athlete 2'}</div>
            {match.athlete2Team && <div className="athlete-team-display">{match.athlete2Team}</div>}
          </div>

          <div className="score-section">
            <div className="main-score">
              <div className="score-label">POINTS</div>
              <div className="score-value">{match.athlete2Points || 0}</div>
            </div>

            <div className="secondary-scores">
              <div className="score-item">
                <div className="score-label-small">Advantages</div>
                <div className="score-value-small">{match.athlete2Advantages || 0}</div>
              </div>
              <div className="score-item">
                <div className="score-label-small">Penalties</div>
                <div className="score-value-small penalties">{match.athlete2Penalties || 0}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submission Result (if applicable) */}
      {match.submissionType && (
        <div className="submission-banner">
          <span className="submission-icon">🎯</span>
          SUBMISSION: {match.submissionType}
        </div>
      )}

      {/* Footer with auto-refresh indicator */}
      <div className="display-footer">
        <div className="refresh-indicator">● Auto-refreshing every 3 seconds</div>
      </div>
    </div>
  );
};

export default MatchDisplay;
