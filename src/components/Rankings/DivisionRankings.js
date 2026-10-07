import React, { useState, useEffect } from 'react';
import divisionService from '../../services/divisionService';
import './DivisionRankings.css';

const DivisionRankings = ({ divisionId, divisionName }) => {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (divisionId) {
      fetchRankings();
    }
  }, [divisionId]);

  const fetchRankings = async () => {
    try {
      setLoading(true);
      const response = await divisionService.getDivisionRankings(divisionId);
      setRankings(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching rankings:', err);
      setError('Failed to load rankings');
    } finally {
      setLoading(false);
    }
  };

  const getMedalEmoji = (medal) => {
    switch(medal) {
      case 'GOLD': return '🥇';
      case 'SILVER': return '🥈';
      case 'BRONZE': return '🥉';
      default: return '';
    }
  };

  const getPositionText = (position) => {
    switch(position) {
      case 1: return '1st Place';
      case 2: return '2nd Place';
      case 3: return '3rd Place';
      case 4: return '4th Place';
      default: return `${position}th Place`;
    }
  };

  if (loading) {
    return (
      <div className="rankings-loading">
        <div className="spinner"></div>
        <p>Loading rankings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rankings-error">
        <p>{error}</p>
      </div>
    );
  }

  if (rankings.length === 0) {
    return (
      <div className="rankings-empty">
        <p>No rankings available yet. Complete the division matches to see results!</p>
      </div>
    );
  }

  const gold = rankings.find(r => r.medal === 'GOLD');
  const silver = rankings.find(r => r.medal === 'SILVER');
  const bronzes = rankings.filter(r => r.medal === 'BRONZE');
  const others = rankings.filter(r => !r.medal && r.position > 3);

  return (
    <div className="division-rankings">
      <div className="rankings-header">
        <h2>🏆 Division Rankings</h2>
        {divisionName && <h3>{divisionName}</h3>}
      </div>

      {/* Podium Display */}
      {(gold || silver || bronzes.length > 0) && (
        <div className="podium-container">
          <div className="podium">
            {/* Silver - 2nd Place */}
            {silver && (
              <div className="podium-place silver-place">
                <div className="medal-icon">{getMedalEmoji('SILVER')}</div>
                <div className="athlete-info">
                  <div className="athlete-name">{silver.athleteName}</div>
                  {silver.team && <div className="athlete-team">{silver.team}</div>}
                  <div className="athlete-stats">
                    {silver.wins}W - {silver.losses}L • {silver.totalPoints} pts
                  </div>
                  {silver.submissionWins > 0 && (
                    <div className="submission-badge">🔒 {silver.submissionWins} sub{silver.submissionWins > 1 ? 's' : ''}</div>
                  )}
                </div>
                <div className="podium-block podium-second">
                  <span className="position-label">2nd</span>
                </div>
              </div>
            )}

            {/* Gold - 1st Place */}
            {gold && (
              <div className="podium-place gold-place">
                <div className="medal-icon champion">{getMedalEmoji('GOLD')}</div>
                <div className="athlete-info">
                  <div className="athlete-name champion-name">{gold.athleteName}</div>
                  {gold.team && <div className="athlete-team">{gold.team}</div>}
                  <div className="athlete-stats">
                    {gold.wins}W - {gold.losses}L • {gold.totalPoints} pts
                  </div>
                  {gold.submissionWins > 0 && (
                    <div className="submission-badge">🔒 {gold.submissionWins} sub{gold.submissionWins > 1 ? 's' : ''}</div>
                  )}
                </div>
                <div className="podium-block podium-first">
                  <span className="position-label">1st</span>
                </div>
              </div>
            )}

            {/* Bronze - 3rd Place (one full podium card per bronze medalist) */}
            {bronzes.map((bronze, index) => (
              <div className="podium-place bronze-place" key={bronze.athleteId ?? index}>
                <div className="medal-icon">{getMedalEmoji('BRONZE')}</div>
                <div className="athlete-info">
                  <div className="athlete-name">{bronze.athleteName}</div>
                  {bronze.team && <div className="athlete-team">{bronze.team}</div>}
                  <div className="athlete-stats">
                    {bronze.wins}W - {bronze.losses}L • {bronze.totalPoints} pts
                  </div>
                  {bronze.submissionWins > 0 && (
                    <div className="submission-badge">🔒 {bronze.submissionWins} sub{bronze.submissionWins > 1 ? 's' : ''}</div>
                  )}
                </div>
                <div className="podium-block podium-third">
                  <span className="position-label">3rd</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full Rankings Table */}
      <div className="rankings-table">
        <h3>Complete Rankings</h3>
        <table>
          <thead>
            <tr>
              <th>Position</th>
              <th>Medal</th>
              <th>Athlete</th>
              <th>Team</th>
              <th>Record</th>
              <th>Submissions</th>
              <th>Points</th>
            </tr>
          </thead>
          <tbody>
            {rankings.map((ranking, index) => (
              <tr key={index} className={`rank-${ranking.position}`}>
                <td className="position-cell">
                  <strong>{getPositionText(ranking.position)}</strong>
                </td>
                <td className="medal-cell">
                  <span className="medal-large">{getMedalEmoji(ranking.medal)}</span>
                </td>
                <td className="name-cell">
                  <strong>{ranking.athleteName}</strong>
                </td>
                <td className="team-cell">{ranking.team || '-'}</td>
                <td className="record-cell">
                  {ranking.wins}W - {ranking.losses}L
                </td>
                <td className="submissions-cell">
                  {ranking.submissionWins > 0 ? `🔒 ${ranking.submissionWins}` : '-'}
                </td>
                <td className="points-cell">{ranking.totalPoints}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DivisionRankings;
