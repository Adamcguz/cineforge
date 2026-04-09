import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useResearchStore } from '@/store/useResearchStore';
import { useCharacterStore } from '@/store/useCharacterStore';
import type { ResearchEntry, Character } from '@/types';
import { ResearchProfile } from './ResearchProfile';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

const EMPTY_ENTRIES: ResearchEntry[] = [];
const EMPTY_CHARS: Character[] = [];

export function ResearchTab() {
  const { projectId } = useParams<{ projectId: string }>();
  if (!projectId) return null;

  const entries = useResearchStore((s) => s.entries[projectId]) || EMPTY_ENTRIES;
  const addEntry = useResearchStore((s) => s.addEntry);
  const updateEntry = useResearchStore((s) => s.updateEntry);
  const removeEntry = useResearchStore((s) => s.removeEntry);
  const toggleCharacterLink = useResearchStore((s) => s.toggleCharacterLink);

  const characters = useCharacterStore((s) => s.characters[projectId]) || EMPTY_CHARS;

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const selected = entries.find((e) => e.id === selectedId) || null;
  const linkedIds = selected?.linkedCharacterIds || [];

  const handleAdd = () => {
    const id = addEntry(projectId, 'New Topic');
    setSelectedId(id);
  };

  return (
    <div className="h-full flex">
      {/* Sidebar */}
      <div className="w-56 flex-shrink-0 border-r border-gray-200 flex flex-col">
        <div className="px-3 py-2 border-b border-gray-200 space-y-1.5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-600">Research</h3>
            <span className="text-xs text-gray-400">{entries.length}</span>
          </div>
          <Button size="sm" onClick={handleAdd} className="w-full text-xs">
            + New Topic
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {entries.map((entry) => (
            <div
              key={entry.id}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedId(entry.id)}
              onKeyDown={(e) => { if (e.key === 'Enter') setSelectedId(entry.id); }}
              className={`w-full text-left px-3 py-2 text-sm border-b border-gray-200 hover:bg-gray-100 cursor-pointer ${
                selectedId === entry.id ? 'bg-gray-200 text-gray-900' : 'text-gray-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="truncate">{entry.topic || 'Untitled'}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteId(entry.id);
                  }}
                  className="text-gray-400 hover:text-red-500 text-xs ml-1"
                >
                  x
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 overflow-y-auto p-4">
        {selected ? (
          <div>
            <div className="mb-4">
              <input
                type="text"
                value={selected.topic}
                onChange={(e) => updateEntry(projectId, selected.id, { topic: e.target.value })}
                className="text-xl font-bold bg-transparent text-gray-900 border-none outline-none w-full"
                placeholder="Research Topic"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ResearchProfile
                  entry={selected}
                  onUpdate={(updates) => updateEntry(projectId, selected.id, updates)}
                />
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Linked Characters
                  </h3>
                  {characters.length === 0 ? (
                    <p className="text-xs text-gray-400">
                      No characters yet. Add characters in the Characters tab to link them here.
                    </p>
                  ) : (
                    <div className="space-y-1">
                      {characters.map((c) => {
                        const isLinked = linkedIds.includes(c.id);
                        return (
                          <label
                            key={c.id}
                            className={`flex items-center gap-2 text-sm px-2 py-1 rounded cursor-pointer ${
                              isLinked ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isLinked}
                              onChange={() => toggleCharacterLink(projectId, selected.id, c.id)}
                            />
                            <span className="truncate">{c.name || 'Unnamed'}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p className="text-sm">
              {entries.length === 0
                ? 'Start a research topic to capture the history, world, and details your script depends on.'
                : 'Select a research topic from the sidebar.'}
            </p>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete Research Topic"
        message="This will remove the research topic and its notes."
        onConfirm={() => {
          if (deleteId) removeEntry(projectId, deleteId);
          if (selectedId === deleteId) setSelectedId(null);
          setDeleteId(null);
        }}
        onClose={() => setDeleteId(null)}
      />
    </div>
  );
}
