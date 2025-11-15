import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import divisionService from '../../services/divisionService';
import { BELT_RANKS, AGE_CATEGORIES, GENDER_OPTIONS, BRACKET_TYPES, WEIGHT_CLASSES_ADULT_MALE, WEIGHT_CLASSES_ADULT_FEMALE } from '../../constants';
import './DivisionForm.css';

const DivisionForm = () => {
  const { tournamentId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    beltRank: '',
    ageCategory: '',
    gender: '',
    weightClass: '',
    bracketType: 'SINGLE_ELIMINATION'
  });

  const [weightClasses, setWeightClasses] = useState([]);

  useEffect(() => {
    // Update weight classes based on selected gender
    if (formData.gender === 'MALE') {
      setWeightClasses(WEIGHT_CLASSES_ADULT_MALE);
    } else if (formData.gender === 'FEMALE') {
      setWeightClasses(WEIGHT_CLASSES_ADULT_FEMALE);
    } else {
      setWeightClasses([]);
      setFormData(prev => ({ ...prev, weightClass: '' }));
    }
  }, [formData.gender]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.beltRank || !formData.ageCategory || !formData.gender || !formData.bracketType) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await divisionService.createDivision(tournamentId, formData);
      alert('Division created successfully!');
      navigate(`/tournaments/${tournamentId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create division');
      console.error('Error creating division:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="division-form-container">
      <div className="form-header">
        <h2>Create New Division</h2>
        <button className="btn btn-secondary" onClick={() => navigate(`/tournaments/${tournamentId}`)}>
          Cancel
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="division-form">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="beltRank">Belt Rank *</label>
            <select
              id="beltRank"
              name="beltRank"
              value={formData.beltRank}
              onChange={handleChange}
              required
            >
              <option value="">Select Belt Rank</option>
              {BELT_RANKS.map(belt => (
                <option key={belt.value} value={belt.value}>
                  {belt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="ageCategory">Age Category *</label>
            <select
              id="ageCategory"
              name="ageCategory"
              value={formData.ageCategory}
              onChange={handleChange}
              required
            >
              <option value="">Select Age Category</option>
              {AGE_CATEGORIES.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="gender">Gender *</label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
            >
              <option value="">Select Gender</option>
              {GENDER_OPTIONS.map(gender => (
                <option key={gender.value} value={gender.value}>
                  {gender.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="weightClass">
              Weight Class {formData.gender && formData.gender !== 'NOT_APPLICABLE' && '(Optional)'}
            </label>
            <select
              id="weightClass"
              name="weightClass"
              value={formData.weightClass}
              onChange={handleChange}
              disabled={!formData.gender || formData.gender === 'NOT_APPLICABLE'}
            >
              <option value="">Open Weight / Not Specified</option>
              {weightClasses.map(wc => (
                <option key={wc.value} value={wc.value}>
                  {wc.label} ({wc.max === 1000 ? '100.5+' : `up to ${wc.max}`} kg)
                </option>
              ))}
            </select>
            {formData.gender === 'NOT_APPLICABLE' && (
              <small className="form-hint">Weight classes not applicable for kids under 10</small>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="bracketType">Bracket Type *</label>
            <select
              id="bracketType"
              name="bracketType"
              value={formData.bracketType}
              onChange={handleChange}
              required
            >
              {BRACKET_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-info">
          <h4>Division Validation Rules:</h4>
          <ul>
            <li>Belt rank must match enrolled athletes</li>
            <li>Age category will validate athlete age ranges</li>
            <li>Gender validation applies to athletes 10+ years old</li>
            <li>Weight class is optional (leave blank for open weight)</li>
            <li>Duplicate divisions (same belt/age/gender) are not allowed</li>
            <li>Divisions can only be created while registration is open</li>
          </ul>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary btn-large"
            disabled={loading}
          >
            {loading ? 'Creating Division...' : 'Create Division'}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate(`/tournaments/${tournamentId}`)}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default DivisionForm;