import {
  ACCOUNT_ALLOWED_SORT_FIELDS,
  ACCOUNT_ROLES_DISPLAY,
  ACCOUNT_ROLES_ID,
  ACCOUNT_ROLES_LABEL,
  ACCOUNT_STATUSES,
} from "@/constants/user.constants.js";

/* ===========================
 *    Constants-based Types
 * =========================== */

export type AccountRoleId = (typeof ACCOUNT_ROLES_ID)[keyof typeof ACCOUNT_ROLES_ID];
export type AccountRoleLabel = (typeof ACCOUNT_ROLES_LABEL)[keyof typeof ACCOUNT_ROLES_LABEL];
export type AccountRoleDisplay = (typeof ACCOUNT_ROLES_DISPLAY)[keyof typeof ACCOUNT_ROLES_DISPLAY];
export type AccountStatus = (typeof ACCOUNT_STATUSES)[keyof typeof ACCOUNT_STATUSES];
export type AccountAllowedSort = (typeof ACCOUNT_ALLOWED_SORT_FIELDS)[number];

/* ===========================
 *           DTOs
 * =========================== */

export interface PublicUserDTO {
  id: string;
  username: string;
  avatarUrl: string | null;
  createdAt: {
    date: string;
    time: string;
  };
}

export interface PrivateUserDTO extends PublicUserDTO {
  role: string;
  firstName: string;
  lastName: string;
  lastLogin: {
    date: string;
    time: string;
  };
}

export interface AdminUserDTO extends PrivateUserDTO {
  email: string;
  status: AccountStatus;
}

/* ===========================
 *     Payloads & Results
 * =========================== */

export interface UpdateUserData {
  username?: string;
  firstName?: string;
  lastName?: string;
  password?: string;
}

/* ===========================
 *          Queries
 * =========================== */
export interface GetUsersQuery {
  search?: string;
  role?: AccountRoleLabel;
  status?: AccountStatus;
  sortBy?: AccountAllowedSort;
  sortDir?: "asc" | "desc";
  page?: string;
  limit?: string;
}

/* ===========================
 *      Filters & Sorting
 * =========================== */

export interface GetUsersFilters {
  search?: string;
  role?: AccountRoleLabel;
  status?: AccountStatus;
}

export interface GetUserSortOptions {
  sort: AccountAllowedSort;
  dir: "ASC" | "DESC";
}
