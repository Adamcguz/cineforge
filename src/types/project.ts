export const DRAFT_COLORS = [
  'white', 'blue', 'pink', 'yellow', 'green',
  'goldenrod', 'buff', 'salmon', 'cherry', 'tan', 'ivory',
] as const;

export type DraftColor = typeof DRAFT_COLORS[number];

export interface ProjectMeta {
  id: string;
  title: string;
  author: string;
  logline?: string;
  draftColor: DraftColor;
  createdAt: string;
  updatedAt: string;
}
