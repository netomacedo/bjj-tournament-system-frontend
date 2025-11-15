import {
  BELT_RANKS,
  AGE_CATEGORIES,
  GENDER_OPTIONS,
  WEIGHT_CLASSES_ADULT_MALE,
  WEIGHT_CLASSES_ADULT_FEMALE,
  MATCH_STATUS,
  TOURNAMENT_STATUS,
  BRACKET_TYPES,
  SUBMISSION_TYPES,
  POINT_VALUES
} from '../../constants';

describe('Constants', () => {
  describe('BELT_RANKS', () => {
    it('should have all belt ranks', () => {
      expect(BELT_RANKS).toBeDefined();
      expect(Array.isArray(BELT_RANKS)).toBe(true);
      expect(BELT_RANKS.length).toBeGreaterThan(0);
    });

    it('should have correct structure for each belt', () => {
      BELT_RANKS.forEach(belt => {
        expect(belt).toHaveProperty('value');
        expect(belt).toHaveProperty('label');
        expect(belt).toHaveProperty('color');
      });
    });

    it('should include major belt ranks', () => {
      const values = BELT_RANKS.map(b => b.value);
      expect(values).toContain('WHITE');
      expect(values).toContain('BLUE');
      expect(values).toContain('PURPLE');
      expect(values).toContain('BROWN');
      expect(values).toContain('BLACK');
    });

    it('should include kids belt ranks', () => {
      const values = BELT_RANKS.map(b => b.value);
      expect(values).toContain('GREY');
      expect(values).toContain('YELLOW');
      expect(values).toContain('ORANGE');
      expect(values).toContain('GREEN');
    });
  });

  describe('AGE_CATEGORIES', () => {
    it('should have all age categories', () => {
      expect(AGE_CATEGORIES).toBeDefined();
      expect(Array.isArray(AGE_CATEGORIES)).toBe(true);
      expect(AGE_CATEGORIES.length).toBeGreaterThan(0);
    });

    it('should have correct structure for each category', () => {
      AGE_CATEGORIES.forEach(category => {
        expect(category).toHaveProperty('value');
        expect(category).toHaveProperty('label');
        expect(category).toHaveProperty('minAge');
        expect(category).toHaveProperty('maxAge');
      });
    });

    it('should include main categories', () => {
      const values = AGE_CATEGORIES.map(c => c.value);
      expect(values).toContain('ADULT');
      expect(values).toContain('JUVENILE');
      expect(values).toContain('MASTER_1');
    });

    it('should have valid age ranges', () => {
      AGE_CATEGORIES.forEach(category => {
        expect(category.minAge).toBeLessThanOrEqual(category.maxAge);
        expect(category.minAge).toBeGreaterThan(0);
      });
    });
  });

  describe('GENDER_OPTIONS', () => {
    it('should have gender options', () => {
      expect(GENDER_OPTIONS).toBeDefined();
      expect(Array.isArray(GENDER_OPTIONS)).toBe(true);
      expect(GENDER_OPTIONS.length).toBe(2);
    });

    it('should include MALE and FEMALE', () => {
      const values = GENDER_OPTIONS.map(g => g.value);
      expect(values).toContain('MALE');
      expect(values).toContain('FEMALE');
    });
  });

  describe('WEIGHT_CLASSES_ADULT_MALE', () => {
    it('should have weight classes', () => {
      expect(WEIGHT_CLASSES_ADULT_MALE).toBeDefined();
      expect(Array.isArray(WEIGHT_CLASSES_ADULT_MALE)).toBe(true);
    });

    it('should have correct structure', () => {
      WEIGHT_CLASSES_ADULT_MALE.forEach(wc => {
        expect(wc).toHaveProperty('value');
        expect(wc).toHaveProperty('label');
        expect(wc).toHaveProperty('max');
      });
    });

    it('should include standard weight classes', () => {
      const values = WEIGHT_CLASSES_ADULT_MALE.map(wc => wc.value);
      expect(values).toContain('ROOSTER');
      expect(values).toContain('FEATHER');
      expect(values).toContain('MIDDLE');
      expect(values).toContain('HEAVY');
    });
  });

  describe('WEIGHT_CLASSES_ADULT_FEMALE', () => {
    it('should have weight classes', () => {
      expect(WEIGHT_CLASSES_ADULT_FEMALE).toBeDefined();
      expect(Array.isArray(WEIGHT_CLASSES_ADULT_FEMALE)).toBe(true);
    });

    it('should have lighter weight limits than male', () => {
      // Female weight classes should generally have lower maximums
      const firstMale = WEIGHT_CLASSES_ADULT_MALE[0].max;
      const firstFemale = WEIGHT_CLASSES_ADULT_FEMALE[0].max;
      expect(firstFemale).toBeLessThan(firstMale);
    });
  });

  describe('MATCH_STATUS', () => {
    it('should have match statuses', () => {
      expect(MATCH_STATUS).toBeDefined();
      expect(Array.isArray(MATCH_STATUS)).toBe(true);
    });

    it('should include main statuses', () => {
      const values = MATCH_STATUS.map(s => s.value);
      expect(values).toContain('PENDING');
      expect(values).toContain('IN_PROGRESS');
      expect(values).toContain('COMPLETED');
    });

    it('should have colors for each status', () => {
      MATCH_STATUS.forEach(status => {
        expect(status).toHaveProperty('color');
        expect(status.color).toMatch(/^#[0-9A-F]{6}$/i);
      });
    });
  });

  describe('TOURNAMENT_STATUS', () => {
    it('should have tournament statuses', () => {
      expect(TOURNAMENT_STATUS).toBeDefined();
      expect(Array.isArray(TOURNAMENT_STATUS)).toBe(true);
    });

    it('should include main statuses', () => {
      const values = TOURNAMENT_STATUS.map(s => s.value);
      expect(values).toContain('DRAFT');
      expect(values).toContain('REGISTRATION_OPEN');
      expect(values).toContain('IN_PROGRESS');
      expect(values).toContain('COMPLETED');
    });
  });

  describe('BRACKET_TYPES', () => {
    it('should have bracket types', () => {
      expect(BRACKET_TYPES).toBeDefined();
      expect(Array.isArray(BRACKET_TYPES)).toBe(true);
    });

    it('should include main bracket types', () => {
      const values = BRACKET_TYPES.map(b => b.value);
      expect(values).toContain('SINGLE_ELIMINATION');
      expect(values).toContain('DOUBLE_ELIMINATION');
      expect(values).toContain('ROUND_ROBIN');
    });
  });

  describe('SUBMISSION_TYPES', () => {
    it('should have submission types', () => {
      expect(SUBMISSION_TYPES).toBeDefined();
      expect(Array.isArray(SUBMISSION_TYPES)).toBe(true);
      expect(SUBMISSION_TYPES.length).toBeGreaterThan(0);
    });

    it('should include common submissions', () => {
      expect(SUBMISSION_TYPES).toContain('Armbar');
      expect(SUBMISSION_TYPES).toContain('Triangle');
      expect(SUBMISSION_TYPES).toContain('Rear Naked Choke');
    });

    it('should have "Other" option', () => {
      expect(SUBMISSION_TYPES).toContain('Other');
    });
  });

  describe('POINT_VALUES', () => {
    it('should have point values for scoring', () => {
      expect(POINT_VALUES).toBeDefined();
      expect(typeof POINT_VALUES).toBe('object');
    });

    it('should have correct IBJJF point values', () => {
      expect(POINT_VALUES.TAKEDOWN).toBe(2);
      expect(POINT_VALUES.SWEEP).toBe(2);
      expect(POINT_VALUES.KNEE_ON_BELLY).toBe(2);
      expect(POINT_VALUES.GUARD_PASS).toBe(3);
      expect(POINT_VALUES.MOUNT).toBe(4);
      expect(POINT_VALUES.BACK_CONTROL).toBe(4);
    });

    it('should have all required point types', () => {
      expect(POINT_VALUES).toHaveProperty('TAKEDOWN');
      expect(POINT_VALUES).toHaveProperty('SWEEP');
      expect(POINT_VALUES).toHaveProperty('GUARD_PASS');
      expect(POINT_VALUES).toHaveProperty('MOUNT');
      expect(POINT_VALUES).toHaveProperty('BACK_CONTROL');
    });
  });
});
