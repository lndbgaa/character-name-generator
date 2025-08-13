import { NAME_LENGTHS, NAME_STATUSES } from "@/constants/name.constants.js";

import type { Name } from "@/models/index.js";
import type { DateTimeParts } from "@/types/common.types.js";

export type NameLength = (typeof NAME_LENGTHS)[keyof typeof NAME_LENGTHS];

export type NameStatus = (typeof NAME_STATUSES)[keyof typeof NAME_STATUSES];

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

export interface CreateNameData {
  value: string;
  typeId: number;
  genderId: number;
}

export type BulkNameResult = {
  created: Name[];
  skipped: string[];
  failed: { value: string; reason: string }[];
};

export interface UpdateNameData {
  value?: string;
  typeId?: number;
  genderId?: number;
}

/* ===========================
 *          Filters
 * =========================== */

export interface GetNameFilters {
  search?: string;
  typeId?: number;
  genderId?: number;
  charLength?: number;
  length?: NameLength;
  status?: NameStatus;
}

export interface GenerateNameFilters {
  genderId?: number;
  charLength?: number;
  length?: NameLength;
}
