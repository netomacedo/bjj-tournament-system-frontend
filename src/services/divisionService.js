import api from './api';

const divisionService = {
  // Get division by ID
  getDivisionById: (id) => api.get(`/divisions/${id}`),

  // Get divisions for a tournament
  getTournamentDivisions: (tournamentId) => api.get(`/tournaments/${tournamentId}/divisions`),

  // Create a new division
  createDivision: (tournamentId, divisionData) =>
    api.post(`/tournaments/${tournamentId}/divisions`, divisionData),

  // Update division
  updateDivision: (id, divisionData) => api.put(`/divisions/${id}`, divisionData),

  // Delete division
  deleteDivision: (id) => api.delete(`/divisions/${id}`),

  // Enroll athlete in division
  enrollAthlete: (divisionId, athleteId) =>
    api.post(`/divisions/${divisionId}/athletes/${athleteId}`),

  // Remove athlete from division
  removeAthlete: (divisionId, athleteId) =>
    api.delete(`/divisions/${divisionId}/athletes/${athleteId}`),

  // Get athletes in a division
  getDivisionAthletes: (divisionId) => api.get(`/divisions/${divisionId}/athletes`),

  // Generate matches for division (automatic)
  generateMatches: (divisionId) =>
    api.post(`/tournaments/divisions/${divisionId}/generate-matches`),

  // Generate matches manually
  generateMatchesManual: (divisionId, matchPairs) =>
    api.post(`/tournaments/divisions/${divisionId}/generate-matches-manual`, matchPairs),
};

export default divisionService;