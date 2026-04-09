export type BeatAct = 'I' | 'II' | 'III' | 'Other';

export interface Beat {
  id: string;
  name: string;
  act?: BeatAct;
  order: number;
  summary?: string;
  emotionalTurn?: string;
  charactersPresent?: string;
  conflictStakes?: string;
  whyItMatters?: string;
  openQuestions?: string;
  notes?: string;
  linkedSceneIds?: string[];
}
