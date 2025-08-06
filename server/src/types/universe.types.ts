export interface CreateUniverseData {
  label: string;
  displayName: string;
  description: string;
}

export interface UpdateUniverseData {
  displayName?: string;
  description?: string;
}
