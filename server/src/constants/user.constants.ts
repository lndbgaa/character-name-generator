export const ACCOUNT_ROLES_ID = {
  ADMIN: 1,
  USER: 2,
} as const;

export const ACCOUNT_ROLES_LABEL = {
  ADMIN: "admin",
  USER: "user",
} as const;

export const ACCOUNT_ROLES_MAP = {
  [ACCOUNT_ROLES_ID.ADMIN]: ACCOUNT_ROLES_LABEL.ADMIN,
  [ACCOUNT_ROLES_ID.USER]: ACCOUNT_ROLES_LABEL.USER,
} as const;

export const ACCOUNT_ROLES_MAP_REVERSE = {
  [ACCOUNT_ROLES_LABEL.ADMIN]: ACCOUNT_ROLES_ID.ADMIN,
  [ACCOUNT_ROLES_LABEL.USER]: ACCOUNT_ROLES_ID.USER,
} as const;

export const ACCOUNT_STATUSES = {
  ACTIVE: "active",
  SUSPENDED: "suspended",
  DELETED: "deleted",
} as const;

export const USER_ALLOWED_SORT_FIELDS = [
  "email",
  "username",
  "first_name",
  "last_name",
  "created_at",
] as const;
