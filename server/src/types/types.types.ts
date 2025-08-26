import { TYPE_STATUSES } from "@/constants/type.constants.js";

import type { DateTimeParts } from "@/types/common.types.js";
import type { GenderLabel } from "@/types/gender.types.js";
import type { UniverseAdminDTO, UniversePublicDTO } from "@/types/universes.types.js";

/* ===========================
 *    Constants-based Types
 * =========================== */

export type TypeStatus = (typeof TYPE_STATUSES)[keyof typeof TYPE_STATUSES];

/* ===========================
 *           DTOs
 * =========================== */

export interface TypeColorTheme {
  primary: string;
  secondary: string;
}

export interface TypePublicDTO {
  id: number;
  displayName: string;
  description: string;
  colorTheme: TypeColorTheme;
  iconUrl: string;
  cardImageUrl: string;
  backgroundImageUrl: string;
  universe: UniversePublicDTO | null;
  allowedGenders: GenderLabel[];
}

export interface TypeAdminDTO extends TypePublicDTO {
  label: string;
  universe: UniverseAdminDTO | null;
  status: TypeStatus;
  createdAt: DateTimeParts;
  updatedAt: DateTimeParts;
  deactivatedAt?: DateTimeParts;
  archivedAt?: DateTimeParts;
}

/* ===========================
 *     Payloads & Results
 * =========================== */

export interface CreateTypePayload {
  universeLabel: string;
  label: string;
  displayName: string;
  description: string;
  colorTheme: TypeColorTheme;
  iconUrl: string;
  cardImageUrl: string;
  backgroundImageUrl: string;
  allowedGenderLabels: GenderLabel[];
}

export interface UpdateTypePayload {
  displayName?: string;
  description?: string;
  colorTheme?: TypeColorTheme;
  iconUrl?: string;
  cardImageUrl?: string;
  backgroundImageUrl?: string;
}
