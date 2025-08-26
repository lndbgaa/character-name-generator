import { NAME_LENGTHS, NAME_SORT_FIELDS, NAME_STATUSES } from "@/constants/name.constants.js";

import type { Name } from "@/models/index.js";
import type { DateTimeParts } from "@/types/common.types.js";
import type { GenderId, GenderLabel } from "@/types/gender.types.js";

/* ===========================
 *    Constants-based Types
 * =========================== */

export type NameLength = (typeof NAME_LENGTHS)[keyof typeof NAME_LENGTHS];
export type NameStatus = (typeof NAME_STATUSES)[keyof typeof NAME_STATUSES];
export type NamesAllowedSort = (typeof NAME_SORT_FIELDS)[number];

/* ===========================
 *           DTOs
 * =========================== */

export interface NamePublicDTO {
  id: string;
  value: string;
  type: string | null;
  gender: string | null;
  length: NameLength;
}

export interface NameAdminDTO {
  id: string;
  value: string;
  type: { id: number; label: string; displayName: string } | null;
  gender: { id: number; label: string; displayName: string } | null;
  length: NameLength;
  status: NameStatus;
  createdAt: DateTimeParts;
  updatedAt: DateTimeParts;
  deactivatedAt?: DateTimeParts;
  archivedAt?: DateTimeParts;
}

/* ===========================
 *     Payloads & Results
 * =========================== */

export interface CreateNamePayload {
  value: string;
  typeLabel: string;
  genderLabel: GenderLabel;
}

export type BulkNameResult = {
  created: Name[];
  skipped: string[];
  failed: { value: string; reason: string }[];
};

export interface UpdateNamePayload {
  value?: string;
  typeLabel?: string;
  genderLabel?: GenderLabel;
}

export interface UpdateNameFields {
  value?: string;
  typeId?: number;
  genderId?: GenderId;
}

/* ===========================
 *           Queries
 * =========================== */

export interface GetNamesQuery {
  search?: string;
  typeLabel?: string;
  genderLabel?: GenderLabel;
  charLength?: number;
  length?: NameLength;
  status?: NameStatus;
  sortBy?: NamesAllowedSort;
  sortDir?: "asc" | "desc";
  page?: string;
  limit?: string;
}

export interface GenerateRandomNamesQuery {
  size?: string;
  genderLabel?: GenderLabel;
  length?: NameLength;
  charLength?: number;
}

/* ===========================
 *      Filters & Sorting
 * =========================== */

export interface GetNamesFilters {
  search?: string;
  typeLabel?: string;
  genderLabel?: GenderLabel;
  charLength?: number;
  length?: NameLength;
  status?: NameStatus;
}

export interface GetNamesSortOptions {
  sort: NamesAllowedSort;
  dir: "ASC" | "DESC";
}

export interface GenerateNamesFilters {
  genderLabel?: GenderLabel;
  charLength?: number;
  length?: NameLength;
}
