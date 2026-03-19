export interface Character {
  id: string;
  name: string;
  aliases?: string;
  age?: string;
  gender?: string;
  height?: string;
  build?: string;
  hair?: string;
  eyes?: string;
  distinguishingFeatures?: string;
  backstory?: string;
  occupation?: string;
  relationships?: string;
  wants?: string;
  needs?: string;
  fears?: string;
  flaws?: string;
  internalConflict?: string;
  arcStart?: string;
  arcChange?: string;
  arcEnd?: string;
  costumeNotes?: string;
  voiceMannerisms?: string;
  notes?: string;
}

export interface CharacterRelationship {
  id: string;
  fromCharacterId: string;
  toCharacterId: string;
  label: string;
}
