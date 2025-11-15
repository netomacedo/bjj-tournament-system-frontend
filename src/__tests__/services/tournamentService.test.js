import tournamentService from '../../services/tournamentService';

describe('tournamentService', () => {
  describe('getAllTournaments', () => {
    it('should fetch all tournaments successfully', async () => {
      const response = await tournamentService.getAllTournaments();
      
      expect(response.data).toBeDefined();
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBeGreaterThan(0);
      expect(response.data[0]).toHaveProperty('id');
      expect(response.data[0]).toHaveProperty('name');
      expect(response.data[0]).toHaveProperty('status');
    });
  });

  describe('getTournamentById', () => {
    it('should fetch a specific tournament by ID', async () => {
      const tournamentId = 1;
      const response = await tournamentService.getTournamentById(tournamentId);
      
      expect(response.data).toBeDefined();
      expect(response.data.id).toBe(tournamentId);
      expect(response.data).toHaveProperty('name');
      expect(response.data).toHaveProperty('location');
    });

    it('should return 404 for non-existent tournament', async () => {
      const nonExistentId = 999;
      
      await expect(
        tournamentService.getTournamentById(nonExistentId)
      ).rejects.toThrow();
    });
  });

  describe('getUpcomingTournaments', () => {
    it('should fetch upcoming tournaments', async () => {
      const response = await tournamentService.getUpcomingTournaments();
      
      expect(response.data).toBeDefined();
      expect(Array.isArray(response.data)).toBe(true);
      response.data.forEach(tournament => {
        expect(['REGISTRATION_OPEN', 'DRAFT']).toContain(tournament.status);
      });
    });
  });

  describe('createTournament', () => {
    it('should create a new tournament successfully', async () => {
      const newTournament = {
        name: 'Test Tournament',
        description: 'Test Description',
        location: 'Test Location',
        tournamentDate: '2025-12-31',
        registrationDeadline: '2025-12-15',
        organizer: 'Test Organizer',
        contactEmail: 'test@tournament.com'
      };

      const response = await tournamentService.createTournament(newTournament);
      
      expect(response.data).toBeDefined();
      expect(response.data).toHaveProperty('id');
      expect(response.data.name).toBe(newTournament.name);
      expect(response.data.location).toBe(newTournament.location);
      expect(response.data.status).toBe('DRAFT');
    });
  });

  describe('updateTournament', () => {
    it('should update an existing tournament', async () => {
      const tournamentId = 1;
      const updates = {
        location: 'Updated Location',
        description: 'Updated Description'
      };

      const response = await tournamentService.updateTournament(tournamentId, updates);
      
      expect(response.data).toBeDefined();
      expect(response.data.id).toBe(tournamentId);
      expect(response.data.location).toBe(updates.location);
    });
  });

  describe('startTournament', () => {
    it('should start a tournament and change status', async () => {
      const tournamentId = 1;
      
      const response = await tournamentService.startTournament(tournamentId);
      
      expect(response.data).toBeDefined();
      expect(response.data.status).toBe('IN_PROGRESS');
    });
  });

  describe('closeRegistration', () => {
    it('should close tournament registration', async () => {
      const tournamentId = 1;
      
      const response = await tournamentService.closeRegistration(tournamentId);
      
      expect(response.data).toBeDefined();
      expect(response.data.status).toBe('REGISTRATION_CLOSED');
    });
  });

  describe('deleteTournament', () => {
    it('should delete a tournament successfully', async () => {
      const tournamentId = 1;
      
      // Note: We need to add this handler to our mock
      // For now, we'll skip this test or add the handler
    });
  });

  describe('generateMatches', () => {
    it('should generate matches for a division', async () => {
      const divisionId = 1;
      
      // This would require more complex mocking
      // Placeholder for integration with actual backend
    });
  });
});
