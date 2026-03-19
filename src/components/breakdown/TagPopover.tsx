import { BREAKDOWN_CATEGORIES, CATEGORY_LABELS, CATEGORY_COLORS } from '@/types';
import type { BreakdownCategory } from '@/types';

interface TagPopoverProps {
  position: { x: number; y: number };
  onSelect: (category: BreakdownCategory) => void;
  onClose: () => void;
}

export function TagPopover({ position, onSelect, onClose }: TagPopoverProps) {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className="fixed z-50 bg-white shadow-lg border border-gray-200 rounded-lg shadow-xl p-2 grid grid-cols-3 gap-1 w-80"
        style={{ left: position.x, top: position.y }}
      >
        {BREAKDOWN_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => onSelect(cat)}
            className="flex items-center gap-2 px-2 py-1.5 rounded text-xs hover:bg-gray-100 transition-colors text-left"
          >
            <span
              className="w-3 h-3 rounded-sm shrink-0"
              style={{ backgroundColor: CATEGORY_COLORS[cat] }}
            />
            <span className="text-gray-600 truncate">{CATEGORY_LABELS[cat]}</span>
          </button>
        ))}
      </div>
    </>
  );
}
