import { TYPE_STATUSES } from "@/constants/type.constants.js";

import type { DateTimeParts } from "@/types/common.types.js";
import type { UniversePublicDTO } from "@/types/universes.types.js";

export type TypeStatus = (typeof TYPE_STATUSES)[keyof typeof TYPE_STATUSES];

/* ===========================
 *           DTOs
 * =========================== */

export interface TypePublicDTO {
  id: number;
  label: string;
  displayName: string;
  description: string | null;
  iconUrl: string | null;
  universe: UniversePublicDTO | null;
}

export interface TypeAdminDTO {
  id: number;
  label: string;
  displayName: string;
  description: string | null;
  iconUrl: string | null;
  universe: UniversePublicDTO | null;
  status: TypeStatus;
  createdAt: DateTimeParts;
  updatedAt: DateTimeParts;
  deactivatedAt?: DateTimeParts;
  archivedAt?: DateTimeParts;
}

/* ===========================
 *     Payloads & Results
 * =========================== */

export interface CreateTypeData {
  universeId: number;
  label: string;
  displayName: string;
  description?: string;
  iconUrl?: string;
}

export interface UpdateTypeData {
  universeId?: number;
  displayName?: string;
  description?: string;
  iconUrl?: string;
}
