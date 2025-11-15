import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import divisionService from '../../services/divisionService';
import './MatchGenerator.css';

const MatchGenerator = () => {
  const { divisionId } = useParams();
  const navigate = useNavigate();
  const [division, setDivision] = useState(null);
  const [athletes, setAthletes] = useState([]);
  const [matchPairs, setMatchPairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [divisionId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [divisionRes, athletesRes] = await Promise.all([
        divisionService.getDivisionById(divisionId),
        divisionService.getDivisionAthletes(divisionId)
      ]);

      setDivision(divisionRes.data);
      setAthletes(athletesRes.data || []);

      // Initialize with one empty pair
      if ((athletesRes.data || []).length >= 2) {
        setMatchPairs([{ athlete1: null, athlete2: null }]);
      }

      setError(null);
    } catch (err) {
      setError('Failed to load division data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const addMatchPair = () => {
    setMatchPairs([...matchPairs, { athlete1: null, athlete2: null }]);
  };

  const removeMatchPair = (index) => {
    const updated = matchPairs.filter((_, i) => i !== index);
    setMatchPairs(updated);
  };

  const updateMatchPair = (index, field, value) => {
    const updated = [...matchPairs];
    updated[index] = { ...updated[index], [field]: parseInt(value) || null };
    setMatchPairs(updated);
  };

  const getAvailableAthletes = (pairIndex, field) => {
    // Get currently selected athletes in other pairs
    const selectedInOtherPairs = matchPairs
      .filter((_, i) => i !== pairIndex)
      .flatMap(pair => [pair.athlete1, pair.athlete2])
      .filter(id => id !== null);

    // Get the other athlete in current pair
    const currentPair = matchPairs[pairIndex];
    const otherField = field === 'athlete1' ? 'athlete2' : 'athlete1';
    const otherAthlete = currentPair?.[otherField];

    // Filter out selected athletes
    return athletes.filter(athlete =>
      !selectedInOtherPairs.includes(athlete.id) &&
      athlete.id !== otherAthlete
    );
  };

  const validateMatches = () => {
    const errors = [];

    if (matchPairs.length === 0) {
      errors.push('Please add at least one match');
      return errors;
    }

    matchPairs.forEach((pair, index) => {
      if (!pair.athlete1 || !pair.athlete2) {
        errors.push(`Match ${index + 1}: Both athletes must be selected`);
      }
      if (pair.athlete1 === pair.athlete2) {
        errors.push(`Match ${index + 1}: Cannot match an athlete with themselves`);
      }
    });

    return errors;
  };

  const handleSubmit = async () => {
    const errors = validateMatches();
    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }

    const confirmation = window.confirm(
      `Create ${matchPairs.length} match${matchPairs.length > 1 ? 'es' : ''}?`
    );

    if (!confirmation) return;

    try {
      setSubmitting(true);
      const pairsData = matchPairs.map(pair => [pair.athlete1, pair.athlete2]);
      await divisionService.generateMatchesManual(divisionId, pairsData);
      alert('Matches created successfully!');
      navigate(-1);
    } catch (err) {
      alert('Failed to create matches: ' + (err.response?.data?.message || err.message));
      console.error('Error creating matches:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const getAthleteDisplay = (athleteId) => {
    const athlete = athletes.find(a => a.id === athleteId);
    if (!athlete) return '';
    return `${athlete.name} (${athlete.weight}kg)`;
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return (
      <div className="match-generator-container">
        <div className="error">{error}</div>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    );
  }

  if (athletes.length < 2) {
    return (
      <div className="match-generator-container">
        <div className="warning">
          <h3>Not Enough Athletes</h3>
          <p>You need at least 2 athletes enrolled to create matches.</p>
          <button className="btn btn-primary" onClick={() => navigate(-1)}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="match-generator-container">
      <div className="generator-header">
        <div>
          <h2>Manual Match Creation</h2>
          <p className="division-name">{division?.name}</p>
          <p className="info-text">Create custom match pairings for this division</p>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          Cancel
        </button>
      </div>

      <div className="generator-content">
        <div className="matches-section">
          <div className="section-header">
            <h3>Match Pairings ({matchPairs.length})</h3>
            <button className="btn btn-small btn-primary" onClick={addMatchPair}>
              + Add Match
            </button>
          </div>

          {matchPairs.map((pair, index) => (
            <div key={index} className="match-pair-card">
              <div className="match-pair-header">
                <h4>Match {index + 1}</h4>
                {matchPairs.length > 1 && (
                  <button
                    className="btn btn-small btn-danger"
                    onClick={() => removeMatchPair(index)}
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="match-pair-selects">
                <div className="athlete-select">
                  <label>Athlete 1</label>
                  <select
                    value={pair.athlete1 || ''}
                    onChange={(e) => updateMatchPair(index, 'athlete1', e.target.value)}
                  >
                    <option value="">Select athlete...</option>
                    {getAvailableAthletes(index, 'athlete1').map(athlete => (
                      <option key={athlete.id} value={athlete.id}>
                        {athlete.name} ({athlete.weight}kg)
                      </option>
                    ))}
                    {pair.athlete1 && !getAvailableAthletes(index, 'athlete1').find(a => a.id === pair.athlete1) && (
                      <option value={pair.athlete1}>
                        {getAthleteDisplay(pair.athlete1)}
                      </option>
                    )}
                  </select>
                </div>

                <div className="vs">VS</div>

                <div className="athlete-select">
                  <label>Athlete 2</label>
                  <select
                    value={pair.athlete2 || ''}
                    onChange={(e) => updateMatchPair(index, 'athlete2', e.target.value)}
                  >
                    <option value="">Select athlete...</option>
                    {getAvailableAthletes(index, 'athlete2').map(athlete => (
                      <option key={athlete.id} value={athlete.id}>
                        {athlete.name} ({athlete.weight}kg)
                      </option>
                    ))}
                    {pair.athlete2 && !getAvailableAthletes(index, 'athlete2').find(a => a.id === pair.athlete2) && (
                      <option value={pair.athlete2}>
                        {getAthleteDisplay(pair.athlete2)}
                      </option>
                    )}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="action-section">
          <button
            className="btn btn-large btn-success"
            onClick={handleSubmit}
            disabled={submitting || matchPairs.length === 0}
          >
            {submitting ? 'Creating Matches...' : `Create ${matchPairs.length} Match${matchPairs.length > 1 ? 'es' : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatchGenerator;