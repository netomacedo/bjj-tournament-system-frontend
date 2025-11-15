import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import divisionService from '../../services/divisionService';
import athleteService from '../../services/athleteService';
import ConfirmationModal from './ConfirmationModal';
import { BELT_RANKS } from '../../constants';
import './AthleteEnrollment.css';

const AthleteEnrollment = () => {
  const { divisionId } = useParams();
  const navigate = useNavigate();
  const [division, setDivision] = useState(null);
  const [enrolledAthletes, setEnrolledAthletes] = useState([]);
  const [availableAthletes, setAvailableAthletes] = useState([]);
  const [filteredAthletes, setFilteredAthletes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalConfig, setModalConfig] = useState({ isOpen: false });

  useEffect(() => {
    fetchData();
  }, [divisionId]);

  useEffect(() => {
    filterAthletes();
  }, [searchTerm, availableAthletes]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [divisionRes, enrolledRes, allAthletesRes] = await Promise.all([
        divisionService.getDivisionById(divisionId),
        divisionService.getDivisionAthletes(divisionId),
        athleteService.getAllAthletes()
      ]);

      setDivision(divisionRes.data);
      setEnrolledAthletes(enrolledRes.data || []);

      // Filter out already enrolled athletes
      const enrolledIds = new Set((enrolledRes.data || []).map(a => a.id));
      const available = (allAthletesRes.data || []).filter(a => !enrolledIds.has(a.id));
      setAvailableAthletes(available);
      setFilteredAthletes(available);

      setError(null);
    } catch (err) {
      setError('Failed to load division and athletes: ' + (err.response?.data?.message || err.message));
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterAthletes = () => {
    if (!searchTerm.trim()) {
      setFilteredAthletes(availableAthletes);
      return;
    }

    const search = searchTerm.toLowerCase();
    const filtered = availableAthletes.filter(athlete =>
      athlete.name.toLowerCase().includes(search) ||
      athlete.team?.toLowerCase().includes(search) ||
      athlete.email?.toLowerCase().includes(search)
    );
    setFilteredAthletes(filtered);
  };

  const handleEnroll = async (athlete) => {
    setModalConfig({
      isOpen: true,
      title: 'Enroll Athlete',
      message: `Enroll ${athlete.name} in this division?`,
      confirmText: 'Enroll',
      type: 'primary',
      onConfirm: async () => {
        try {
          await divisionService.enrollAthlete(divisionId, athlete.id);
          setModalConfig({
            isOpen: true,
            title: 'Success!',
            message: `${athlete.name} has been enrolled successfully!`,
            confirmText: 'OK',
            type: 'success',
            onConfirm: () => fetchData()
          });
        } catch (err) {
          setModalConfig({
            isOpen: true,
            title: 'Error',
            message: `Failed to enroll athlete: ${err.response?.data?.message || err.message}`,
            confirmText: 'OK',
            type: 'danger',
            onConfirm: () => {}
          });
          console.error('Error enrolling athlete:', err);
        }
      }
    });
  };

  const handleRemove = async (athlete) => {
    setModalConfig({
      isOpen: true,
      title: 'Remove Athlete',
      message: `Remove ${athlete.name} from this division? This action cannot be undone.`,
      confirmText: 'Remove',
      cancelText: 'Cancel',
      type: 'danger',
      onConfirm: async () => {
        try {
          await divisionService.removeAthlete(divisionId, athlete.id);
          setModalConfig({
            isOpen: true,
            title: 'Success!',
            message: `${athlete.name} has been removed from the division.`,
            confirmText: 'OK',
            type: 'success',
            onConfirm: () => fetchData()
          });
        } catch (err) {
          setModalConfig({
            isOpen: true,
            title: 'Error',
            message: `Failed to remove athlete: ${err.response?.data?.message || err.message}`,
            confirmText: 'OK',
            type: 'danger',
            onConfirm: () => {}
          });
          console.error('Error removing athlete:', err);
        }
      }
    });
  };

  const getBeltLabel = (value) => {
    const belt = BELT_RANKS.find(b => b.value === value);
    return belt ? belt.label : value;
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
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
    return (
      <div className="enrollment-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading division and athletes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="enrollment-container">
        <div className="error-state">
          <h3>⚠️ Error Loading Data</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => navigate(-1)}>
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="enrollment-container">
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

      <div className="enrollment-header">
        <div>
          <h2>Manage Athletes</h2>
          <p className="division-name">{division?.name}</p>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>

      <div className="enrollment-content">
        <div className="enrolled-section">
          <div className="section-header">
            <h3>
              <span className="section-icon">✓</span>
              Enrolled Athletes ({enrolledAthletes.length})
            </h3>
          </div>

          {enrolledAthletes.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">👥</span>
              <p>No athletes enrolled yet</p>
              <small>Select athletes from the available list to enroll them</small>
            </div>
          ) : (
            <div className="athletes-list">
              {enrolledAthletes.map(athlete => (
                <div key={athlete.id} className="athlete-card enrolled">
                  <div className="athlete-info">
                    <h4>{athlete.name}</h4>
                    <div className="athlete-details">
                      <span className="detail-badge belt">{getBeltLabel(athlete.beltRank)}</span>
                      <span className="detail-badge">⚖️ {athlete.weight} kg</span>
                      <span className="detail-badge">🎂 {calculateAge(athlete.dateOfBirth)} yrs</span>
                      <span className="detail-badge">{athlete.gender}</span>
                    </div>
                    {athlete.team && <p className="team">🏋️ {athlete.team}</p>}
                  </div>
                  <button
                    className="btn btn-small btn-danger"
                    onClick={() => handleRemove(athlete)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="available-section">
          <div className="section-header">
            <h3>
              <span className="section-icon">👥</span>
              Available Athletes ({filteredAthletes.length})
            </h3>
          </div>

          <input
            type="text"
            className="search-input"
            placeholder="🔍 Search by name, team, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {filteredAthletes.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">🔍</span>
              <p>{searchTerm ? 'No athletes match your search' : 'No available athletes'}</p>
              <small>{searchTerm ? 'Try a different search term' : 'All athletes are already enrolled'}</small>
            </div>
          ) : (
            <div className="athletes-list">
              {filteredAthletes.map(athlete => (
                <div key={athlete.id} className="athlete-card available">
                  <div className="athlete-info">
                    <h4>{athlete.name}</h4>
                    <div className="athlete-details">
                      <span className="detail-badge belt">{getBeltLabel(athlete.beltRank)}</span>
                      <span className="detail-badge">⚖️ {athlete.weight} kg</span>
                      <span className="detail-badge">🎂 {calculateAge(athlete.dateOfBirth)} yrs</span>
                      <span className="detail-badge">{athlete.gender}</span>
                    </div>
                    {athlete.team && <p className="team">🏋️ {athlete.team}</p>}
                    {athlete.experienceNotes && (
                      <p className="notes">📝 {athlete.experienceNotes}</p>
                    )}
                  </div>
                  <button
                    className="btn btn-small btn-primary"
                    onClick={() => handleEnroll(athlete)}
                  >
                    + Enroll
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AthleteEnrollment;