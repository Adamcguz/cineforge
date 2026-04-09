import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ResearchEntry } from '@/types';
import { generateId } from '@/lib/uuid';

interface ResearchState {
  entries: Record<string, ResearchEntry[]>; // keyed by projectId
  getEntries: (projectId: string) => ResearchEntry[];
  addEntry: (projectId: string, topic: string) => string;
  updateEntry: (projectId: string, entryId: string, updates: Partial<ResearchEntry>) => void;
  removeEntry: (projectId: string, entryId: string) => void;
  toggleCharacterLink: (projectId: string, entryId: string, characterId: string) => void;
}

export const useResearchStore = create<ResearchState>()(
  persist(
    (set, get) => ({
      entries: {},

      getEntries: (projectId) => get().entries[projectId] || [],

      addEntry: (projectId, topic) => {
        const id = generateId();
        const entry: ResearchEntry = { id, topic, linkedCharacterIds: [] };
        set((state) => ({
          entries: {
            ...state.entries,
            [projectId]: [...(state.entries[projectId] || []), entry],
          },
        }));
        return id;
      },

      updateEntry: (projectId, entryId, updates) => {
        set((state) => ({
          entries: {
            ...state.entries,
            [projectId]: (state.entries[projectId] || []).map((e) =>
              e.id === entryId ? { ...e, ...updates } : e
            ),
          },
        }));
      },

      removeEntry: (projectId, entryId) => {
        set((state) => ({
          entries: {
            ...state.entries,
            [projectId]: (state.entries[projectId] || []).filter((e) => e.id !== entryId),
          },
        }));
      },

      toggleCharacterLink: (projectId, entryId, characterId) => {
        set((state) => ({
          entries: {
            ...state.entries,
            [projectId]: (state.entries[projectId] || []).map((e) => {
              if (e.id !== entryId) return e;
              const linked = e.linkedCharacterIds || [];
              const next = linked.includes(characterId)
                ? linked.filter((id) => id !== characterId)
                : [...linked, characterId];
              return { ...e, linkedCharacterIds: next };
            }),
          },
        }));
      },
    }),
    {
      name: 'cineforge-research',
    }
  )
);
