import athleteService from '../../services/athleteService';

describe('athleteService', () => {
  describe('getAllAthletes', () => {
    it('should fetch all athletes successfully', async () => {
      const response = await athleteService.getAllAthletes();
      
      expect(response.data).toBeDefined();
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBeGreaterThan(0);
      expect(response.data[0]).toHaveProperty('id');
      expect(response.data[0]).toHaveProperty('name');
      expect(response.data[0]).toHaveProperty('beltRank');
    });
  });

  describe('getAthleteById', () => {
    it('should fetch a specific athlete by ID', async () => {
      const athleteId = 1;
      const response = await athleteService.getAthleteById(athleteId);
      
      expect(response.data).toBeDefined();
      expect(response.data.id).toBe(athleteId);
      expect(response.data).toHaveProperty('name');
      expect(response.data).toHaveProperty('email');
    });

    it('should return 404 for non-existent athlete', async () => {
      const nonExistentId = 999;
      
      await expect(
        athleteService.getAthleteById(nonExistentId)
      ).rejects.toThrow();
    });
  });

  describe('registerAthlete', () => {
    it('should register a new athlete successfully', async () => {
      const newAthlete = {
        name: 'Test Athlete',
        dateOfBirth: '2000-01-01',
        gender: 'MALE',
        beltRank: 'WHITE',
        weight: 70.0,
        team: 'Test Team',
        coachName: 'Test Coach',
        email: 'test@test.com',
        phone: '+1111111111'
      };

      const response = await athleteService.registerAthlete(newAthlete);
      
      expect(response.data).toBeDefined();
      expect(response.data).toHaveProperty('id');
      expect(response.data.name).toBe(newAthlete.name);
      expect(response.data.email).toBe(newAthlete.email);
    });
  });

  describe('updateAthlete', () => {
    it('should update an existing athlete', async () => {
      const athleteId = 1;
      const updates = {
        weight: 80.0,
        team: 'Updated Team'
      };

      const response = await athleteService.updateAthlete(athleteId, updates);
      
      expect(response.data).toBeDefined();
      expect(response.data.id).toBe(athleteId);
      expect(response.data.weight).toBe(updates.weight);
      expect(response.data.team).toBe(updates.team);
    });
  });

  describe('deleteAthlete', () => {
    it('should delete an athlete successfully', async () => {
      const athleteId = 1;
      
      const response = await athleteService.deleteAthlete(athleteId);
      
      expect(response.status).toBe(204);
    });
  });

  describe('getAthletesByBelt', () => {
    it('should filter athletes by belt rank', async () => {
      const beltRank = 'BLUE';
      const response = await athleteService.getAthletesByBelt(beltRank);
      
      expect(response.data).toBeDefined();
      expect(Array.isArray(response.data)).toBe(true);
      response.data.forEach(athlete => {
        expect(athlete.beltRank).toBe(beltRank);
      });
    });
  });

  describe('searchAthletes', () => {
    it('should search athletes by name', async () => {
      const searchName = 'John';
      const response = await athleteService.searchAthletes(searchName);
      
      expect(response.data).toBeDefined();
      expect(Array.isArray(response.data)).toBe(true);
      response.data.forEach(athlete => {
        expect(athlete.name.toLowerCase()).toContain(searchName.toLowerCase());
      });
    });
  });

  describe('getAthletesByAge', () => {
    it('should filter athletes by age range', async () => {
      const minAge = 18;
      const maxAge = 30;
      
      const response = await athleteService.getAthletesByAge(minAge, maxAge);
      
      expect(response.data).toBeDefined();
      expect(Array.isArray(response.data)).toBe(true);
    });
  });
});
