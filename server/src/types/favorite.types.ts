export interface FavoritePublicDTO {
  id: string;
  name: string;
  note: string | null;
}

export interface AddFavoriteData {
  nameId: string;
  note?: string;
}

export interface UpdateFavoriteData {
  note: string;
}
