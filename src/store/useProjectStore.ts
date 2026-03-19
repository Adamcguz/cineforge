import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ProjectMeta, DraftColor } from '@/types';
import { generateId } from '@/lib/uuid';

interface ProjectStore {
  projects: Record<string, ProjectMeta>;
  createProject: (title: string, author: string, logline?: string) => string;
  updateProject: (id: string, updates: Partial<ProjectMeta>) => void;
  deleteProject: (id: string) => void;
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set) => ({
      projects: {},

      createProject: (title, author, logline) => {
        const id = generateId();
        const now = new Date().toISOString();
        const project: ProjectMeta = {
          id,
          title,
          author,
          logline,
          draftColor: 'white' as DraftColor,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          projects: { ...state.projects, [id]: project },
        }));
        return id;
      },

      updateProject: (id, updates) => {
        set((state) => {
          const existing = state.projects[id];
          if (!existing) return state;
          return {
            projects: {
              ...state.projects,
              [id]: {
                ...existing,
                ...updates,
                updatedAt: new Date().toISOString(),
              },
            },
          };
        });
      },

      deleteProject: (id) => {
        set((state) => {
          const { [id]: _, ...rest } = state.projects;
          return { projects: rest };
        });
      },
    }),
    {
      name: 'cineforge-projects',
    }
  )
);
