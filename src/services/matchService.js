import api from './api';

const matchService = {
  // Get match by ID
  getMatchById: (id) => api.get(`/matches/${id}`),

  // Get all matches in a division
  getMatchesByDivision: (divisionId) => api.get(`/matches/division/${divisionId}`),

  // Get matches by round
  getMatchesByRound: (divisionId, roundNumber) =>
    api.get(`/matches/division/${divisionId}/round/${roundNumber}`),

  // Get pending matches in a division
  getPendingMatches: (divisionId) => api.get(`/matches/division/${divisionId}/pending`),

  // Get athlete's matches
  getAthleteMatches: (athleteId) => api.get(`/matches/athlete/${athleteId}`),

  // Start match
  startMatch: (id) => api.post(`/matches/${id}/start`),

  // Update match scores
  updateMatch: (id, matchData) => api.put(`/matches/${id}`, matchData),

  // Record submission
  recordSubmission: (id, submissionData) => api.post(`/matches/${id}/submission`, submissionData),

  // Record walkover
  recordWalkover: (id, walkoverData) => api.post(`/matches/${id}/walkover`, walkoverData),

  // Assign to mat
  assignMat: (id, matNumber) => api.post(`/matches/${id}/assign-mat`, { matNumber }),

  // Complete match
  completeMatch: (id, winnerId) => api.post(`/matches/${id}/complete`, { winnerId }),

  // Reset match
  resetMatch: (id) => api.post(`/matches/${id}/reset`),
};

export default matchService;
