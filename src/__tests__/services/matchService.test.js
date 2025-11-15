import matchService from '../../services/matchService';

describe('matchService', () => {
  describe('getMatchById', () => {
    it('should fetch a specific match by ID', async () => {
      const matchId = 1;
      const response = await matchService.getMatchById(matchId);
      
      expect(response.data).toBeDefined();
      expect(response.data.id).toBe(matchId);
      expect(response.data).toHaveProperty('athlete1Id');
      expect(response.data).toHaveProperty('athlete2Id');
      expect(response.data).toHaveProperty('status');
    });

    it('should return 404 for non-existent match', async () => {
      const nonExistentId = 999;
      
      await expect(
        matchService.getMatchById(nonExistentId)
      ).rejects.toThrow();
    });
  });

  describe('updateMatch', () => {
    it('should update match scores', async () => {
      const matchId = 1;
      const updates = {
        athlete1Points: 4,
        athlete2Points: 2,
        athlete1Advantages: 1,
        athlete2Advantages: 0
      };

      const response = await matchService.updateMatch(matchId, updates);
      
      expect(response.data).toBeDefined();
      expect(response.data.id).toBe(matchId);
      expect(response.data.athlete1Points).toBe(updates.athlete1Points);
      expect(response.data.athlete2Points).toBe(updates.athlete2Points);
    });
  });

  describe('startMatch', () => {
    it('should start a match and change status', async () => {
      const matchId = 1;
      
      const response = await matchService.startMatch(matchId);
      
      expect(response.data).toBeDefined();
      expect(response.data.status).toBe('IN_PROGRESS');
    });
  });

  describe('recordSubmission', () => {
    it('should record a submission for a match', async () => {
      const matchId = 1;
      const submissionData = {
        winnerId: 1,
        submissionType: 'Triangle',
        timeOfSubmission: '3:45'
      };

      // This would require adding the handler
      // Placeholder for actual implementation
    });
  });

  describe('assignMat', () => {
    it('should assign a match to a specific mat', async () => {
      const matchId = 1;
      const matNumber = 2;

      // This would require adding the handler
      // Placeholder for actual implementation
    });
  });

  describe('getMatchesByDivision', () => {
    it('should fetch all matches in a division', async () => {
      const divisionId = 1;
      
      // This would require adding the handler with division filtering
      // Placeholder for actual implementation
    });
  });

  describe('getAthleteMatches', () => {
    it('should fetch all matches for a specific athlete', async () => {
      const athleteId = 1;
      
      // This would require adding the handler with athlete filtering
      // Placeholder for actual implementation
    });
  });
});
