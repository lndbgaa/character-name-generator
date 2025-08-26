export const AUTH_REFRESH_TOKEN_STATUSES = {
  ACTIVE: "active",
  REVOKED: "revoked",
  EXPIRED: "expired",
} as const;

export const PWD_RESET_TOKEN_STATUSES = {
  ACTIVE: "active",
  USED: "used",
  EXPIRED: "expired",
} as const;
