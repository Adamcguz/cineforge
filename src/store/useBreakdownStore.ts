import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BreakdownTag } from '@/types';
import { generateId } from '@/lib/uuid';

interface BreakdownState {
  tags: Record<string, BreakdownTag[]>; // keyed by projectId
  getTags: (projectId: string) => BreakdownTag[];
  getSceneTags: (projectId: string, sceneId: string) => BreakdownTag[];
  addTag: (projectId: string, tag: Omit<BreakdownTag, 'id'>) => void;
  removeTag: (projectId: string, tagId: string) => void;
  updateTag: (projectId: string, tagId: string, updates: Partial<BreakdownTag>) => void;
  deleteProjectTags: (projectId: string) => void;
}

export const useBreakdownStore = create<BreakdownState>()(
  persist(
    (set, get) => ({
      tags: {},

      getTags: (projectId) => get().tags[projectId] || [],

      getSceneTags: (projectId, sceneId) =>
        (get().tags[projectId] || []).filter((t) => t.sceneId === sceneId),

      addTag: (projectId, tag) => {
        const newTag: BreakdownTag = { ...tag, id: generateId() };
        set((state) => ({
          tags: {
            ...state.tags,
            [projectId]: [...(state.tags[projectId] || []), newTag],
          },
        }));
      },

      removeTag: (projectId, tagId) => {
        set((state) => ({
          tags: {
            ...state.tags,
            [projectId]: (state.tags[projectId] || []).filter((t) => t.id !== tagId),
          },
        }));
      },

      updateTag: (projectId, tagId, updates) => {
        set((state) => ({
          tags: {
            ...state.tags,
            [projectId]: (state.tags[projectId] || []).map((t) =>
              t.id === tagId ? { ...t, ...updates } : t
            ),
          },
        }));
      },

      deleteProjectTags: (projectId) => {
        set((state) => {
          const { [projectId]: _, ...rest } = state.tags;
          return { tags: rest };
        });
      },
    }),
    {
      name: 'cineforge-breakdown',
    }
  )
);
