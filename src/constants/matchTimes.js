// IBJJF Match Times (in seconds)

// Adult Belt Ranks
export const ADULT_MATCH_TIMES = {
  'WHITE': 5 * 60,      // 5 minutes
  'BLUE': 6 * 60,       // 6 minutes
  'PURPLE': 7 * 60,     // 7 minutes
  'BROWN': 8 * 60,      // 8 minutes
  'BLACK': 10 * 60,     // 10 minutes
};

// Youth Age Categories
export const YOUTH_MATCH_TIMES = {
  'MM1': 2 * 60,        // Mighty Mite 1 (4-5 years): 2 minutes
  'MM2': 2 * 60,        // Mighty Mite 2 (6-7 years): 2 minutes
  'PW1': 3 * 60,        // Pee Wee 1 (8 years): 3 minutes
  'PW2': 3 * 60,        // Pee Wee 2 (9 years): 3 minutes
  'JR1': 3 * 60,        // Junior 1 (10 years): 3 minutes
  'JR2': 3 * 60,        // Junior 2 (11 years): 3 minutes
  'T1': 4 * 60,         // Teen 1 (12 years): 4 minutes
  'T2': 4 * 60,         // Teen 2 (13 years): 4 minutes
  'T3': 4 * 60,         // Teen 3 (14-15 years): 4 minutes
};

// Age category patterns for matching
export const AGE_CATEGORY_PATTERNS = {
  'MIGHTY_MITE': /mighty\s*mite|mm\d?|4-7|4\s*-?\s*7|5-7|6-7/i,
  'PEE_WEE': /pee\s*wee|pw\d?|8-9|8\s*years?|9\s*years?/i,
  'JUNIOR': /junior|jr\d?|10-11|10\s*years?|11\s*years?/i,
  'TEEN': /teen|t\d?|12-15|12\s*years?|13\s*years?|14\s*years?|15\s*years?/i,
};

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

  // Check if it's a youth division based on age category
  if (AGE_CATEGORY_PATTERNS.MIGHTY_MITE.test(ageCategory)) {
    console.log('[MatchTimes] Matched MIGHTY_MITE - 2 minutes');
    return YOUTH_MATCH_TIMES.MM1; // 2 minutes
  }
  if (AGE_CATEGORY_PATTERNS.PEE_WEE.test(ageCategory)) {
    console.log('[MatchTimes] Matched PEE_WEE - 3 minutes');
    return YOUTH_MATCH_TIMES.PW1; // 3 minutes
  }
  if (AGE_CATEGORY_PATTERNS.JUNIOR.test(ageCategory)) {
    console.log('[MatchTimes] Matched JUNIOR - 3 minutes');
    return YOUTH_MATCH_TIMES.JR1; // 3 minutes
  }
  if (AGE_CATEGORY_PATTERNS.TEEN.test(ageCategory)) {
    console.log('[MatchTimes] Matched TEEN - 4 minutes');
    return YOUTH_MATCH_TIMES.T1; // 4 minutes
  }

  // Check for general youth keywords
  if (/youth|kids?|children|juvenile|crianca/i.test(ageCategory)) {
    console.log('[MatchTimes] Matched youth keyword - 3 minutes default');
    return 3 * 60;
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
