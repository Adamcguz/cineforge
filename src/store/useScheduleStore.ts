import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ShootDay } from '@/types';
import { generateId } from '@/lib/uuid';

interface ScheduleState {
  schedules: Record<string, ShootDay[]>; // keyed by projectId
  getSchedule: (projectId: string) => ShootDay[];
  addShootDay: (projectId: string, label?: string, date?: string) => void;
  removeShootDay: (projectId: string, dayId: string) => void;
  updateShootDay: (projectId: string, dayId: string, updates: Partial<ShootDay>) => void;
  assignScene: (projectId: string, dayId: string, sceneId: string, index?: number) => void;
  unassignScene: (projectId: string, sceneId: string) => void;
  moveScene: (projectId: string, fromDayId: string, toDayId: string, sceneId: string, toIndex: number) => void;
  reorderScene: (projectId: string, dayId: string, fromIndex: number, toIndex: number) => void;
}

export const useScheduleStore = create<ScheduleState>()(
  persist(
    (set, get) => ({
      schedules: {},

      getSchedule: (projectId) => get().schedules[projectId] || [],

      addShootDay: (projectId, label, date) => {
        const schedule = get().schedules[projectId] || [];
        const dayNum = schedule.length + 1;
        const newDay: ShootDay = {
          id: generateId(),
          label: label || `Day ${dayNum}`,
          date,
          sceneIds: [],
        };
        set((state) => ({
          schedules: {
            ...state.schedules,
            [projectId]: [...(state.schedules[projectId] || []), newDay],
          },
        }));
      },

      removeShootDay: (projectId, dayId) => {
        set((state) => ({
          schedules: {
            ...state.schedules,
            [projectId]: (state.schedules[projectId] || []).filter((d) => d.id !== dayId),
          },
        }));
      },

      updateShootDay: (projectId, dayId, updates) => {
        set((state) => ({
          schedules: {
            ...state.schedules,
            [projectId]: (state.schedules[projectId] || []).map((d) =>
              d.id === dayId ? { ...d, ...updates } : d
            ),
          },
        }));
      },

      assignScene: (projectId, dayId, sceneId, index) => {
        set((state) => {
          const schedule = (state.schedules[projectId] || []).map((d) => ({
            ...d,
            sceneIds: d.sceneIds.filter((s) => s !== sceneId),
          }));
          return {
            schedules: {
              ...state.schedules,
              [projectId]: schedule.map((d) => {
                if (d.id !== dayId) return d;
                const newSceneIds = [...d.sceneIds];
                if (index !== undefined) {
                  newSceneIds.splice(index, 0, sceneId);
                } else {
                  newSceneIds.push(sceneId);
                }
                return { ...d, sceneIds: newSceneIds };
              }),
            },
          };
        });
      },

      unassignScene: (projectId, sceneId) => {
        set((state) => ({
          schedules: {
            ...state.schedules,
            [projectId]: (state.schedules[projectId] || []).map((d) => ({
              ...d,
              sceneIds: d.sceneIds.filter((s) => s !== sceneId),
            })),
          },
        }));
      },

      moveScene: (projectId, _fromDayId, toDayId, sceneId, toIndex) => {
        set((state) => {
          const schedule = (state.schedules[projectId] || []).map((d) => ({
            ...d,
            sceneIds: d.sceneIds.filter((s) => s !== sceneId),
          }));
          return {
            schedules: {
              ...state.schedules,
              [projectId]: schedule.map((d) => {
                if (d.id !== toDayId) return d;
                const newSceneIds = [...d.sceneIds];
                newSceneIds.splice(toIndex, 0, sceneId);
                return { ...d, sceneIds: newSceneIds };
              }),
            },
          };
        });
      },

      reorderScene: (projectId, dayId, fromIndex, toIndex) => {
        set((state) => ({
          schedules: {
            ...state.schedules,
            [projectId]: (state.schedules[projectId] || []).map((d) => {
              if (d.id !== dayId) return d;
              const newSceneIds = [...d.sceneIds];
              const [moved] = newSceneIds.splice(fromIndex, 1);
              newSceneIds.splice(toIndex, 0, moved);
              return { ...d, sceneIds: newSceneIds };
            }),
          },
        }));
      },
    }),
    {
      name: 'cineforge-schedule',
    }
  )
);
