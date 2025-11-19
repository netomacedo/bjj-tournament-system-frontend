import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import matchService from '../../services/matchService';
import divisionService from '../../services/divisionService';
import './BracketView.css';

const BracketView = () => {
  const { divisionId } = useParams();
  const navigate = useNavigate();
  const [division, setDivision] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (divisionId) {
      fetchBracketData();
    } else {
      setLoading(false);
    }
  }, [divisionId]);

  const fetchBracketData = async () => {
    try {
      setLoading(true);
      // Fetch division first
      const divisionRes = await divisionService.getDivisionById(divisionId);
      setDivision(divisionRes.data);
      console.log('Division data:', divisionRes.data);

      // Try to fetch matches, but don't fail if they don't exist
      try {
        const matchesRes = await matchService.getMatchesByDivision(divisionId);
        console.log('=== MATCHES DEBUG ===');
        console.log('Full response:', matchesRes);
        console.log('Response data:', matchesRes.data);
        console.log('Is array?:', Array.isArray(matchesRes.data));
        console.log('Data length:', matchesRes.data?.length);

        if (matchesRes.data && matchesRes.data.length > 0) {
          console.log('First match sample:', JSON.stringify(matchesRes.data[0], null, 2));
        }

        // Handle both array and object responses
        const matchesData = Array.isArray(matchesRes.data)
          ? matchesRes.data
          : (matchesRes.data?.matches || []);

        console.log('Processed matches count:', matchesData.length);
        setMatches(matchesData);
      } catch (matchErr) {
        console.error('Error fetching matches:', matchErr);
        console.error('Match error response:', matchErr.response);
        setMatches([]);
      }

      setError(null);
    } catch (err) {
      console.error('Error fetching bracket data:', err);
      setError(err.response?.data?.message || 'Failed to load division data');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMatches = async () => {
    if (!window.confirm('Generate matches automatically for this division?')) {
      return;
    }

    try {
      setGenerating(true);
      await divisionService.generateMatches(divisionId);
      alert('Matches generated successfully!');
      // Reload the bracket data
      await fetchBracketData();
    } catch (err) {
      console.error('Error generating matches:', err);
      alert('Failed to generate matches: ' + (err.response?.data?.message || err.message));
    } finally {
      setGenerating(false);
    }
  };

  const organizeMatchesByRound = () => {
    const rounds = {};
    matches.forEach(match => {
      const round = match.roundNumber || 1;
      if (!rounds[round]) {
        rounds[round] = [];
      }
      rounds[round].push(match);
    });
    return rounds;
  };

  const getMatchStatusClass = (match) => {
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

  const getRoundName = (roundNumber, totalRounds) => {
    if (roundNumber === totalRounds) return 'Final';
    if (roundNumber === totalRounds - 1) return 'Semi-Finals';
    if (roundNumber === totalRounds - 2) return 'Quarter-Finals';
    return `Round ${roundNumber}`;
  };

  if (loading) {
    return (
      <div className="bracket-view">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading bracket...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bracket-view">
        <div className="error-state">
          <span className="error-icon">⚠️</span>
          <h3>Error Loading Bracket</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => fetchBracketData()}>
            🔄 Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!divisionId) {
    return (
      <div className="bracket-view">
        <div className="no-data">
          <span className="empty-icon">🏆</span>
          <h4>No Division Selected</h4>
          <p>Select a division to view its bracket</p>
          <button className="btn btn-primary btn-large" onClick={() => navigate('/tournaments')}>
            View Tournaments
          </button>
        </div>
      </div>
    );
  }

  const rounds = organizeMatchesByRound();
  const roundNumbers = Object.keys(rounds).sort((a, b) => Number(a) - Number(b));
  const totalRounds = roundNumbers.length;

  return (
    <div className="bracket-view">
      <div className="bracket-header">
        <div className="header-content">
          <h2>
            <span className="header-icon">🏆</span>
            Tournament Bracket
          </h2>
          {division && (
            <div className="division-details">
              <h3>{division.name}</h3>
              <div className="detail-badges">
                <span className="detail-badge">{division.beltRank}</span>
                <span className="detail-badge">{division.ageCategory}</span>
                <span className="detail-badge">{division.gender}</span>
                {division.weightClass && <span className="detail-badge">{division.weightClass}</span>}
                <span className="detail-badge bracket-type">{division.bracketType}</span>
              </div>
            </div>
          )}
        </div>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>

      {matches.length === 0 ? (
        <div className="no-data">
          <span className="empty-icon">⚔️</span>
          <h4>No Matches Generated</h4>
          <p>Matches haven't been generated for this division yet.</p>
          <div className="action-buttons">
            <button
              className="btn btn-primary btn-large"
              onClick={handleGenerateMatches}
              disabled={generating}
            >
              {generating ? 'Generating...' : '⚡ Generate Matches Automatically'}
            </button>
            <button
              className="btn btn-secondary btn-large"
              onClick={() => navigate(`/divisions/${divisionId}/generate-matches`)}
            >
              ✏️ Create Matches Manually
            </button>
          </div>
        </div>
      ) : (
        <div className="bracket-container">
          {roundNumbers.map((roundNum) => (
            <div key={roundNum} className="bracket-round">
              <div className="round-header">
                <h4>{getRoundName(Number(roundNum), totalRounds)}</h4>
                <span className="round-number">Round {roundNum}</span>
              </div>
              <div className="round-matches">
                {rounds[roundNum].map((match) => {
                  const status = getMatchStatusClass(match);
                  const isCompleted = status === 'completed';
                  const isInProgress = status === 'in-progress';

                  return (
                    <div
                      key={match.id}
                      className={`bracket-match ${status}`}
                      onClick={() => {
                        // Navigate to match scorer for in-progress matches, matches list for others
                        if (isInProgress) {
                          navigate(`/matches/${match.id}/score`);
                        } else {
                          navigate(`/matches?divisionId=${divisionId}`);
                        }
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="match-number">Match #{match.matchNumber || match.id}</div>

                      <div className={`match-competitor ${match.winnerId === match.athlete1Id ? 'winner' : ''}`}>
                        <div className="competitor-info">
                          {match.winnerId === match.athlete1Id && <span className="winner-icon">👑</span>}
                          <span className="competitor-name">{match.athlete1Name || 'TBD'}</span>
                        </div>
                        {isCompleted && (
                          <span className="competitor-score">{match.athlete1Points || 0}</span>
                        )}
                      </div>

                      <div className="vs-separator">VS</div>

                      <div className={`match-competitor ${match.winnerId === match.athlete2Id ? 'winner' : ''}`}>
                        <div className="competitor-info">
                          {match.winnerId === match.athlete2Id && <span className="winner-icon">👑</span>}
                          <span className="competitor-name">{match.athlete2Name || 'TBD'}</span>
                        </div>
                        {isCompleted && (
                          <span className="competitor-score">{match.athlete2Points || 0}</span>
                        )}
                      </div>

                      {match.matNumber && (
                        <div className="match-mat">
                          <span>🥋 Mat {match.matNumber}</span>
                        </div>
                      )}

                      <div className={`match-status ${status}`}>
                        {isCompleted ? '✓ Completed' : isInProgress ? '⚔️ In Progress' : '⏳ Pending'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BracketView;
