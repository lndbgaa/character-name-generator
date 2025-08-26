/* ===========================
 *           DTOs
 * =========================== */

export interface FavoritePublicDTO {
  id: string;
  name: string | null;
  note: string | null;
}

/* ===========================
 *     Payloads & Results
 * =========================== */

export interface AddFavoriteData {
  nameId: string;
  note?: string;
}

export interface UpdateFavoriteData {
  note: string;
}
