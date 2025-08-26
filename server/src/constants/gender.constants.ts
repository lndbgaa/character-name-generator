export const GENDERS_ID = {
  MALE: 1,
  FEMALE: 2,
  NEUTRAL: 3,
} as const;

export const GENDERS_LABEL = {
  MALE: "male",
  FEMALE: "female",
  NEUTRAL: "neutral",
} as const;

export const GENDERS_DISPLAY = {
  MALE: "Male",
  FEMALE: "Female",
  NEUTRAL: "Neutral",
} as const;

export const GENDERS_MAP = {
  [GENDERS_ID.MALE]: GENDERS_LABEL.MALE,
  [GENDERS_ID.FEMALE]: GENDERS_LABEL.FEMALE,
  [GENDERS_ID.NEUTRAL]: GENDERS_LABEL.NEUTRAL,
} as const;

export const GENDERS_MAP_REVERSE = {
  [GENDERS_LABEL.MALE]: GENDERS_ID.MALE,
  [GENDERS_LABEL.FEMALE]: GENDERS_ID.FEMALE,
  [GENDERS_LABEL.NEUTRAL]: GENDERS_ID.NEUTRAL,
} as const;
