export interface OpenFile {
  path: string;
  sha: string;
  content: string;
  isDirty: boolean;
  lastFetchedAt: number;
  imageUrl?: string;
}
