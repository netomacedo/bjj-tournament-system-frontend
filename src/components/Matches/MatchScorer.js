import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import matchService from '../../services/matchService';
import divisionService from '../../services/divisionService';
import { POINT_VALUES, SUBMISSION_TYPES } from '../../constants';
import { getMatchDuration } from '../../constants/matchTimes';
import ConfirmationModal from '../Divisions/ConfirmationModal';
import './MatchScorer.css';

const MatchScorer = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [match, setMatch] = useState(null);
  const [division, setDivision] = useState(null);
  const [athlete1Points, setAthlete1Points] = useState(0);
  const [athlete2Points, setAthlete2Points] = useState(0);
  const [athlete1Advantages, setAthlete1Advantages] = useState(0);
  const [athlete2Advantages, setAthlete2Advantages] = useState(0);
  const [athlete1Penalties, setAthlete1Penalties] = useState(0);
  const [athlete2Penalties, setAthlete2Penalties] = useState(0);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [submissionWinner, setSubmissionWinner] = useState(null);
  const [submissionType, setSubmissionType] = useState('');
  const [modalConfig, setModalConfig] = useState({ isOpen: false });
  const [loading, setLoading] = useState(true);

  // IBJJF Timer state
  const [matchTime, setMatchTime] = useState(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerDuration, setTimerDuration] = useState(null);

  // Timer sync key for localStorage (same as Display)
  const timerKey = `match_${id}_timer`;

  useEffect(() => {
    fetchMatch();
    loadTimerState(); // Load timer state on mount
  }, [id]);

  // Listen for timer changes from other tabs (Display)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === timerKey) {
        loadTimerState();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [timerKey]);

  // Load timer state from localStorage
  const loadTimerState = () => {
    try {
      const stored = localStorage.getItem(timerKey);
      if (stored) {
        const timerState = JSON.parse(stored);
        setMatchTime(timerState.time);
        setIsTimerRunning(timerState.isRunning);
      }
    } catch (err) {
      console.error('Error loading timer state:', err);
    }
  };

  // Save timer state to localStorage
  const saveTimerState = (time, isRunning) => {
    try {
      localStorage.setItem(timerKey, JSON.stringify({
        time,
        isRunning,
        lastUpdate: Date.now()
      }));
    } catch (err) {
      console.error('Error saving timer state:', err);
    }
  };

  // Timer countdown effect
  useEffect(() => {
    if (!isTimerRunning) return;

    const timer = setInterval(() => {
      setMatchTime((prevTime) => {
        if (prevTime <= 0) {
          setIsTimerRunning(false);
          saveTimerState(0, false);
          return 0;
        }
        const newTime = prevTime - 1;
        saveTimerState(newTime, true);
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimerRunning]);

  const fetchMatch = async () => {
    try {
      const response = await matchService.getMatchById(id);
      const matchData = response.data;
      setMatch(matchData);
      setAthlete1Points(matchData.athlete1Points || 0);
      setAthlete2Points(matchData.athlete2Points || 0);
      setAthlete1Advantages(matchData.athlete1Advantages || 0);
      setAthlete2Advantages(matchData.athlete2Advantages || 0);
      setAthlete1Penalties(matchData.athlete1Penalties || 0);
      setAthlete2Penalties(matchData.athlete2Penalties || 0);

      // Fetch division info to set timer duration
      if (matchData.divisionId && !division && timerDuration === null) {
        try {
          const divisionResponse = await divisionService.getDivisionById(matchData.divisionId);
          const divisionData = divisionResponse.data;
          setDivision(divisionData);

          // Set timer duration based on IBJJF rules
          const duration = getMatchDuration(divisionData);
          setTimerDuration(duration);

          // Only set initial time if no timer state exists in localStorage
          const stored = localStorage.getItem(timerKey);
          if (!stored) {
            setMatchTime(duration);
            saveTimerState(duration, false);
          }
        } catch (divErr) {
          console.error('Error fetching division:', divErr);
          // Set default duration if division fetch fails
          const defaultDuration = 5 * 60;
          setTimerDuration(defaultDuration);

          const stored = localStorage.getItem(timerKey);
          if (!stored) {
            setMatchTime(defaultDuration);
            saveTimerState(defaultDuration, false);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching match:', err);
    } finally {
      setLoading(false);
    }
  };

  // Timer control functions
  const startTimer = () => {
    const time = (matchTime === null || matchTime === 0) ? timerDuration : matchTime;
    setMatchTime(time);
    setIsTimerRunning(true);
    saveTimerState(time, true);
  };

  const pauseTimer = () => {
    setIsTimerRunning(false);
    saveTimerState(matchTime, false);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setMatchTime(timerDuration);
    saveTimerState(timerDuration, false);
  };

  const formatTime = (seconds) => {
    if (seconds === null) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const autoSaveScore = async (updates) => {
    try {
      await matchService.updateMatch(id, updates);
      console.log('Auto-saved score:', updates);
    } catch (err) {
      console.error('Auto-save failed:', err);
      setModalConfig({
        isOpen: true,
        title: 'Auto-save Error',
        message: 'Failed to auto-save score: ' + (err.response?.data?.message || err.message),
        confirmText: 'OK',
        type: 'warning',
        onConfirm: () => setModalConfig({ isOpen: false })
      });
    }
  };

  const addPoints = (athlete, pointType) => {
    const points = POINT_VALUES[pointType];
    if (athlete === 1) {
      const newPoints = athlete1Points + points;
      setAthlete1Points(newPoints);
      autoSaveScore({
        athlete1Points: newPoints,
        athlete2Points,
        athlete1Advantages,
        athlete2Advantages,
        athlete1Penalties,
        athlete2Penalties
      });
    } else {
      const newPoints = athlete2Points + points;
      setAthlete2Points(newPoints);
      autoSaveScore({
        athlete1Points,
        athlete2Points: newPoints,
        athlete1Advantages,
        athlete2Advantages,
        athlete1Penalties,
        athlete2Penalties
      });
    }
  };

  const addAdvantage = (athlete) => {
    if (athlete === 1) {
      const newAdvantages = athlete1Advantages + 1;
      setAthlete1Advantages(newAdvantages);
      autoSaveScore({
        athlete1Points,
        athlete2Points,
        athlete1Advantages: newAdvantages,
        athlete2Advantages,
        athlete1Penalties,
        athlete2Penalties
      });
    } else {
      const newAdvantages = athlete2Advantages + 1;
      setAthlete2Advantages(newAdvantages);
      autoSaveScore({
        athlete1Points,
        athlete2Points,
        athlete1Advantages,
        athlete2Advantages: newAdvantages,
        athlete1Penalties,
        athlete2Penalties
      });
    }
  };

  const addPenalty = (athlete) => {
    if (athlete === 1) {
      const newPenalties = athlete1Penalties + 1;
      setAthlete1Penalties(newPenalties);
      autoSaveScore({
        athlete1Points,
        athlete2Points,
        athlete1Advantages,
        athlete2Advantages,
        athlete1Penalties: newPenalties,
        athlete2Penalties
      });
    } else {
      const newPenalties = athlete2Penalties + 1;
      setAthlete2Penalties(newPenalties);
      autoSaveScore({
        athlete1Points,
        athlete2Points,
        athlete1Advantages,
        athlete2Advantages,
        athlete1Penalties,
        athlete2Penalties: newPenalties
      });
    }
  };

  const saveScore = async () => {
    try {
      await matchService.updateMatch(id, {
        athlete1Points,
        athlete2Points,
        athlete1Advantages,
        athlete2Advantages,
        athlete1Penalties,
        athlete2Penalties
      });
      setModalConfig({
        isOpen: true,
        title: 'Success!',
        message: 'Score saved successfully',
        confirmText: 'OK',
        type: 'success',
        onConfirm: () => setModalConfig({ isOpen: false })
      });
    } catch (err) {
      setModalConfig({
        isOpen: true,
        title: 'Error',
        message: 'Failed to save score: ' + (err.response?.data?.message || err.message),
        confirmText: 'OK',
        type: 'danger',
        onConfirm: () => setModalConfig({ isOpen: false })
      });
    }
  };

  const handleSubmission = (athleteNumber) => {
    setSubmissionWinner(athleteNumber);
    setShowSubmissionModal(true);
  };

  const recordSubmission = async () => {
    if (!submissionType) {
      setModalConfig({
        isOpen: true,
        title: 'Validation Error',
        message: 'Please select a submission type',
        confirmText: 'OK',
        type: 'warning',
        onConfirm: () => setModalConfig({ isOpen: false })
      });
      return;
    }

    try {
      const winnerId = submissionWinner === 1 ? match.athlete1Id : match.athlete2Id;

      await matchService.recordSubmission(id, {
        winnerId,
        submissionType
      });

      setShowSubmissionModal(false);
      setModalConfig({
        isOpen: true,
        title: 'Success!',
        message: 'Submission recorded! Match completed.',
        confirmText: 'OK',
        type: 'success',
        onConfirm: () => navigate('/matches?divisionId=' + match.divisionId)
      });
    } catch (err) {
      setShowSubmissionModal(false);
      setModalConfig({
        isOpen: true,
        title: 'Error',
        message: 'Failed to record submission: ' + (err.response?.data?.message || err.message),
        confirmText: 'OK',
        type: 'danger',
        onConfirm: () => setModalConfig({ isOpen: false })
      });
    }
  };

  const completeMatch = async () => {
    // Determine winner based on points, advantages, and penalties
    let winnerId;
    let winnerName;

    if (athlete1Points > athlete2Points) {
      winnerId = match.athlete1Id;
      winnerName = match.athlete1Name;
    } else if (athlete2Points > athlete1Points) {
      winnerId = match.athlete2Id;
      winnerName = match.athlete2Name;
    } else if (athlete1Advantages > athlete2Advantages) {
      winnerId = match.athlete1Id;
      winnerName = match.athlete1Name;
    } else if (athlete2Advantages > athlete1Advantages) {
      winnerId = match.athlete2Id;
      winnerName = match.athlete2Name;
    } else if (athlete1Penalties < athlete2Penalties) {
      winnerId = match.athlete1Id;
      winnerName = match.athlete1Name;
    } else if (athlete2Penalties < athlete1Penalties) {
      winnerId = match.athlete2Id;
      winnerName = match.athlete2Name;
    } else {
      setModalConfig({
        isOpen: true,
        title: 'Match Tied',
        message: 'Match is tied! Please add advantages or determine winner by referee decision.',
        confirmText: 'OK',
        type: 'warning',
        onConfirm: () => setModalConfig({ isOpen: false })
      });
      return;
    }

    try {
      // First save the final scores
      await matchService.updateMatch(id, {
        athlete1Points,
        athlete2Points,
        athlete1Advantages,
        athlete2Advantages,
        athlete1Penalties,
        athlete2Penalties
      });

      // Then complete the match
      console.log('Completing match with winnerId:', winnerId);
      console.log('Winner details:', { winnerId, winnerName, athlete1Id: match.athlete1Id, athlete2Id: match.athlete2Id });
      await matchService.completeMatch(id, winnerId);

      setModalConfig({
        isOpen: true,
        title: 'Match Completed!',
        message: `Winner: ${winnerName}\nFinal Score: ${athlete1Points} - ${athlete2Points}`,
        confirmText: 'OK',
        type: 'success',
        onConfirm: () => navigate('/matches?divisionId=' + match.divisionId)
      });
    } catch (err) {
      console.error('Complete match error:', err);
      console.error('Error response:', err.response);
      console.error('Error data:', err.response?.data);

      let errorMessage = 'Failed to complete match: ';
      if (err.response?.status === 403) {
        errorMessage += 'Permission denied. This is likely a backend authorization issue. Check that the user has permission to complete matches.';
      } else {
        errorMessage += (err.response?.data?.message || err.message);
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
  };

  const handleRestartMatch = () => {
    setModalConfig({
      isOpen: true,
      title: 'Restart Match',
      message: 'Reset this match?\n\nThis will clear all scores and reset the match to pending status.',
      confirmText: 'Restart Match',
      type: 'warning',
      onConfirm: async () => {
        try {
          await matchService.resetMatch(id);
          setModalConfig({
            isOpen: true,
            title: 'Success!',
            message: 'Match has been reset successfully!',
            confirmText: 'OK',
            type: 'success',
            onConfirm: () => navigate('/matches?divisionId=' + match.divisionId)
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

  if (loading) return <div className="loading">Loading match...</div>;
  if (!match) return <div className="error">Match not found</div>;

  // Check if match is completed
  const isCompleted = match.status && match.status.toUpperCase() === 'COMPLETED';

  return (
    <div className="match-scorer">
      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ isOpen: false })}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        type={modalConfig.type}
      />

      <div className="scorer-header">
        <h2>Match Scorer {isCompleted && <span style={{ color: '#2e7d32' }}>✓ Completed</span>}</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className="btn btn-success"
            onClick={() => window.open(`/display/${match.id}`, '_blank')}
            title="Open display view in new window for big screen"
          >
            📺 Open Display
          </button>
          {isCompleted && (
            <button className="btn btn-warning" onClick={handleRestartMatch}>
              🔄 Restart Match
            </button>
          )}
          <button className="btn btn-secondary" onClick={() => navigate(`/matches?divisionId=${match.divisionId}`)}>
            Back
          </button>
        </div>
      </div>

      {/* IBJJF Match Timer */}
      {matchTime !== null && !isCompleted && (
        <div className="match-timer-section">
          <div className={`match-timer ${matchTime <= 30 ? 'warning' : ''} ${matchTime === 0 ? 'expired' : ''}`}>
            <div className="timer-label">⏱️ IBJJF Match Time</div>
            <div className="timer-display">{formatTime(matchTime)}</div>
            <div className="timer-info">
              {division && (
                <small>
                  {division.beltRank && `${division.beltRank} Belt`}
                  {division.ageCategory && ` • ${division.ageCategory}`}
                  {` • ${formatTime(timerDuration)} match`}
                </small>
              )}
            </div>
            <div className="timer-controls">
              {!isTimerRunning ? (
                <button className="btn btn-primary btn-small" onClick={startTimer}>
                  ▶️ Start
                </button>
              ) : (
                <button className="btn btn-warning btn-small" onClick={pauseTimer}>
                  ⏸️ Pause
                </button>
              )}
              <button className="btn btn-secondary btn-small" onClick={resetTimer}>
                🔄 Reset
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="scoreboard">
        <div className="athlete-score">
          <h3>{match.athlete1Name || 'Athlete 1'}</h3>
          <div className="score-display">
            <div className="points">{athlete1Points}</div>
            <div className="advantages">Advantages: {athlete1Advantages}</div>
            <div className="penalties">Penalties: {athlete1Penalties}</div>
          </div>
          <div className="score-controls">
            <button className="btn btn-small btn-primary" onClick={() => addPoints(1, 'TAKEDOWN')}>
              Takedown (+2)
            </button>
            <button className="btn btn-small btn-primary" onClick={() => addPoints(1, 'SWEEP')}>
              Sweep (+2)
            </button>
            <button className="btn btn-small btn-primary" onClick={() => addPoints(1, 'GUARD_PASS')}>
              Guard Pass (+3)
            </button>
            <button className="btn btn-small btn-primary" onClick={() => addPoints(1, 'MOUNT')}>
              Mount (+4)
            </button>
            <button className="btn btn-small btn-primary" onClick={() => addPoints(1, 'BACK_CONTROL')}>
              Back Control (+4)
            </button>
            <button className="btn btn-small btn-secondary" onClick={() => addAdvantage(1)}>
              Advantage (+1)
            </button>
            <button className="btn btn-small btn-warning" onClick={() => addPenalty(1)}>
              Penalty
            </button>
            <button className="btn btn-small btn-danger" onClick={() => handleSubmission(1)}>
              🎯 Submission Win
            </button>
          </div>
        </div>

        <div className="vs-divider">VS</div>

        <div className="athlete-score">
          <h3>{match.athlete2Name || 'Athlete 2'}</h3>
          <div className="score-display">
            <div className="points">{athlete2Points}</div>
            <div className="advantages">Advantages: {athlete2Advantages}</div>
            <div className="penalties">Penalties: {athlete2Penalties}</div>
          </div>
          <div className="score-controls">
            <button className="btn btn-small btn-primary" onClick={() => addPoints(2, 'TAKEDOWN')}>
              Takedown (+2)
            </button>
            <button className="btn btn-small btn-primary" onClick={() => addPoints(2, 'SWEEP')}>
              Sweep (+2)
            </button>
            <button className="btn btn-small btn-primary" onClick={() => addPoints(2, 'GUARD_PASS')}>
              Guard Pass (+3)
            </button>
            <button className="btn btn-small btn-primary" onClick={() => addPoints(2, 'MOUNT')}>
              Mount (+4)
            </button>
            <button className="btn btn-small btn-primary" onClick={() => addPoints(2, 'BACK_CONTROL')}>
              Back Control (+4)
            </button>
            <button className="btn btn-small btn-secondary" onClick={() => addAdvantage(2)}>
              Advantage (+1)
            </button>
            <button className="btn btn-small btn-warning" onClick={() => addPenalty(2)}>
              Penalty
            </button>
            <button className="btn btn-small btn-danger" onClick={() => handleSubmission(2)}>
              🎯 Submission Win
            </button>
          </div>
        </div>
      </div>

      {!isCompleted && (
        <div className="scorer-actions">
          <button className="btn btn-primary" onClick={saveScore}>
            💾 Save Score
          </button>
          <button className="btn btn-success btn-large" onClick={completeMatch}>
            ✓ Complete Match (By Points)
          </button>
        </div>
      )}

      {isCompleted && (
        <div className="scorer-actions">
          <div style={{
            padding: '1rem',
            background: '#c8e6c9',
            borderRadius: '8px',
            textAlign: 'center',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            color: '#2e7d32'
          }}>
            ✓ Match Completed - Winner: {match.winnerId === match.athlete1Id ? match.athlete1Name : match.athlete2Name}
          </div>
        </div>
      )}

      {showSubmissionModal && (
        <div className="modal-overlay" onClick={() => setShowSubmissionModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Record Submission</h3>
            <p>Select submission type for {submissionWinner === 1 ? match.athlete1Name : match.athlete2Name}:</p>

            <div className="submission-types">
              {SUBMISSION_TYPES.map((type) => (
                <button
                  key={type}
                  className={`btn btn-small ${submissionType === type ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setSubmissionType(type)}
                >
                  {type.replace(/_/g, ' ')}
                </button>
              ))}
            </div>

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowSubmissionModal(false)}>
                Cancel
              </button>
              <button className="btn btn-success" onClick={recordSubmission}>
                Record Submission
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchScorer;
