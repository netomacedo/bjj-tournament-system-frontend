import api from './api';

const athleteService = {
  // Get all athletes
  getAllAthletes: () => api.get('/athletes'),

  // Get athlete by ID
  getAthleteById: (id) => api.get(`/athletes/${id}`),

  // Register new athlete
  registerAthlete: (athleteData) => api.post('/athletes', athleteData),

  // Update athlete
  updateAthlete: (id, athleteData) => api.put(`/athletes/${id}`, athleteData),

  // Delete athlete
  deleteAthlete: (id) => api.delete(`/athletes/${id}`),

  // Get athletes by belt rank
  getAthletesByBelt: (beltRank) => api.get(`/athletes/belt/${beltRank}`),

  // Get athletes by age range
  getAthletesByAge: (minAge, maxAge) => api.get(`/athletes/age`, {
    params: { min: minAge, max: maxAge }
  }),

  // Search athletes by name
  searchAthletes: (name) => api.get(`/athletes/search`, {
    params: { name }
  }),

  // Get athletes by team
  getAthletesByTeam: (team) => api.get(`/athletes/team/${team}`),
};

export default athleteService;
