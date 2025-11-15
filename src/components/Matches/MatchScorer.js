import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import matchService from '../../services/matchService';
import { POINT_VALUES, SUBMISSION_TYPES } from '../../constants';
import './MatchScorer.css';

const MatchScorer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [match, setMatch] = useState(null);
  const [athlete1Points, setAthlete1Points] = useState(0);
  const [athlete2Points, setAthlete2Points] = useState(0);
  const [athlete1Advantages, setAthlete1Advantages] = useState(0);
  const [athlete2Advantages, setAthlete2Advantages] = useState(0);
  const [athlete1Penalties, setAthlete1Penalties] = useState(0);
  const [athlete2Penalties, setAthlete2Penalties] = useState(0);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [submissionWinner, setSubmissionWinner] = useState(null);
  const [submissionType, setSubmissionType] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatch();
  }, [id]);

  const fetchMatch = async () => {
    try {
      const response = await matchService.getMatchById(id);
      const matchData = response.data;
      setMatch(matchData);
      setAthlete1Points(matchData.athlete1Points || 0);
      setAthlete2Points(matchData.athlete2Points || 0);
      setAthlete1Advantages(matchData.athlete1Advantages || 0);
      setAthlete2Advantages(matchData.athlete2Advantages || 0);
    } catch (err) {
      console.error('Error fetching match:', err);
    } finally {
      setLoading(false);
    }
  };

  const addPoints = (athlete, pointType) => {
    const points = POINT_VALUES[pointType];
    if (athlete === 1) {
      setAthlete1Points(athlete1Points + points);
    } else {
      setAthlete2Points(athlete2Points + points);
    }
  };

  const addAdvantage = (athlete) => {
    if (athlete === 1) {
      setAthlete1Advantages(athlete1Advantages + 1);
    } else {
      setAthlete2Advantages(athlete2Advantages + 1);
    }
  };

  const saveScore = async () => {
    try {
      await matchService.updateMatch(id, {
        athlete1Points,
        athlete2Points,
        athlete1Advantages,
        athlete2Advantages
      });
      alert('Score saved successfully');
    } catch (err) {
      alert('Failed to save score');
    }
  };

  if (loading) return <div className="loading">Loading match...</div>;
  if (!match) return <div className="error">Match not found</div>;

  return (
    <div className="match-scorer">
      <div className="scorer-header">
        <h2>Match Scorer</h2>
        <button className="btn btn-secondary" onClick={() => navigate('/matches')}>
          Back
        </button>
      </div>

      <div className="scoreboard">
        <div className="athlete-score">
          <h3>Athlete 1</h3>
          <div className="score-display">
            <div className="points">{athlete1Points}</div>
            <div className="advantages">Advantages: {athlete1Advantages}</div>
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
          </div>
        </div>

        <div className="vs-divider">VS</div>

        <div className="athlete-score">
          <h3>Athlete 2</h3>
          <div className="score-display">
            <div className="points">{athlete2Points}</div>
            <div className="advantages">Advantages: {athlete2Advantages}</div>
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
          </div>
        </div>
      </div>

      <div className="scorer-actions">
        <button className="btn btn-success" onClick={saveScore}>
          Save Score
        </button>
      </div>
    </div>
  );
};

export default MatchScorer;
