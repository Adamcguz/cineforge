import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Shot, ShotType, ShotAngle, ShotMovement } from '@/types';
import { generateId } from '@/lib/uuid';

interface ShotListState {
  shots: Record<string, Record<string, Shot[]>>; // projectId -> sceneId -> shots
  getSceneShots: (projectId: string, sceneId: string) => Shot[];
  addShot: (projectId: string, sceneId: string) => void;
  updateShot: (projectId: string, sceneId: string, shotId: string, updates: Partial<Shot>) => void;
  removeShot: (projectId: string, sceneId: string, shotId: string) => void;
  duplicateShot: (projectId: string, sceneId: string, shotId: string) => void;
  reorderShot: (projectId: string, sceneId: string, fromIndex: number, toIndex: number) => void;
}

export const useShotListStore = create<ShotListState>()(
  persist(
    (set, get) => ({
      shots: {},

      getSceneShots: (projectId, sceneId) =>
        get().shots[projectId]?.[sceneId] || [],

      addShot: (projectId, sceneId) => {
        const existing = get().shots[projectId]?.[sceneId] || [];
        const newShot: Shot = {
          id: generateId(),
          number: String(existing.length + 1),
          type: 'Wide' as ShotType,
          angle: 'Eye Level' as ShotAngle,
          movement: 'Static' as ShotMovement,
          frame: '',
          completed: false,
        };
        set((state) => ({
          shots: {
            ...state.shots,
            [projectId]: {
              ...(state.shots[projectId] || {}),
              [sceneId]: [...existing, newShot],
            },
          },
        }));
      },

      updateShot: (projectId, sceneId, shotId, updates) => {
        set((state) => ({
          shots: {
            ...state.shots,
            [projectId]: {
              ...(state.shots[projectId] || {}),
              [sceneId]: (state.shots[projectId]?.[sceneId] || []).map((s) =>
                s.id === shotId ? { ...s, ...updates } : s
              ),
            },
          },
        }));
      },

      removeShot: (projectId, sceneId, shotId) => {
        set((state) => ({
          shots: {
            ...state.shots,
            [projectId]: {
              ...(state.shots[projectId] || {}),
              [sceneId]: (state.shots[projectId]?.[sceneId] || []).filter((s) => s.id !== shotId),
            },
          },
        }));
      },

      duplicateShot: (projectId, sceneId, shotId) => {
        const shots = get().shots[projectId]?.[sceneId] || [];
        const idx = shots.findIndex((s) => s.id === shotId);
        if (idx === -1) return;
        const original = shots[idx];
        const duplicate: Shot = {
          ...original,
          id: generateId(),
          number: original.number + 'A',
          completed: false,
        };
        const newShots = [...shots];
        newShots.splice(idx + 1, 0, duplicate);
        set((state) => ({
          shots: {
            ...state.shots,
            [projectId]: {
              ...(state.shots[projectId] || {}),
              [sceneId]: newShots,
            },
          },
        }));
      },

      reorderShot: (projectId, sceneId, fromIndex, toIndex) => {
        set((state) => {
          const shots = [...(state.shots[projectId]?.[sceneId] || [])];
          const [moved] = shots.splice(fromIndex, 1);
          shots.splice(toIndex, 0, moved);
          return {
            shots: {
              ...state.shots,
              [projectId]: {
                ...(state.shots[projectId] || {}),
                [sceneId]: shots,
              },
            },
          };
        });
      },
    }),
    {
      name: 'cineforge-shotlist',
    }
  )
);
