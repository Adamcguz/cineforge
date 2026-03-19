import { useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent, DragOverEvent } from '@dnd-kit/core';
import { useState } from 'react';
import { useScheduleStore } from '@/store/useScheduleStore';
import { useScriptStore } from '@/store/useScriptStore';
import { useBreakdownStore } from '@/store/useBreakdownStore';
import { estimateScenePages } from '@/lib/breakdownSync';
import type { ScenePageInfo } from '@/lib/breakdownSync';
import type { Descendant } from 'slate';
import type { BreakdownTag, ShootDay } from '@/types';
import { SceneBank } from './SceneBank';
import { ShootDayColumn } from './ShootDayColumn';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

const EMPTY_DOC: Descendant[] = [];
const EMPTY_TAGS: BreakdownTag[] = [];
const EMPTY_SCHEDULE: ShootDay[] = [];

export function ScheduleTab() {
  const { projectId } = useParams<{ projectId: string }>();
  if (!projectId) return null;

  const doc = useScriptStore((s) => s.documents[projectId]) || EMPTY_DOC;
  const tags = useBreakdownStore((s) => s.tags[projectId]) || EMPTY_TAGS;
  const schedule = useScheduleStore((s) => s.schedules[projectId]) || EMPTY_SCHEDULE;
  const addShootDay = useScheduleStore((s) => s.addShootDay);
  const removeShootDay = useScheduleStore((s) => s.removeShootDay);
  const updateShootDay = useScheduleStore((s) => s.updateShootDay);
  const assignScene = useScheduleStore((s) => s.assignScene);
  const unassignScene = useScheduleStore((s) => s.unassignScene);
  const reorderScene = useScheduleStore((s) => s.reorderScene);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [removeDayId, setRemoveDayId] = useState<string | null>(null);

  const scenePages = useMemo(() => estimateScenePages(doc), [doc]);
  const scenePagesMap = useMemo(() => {
    const m = new Map<string, ScenePageInfo>();
    for (const sp of scenePages) m.set(sp.sceneId, sp);
    return m;
  }, [scenePages]);

  const assignedSceneIds = useMemo(() => {
    const set = new Set<string>();
    for (const day of schedule) {
      for (const sid of day.sceneIds) set.add(sid);
    }
    return set;
  }, [schedule]);

  const unassignedScenes = useMemo(
    () => scenePages.filter((sp) => !assignedSceneIds.has(sp.sceneId)),
    [scenePages, assignedSceneIds]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const findContainer = useCallback(
    (id: string): string | null => {
      if (unassignedScenes.some((s) => s.sceneId === id)) return 'bank';
      for (const day of schedule) {
        if (day.sceneIds.includes(id)) return day.id;
      }
      return null;
    },
    [unassignedScenes, schedule]
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragOver = useCallback(
    (_event: DragOverEvent) => {
      // Visual feedback handled by droppable isOver state
    },
    []
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);

      if (!over) return;

      const sceneId = active.id as string;
      const overId = over.id as string;

      // Determine target container
      let targetDayId: string | null = null;
      let targetIsBank = false;

      if (overId === 'bank') {
        targetIsBank = true;
      } else if (overId.startsWith('day-')) {
        targetDayId = overId.replace('day-', '');
      } else {
        // Dropped onto another scene card — find its container
        if (unassignedScenes.some((s) => s.sceneId === overId)) {
          targetIsBank = true;
        } else {
          for (const day of schedule) {
            if (day.sceneIds.includes(overId)) {
              targetDayId = day.id;
              break;
            }
          }
        }
      }

      const sourceContainer = findContainer(sceneId);

      if (targetIsBank) {
        if (sourceContainer && sourceContainer !== 'bank') {
          unassignScene(projectId, sceneId);
        }
        return;
      }

      if (!targetDayId) return;

      if (sourceContainer === targetDayId) {
        // Reorder within the same day
        const day = schedule.find((d) => d.id === targetDayId);
        if (!day) return;
        const fromIndex = day.sceneIds.indexOf(sceneId);
        let toIndex = day.sceneIds.indexOf(overId);
        if (toIndex === -1) toIndex = day.sceneIds.length;
        if (fromIndex !== toIndex) {
          reorderScene(projectId, targetDayId, fromIndex, toIndex);
        }
      } else {
        // Move to different day
        const day = schedule.find((d) => d.id === targetDayId);
        let insertIndex = day ? day.sceneIds.indexOf(overId) : -1;
        if (insertIndex === -1) insertIndex = day ? day.sceneIds.length : 0;
        assignScene(projectId, targetDayId, sceneId, insertIndex);
      }
    },
    [projectId, schedule, unassignedScenes, findContainer, assignScene, unassignScene, reorderScene]
  );

  const activeScene = activeId ? scenePagesMap.get(activeId) : null;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-600">Shooting Schedule</h2>
        <Button size="sm" onClick={() => addShootDay(projectId)}>
          + Shoot Day
        </Button>
      </div>

      {scenePages.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <p className="text-lg mb-1">No scenes yet</p>
            <p className="text-sm text-gray-400">
              Write scene headings in the Script tab to populate the schedule.
            </p>
          </div>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex-1 flex overflow-hidden">
            <SceneBank unassignedScenes={unassignedScenes} tags={tags} />

            <div className="flex-1 overflow-x-auto flex gap-3 p-3">
              {schedule.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-gray-400">
                  <p className="text-sm">Click "+ Shoot Day" to create your first shoot day.</p>
                </div>
              ) : (
                schedule.map((day) => (
                  <ShootDayColumn
                    key={day.id}
                    day={day}
                    scenePages={scenePagesMap}
                    tags={tags}
                    onRemove={() => setRemoveDayId(day.id)}
                    onUpdateLabel={(label) =>
                      updateShootDay(projectId, day.id, { label })
                    }
                    onUpdateDate={(date) =>
                      updateShootDay(projectId, day.id, { date })
                    }
                  />
                ))
              )}
            </div>
          </div>

          <DragOverlay>
            {activeScene ? (
              <div className="bg-gray-200 border border-blue-500 rounded px-3 py-2 shadow-lg opacity-90 w-64">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-yellow-600">
                    {activeScene.sceneNumber}
                  </span>
                </div>
                <p className="text-sm text-gray-800 truncate">
                  {activeScene.heading}
                </p>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      <ConfirmDialog
        open={removeDayId !== null}
        title="Remove Shoot Day"
        message="Scenes will return to the Scene Bank."
        onConfirm={() => {
          if (removeDayId) removeShootDay(projectId, removeDayId);
          setRemoveDayId(null);
        }}
        onClose={() => setRemoveDayId(null)}
      />
    </div>
  );
}
