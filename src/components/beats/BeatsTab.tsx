import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { useBeatStore } from '@/store/useBeatStore';
import { useScriptStore } from '@/store/useScriptStore';
import { estimateScenePages } from '@/lib/breakdownSync';
import type { Beat } from '@/types';
import { BeatCard } from './BeatCard';
import { BeatProfile } from './BeatProfile';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

const EMPTY_BEATS: Beat[] = [];

export function BeatsTab() {
  const { projectId } = useParams<{ projectId: string }>();
  if (!projectId) return null;

  const beats = useBeatStore((s) => s.beats[projectId]) || EMPTY_BEATS;
  const addBeat = useBeatStore((s) => s.addBeat);
  const updateBeat = useBeatStore((s) => s.updateBeat);
  const removeBeat = useBeatStore((s) => s.removeBeat);
  const reorderBeat = useBeatStore((s) => s.reorderBeat);
  const toggleSceneLink = useBeatStore((s) => s.toggleSceneLink);

  const doc = useScriptStore((s) => s.documents[projectId]);
  const scenes = useMemo(() => (doc ? estimateScenePages(doc) : []), [doc]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const selected = beats.find((b) => b.id === selectedId) || null;
  const linkedSceneIds = selected?.linkedSceneIds || [];

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const fromIndex = beats.findIndex((b) => b.id === active.id);
    const toIndex = beats.findIndex((b) => b.id === over.id);
    if (fromIndex !== -1 && toIndex !== -1) {
      reorderBeat(projectId, fromIndex, toIndex);
    }
  };

  const handleAdd = () => {
    const id = addBeat(projectId, 'New Beat');
    setSelectedId(id);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Corkboard */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-600">Beat Board</h3>
            <span className="text-xs text-gray-400">{beats.length} beats</span>
          </div>
          <Button size="sm" onClick={handleAdd} className="text-xs">
            + New Beat
          </Button>
        </div>
        <div className="overflow-x-auto px-4 pb-3">
          {beats.length === 0 ? (
            <div className="text-xs text-gray-400 py-6">
              Drop in your first beat — the story shape you have in mind before the writing starts.
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={beats.map((b) => b.id)}
                strategy={horizontalListSortingStrategy}
              >
                <div className="flex gap-3 min-h-[160px]">
                  {beats.map((beat, i) => (
                    <BeatCard
                      key={beat.id}
                      beat={beat}
                      index={i}
                      selected={selectedId === beat.id}
                      onSelect={() => setSelectedId(beat.id)}
                      onRemove={() => setDeleteId(beat.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>

      {/* Detail pane */}
      <div className="flex-1 overflow-y-auto p-4">
        {selected ? (
          <div>
            <div className="mb-4">
              <input
                type="text"
                value={selected.name}
                onChange={(e) => updateBeat(projectId, selected.id, { name: e.target.value })}
                className="text-xl font-bold bg-transparent text-gray-900 border-none outline-none w-full"
                placeholder="Beat Name"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <BeatProfile
                  beat={selected}
                  onUpdate={(updates) => updateBeat(projectId, selected.id, updates)}
                />
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Linked Scenes
                  </h3>
                  {scenes.length === 0 ? (
                    <p className="text-xs text-gray-400">
                      No scenes yet. Once you write scene headings in the Script tab they'll
                      show up here to link.
                    </p>
                  ) : (
                    <div className="space-y-1 max-h-96 overflow-y-auto">
                      {scenes.map((s) => {
                        const isLinked = linkedSceneIds.includes(s.sceneId);
                        return (
                          <label
                            key={s.sceneId}
                            className={`flex items-start gap-2 text-xs px-2 py-1.5 rounded cursor-pointer ${
                              isLinked ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            <input
                              type="checkbox"
                              className="mt-0.5"
                              checked={isLinked}
                              onChange={() =>
                                toggleSceneLink(projectId, selected.id, s.sceneId)
                              }
                            />
                            <span className="flex-1">
                              <span className="font-semibold text-yellow-600 mr-1">
                                {s.sceneNumber}
                              </span>
                              <span className="truncate">{s.heading}</span>
                            </span>
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
              {beats.length === 0
                ? 'Add a beat above to start sketching your story shape.'
                : 'Select a beat card to edit its details.'}
            </p>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete Beat"
        message="This will remove the beat from the board."
        onConfirm={() => {
          if (deleteId) removeBeat(projectId, deleteId);
          if (selectedId === deleteId) setSelectedId(null);
          setDeleteId(null);
        }}
        onClose={() => setDeleteId(null)}
      />
    </div>
  );
}
