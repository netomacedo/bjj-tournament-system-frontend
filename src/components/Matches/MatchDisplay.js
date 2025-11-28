import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import matchService from '../../services/matchService';
import divisionService from '../../services/divisionService';
import { getMatchDuration } from '../../constants/matchTimes';
import './MatchDisplay.css';

const MatchDisplay = () => {
  const { id } = useParams();
  const [match, setMatch] = useState(null);
  const [division, setDivision] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Countdown timer state
  const [countdownTime, setCountdownTime] = useState(null);
  const [isCountdownRunning, setIsCountdownRunning] = useState(false);
  const [countdownDuration, setCountdownDuration] = useState(null);

  useEffect(() => {
    fetchMatch();
    const interval = setInterval(() => {
      fetchMatch();
    }, 2000); // Poll every 2 seconds for live updates
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Countdown timer effect
  useEffect(() => {
    if (!isCountdownRunning) return;

    const countdown = setInterval(() => {
      setCountdownTime((prevTime) => {
        if (prevTime <= 0) {
          setIsCountdownRunning(false);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, [isCountdownRunning]);

  const handleStartCountdown = () => {
    if (countdownTime === null || countdownTime === 0) {
      // Reset to full duration
      setCountdownTime(countdownDuration);
    }
    setIsCountdownRunning(true);
  };

  const handlePauseCountdown = () => {
    setIsCountdownRunning(false);
  };

  const handleResetCountdown = () => {
    setIsCountdownRunning(false);
    setCountdownTime(countdownDuration);
  };

  const fetchMatch = async () => {
    try {
      const response = await matchService.getMatchById(id);
      const matchData = response.data;
      setMatch(matchData);

      // Fetch division info ONLY on first load to get match duration
      if (matchData.divisionId && !division && countdownDuration === null) {
        try {
          const divisionResponse = await divisionService.getDivisionById(matchData.divisionId);
          const divisionData = divisionResponse.data;
          setDivision(divisionData);

          // Set countdown duration based on division
          const duration = getMatchDuration(divisionData);
          setCountdownDuration(duration);
          setCountdownTime(duration);
        } catch (divErr) {
          console.error('Error fetching division:', divErr);
          // Set default duration if division fetch fails
          setCountdownDuration(5 * 60); // 5 minutes default
          setCountdownTime(5 * 60);
        }
      }

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

      {/* IBJJF Countdown Timer */}
      {countdownTime !== null && (
        <div className="countdown-timer-section">
          <div className={`display-timer countdown ${countdownTime <= 30 ? 'warning' : ''} ${countdownTime === 0 ? 'expired' : ''}`}>
            <div className="timer-label">⏱️ IBJJF Match Time</div>
            <div className="timer-value countdown-value">
              {formatTime(countdownTime)}
            </div>
            <div className="timer-controls">
              {!isCountdownRunning ? (
                <button className="timer-btn start-btn" onClick={handleStartCountdown}>
                  ▶️ Start
                </button>
              ) : (
                <button className="timer-btn pause-btn" onClick={handlePauseCountdown}>
                  ⏸️ Pause
                </button>
              )}
              <button className="timer-btn reset-btn" onClick={handleResetCountdown}>
                🔄 Reset
              </button>
            </div>
          </div>
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
        <div className="refresh-indicator">● Auto-refreshing every 2 seconds</div>
      </div>
    </div>
  );
};

export default MatchDisplay;
