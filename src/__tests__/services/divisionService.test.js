import divisionService from '../../services/divisionService';
import api from '../../services/api';

// Mock the api module
jest.mock('../../services/api');

describe('divisionService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getDivisionById', () => {
    it('should fetch a specific division by ID', async () => {
      const mockDivision = {
        id: 1,
        name: 'Adult Male Blue Belt Medium Heavy',
        beltRank: 'BLUE',
        ageCategory: 'ADULT',
        gender: 'MALE',
        weightClass: 'MEDIUM_HEAVY',
        bracketType: 'SINGLE_ELIMINATION',
        athleteCount: 8
      };

      api.get.mockResolvedValue({ data: mockDivision });

      const response = await divisionService.getDivisionById(1);

      expect(api.get).toHaveBeenCalledWith('/divisions/1');
      expect(response.data).toEqual(mockDivision);
    });

    it('should handle error when division not found', async () => {
      api.get.mockRejectedValue(new Error('Division not found'));

      await expect(divisionService.getDivisionById(999)).rejects.toThrow('Division not found');
      expect(api.get).toHaveBeenCalledWith('/divisions/999');
    });
  });

  describe('getTournamentDivisions', () => {
    it('should fetch all divisions for a tournament', async () => {
      const mockDivisions = [
        {
          id: 1,
          name: 'Adult Male Blue Belt Medium Heavy',
          beltRank: 'BLUE',
          ageCategory: 'ADULT',
          gender: 'MALE',
          athleteCount: 8
        },
        {
          id: 2,
          name: 'Adult Female Blue Belt Light',
          beltRank: 'BLUE',
          ageCategory: 'ADULT',
          gender: 'FEMALE',
          athleteCount: 6
        }
      ];

      api.get.mockResolvedValue({ data: mockDivisions });

      const response = await divisionService.getTournamentDivisions(1);

      expect(api.get).toHaveBeenCalledWith('/tournaments/1/divisions');
      expect(response.data).toEqual(mockDivisions);
      expect(response.data).toHaveLength(2);
    });

    it('should return empty array when tournament has no divisions', async () => {
      api.get.mockResolvedValue({ data: [] });

      const response = await divisionService.getTournamentDivisions(1);

      expect(response.data).toEqual([]);
      expect(response.data).toHaveLength(0);
    });
  });

  describe('createDivision', () => {
    it('should create a new division successfully', async () => {
      const newDivisionData = {
        beltRank: 'BLUE',
        ageCategory: 'ADULT',
        gender: 'MALE',
        weightClass: 'MEDIUM_HEAVY',
        bracketType: 'SINGLE_ELIMINATION'
      };

      const mockCreatedDivision = {
        id: 1,
        ...newDivisionData,
        name: 'Adult Male Blue Belt Medium Heavy',
        athleteCount: 0,
        matchesGenerated: false
      };

      api.post.mockResolvedValue({ data: mockCreatedDivision, status: 201 });

      const response = await divisionService.createDivision(1, newDivisionData);

      expect(api.post).toHaveBeenCalledWith('/tournaments/1/divisions', newDivisionData);
      expect(response.data).toEqual(mockCreatedDivision);
      expect(response.status).toBe(201);
    });

    it('should handle validation error when creating duplicate division', async () => {
      const duplicateDivision = {
        beltRank: 'BLUE',
        ageCategory: 'ADULT',
        gender: 'MALE',
        weightClass: 'MEDIUM_HEAVY',
        bracketType: 'SINGLE_ELIMINATION'
      };

      api.post.mockRejectedValue({
        response: {
          status: 400,
          data: { message: 'Division already exists for this category' }
        }
      });

      await expect(divisionService.createDivision(1, duplicateDivision)).rejects.toMatchObject({
        response: {
          status: 400,
          data: { message: 'Division already exists for this category' }
        }
      });
    });
  });

  describe('updateDivision', () => {
    it('should update a division successfully', async () => {
      const updatedData = {
        bracketType: 'DOUBLE_ELIMINATION'
      };

      const mockUpdatedDivision = {
        id: 1,
        beltRank: 'BLUE',
        ageCategory: 'ADULT',
        gender: 'MALE',
        weightClass: 'MEDIUM_HEAVY',
        bracketType: 'DOUBLE_ELIMINATION',
        athleteCount: 8
      };

      api.put.mockResolvedValue({ data: mockUpdatedDivision });

      const response = await divisionService.updateDivision(1, updatedData);

      expect(api.put).toHaveBeenCalledWith('/divisions/1', updatedData);
      expect(response.data.bracketType).toBe('DOUBLE_ELIMINATION');
    });
  });

  describe('deleteDivision', () => {
    it('should delete a division successfully', async () => {
      api.delete.mockResolvedValue({ status: 204 });

      const response = await divisionService.deleteDivision(1);

      expect(api.delete).toHaveBeenCalledWith('/divisions/1');
      expect(response.status).toBe(204);
    });

    it('should handle error when deleting division with enrolled athletes', async () => {
      api.delete.mockRejectedValue({
        response: {
          status: 400,
          data: { message: 'Cannot delete division with enrolled athletes' }
        }
      });

      await expect(divisionService.deleteDivision(1)).rejects.toMatchObject({
        response: {
          status: 400
        }
      });
    });
  });

  describe('enrollAthlete', () => {
    it('should enroll an athlete in a division', async () => {
      const mockResponse = {
        divisionId: 1,
        athleteId: 5,
        enrolledAt: '2025-11-15T10:00:00'
      };

      api.post.mockResolvedValue({ data: mockResponse, status: 200 });

      const response = await divisionService.enrollAthlete(1, 5);

      expect(api.post).toHaveBeenCalledWith('/divisions/1/athletes/5');
      expect(response.data).toEqual(mockResponse);
    });

    it('should handle error when athlete is already enrolled', async () => {
      api.post.mockRejectedValue({
        response: {
          status: 400,
          data: { message: 'Athlete already enrolled in this division' }
        }
      });

      await expect(divisionService.enrollAthlete(1, 5)).rejects.toMatchObject({
        response: {
          status: 400,
          data: { message: 'Athlete already enrolled in this division' }
        }
      });
    });

    it('should handle error when athlete does not meet division criteria', async () => {
      api.post.mockRejectedValue({
        response: {
          status: 400,
          data: { message: 'Athlete does not meet division requirements (belt/age/gender/weight)' }
        }
      });

      await expect(divisionService.enrollAthlete(1, 5)).rejects.toMatchObject({
        response: {
          status: 400
        }
      });
    });
  });

  describe('removeAthlete', () => {
    it('should remove an athlete from a division', async () => {
      api.delete.mockResolvedValue({ status: 204 });

      const response = await divisionService.removeAthlete(1, 5);

      expect(api.delete).toHaveBeenCalledWith('/divisions/1/athletes/5');
      expect(response.status).toBe(204);
    });

    it('should handle error when athlete is not enrolled', async () => {
      api.delete.mockRejectedValue({
        response: {
          status: 404,
          data: { message: 'Athlete not found in division' }
        }
      });

      await expect(divisionService.removeAthlete(1, 999)).rejects.toMatchObject({
        response: {
          status: 404
        }
      });
    });
  });

  describe('getDivisionAthletes', () => {
    it('should fetch all athletes in a division', async () => {
      const mockAthletes = [
        {
          id: 1,
          name: 'John Doe',
          beltRank: 'BLUE',
          weight: 82.5,
          gender: 'MALE'
        },
        {
          id: 2,
          name: 'Jane Smith',
          beltRank: 'BLUE',
          weight: 79.0,
          gender: 'MALE'
        }
      ];

      api.get.mockResolvedValue({ data: mockAthletes });

      const response = await divisionService.getDivisionAthletes(1);

      expect(api.get).toHaveBeenCalledWith('/divisions/1/athletes');
      expect(response.data).toEqual(mockAthletes);
      expect(response.data).toHaveLength(2);
    });

    it('should return empty array when division has no athletes', async () => {
      api.get.mockResolvedValue({ data: [] });

      const response = await divisionService.getDivisionAthletes(1);

      expect(response.data).toEqual([]);
    });
  });

  describe('generateMatches', () => {
    it('should generate matches automatically for a division', async () => {
      const mockMatchesResponse = {
        divisionId: 1,
        matchesGenerated: 4,
        bracketCreated: true
      };

      api.post.mockResolvedValue({ data: mockMatchesResponse });

      const response = await divisionService.generateMatches(1);

      expect(api.post).toHaveBeenCalledWith('/tournaments/divisions/1/generate-matches');
      expect(response.data.matchesGenerated).toBe(4);
      expect(response.data.bracketCreated).toBe(true);
    });

    it('should handle error when division has insufficient athletes', async () => {
      api.post.mockRejectedValue({
        response: {
          status: 400,
          data: { message: 'Division must have at least 2 athletes to generate matches' }
        }
      });

      await expect(divisionService.generateMatches(1)).rejects.toMatchObject({
        response: {
          status: 400,
          data: { message: 'Division must have at least 2 athletes to generate matches' }
        }
      });
    });

    it('should handle error when matches already generated', async () => {
      api.post.mockRejectedValue({
        response: {
          status: 400,
          data: { message: 'Matches already generated for this division' }
        }
      });

      await expect(divisionService.generateMatches(1)).rejects.toMatchObject({
        response: {
          status: 400
        }
      });
    });
  });

  describe('generateMatchesManual', () => {
    it('should generate matches manually with custom pairings', async () => {
      const matchPairs = [
        { athlete1Id: 1, athlete2Id: 2 },
        { athlete1Id: 3, athlete2Id: 4 }
      ];

      const mockResponse = {
        divisionId: 1,
        matchesGenerated: 2,
        bracketCreated: true
      };

      api.post.mockResolvedValue({ data: mockResponse });

      const response = await divisionService.generateMatchesManual(1, matchPairs);

      expect(api.post).toHaveBeenCalledWith('/tournaments/divisions/1/generate-matches-manual', matchPairs);
      expect(response.data.matchesGenerated).toBe(2);
    });

    it('should handle error when match pairs contain duplicate athletes', async () => {
      const invalidPairs = [
        { athlete1Id: 1, athlete2Id: 1 }
      ];

      api.post.mockRejectedValue({
        response: {
          status: 400,
          data: { message: 'Invalid match pairing: athlete cannot compete against themselves' }
        }
      });

      await expect(divisionService.generateMatchesManual(1, invalidPairs)).rejects.toMatchObject({
        response: {
          status: 400
        }
      });
    });

    it('should handle error when athlete is not enrolled in division', async () => {
      const invalidPairs = [
        { athlete1Id: 1, athlete2Id: 999 }
      ];

      api.post.mockRejectedValue({
        response: {
          status: 400,
          data: { message: 'Athlete not enrolled in division' }
        }
      });

      await expect(divisionService.generateMatchesManual(1, invalidPairs)).rejects.toMatchObject({
        response: {
          status: 400
        }
      });
    });
  });
});