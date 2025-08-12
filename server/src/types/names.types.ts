import type { Name } from "@/models/index.js";
import type { DateTimeParts } from "@/types/common.types.js";

export type NameLength = "long" | "short" | "medium";

export type NameStatus = "active" | "inactive" | "archived";

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
  type: { id: number; label: string } | null;
  gender: { id: number; label: string } | null;
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

/* ===========================
 *       HTTP Query Types
 * =========================== */

export interface GenerateRandomNamesQuery {
  count?: string;
  genderId?: string;
  charLength?: string;
  length?: NameLength;
}

export interface GetNamesQuery {
  search?: string;
  typeId?: string;
  genderId?: string;
  charLength?: string;
  length?: NameLength;
  status?: NameStatus;
}
