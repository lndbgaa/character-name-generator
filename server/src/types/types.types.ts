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
