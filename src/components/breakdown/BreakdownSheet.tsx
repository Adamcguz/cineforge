import type { BreakdownTag } from '@/types';
import { BREAKDOWN_CATEGORIES, CATEGORY_LABELS, CATEGORY_COLORS } from '@/types';

interface BreakdownSheetProps {
  tags: BreakdownTag[];
  sceneHeading: string;
  onRemoveTag: (tagId: string) => void;
}

export function BreakdownSheet({ tags, sceneHeading, onRemoveTag }: BreakdownSheetProps) {
  const grouped = BREAKDOWN_CATEGORIES.map((cat) => ({
    category: cat,
    label: CATEGORY_LABELS[cat],
    color: CATEGORY_COLORS[cat],
    items: tags.filter((t) => t.category === cat),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-800">Breakdown Sheet</h3>
        <p className="text-xs text-gray-400 mt-0.5 uppercase">{sceneHeading || 'Select a scene'}</p>
      </div>

      {grouped.length === 0 ? (
        <div className="px-4 py-8 text-center">
          <p className="text-gray-400 text-sm">No elements tagged yet.</p>
          <p className="text-gray-500 text-xs mt-1">Select text in the script to tag production elements.</p>
        </div>
      ) : (
        <div className="px-4 py-2 space-y-3">
          {grouped.map((group) => (
            <div key={group.category}>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="w-2.5 h-2.5 rounded-sm"
                  style={{ backgroundColor: group.color }}
                />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {group.label}
                </span>
                <span className="text-xs text-gray-400">({group.items.length})</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {group.items.map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs cursor-pointer group"
                    style={{
                      backgroundColor: group.color + '20',
                      color: group.color,
                    }}
                  >
                    {tag.text}
                    <button
                      onClick={() => onRemoveTag(tag.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-current"
                    >
                      x
                    </button>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
