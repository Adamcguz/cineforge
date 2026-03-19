import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useShotListStore } from '@/store/useShotListStore';
import type { Shot } from '@/types';
import { ShotRow } from './ShotRow';

const EMPTY_SHOTS: Shot[] = [];

interface SceneShotListProps {
  projectId: string;
  sceneId: string;
  sceneNumber: string;
  sceneHeading: string;
}

export function SceneShotList({
  projectId,
  sceneId,
  sceneNumber,
  sceneHeading,
}: SceneShotListProps) {
  const [expanded, setExpanded] = useState(true);
  const shots = useShotListStore((s) => s.shots[projectId]?.[sceneId]) || EMPTY_SHOTS;
  const addShot = useShotListStore((s) => s.addShot);
  const updateShot = useShotListStore((s) => s.updateShot);
  const removeShot = useShotListStore((s) => s.removeShot);
  const duplicateShot = useShotListStore((s) => s.duplicateShot);
  const reorderShot = useShotListStore((s) => s.reorderShot);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const completedCount = shots.filter((s: Shot) => s.completed).length;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const fromIndex = shots.findIndex((s: Shot) => s.id === active.id);
    const toIndex = shots.findIndex((s: Shot) => s.id === over.id);
    if (fromIndex !== -1 && toIndex !== -1) {
      reorderShot(projectId, sceneId, fromIndex, toIndex);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg mb-3 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-100 hover:bg-gray-100 text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{expanded ? '▼' : '▶'}</span>
          <span className="text-sm font-bold text-yellow-600">{sceneNumber}</span>
          <span className="text-sm text-gray-600">{sceneHeading}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">
            {completedCount}/{shots.length} shots
          </span>
        </div>
      </button>

      {expanded && (
        <div className="bg-gray-50">
          {shots.length > 0 && (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200 text-xs text-gray-400 uppercase">
                    <th className="px-2 py-1.5 w-8"></th>
                    <th className="px-2 py-1.5 w-10"></th>
                    <th className="px-2 py-1.5 w-16">#</th>
                    <th className="px-2 py-1.5">Type</th>
                    <th className="px-2 py-1.5">Angle</th>
                    <th className="px-2 py-1.5">Movement</th>
                    <th className="px-2 py-1.5">Description</th>
                    <th className="px-2 py-1.5">Notes</th>
                    <th className="px-2 py-1.5 w-20"></th>
                  </tr>
                </thead>
                <tbody>
                  <SortableContext
                    items={shots.map((s: Shot) => s.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {shots.map((shot: Shot) => (
                      <ShotRow
                        key={shot.id}
                        shot={shot}
                        onUpdate={(updates) =>
                          updateShot(projectId, sceneId, shot.id, updates)
                        }
                        onRemove={() => removeShot(projectId, sceneId, shot.id)}
                        onDuplicate={() =>
                          duplicateShot(projectId, sceneId, shot.id)
                        }
                      />
                    ))}
                  </SortableContext>
                </tbody>
              </table>
            </DndContext>
          )}
          <div className="px-4 py-2 border-t border-gray-200">
            <button
              onClick={() => addShot(projectId, sceneId)}
              className="text-xs text-blue-600 hover:text-blue-600"
            >
              + Add Shot
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
