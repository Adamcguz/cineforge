import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MoodboardItem } from '@/types';
import { generateId } from '@/lib/uuid';

interface MoodboardState {
  items: Record<string, MoodboardItem[]>; // keyed by projectId (or projectId:sceneId)
  getItems: (key: string) => MoodboardItem[];
  addItem: (key: string, item: Omit<MoodboardItem, 'id' | 'zIndex'>) => void;
  updateItem: (key: string, itemId: string, updates: Partial<MoodboardItem>) => void;
  removeItem: (key: string, itemId: string) => void;
  bringToFront: (key: string, itemId: string) => void;
  sendToBack: (key: string, itemId: string) => void;
}

export const useMoodboardStore = create<MoodboardState>()(
  persist(
    (set, get) => ({
      items: {},

      getItems: (key) => get().items[key] || [],

      addItem: (key, item) => {
        const existing = get().items[key] || [];
        const maxZ = existing.reduce((max, i) => Math.max(max, i.zIndex), 0);
        const newItem: MoodboardItem = {
          ...item,
          id: generateId(),
          zIndex: maxZ + 1,
        };
        set((state) => ({
          items: { ...state.items, [key]: [...existing, newItem] },
        }));
      },

      updateItem: (key, itemId, updates) => {
        set((state) => ({
          items: {
            ...state.items,
            [key]: (state.items[key] || []).map((i) =>
              i.id === itemId ? { ...i, ...updates } : i
            ),
          },
        }));
      },

      removeItem: (key, itemId) => {
        set((state) => ({
          items: {
            ...state.items,
            [key]: (state.items[key] || []).filter((i) => i.id !== itemId),
          },
        }));
      },

      bringToFront: (key, itemId) => {
        const existing = get().items[key] || [];
        const maxZ = existing.reduce((max, i) => Math.max(max, i.zIndex), 0);
        set((state) => ({
          items: {
            ...state.items,
            [key]: existing.map((i) =>
              i.id === itemId ? { ...i, zIndex: maxZ + 1 } : i
            ),
          },
        }));
      },

      sendToBack: (key, itemId) => {
        const existing = get().items[key] || [];
        const minZ = existing.reduce((min, i) => Math.min(min, i.zIndex), 0);
        set((state) => ({
          items: {
            ...state.items,
            [key]: existing.map((i) =>
              i.id === itemId ? { ...i, zIndex: minZ - 1 } : i
            ),
          },
        }));
      },
    }),
    {
      name: 'cineforge-moodboard',
    }
  )
);
