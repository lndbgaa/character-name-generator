export const REFRESH_TOKEN_STATUSES = {
  ACTIVE: "active",
  REVOKED: "revoked",
  EXPIRED: "expired",
} as const;

export const EMAIL_VERIFICATION_TOKEN_STATUSES = {
  ACTIVE: "active",
  USED: "used",
  EXPIRED: "expired",
} as const;

export const PASSWORD_RESET_TOKEN_STATUSES = {
  ACTIVE: "active",
  USED: "used",
  EXPIRED: "expired",
} as const;
