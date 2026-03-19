import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Character, CharacterRelationship } from '@/types';
import { generateId } from '@/lib/uuid';

interface CharacterState {
  characters: Record<string, Character[]>; // keyed by projectId
  relationships: Record<string, CharacterRelationship[]>;
  getCharacters: (projectId: string) => Character[];
  getRelationships: (projectId: string) => CharacterRelationship[];
  addCharacter: (projectId: string, name: string) => string;
  updateCharacter: (projectId: string, charId: string, updates: Partial<Character>) => void;
  removeCharacter: (projectId: string, charId: string) => void;
  addRelationship: (projectId: string, fromId: string, toId: string, label: string) => void;
  removeRelationship: (projectId: string, relId: string) => void;
}

export const useCharacterStore = create<CharacterState>()(
  persist(
    (set, get) => ({
      characters: {},
      relationships: {},

      getCharacters: (projectId) => get().characters[projectId] || [],
      getRelationships: (projectId) => get().relationships[projectId] || [],

      addCharacter: (projectId, name) => {
        const id = generateId();
        const char: Character = { id, name };
        set((state) => ({
          characters: {
            ...state.characters,
            [projectId]: [...(state.characters[projectId] || []), char],
          },
        }));
        return id;
      },

      updateCharacter: (projectId, charId, updates) => {
        set((state) => ({
          characters: {
            ...state.characters,
            [projectId]: (state.characters[projectId] || []).map((c) =>
              c.id === charId ? { ...c, ...updates } : c
            ),
          },
        }));
      },

      removeCharacter: (projectId, charId) => {
        set((state) => ({
          characters: {
            ...state.characters,
            [projectId]: (state.characters[projectId] || []).filter((c) => c.id !== charId),
          },
          relationships: {
            ...state.relationships,
            [projectId]: (state.relationships[projectId] || []).filter(
              (r) => r.fromCharacterId !== charId && r.toCharacterId !== charId
            ),
          },
        }));
      },

      addRelationship: (projectId, fromId, toId, label) => {
        const rel: CharacterRelationship = {
          id: generateId(),
          fromCharacterId: fromId,
          toCharacterId: toId,
          label,
        };
        set((state) => ({
          relationships: {
            ...state.relationships,
            [projectId]: [...(state.relationships[projectId] || []), rel],
          },
        }));
      },

      removeRelationship: (projectId, relId) => {
        set((state) => ({
          relationships: {
            ...state.relationships,
            [projectId]: (state.relationships[projectId] || []).filter((r) => r.id !== relId),
          },
        }));
      },
    }),
    {
      name: 'cineforge-characters',
    }
  )
);
