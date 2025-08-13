import {
  ACCOUNT_ROLES_ID,
  ACCOUNT_ROLES_LABEL,
  ACCOUNT_STATUSES,
  USER_ALLOWED_SORT_FIELDS,
} from "@/constants/user.constants.js";

export type AccountRoleId = (typeof ACCOUNT_ROLES_ID)[keyof typeof ACCOUNT_ROLES_ID];

export type AccountRoleLabel = (typeof ACCOUNT_ROLES_LABEL)[keyof typeof ACCOUNT_ROLES_LABEL];

export type AccountStatus = (typeof ACCOUNT_STATUSES)[keyof typeof ACCOUNT_STATUSES];

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
 *          Filters
 * =========================== */

export interface GetUsersFilters {
  search?: string;
  roleId?: number;
  status?: AccountStatus;
}

/* ===========================
 *         Sort
 * =========================== */

export type UserAllowedSort = (typeof USER_ALLOWED_SORT_FIELDS)[number];

export interface GetUserSortOptions {
  sort: UserAllowedSort;
  dir: "ASC" | "DESC";
}
