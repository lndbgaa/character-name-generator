import { UNIVERSE_STATUSES } from "@/constants/universe.constants.js";

import type { DateTimeParts } from "@/types/common.types.js";

export type UniverseStatus = (typeof UNIVERSE_STATUSES)[keyof typeof UNIVERSE_STATUSES];

/* ===========================
 *           DTOs
 * =========================== */

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
  status: UniverseStatus;
  createdAt: DateTimeParts;
  updatedAt: DateTimeParts;
  deactivatedAt?: DateTimeParts;
  archivedAt?: DateTimeParts;
}

/* ===========================
 *     Payloads & Results
 * =========================== */

export interface CreateUniverseData {
  label: string;
  displayName: string;
  description?: string;
}

export interface UpdateUniverseData {
  displayName?: string;
  description?: string;
}
