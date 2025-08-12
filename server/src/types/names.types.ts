import type { Name } from "@/models/index.js";
import type { DateTimeParts } from "@/types/common.types.js";

/**
 * Length bucket for a name value.
 */
export type NameLength = "long" | "short" | "medium";

/**
 * Lifecycle/status state for a name record.
 */
export type NameStatus = "active" | "inactive" | "archived";

/**
 * Public-facing projection of a Name.
 */
export interface NamePublicDTO {
  id: string;
  value: string;
  type: string | null;
  gender: string | null;
  length: NameLength;
}

/**
 * Admin-facing projection of a Name.
 */
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

/**
 * Payload required to create a new Name.
 */
export interface CreateNameData {
  value: string;
  typeId: number;
  genderId: number;
}

/**
 * Result of bulk name creation/import operations.
 * - created: successfully created Name instances
 * - skipped: input values that already existed and were skipped
 * - failed: inputs that could not be created with a reason
 */
export type BulkNameResult = {
  created: Name[];
  skipped: string[];
  failed: { value: string; reason: string }[];
};

/**
 * Fields that can be updated on an existing Name.
 *
 * Note : All properties are optional to allow partial updates in the service layer.
 */
export interface UpdateNameData {
  value?: string;
  typeId?: number;
  genderId?: number;
}

/**
 * Optional filters when searching for names.
 */
export interface NameFilters {
  search?: string;
  typeId?: number;
  genderId?: number;
  length?: NameLength;
  charLength?: number;
  status?: NameStatus;
}
