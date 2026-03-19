import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SceneCard } from './SceneCard';
import { formatEighths } from '@/lib/breakdownSync';
import type { ShootDay } from '@/types';
import type { ScenePageInfo } from '@/lib/breakdownSync';
import type { BreakdownTag } from '@/types';

interface ShootDayColumnProps {
  day: ShootDay;
  scenePages: Map<string, ScenePageInfo>;
  tags: BreakdownTag[];
  onRemove: () => void;
  onUpdateLabel: (label: string) => void;
  onUpdateDate: (date: string) => void;
}

export function ShootDayColumn({
  day,
  scenePages,
  tags,
  onRemove,
  onUpdateLabel,
  onUpdateDate,
}: ShootDayColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: `day-${day.id}` });

  const totalEighths = day.sceneIds.reduce((sum, sid) => {
    const info = scenePages.get(sid);
    return sum + (info?.pageCount || 0);
  }, 0);

  const totalPages = totalEighths / 8;
  const overloaded = totalPages >= 8;

  // Cast conflict: same cast member in scenes at different locations
  const dayCast = new Map<string, Set<string>>();
  for (const sid of day.sceneIds) {
    const sceneCast = tags.filter((t) => t.sceneId === sid && t.category === 'cast');
    const sceneLocations = tags.filter((t) => t.sceneId === sid && t.category === 'location');
    const locStr = sceneLocations.map((l) => l.text).join(',') || 'unknown';
    for (const c of sceneCast) {
      if (!dayCast.has(c.text)) dayCast.set(c.text, new Set());
      dayCast.get(c.text)!.add(locStr);
    }
  }
  const castConflicts = [...dayCast.entries()]
    .filter(([, locs]) => locs.size > 1)
    .map(([name]) => name);

  return (
    <div className="w-72 flex-shrink-0 flex flex-col bg-gray-100 rounded-lg border border-gray-200">
      <div className="px-3 py-2 border-b border-gray-200">
        <div className="flex items-center justify-between mb-1">
          <input
            type="text"
            value={day.label}
            onChange={(e) => onUpdateLabel(e.target.value)}
            className="bg-transparent text-sm font-semibold text-gray-800 border-none outline-none w-28"
          />
          <button
            onClick={onRemove}
            className="text-gray-400 hover:text-red-500 text-xs"
          >
            Remove
          </button>
        </div>
        <input
          type="date"
          value={day.date || ''}
          onChange={(e) => onUpdateDate(e.target.value)}
          className="bg-gray-200 text-xs text-gray-500 rounded px-1.5 py-0.5 border border-gray-300 w-full"
        />
        <div className="flex items-center justify-between mt-1.5">
          <span className={`text-xs ${overloaded ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
            {formatEighths(totalEighths)} pages
          </span>
          <span className="text-xs text-gray-400">
            {day.sceneIds.length} scene{day.sceneIds.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {overloaded && (
        <div className="px-3 py-1 bg-red-50 border-b border-red-200 text-xs text-red-600">
          8+ pages — heavy day
        </div>
      )}
      {castConflicts.length > 0 && (
        <div className="px-3 py-1 bg-yellow-50 border-b border-yellow-200 text-xs text-yellow-600">
          Cast at multiple locations: {castConflicts.join(', ')}
        </div>
      )}

      <div
        ref={setNodeRef}
        className={`flex-1 overflow-y-auto p-2 space-y-1.5 min-h-[120px] ${
          isOver ? 'bg-blue-50 ring-1 ring-inset ring-blue-300' : ''
        }`}
      >
        <SortableContext
          items={day.sceneIds}
          strategy={verticalListSortingStrategy}
        >
          {day.sceneIds.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-6">
              Drop scenes here
            </p>
          ) : (
            day.sceneIds.map((sid) => {
              const info = scenePages.get(sid);
              return (
                <SceneCard
                  key={sid}
                  sceneId={sid}
                  sceneNumber={info?.sceneNumber || '?'}
                  heading={info?.heading || 'Unknown Scene'}
                  pageEighths={info?.pageCount || 0}
                  castTags={tags.filter(
                    (t) => t.sceneId === sid && t.category === 'cast'
                  )}
                  locationTags={tags.filter(
                    (t) => t.sceneId === sid && t.category === 'location'
                  )}
                />
              );
            })
          )}
        </SortableContext>
      </div>
    </div>
  );
}
