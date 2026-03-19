import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { BankSceneCard } from './SceneCard';
import type { ScenePageInfo } from '@/lib/breakdownSync';
import type { BreakdownTag } from '@/types';

interface SceneBankProps {
  unassignedScenes: ScenePageInfo[];
  tags: BreakdownTag[];
}

export function SceneBank({ unassignedScenes, tags }: SceneBankProps) {
  const { setNodeRef, isOver } = useDroppable({ id: 'bank' });

  return (
    <div className="w-64 flex-shrink-0 flex flex-col border-r border-gray-200">
      <div className="px-3 py-2 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-600">
          Scene Bank
          <span className="text-gray-400 font-normal ml-1">
            ({unassignedScenes.length})
          </span>
        </h3>
      </div>
      <div
        ref={setNodeRef}
        className={`flex-1 overflow-y-auto p-2 space-y-1.5 ${
          isOver ? 'bg-gray-100 ring-1 ring-inset ring-blue-300' : ''
        }`}
      >
        <SortableContext
          items={unassignedScenes.map((s) => s.sceneId)}
          strategy={verticalListSortingStrategy}
        >
          {unassignedScenes.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">
              All scenes scheduled
            </p>
          ) : (
            unassignedScenes.map((scene) => (
              <BankSceneCard
                key={scene.sceneId}
                sceneId={scene.sceneId}
                sceneNumber={scene.sceneNumber}
                heading={scene.heading}
                pageEighths={scene.pageCount}
                castTags={tags.filter(
                  (t) => t.sceneId === scene.sceneId && t.category === 'cast'
                )}
                locationTags={tags.filter(
                  (t) => t.sceneId === scene.sceneId && t.category === 'location'
                )}
              />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
}
