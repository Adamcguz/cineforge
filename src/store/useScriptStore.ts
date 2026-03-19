import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Descendant } from 'slate';
import type { ElementType } from '@/types';
import { generateId } from '@/lib/uuid';

interface ScriptState {
  documents: Record<string, Descendant[]>;
  getDocument: (projectId: string) => Descendant[];
  setDocument: (projectId: string, doc: Descendant[]) => void;
  deleteDocument: (projectId: string) => void;
}

function createDefaultDocument(): Descendant[] {
  return [
    {
      type: 'action' as ElementType,
      id: generateId(),
      children: [{ text: '' }],
    },
  ];
}

export const useScriptStore = create<ScriptState>()(
  persist(
    (set, get) => ({
      documents: {},

      getDocument: (projectId: string) => {
        return get().documents[projectId] || createDefaultDocument();
      },

      setDocument: (projectId: string, doc: Descendant[]) => {
        set((state) => ({
          documents: { ...state.documents, [projectId]: doc },
        }));
      },

      deleteDocument: (projectId: string) => {
        set((state) => {
          const { [projectId]: _, ...rest } = state.documents;
          return { documents: rest };
        });
      },
    }),
    {
      name: 'cineforge-script',
    }
  )
);
