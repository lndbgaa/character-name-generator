import type { DateTimeParts } from "@/types/common.types.js";

export type UnvierseStatus = "active" | "inactive" | "archived";

export interface UniversePublicDTO {
  id: number;
  label: string;
  displayName: string;
  description: string | null;
}

export interface UniverseAdminDTO {
  id: number;
  label: string;
  displayName: string;
  description: string | null;
  status: UnvierseStatus;
  createdAt: DateTimeParts;
  updatedAt: DateTimeParts;
  deactivatedAt?: DateTimeParts;
  archivedAt?: DateTimeParts;
}

export interface CreateUniverseData {
  label: string;
  displayName: string;
  description?: string;
}

export interface UpdateUniverseData {
  displayName?: string;
  description?: string;
}
