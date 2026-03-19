export const BREAKDOWN_CATEGORIES = [
  'cast', 'extras', 'location', 'props', 'set-dressing',
  'costumes', 'vehicles', 'sound', 'sfx', 'music',
  'hair-makeup', 'animals',
] as const;

export type BreakdownCategory = typeof BREAKDOWN_CATEGORIES[number];

export const CATEGORY_LABELS: Record<BreakdownCategory, string> = {
  'cast': 'Cast',
  'extras': 'Extras / Background',
  'location': 'Location',
  'props': 'Props',
  'set-dressing': 'Set Dressing',
  'costumes': 'Costumes',
  'vehicles': 'Vehicles',
  'sound': 'Sound Design',
  'sfx': 'Special Effects',
  'music': 'Music',
  'hair-makeup': 'Hair & Makeup',
  'animals': 'Animals',
};

export const CATEGORY_COLORS: Record<BreakdownCategory, string> = {
  'cast': '#ef4444',
  'extras': '#f97316',
  'location': '#eab308',
  'props': '#22c55e',
  'set-dressing': '#14b8a6',
  'costumes': '#3b82f6',
  'vehicles': '#a855f7',
  'sound': '#ec4899',
  'sfx': '#6b7280',
  'music': '#c4b5fd',
  'hair-makeup': '#92400e',
  'animals': '#84cc16',
};

export interface BreakdownTag {
  id: string;
  sceneId: string;
  category: BreakdownCategory;
  text: string;
  startOffset: number;
  endOffset: number;
  blockId: string;
  notes?: string;
}
