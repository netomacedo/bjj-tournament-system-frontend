import api from './api';

const tournamentService = {
  // Get all tournaments
  getAllTournaments: () => api.get('/tournaments'),

  // Get tournament by ID
  getTournamentById: (id) => api.get(`/tournaments/${id}`),

  // Get upcoming tournaments
  getUpcomingTournaments: () => api.get('/tournaments/upcoming'),

  // Create new tournament
  createTournament: (tournamentData) => api.post('/tournaments', tournamentData),

  // Update tournament
  updateTournament: (id, tournamentData) => api.put(`/tournaments/${id}`, tournamentData),

  // Delete tournament
  deleteTournament: (id) => api.delete(`/tournaments/${id}`),

  // Start tournament
  startTournament: (id) => api.post(`/tournaments/${id}/start`),

  // Close registration
  closeRegistration: (id) => api.post(`/tournaments/${id}/close-registration`),

  // Complete tournament
  completeTournament: (id) => api.post(`/tournaments/${id}/complete`),

  // Generate matches automatically
  generateMatches: (divisionId) => api.post(`/tournaments/divisions/${divisionId}/generate-matches`),

  // Generate matches manually
  generateMatchesManual: (divisionId, matchData) => 
    api.post(`/tournaments/divisions/${divisionId}/generate-matches-manual`, matchData),

  // Get divisions for a tournament
  getTournamentDivisions: (tournamentId) => api.get(`/tournaments/${tournamentId}/divisions`),
};

export default tournamentService;
