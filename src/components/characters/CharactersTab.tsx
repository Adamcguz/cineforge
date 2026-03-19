import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useCharacterStore } from '@/store/useCharacterStore';
import { useBreakdownStore } from '@/store/useBreakdownStore';
import { useScriptStore } from '@/store/useScriptStore';
import { Node } from 'slate';
import type { Descendant } from 'slate';
import type { ScriptElement, Character, BreakdownTag, CharacterRelationship } from '@/types';
import { CharacterProfile } from './CharacterProfile';
import { ImportCharactersModal } from './ImportCharactersModal';
import { RelationshipMap } from './RelationshipMap';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

const EMPTY_CHARS: Character[] = [];
const EMPTY_TAGS: BreakdownTag[] = [];
const EMPTY_RELS: CharacterRelationship[] = [];

type ViewMode = 'profile' | 'relationships';

export function CharactersTab() {
  const { projectId } = useParams<{ projectId: string }>();
  if (!projectId) return null;

  const characters = useCharacterStore((s) => s.characters[projectId]) || EMPTY_CHARS;
  const relationships = useCharacterStore((s) => s.relationships[projectId]) || EMPTY_RELS;
  const addCharacter = useCharacterStore((s) => s.addCharacter);
  const updateCharacter = useCharacterStore((s) => s.updateCharacter);
  const removeCharacter = useCharacterStore((s) => s.removeCharacter);
  const addRelationship = useCharacterStore((s) => s.addRelationship);
  const removeRelationship = useCharacterStore((s) => s.removeRelationship);

  const tags = useBreakdownStore((s) => s.tags[projectId]) || EMPTY_TAGS;
  const castTags = useMemo(() => tags.filter((t) => t.category === 'cast'), [tags]);
  const doc = useScriptStore((s) => s.documents[projectId]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('profile');

  const selected = characters.find((c) => c.id === selectedId) || null;

  // Find scenes a character appears in (from breakdown tags)
  const characterScenes = useMemo(() => {
    if (!selected) return [];
    const matchingTags = castTags.filter(
      (t) => t.text.toLowerCase() === selected.name.toLowerCase()
    );
    return [...new Set(matchingTags.map((t) => t.sceneId))];
  }, [selected, castTags]);

  // Extract dialogue samples from script
  const dialogueSamples = useMemo(() => {
    if (!selected || !doc) return [];
    const samples: string[] = [];
    let isCharacterBlock = false;

    for (const node of doc) {
      const el = node as ScriptElement;
      const text = Node.string(node as Descendant);

      if (el.type === 'character' && text.toUpperCase().includes(selected.name.toUpperCase())) {
        isCharacterBlock = true;
        continue;
      }

      if (isCharacterBlock && el.type === 'dialogue') {
        samples.push(text);
        isCharacterBlock = false;
        if (samples.length >= 5) break;
        continue;
      }

      isCharacterBlock = false;
    }

    return samples;
  }, [selected, doc]);

  const handleImport = (names: string[]) => {
    for (const name of names) {
      addCharacter(projectId, name);
    }
  };

  const handleAdd = () => {
    const id = addCharacter(projectId, 'New Character');
    setSelectedId(id);
  };

  return (
    <div className="h-full flex">
      {/* Sidebar: character list */}
      <div className="w-56 flex-shrink-0 border-r border-gray-200 flex flex-col">
        <div className="px-3 py-2 border-b border-gray-200 space-y-1.5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-600">Characters</h3>
            <span className="text-xs text-gray-400">{characters.length}</span>
          </div>
          <div className="flex gap-1.5">
            <Button size="sm" onClick={handleAdd} className="flex-1 text-xs">
              + New
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setShowImport(true)}
              className="flex-1 text-xs"
            >
              Import
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {characters.map((char) => (
            <div
              key={char.id}
              role="button"
              tabIndex={0}
              onClick={() => { setSelectedId(char.id); setViewMode('profile'); }}
              onKeyDown={(e) => { if (e.key === 'Enter') { setSelectedId(char.id); setViewMode('profile'); } }}
              className={`w-full text-left px-3 py-2 text-sm border-b border-gray-200 hover:bg-gray-100 cursor-pointer ${
                selectedId === char.id ? 'bg-gray-200 text-gray-900' : 'text-gray-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="truncate">{char.name || 'Unnamed'}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteId(char.id);
                  }}
                  className="text-gray-400 hover:text-red-500 text-xs ml-1"
                >
                  x
                </button>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={() => setViewMode('relationships')}
          className={`px-3 py-2 text-sm border-t border-gray-200 hover:bg-gray-100 ${
            viewMode === 'relationships' ? 'bg-gray-200 text-blue-600' : 'text-gray-500'
          }`}
        >
          Relationship Map
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-4">
        {viewMode === 'relationships' ? (
          <RelationshipMap
            characters={characters}
            relationships={relationships}
            onAddRelationship={(f, t, l) => addRelationship(projectId, f, t, l)}
            onRemoveRelationship={(id) => removeRelationship(projectId, id)}
          />
        ) : selected ? (
          <div>
            <div className="mb-4">
              <input
                type="text"
                value={selected.name}
                onChange={(e) =>
                  updateCharacter(projectId, selected.id, { name: e.target.value })
                }
                className="text-xl font-bold bg-transparent text-gray-900 border-none outline-none w-full"
                placeholder="Character Name"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <CharacterProfile
                  character={selected}
                  onUpdate={(updates) =>
                    updateCharacter(projectId, selected.id, updates)
                  }
                />
              </div>

              <div className="space-y-6">
                {/* Scenes panel */}
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Appears In ({characterScenes.length} scenes)
                  </h3>
                  {characterScenes.length === 0 ? (
                    <p className="text-xs text-gray-400">
                      No scenes tagged yet. Use the Breakdown tab to tag this character.
                    </p>
                  ) : (
                    <div className="space-y-1">
                      {characterScenes.map((sid) => (
                        <div
                          key={sid}
                          className="text-xs text-gray-500 bg-gray-100 rounded px-2 py-1"
                        >
                          Scene {sid.slice(0, 8)}...
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Dialogue samples */}
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Dialogue Samples
                  </h3>
                  {dialogueSamples.length === 0 ? (
                    <p className="text-xs text-gray-400">
                      No dialogue found for this character in the script.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {dialogueSamples.map((line, i) => (
                        <blockquote
                          key={i}
                          className="text-xs text-gray-500 italic border-l-2 border-gray-300 pl-2"
                        >
                          "{line}"
                        </blockquote>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p className="text-sm">
              {characters.length === 0
                ? 'Add a character or import from Breakdown to get started.'
                : 'Select a character from the sidebar.'}
            </p>
          </div>
        )}
      </div>

      <ImportCharactersModal
        open={showImport}
        onClose={() => setShowImport(false)}
        castTags={castTags}
        existingCharacters={characters}
        onImport={handleImport}
      />

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete Character"
        message="This will remove the character and all their relationships."
        onConfirm={() => {
          if (deleteId) removeCharacter(projectId, deleteId);
          if (selectedId === deleteId) setSelectedId(null);
          setDeleteId(null);
        }}
        onClose={() => setDeleteId(null)}
      />
    </div>
  );
}
