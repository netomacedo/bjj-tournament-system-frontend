import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import athleteService from "../../services/athleteService";
import { BELT_RANKS } from "../../constants";
import ConfirmationModal from "../Divisions/ConfirmationModal";
import "./AthleteList.css";

const AthleteList = () => {
  const [athletes, setAthletes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBelt, setFilterBelt] = useState("");
  const [modalConfig, setModalConfig] = useState({ isOpen: false });
  const navigate = useNavigate();

  useEffect(() => {
    fetchAthletes();
  }, []);

  const fetchAthletes = async () => {
    try {
      setLoading(true);
      const response = await athleteService.getAllAthletes();
      setAthletes(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to load athletes. Please try again.");
      console.error("Error fetching athletes:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (athlete) => {
    setModalConfig({
      isOpen: true,
      title: 'Delete Athlete',
      message: `Are you sure you want to delete ${athlete.name}? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
      onConfirm: async () => {
        try {
          await athleteService.deleteAthlete(athlete.id);
          setModalConfig({
            isOpen: true,
            title: 'Success!',
            message: `${athlete.name} has been deleted successfully.`,
            confirmText: 'OK',
            type: 'success',
            onConfirm: () => {
              setModalConfig({ isOpen: false });
              fetchAthletes();
            }
          });
        } catch (err) {
          setModalConfig({
            isOpen: true,
            title: 'Error',
            message: `Failed to delete athlete: ${err.response?.data?.message || err.message}`,
            confirmText: 'OK',
            type: 'danger',
            onConfirm: () => setModalConfig({ isOpen: false })
          });
          console.error('Error deleting athlete:', err);
        }
      }
    });
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchAthletes();
      return;
    }

    try {
      setLoading(true);
      const response = await athleteService.searchAthletes(searchTerm);
      setAthletes(response.data);
    } catch (err) {
      setError("Failed to search athletes");
      console.error("Error searching athletes:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterByBelt = async () => {
    if (!filterBelt) {
      fetchAthletes();
      return;
    }

    try {
      setLoading(true);
      const response = await athleteService.getAthletesByBelt(filterBelt);
      setAthletes(response.data);
    } catch (err) {
      setError("Failed to filter athletes");
      console.error("Error filtering athletes:", err);
    } finally {
      setLoading(false);
    }
  };

  const getBeltColor = (beltRank) => {
    const belt = BELT_RANKS.find((b) => b.value === beltRank);
    return belt ? belt.color : "#000";
  };

  const getBeltLabel = (beltRank) => {
    const belt = BELT_RANKS.find((b) => b.value === beltRank);
    return belt ? belt.label : beltRank;
  };

  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <div className="athlete-list">
        <div className="loading">Loading athletes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="athlete-list">
        <div className="error">{error}</div>
        <button onClick={fetchAthletes} className="btn btn-primary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="athlete-list">
      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        cancelText={modalConfig.cancelText}
        type={modalConfig.type}
      />

      <div className="list-header">
        <h2>Athletes</h2>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/athletes/register")}
        >
          + Register New Athlete
        </button>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
          <button onClick={handleSearch} className="btn btn-secondary">
            Search
          </button>
        </div>

        <div className="filter-box">
          <select
            value={filterBelt}
            onChange={(e) => setFilterBelt(e.target.value)}
          >
            <option value="">All Belts</option>
            {BELT_RANKS.map((belt) => (
              <option key={belt.value} value={belt.value}>
                {belt.label}
              </option>
            ))}
          </select>
          <button onClick={handleFilterByBelt} className="btn btn-secondary">
            Filter
          </button>
          <button
            onClick={() => {
              setFilterBelt("");
              setSearchTerm("");
              fetchAthletes();
            }}
            className="btn btn-secondary"
          >
            Clear
          </button>
        </div>
      </div>

      {athletes.length === 0 ? (
        <div className="no-data">
          <p>No athletes found. Register your first athlete!</p>
        </div>
      ) : (
        <div className="athlete-grid">
          {athletes.map((athlete) => (
            <div key={athlete.id} className="athlete-card">
              <div
                className="belt-indicator"
                style={{ backgroundColor: getBeltColor(athlete.beltRank) }}
              />
              <div className="athlete-info">
                <h3>{athlete.name}</h3>
                <div className="info-row">
                  <span className="label">Belt:</span>
                  <span className="value">
                    {getBeltLabel(athlete.beltRank)}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">Age:</span>
                  <span className="value">
                    {calculateAge(athlete.dateOfBirth)} years
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">Weight:</span>
                  <span className="value">{athlete.weight} kg</span>
                </div>
                <div className="info-row">
                  <span className="label">Gender:</span>
                  <span className="value">{athlete.gender}</span>
                </div>
                {athlete.team && (
                  <div className="info-row">
                    <span className="label">Team:</span>
                    <span className="value">{athlete.team}</span>
                  </div>
                )}
              </div>
              <div className="athlete-actions">
                <button
                  className="btn btn-small btn-primary"
                  onClick={() => navigate(`/athletes/edit/${athlete.id}`)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-small btn-danger"
                  onClick={() => handleDelete(athlete)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AthleteList;
