// IBJJF Match Times (in seconds)

import { AGE_CATEGORIES } from './index';

// Adult Belt Ranks
export const ADULT_MATCH_TIMES = {
  'WHITE': 5 * 60,      // 5 minutes
  'BLUE': 6 * 60,       // 6 minutes
  'PURPLE': 7 * 60,     // 7 minutes
  'BROWN': 8 * 60,      // 8 minutes
  'BLACK': 10 * 60,     // 10 minutes
};

// Youth categories use a flat duration by age (no belt-based scaling), driven
// by AGE_CATEGORIES (constants/index.js), which mirrors the backend AgeCategory enum.
const YOUTH_AGE_CATEGORY_VALUES = ['MIGHTY_MITE', 'TINY_TOT', 'WEE_ONE', 'LITTLE_ONE', 'PRE_TEEN'];

/**
 * Get match duration based on division info
 * @param {Object} division - Division object with beltRank and ageCategory
 * @returns {number} Match duration in seconds
 */
export const getMatchDuration = (division) => {
  if (!division) {
    console.log('[MatchTimes] No division provided, defaulting to 5 minutes');
    return 5 * 60; // Default 5 minutes
  }

  const ageCategory = division.ageCategory?.toUpperCase() || '';
  const beltRank = division.beltRank?.toUpperCase() || '';

  console.log('[MatchTimes] Division data:', {
    name: division.name,
    ageCategory,
    beltRank,
    fullDivision: division
  });

  // Youth divisions use a flat per-category duration (exact match against the
  // backend-mirrored AGE_CATEGORIES), not belt rank
  if (YOUTH_AGE_CATEGORY_VALUES.includes(ageCategory)) {
    const category = AGE_CATEGORIES.find((c) => c.value === ageCategory);
    if (category) {
      console.log(`[MatchTimes] Matched ${ageCategory} - ${category.matchDuration} minutes`);
      return category.matchDuration * 60;
    }
  }

  // Adult division - use belt rank
  if (beltRank.includes('WHITE')) {
    console.log('[MatchTimes] Adult WHITE belt - 5 minutes');
    return ADULT_MATCH_TIMES.WHITE;
  }
  if (beltRank.includes('BLUE') || beltRank.includes('AZUL')) {
    console.log('[MatchTimes] Adult BLUE belt - 6 minutes');
    return ADULT_MATCH_TIMES.BLUE;
  }
  if (beltRank.includes('PURPLE') || beltRank.includes('ROXA')) {
    console.log('[MatchTimes] Adult PURPLE belt - 7 minutes');
    return ADULT_MATCH_TIMES.PURPLE;
  }
  if (beltRank.includes('BROWN') || beltRank.includes('MARROM')) {
    console.log('[MatchTimes] Adult BROWN belt - 8 minutes');
    return ADULT_MATCH_TIMES.BROWN;
  }
  if (beltRank.includes('BLACK') || beltRank.includes('PRETA')) {
    console.log('[MatchTimes] Adult BLACK belt - 10 minutes');
    return ADULT_MATCH_TIMES.BLACK;
  }

  // Default to white belt time (5 minutes)
  console.log('[MatchTimes] No match found, defaulting to 5 minutes');
  return ADULT_MATCH_TIMES.WHITE;
};
