import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import divisionService from "../../services/divisionService";
import ConfirmationModal from "./ConfirmationModal";
import {
  BELT_RANKS,
  AGE_CATEGORIES,
  GENDER_OPTIONS,
  BRACKET_TYPES,
} from "../../constants";
import "./DivisionManager.css";

const DivisionManager = ({ tournamentId }) => {
  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedDivision, setExpandedDivision] = useState(null);
  const [modalConfig, setModalConfig] = useState({ isOpen: false });
  const navigate = useNavigate();

  useEffect(() => {
    if (tournamentId) {
      fetchDivisions();
    }
  }, [tournamentId]);

  const fetchDivisions = async () => {
    try {
      setLoading(true);
      const response = await divisionService.getTournamentDivisions(
        tournamentId
      );
      setDivisions(response.data || []);
      setError(null);
    } catch (err) {
      // If endpoint doesn't exist yet, show empty state instead of error
      console.log("Divisions endpoint not available yet:", err);
      setDivisions([]);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMatches = async (divisionId, isManual = false) => {
    if (isManual) {
      setModalConfig({
        isOpen: true,
        title: 'Manual Match Creation',
        message: 'You will be redirected to create custom match pairings for this division. Continue?',
        confirmText: 'Continue',
        type: 'primary',
        onConfirm: () => {
          navigate(`/divisions/${divisionId}/generate-matches`);
        }
      });
    } else {
      setModalConfig({
        isOpen: true,
        title: 'Auto Generate Matches',
        message: 'This will automatically create matches with random pairings based on the selected bracket type. This action cannot be undone. Continue?',
        confirmText: 'Generate Matches',
        type: 'success',
        onConfirm: async () => {
          try {
            await divisionService.generateMatches(divisionId);
            setModalConfig({
              isOpen: true,
              title: 'Success!',
              message: 'Matches generated successfully!',
              confirmText: 'OK',
              type: 'success',
              onConfirm: () => {
                setModalConfig({ isOpen: false });
                fetchDivisions();
              }
            });
          } catch (err) {
            setModalConfig({
              isOpen: true,
              title: 'Error',
              message: `Failed to generate matches: ${err.response?.data?.message || err.message}`,
              confirmText: 'OK',
              type: 'danger',
              onConfirm: () => {
                setModalConfig({ isOpen: false });
              }
            });
            console.error("Error generating matches:", err);
          }
        }
      });
    }
  };

  const handleEditDivision = (divisionId) => {
    navigate(`/divisions/edit/${divisionId}`);
  };

  const handleDeleteDivision = (division) => {
    setModalConfig({
      isOpen: true,
      title: 'Delete Division',
      message: `Are you sure you want to delete "${division.name}"? This will also delete all matches and related data for this division. This action cannot be undone.`,
      confirmText: 'Delete Division',
      type: 'danger',
      onConfirm: async () => {
        try {
          await divisionService.deleteDivision(division.id);
          // Close modal and refresh immediately
          setModalConfig({ isOpen: false });
          fetchDivisions();
        } catch (err) {
          setModalConfig({
            isOpen: true,
            title: 'Error',
            message: `Failed to delete division: ${err.response?.data?.message || err.message}`,
            confirmText: 'OK',
            type: 'danger',
            onConfirm: () => {
              setModalConfig({ isOpen: false });
            }
          });
          console.error("Error deleting division:", err);
        }
      }
    });
  };

  const toggleDivision = (divisionId) => {
    setExpandedDivision(expandedDivision === divisionId ? null : divisionId);
  };

  const getBeltLabel = (value) => {
    const belt = BELT_RANKS.find((b) => b.value === value);
    return belt ? belt.label : value;
  };

  const getAgeCategoryLabel = (value) => {
    const category = AGE_CATEGORIES.find((c) => c.value === value);
    return category ? category.label : value;
  };

  const getGenderLabel = (value) => {
    const gender = GENDER_OPTIONS.find((g) => g.value === value);
    return gender ? gender.label : value;
  };

  const getBracketTypeLabel = (value) => {
    const type = BRACKET_TYPES.find((t) => t.value === value);
    return type ? type.label : value;
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return <div className="loading">Loading divisions...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="division-manager">
      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        type={modalConfig.type}
      />

      <div className="manager-header">
        <h3>Tournament Divisions</h3>
        <button
          className="btn btn-primary"
          onClick={() =>
            navigate(`/tournaments/${tournamentId}/divisions/create`)
          }
        >
          <span className="btn-icon">+</span>
          Add Division
        </button>
      </div>

      {divisions.length === 0 ? (
        <div className="no-data">
          <h4>No Divisions Yet</h4>
          <p>
            Create divisions to organize athletes by belt rank, age, gender, and
            weight class.
          </p>
          <button
            className="btn btn-primary btn-large"
            onClick={() =>
              navigate(`/tournaments/${tournamentId}/divisions/create`)
            }
          >
            <span className="btn-icon">+</span>
            Create First Division
          </button>
          <p className="help-text">
            Once divisions are created, you can enroll athletes and generate
            matches.
          </p>
        </div>
      ) : (
        <div className="divisions-list">
          {divisions.map((division) => (
            <div key={division.id} className="division-card">
              <div
                className="division-header"
                onClick={() => toggleDivision(division.id)}
              >
                <div className="division-info">
                  <h4>{division.name}</h4>
                  <div className="division-details">
                    <span className="badge">
                      {getBeltLabel(division.beltRank)}
                    </span>
                    <span className="badge">
                      {getAgeCategoryLabel(division.ageCategory)}
                    </span>
                    <span className="badge">
                      {getGenderLabel(division.gender)}
                    </span>
                    {division.weightClass && (
                      <span className="badge">{division.weightClass}</span>
                    )}
                  </div>
                </div>
                <div className="division-stats">
                  <span className="stat">
                    <span className="stat-icon">👥</span>
                    {division.athleteCount || division.athletes?.length || 0}{" "}
                    Athletes
                  </span>
                  <span className="stat">
                    <span className="stat-icon">⚔️</span>
                    {division.matchesGenerated ? "Matches Ready" : "No Matches"}
                  </span>
                  <span
                    className={`status ${
                      division.completed ? "completed" : "pending"
                    }`}
                  >
                    {division.completed ? "✓ Completed" : "● Active"}
                  </span>
                </div>
              </div>

              {expandedDivision === division.id && (
                <div className="division-content">
                  <div className="division-actions">
                    <button
                      className="btn btn-small btn-secondary"
                      onClick={() =>
                        navigate(`/divisions/${division.id}/athletes`)
                      }
                    >
                      <span className="btn-icon">👥</span>
                      Manage Athletes
                    </button>

                    {!division.matchesGenerated ? (
                      <>
                        <button
                          className="btn btn-small btn-primary"
                          onClick={() =>
                            handleGenerateMatches(division.id, false)
                          }
                          disabled={
                            (division.athleteCount || division.athletes?.length || 0) < 2
                          }
                        >
                          <span className="btn-icon">⚡</span>
                          Auto Generate
                        </button>
                        <button
                          className="btn btn-small btn-primary"
                          onClick={() =>
                            handleGenerateMatches(division.id, true)
                          }
                          disabled={
                            (division.athleteCount || division.athletes?.length || 0) < 2
                          }
                        >
                          <span className="btn-icon">✏️</span>
                          Manual Creation
                        </button>
                      </>
                    ) : (
                      <button
                        className="btn btn-small btn-success"
                        onClick={() => navigate(`/brackets/${division.id}`)}
                      >
                        <span className="btn-icon">🏆</span>
                        View Bracket
                      </button>
                    )}

                    <button
                      className="btn btn-small btn-info"
                      onClick={() => handleEditDivision(division.id)}
                    >
                      <span className="btn-icon">✏️</span>
                      Edit
                    </button>

                    <button
                      className="btn btn-small btn-danger"
                      onClick={() => handleDeleteDivision(division)}
                    >
                      <span className="btn-icon">🗑️</span>
                      Delete
                    </button>
                  </div>

                  <div className="division-meta">
                    <p>
                      <strong>Bracket Type:</strong>{" "}
                      {getBracketTypeLabel(division.bracketType)}
                    </p>
                    {division.athletes && division.athletes.length > 0 ? (
                      <div className="athletes-preview">
                        <strong>
                          <span className="preview-icon">👥</span>
                          Enrolled Athletes ({division.athletes.length}):
                        </strong>
                        <ul>
                          {division.athletes.slice(0, 5).map((athlete) => {
                            const age = calculateAge(athlete.dateOfBirth);
                            return (
                              <li key={athlete.id} className="athlete-item">
                                <div className="athlete-details-compact">
                                  <div className="athlete-header-row">
                                    <span className="athlete-name-preview">{athlete.name}</span>
                                    {athlete.gender && (
                                      <span className="athlete-gender-badge">
                                        {athlete.gender === 'MALE' ? '♂' : athlete.gender === 'FEMALE' ? '♀' : athlete.gender}
                                      </span>
                                    )}
                                  </div>
                                  <div className="athlete-badges-preview">
                                    {athlete.beltRank && (
                                      <span className="preview-badge belt">{getBeltLabel(athlete.beltRank)}</span>
                                    )}
                                    {athlete.weight && (
                                      <span className="preview-badge">⚖️ {athlete.weight}kg</span>
                                    )}
                                    {age && (
                                      <span className="preview-badge age">🎂 {age} yrs</span>
                                    )}
                                    {athlete.team && (
                                      <span className="preview-badge team">🏋️ {athlete.team}</span>
                                    )}
                                  </div>
                                </div>
                              </li>
                            );
                          })}
                          {division.athletes.length > 5 && (
                            <li className="more-athletes">
                              <span className="more-icon">+</span>
                              {division.athletes.length - 5} more athletes
                            </li>
                          )}
                        </ul>
                      </div>
                    ) : division.athleteCount > 0 ? (
                      <div className="athletes-preview-simple">
                        <strong>
                          <span className="preview-icon">👥</span>
                          {division.athleteCount} Athletes Enrolled
                        </strong>
                        <p className="preview-note">Click "Manage Athletes" to view full details</p>
                      </div>
                    ) : (
                      <div className="no-athletes-preview">
                        <span className="no-athletes-icon">👥</span>
                        <p>No athletes enrolled yet</p>
                        <small>Click "Manage Athletes" to add athletes to this division</small>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DivisionManager;