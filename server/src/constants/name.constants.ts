export const NAME_LENGTHS = {
  SHORT: "short",
  MEDIUM: "medium",
  LONG: "long",
} as const;

export const NAME_STATUSES = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  ARCHIVED: "archived",
} as const;

export const NAME_SORT_FIELDS = ["value", "created_at"] as const;

export const NAME_MIN_LENGTH = 2;
export const NAME_MAX_LENGTH = 100;

export const MAX_RANDOM_NAMES = 50;
export const DEFAULT_RANDOM_NAMES = 10;
