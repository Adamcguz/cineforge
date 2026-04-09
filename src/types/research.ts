export interface ResearchEntry {
  id: string;
  topic: string;
  timePeriod?: string;
  location?: string;
  keyFacts?: string;
  sensoryDetails?: string;
  languageDialect?: string;
  culturalNotes?: string;
  sources?: string;
  imageRefs?: string;
  mustNotGetWrong?: string;
  notes?: string;
  linkedCharacterIds?: string[];
}
