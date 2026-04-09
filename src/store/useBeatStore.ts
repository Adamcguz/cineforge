import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Beat } from '@/types';
import { generateId } from '@/lib/uuid';

interface BeatState {
  beats: Record<string, Beat[]>; // keyed by projectId
  getBeats: (projectId: string) => Beat[];
  addBeat: (projectId: string, name: string) => string;
  updateBeat: (projectId: string, beatId: string, updates: Partial<Beat>) => void;
  removeBeat: (projectId: string, beatId: string) => void;
  reorderBeat: (projectId: string, fromIndex: number, toIndex: number) => void;
  toggleSceneLink: (projectId: string, beatId: string, sceneId: string) => void;
}

export const useBeatStore = create<BeatState>()(
  persist(
    (set, get) => ({
      beats: {},

      getBeats: (projectId) => get().beats[projectId] || [],

      addBeat: (projectId, name) => {
        const id = generateId();
        const existing = get().beats[projectId] || [];
        const beat: Beat = {
          id,
          name,
          order: existing.length,
          linkedSceneIds: [],
        };
        set((state) => ({
          beats: {
            ...state.beats,
            [projectId]: [...existing, beat],
          },
        }));
        return id;
      },

      updateBeat: (projectId, beatId, updates) => {
        set((state) => ({
          beats: {
            ...state.beats,
            [projectId]: (state.beats[projectId] || []).map((b) =>
              b.id === beatId ? { ...b, ...updates } : b
            ),
          },
        }));
      },

      removeBeat: (projectId, beatId) => {
        set((state) => ({
          beats: {
            ...state.beats,
            [projectId]: (state.beats[projectId] || [])
              .filter((b) => b.id !== beatId)
              .map((b, i) => ({ ...b, order: i })),
          },
        }));
      },

      reorderBeat: (projectId, fromIndex, toIndex) => {
        set((state) => {
          const beats = [...(state.beats[projectId] || [])];
          const [moved] = beats.splice(fromIndex, 1);
          beats.splice(toIndex, 0, moved);
          return {
            beats: {
              ...state.beats,
              [projectId]: beats.map((b, i) => ({ ...b, order: i })),
            },
          };
        });
      },

      toggleSceneLink: (projectId, beatId, sceneId) => {
        set((state) => ({
          beats: {
            ...state.beats,
            [projectId]: (state.beats[projectId] || []).map((b) => {
              if (b.id !== beatId) return b;
              const linked = b.linkedSceneIds || [];
              const next = linked.includes(sceneId)
                ? linked.filter((id) => id !== sceneId)
                : [...linked, sceneId];
              return { ...b, linkedSceneIds: next };
            }),
          },
        }));
      },
    }),
    {
      name: 'cineforge-beats',
    }
  )
);
