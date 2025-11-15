// Belt Ranks based on IBJJF system - matching backend exactly
export const BELT_RANKS = [
  // Kids belts (under 16)
  { value: 'WHITE_GREY', label: 'White-Grey', color: '#808080', isKidsBelt: true },
  { value: 'GREY', label: 'Grey', color: '#A9A9A9', isKidsBelt: true },
  { value: 'GREY_BLACK', label: 'Grey-Black', color: '#696969', isKidsBelt: true },
  { value: 'YELLOW_WHITE', label: 'Yellow-White', color: '#FFFF99', isKidsBelt: true },
  { value: 'YELLOW', label: 'Yellow', color: '#FFD700', isKidsBelt: true },
  { value: 'YELLOW_BLACK', label: 'Yellow-Black', color: '#B8860B', isKidsBelt: true },
  { value: 'ORANGE_WHITE', label: 'Orange-White', color: '#FFD599', isKidsBelt: true },
  { value: 'ORANGE', label: 'Orange', color: '#FFA500', isKidsBelt: true },
  { value: 'ORANGE_BLACK', label: 'Orange-Black', color: '#CC8400', isKidsBelt: true },
  { value: 'GREEN_WHITE', label: 'Green-White', color: '#90EE90', isKidsBelt: true },
  { value: 'GREEN', label: 'Green', color: '#00A000', isKidsBelt: true },
  { value: 'GREEN_BLACK', label: 'Green-Black', color: '#006400', isKidsBelt: true },
  // Adult belts (16+)
  { value: 'WHITE', label: 'White', color: '#FFFFFF', isKidsBelt: false },
  { value: 'BLUE', label: 'Blue', color: '#0000FF', isKidsBelt: false },
  { value: 'PURPLE', label: 'Purple', color: '#800080', isKidsBelt: false },
  { value: 'BROWN', label: 'Brown', color: '#8B4513', isKidsBelt: false },
  { value: 'BLACK', label: 'Black', color: '#000000', isKidsBelt: false },
  // Master belts
  { value: 'CORAL', label: 'Coral (Red-Black)', color: '#8B0000', isKidsBelt: false },
  { value: 'RED', label: 'Red', color: '#FF0000', isKidsBelt: false },
];

// Age Categories - matching backend exactly
export const AGE_CATEGORIES = [
  { value: 'MIGHTY_MITE', label: 'Mighty Mite (4-5 years)', minAge: 4, maxAge: 5, matchDuration: 3 },
  { value: 'TINY_TOT', label: 'Tiny Tot (6-7 years)', minAge: 6, maxAge: 7, matchDuration: 3 },
  { value: 'WEE_ONE', label: 'Wee One (8-9 years)', minAge: 8, maxAge: 9, matchDuration: 4 },
  { value: 'LITTLE_ONE', label: 'Little One (10-12 years)', minAge: 10, maxAge: 12, matchDuration: 4 },
  { value: 'PRE_TEEN', label: 'Pre-Teen (13-15 years)', minAge: 13, maxAge: 15, matchDuration: 5 },
  { value: 'JUVENILE', label: 'Juvenile (16-17 years)', minAge: 16, maxAge: 17, matchDuration: 5 },
  { value: 'ADULT', label: 'Adult (18-29 years)', minAge: 18, maxAge: 29, matchDuration: 5 },
  { value: 'MASTER_1', label: 'Master 1 (30-35 years)', minAge: 30, maxAge: 35, matchDuration: 5 },
  { value: 'MASTER_2', label: 'Master 2 (36-40 years)', minAge: 36, maxAge: 40, matchDuration: 5 },
  { value: 'MASTER_3', label: 'Master 3 (41-45 years)', minAge: 41, maxAge: 45, matchDuration: 5 },
  { value: 'MASTER_4', label: 'Master 4 (46-50 years)', minAge: 46, maxAge: 50, matchDuration: 5 },
  { value: 'MASTER_5', label: 'Master 5 (51-55 years)', minAge: 51, maxAge: 55, matchDuration: 5 },
  { value: 'MASTER_6', label: 'Master 6 (56-60 years)', minAge: 56, maxAge: 60, matchDuration: 4 },
  { value: 'MASTER_7', label: 'Master 7 (61+ years)', minAge: 61, maxAge: 100, matchDuration: 4 },
];

// Gender Options - matching backend exactly
export const GENDER_OPTIONS = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'NOT_APPLICABLE', label: 'Not Applicable (Kids under 10)' },
];

// Weight Classes - Adult Male (in kg)
export const WEIGHT_CLASSES_ADULT_MALE = [
  { value: 'ROOSTER', label: 'Rooster', max: 57.5 },
  { value: 'LIGHT_FEATHER', label: 'Light Feather', max: 64 },
  { value: 'FEATHER', label: 'Feather', max: 70 },
  { value: 'LIGHT', label: 'Light', max: 76 },
  { value: 'MIDDLE', label: 'Middle', max: 82.3 },
  { value: 'MEDIUM_HEAVY', label: 'Medium Heavy', max: 88.3 },
  { value: 'HEAVY', label: 'Heavy', max: 94.3 },
  { value: 'SUPER_HEAVY', label: 'Super Heavy', max: 100.5 },
  { value: 'ULTRA_HEAVY', label: 'Ultra Heavy', max: 1000 },
];

// Weight Classes - Adult Female (in kg)
export const WEIGHT_CLASSES_ADULT_FEMALE = [
  { value: 'ROOSTER', label: 'Rooster', max: 48.5 },
  { value: 'LIGHT_FEATHER', label: 'Light Feather', max: 53.5 },
  { value: 'FEATHER', label: 'Feather', max: 58.5 },
  { value: 'LIGHT', label: 'Light', max: 64 },
  { value: 'MIDDLE', label: 'Middle', max: 69 },
  { value: 'MEDIUM_HEAVY', label: 'Medium Heavy', max: 74 },
  { value: 'HEAVY', label: 'Heavy', max: 79.3 },
  { value: 'SUPER_HEAVY', label: 'Super Heavy', max: 1000 },
];

// Match Status
export const MATCH_STATUS = [
  { value: 'PENDING', label: 'Pending', color: '#FFA500' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: '#4169E1' },
  { value: 'COMPLETED', label: 'Completed', color: '#32CD32' },
  { value: 'CANCELLED', label: 'Cancelled', color: '#DC143C' },
  { value: 'WALKOVER', label: 'Walkover', color: '#FFD700' },
];

// Tournament Status
export const TOURNAMENT_STATUS = [
  { value: 'DRAFT', label: 'Draft', color: '#808080' },
  { value: 'REGISTRATION_OPEN', label: 'Registration Open', color: '#32CD32' },
  { value: 'REGISTRATION_CLOSED', label: 'Registration Closed', color: '#FFA500' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: '#4169E1' },
  { value: 'COMPLETED', label: 'Completed', color: '#800080' },
  { value: 'CANCELLED', label: 'Cancelled', color: '#DC143C' },
];

// Bracket Types
export const BRACKET_TYPES = [
  { value: 'SINGLE_ELIMINATION', label: 'Single Elimination' },
  { value: 'DOUBLE_ELIMINATION', label: 'Double Elimination' },
  { value: 'ROUND_ROBIN', label: 'Round Robin' },
];

// Submission Types
export const SUBMISSION_TYPES = [
  'Armbar',
  'Triangle',
  'Rear Naked Choke',
  'Kimura',
  'Guillotine',
  'Americana',
  'Omoplata',
  'Ezekiel Choke',
  'Bow and Arrow',
  'Ankle Lock',
  'Heel Hook',
  'Toe Hold',
  'Kneebar',
  'Other',
];

// Point Values
export const POINT_VALUES = {
  TAKEDOWN: 2,
  SWEEP: 2,
  KNEE_ON_BELLY: 2,
  GUARD_PASS: 3,
  MOUNT: 4,
  BACK_CONTROL: 4,
};

export default {
  BELT_RANKS,
  AGE_CATEGORIES,
  GENDER_OPTIONS,
  WEIGHT_CLASSES_ADULT_MALE,
  WEIGHT_CLASSES_ADULT_FEMALE,
  MATCH_STATUS,
  TOURNAMENT_STATUS,
  BRACKET_TYPES,
  SUBMISSION_TYPES,
  POINT_VALUES,
};
