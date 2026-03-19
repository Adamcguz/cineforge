import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BudgetLineItem } from '@/types';
import { ABOVE_THE_LINE_CATEGORIES } from '@/types';
import { generateId } from '@/lib/uuid';

interface BudgetState {
  lineItems: Record<string, BudgetLineItem[]>; // keyed by projectId
  getLineItems: (projectId: string) => BudgetLineItem[];
  addLineItem: (projectId: string, item: Partial<BudgetLineItem> & { name: string; category: string }) => void;
  updateLineItem: (projectId: string, itemId: string, updates: Partial<BudgetLineItem>) => void;
  removeLineItem: (projectId: string, itemId: string) => void;
  syncFromBreakdown: (projectId: string, breakdownItems: { name: string; category: string; sourceTagId: string }[]) => void;
  initializeAboveTheLine: (projectId: string) => void;
}

export const useBudgetStore = create<BudgetState>()(
  persist(
    (set, get) => ({
      lineItems: {},

      getLineItems: (projectId) => get().lineItems[projectId] || [],

      addLineItem: (projectId, item) => {
        const newItem: BudgetLineItem = {
          id: generateId(),
          name: item.name,
          category: item.category,
          quantity: item.quantity || 1,
          unitCost: item.unitCost || 0,
          notes: item.notes,
          sourceTagId: item.sourceTagId,
        };
        set((state) => ({
          lineItems: {
            ...state.lineItems,
            [projectId]: [...(state.lineItems[projectId] || []), newItem],
          },
        }));
      },

      updateLineItem: (projectId, itemId, updates) => {
        set((state) => ({
          lineItems: {
            ...state.lineItems,
            [projectId]: (state.lineItems[projectId] || []).map((i) =>
              i.id === itemId ? { ...i, ...updates } : i
            ),
          },
        }));
      },

      removeLineItem: (projectId, itemId) => {
        set((state) => ({
          lineItems: {
            ...state.lineItems,
            [projectId]: (state.lineItems[projectId] || []).filter((i) => i.id !== itemId),
          },
        }));
      },

      syncFromBreakdown: (projectId, breakdownItems) => {
        const existing = get().lineItems[projectId] || [];
        const existingTagIds = new Set(existing.filter((i) => i.sourceTagId).map((i) => i.sourceTagId));

        const newItems = breakdownItems
          .filter((bi) => !existingTagIds.has(bi.sourceTagId))
          .map((bi) => ({
            id: generateId(),
            name: bi.name,
            category: bi.category,
            quantity: 1,
            unitCost: 0,
            sourceTagId: bi.sourceTagId,
          }));

        if (newItems.length > 0) {
          set((state) => ({
            lineItems: {
              ...state.lineItems,
              [projectId]: [...existing, ...newItems],
            },
          }));
        }
      },

      initializeAboveTheLine: (projectId) => {
        const existing = get().lineItems[projectId] || [];
        const hasATL = existing.some((i) =>
          ABOVE_THE_LINE_CATEGORIES.includes(i.category as typeof ABOVE_THE_LINE_CATEGORIES[number])
        );
        if (hasATL) return;

        const atlItems: BudgetLineItem[] = ABOVE_THE_LINE_CATEGORIES.map((cat) => ({
          id: generateId(),
          name: '',
          category: cat,
          quantity: 1,
          unitCost: 0,
        }));

        set((state) => ({
          lineItems: {
            ...state.lineItems,
            [projectId]: [...existing, ...atlItems],
          },
        }));
      },
    }),
    {
      name: 'cineforge-budget',
    }
  )
);
