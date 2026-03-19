import type { ElementType } from '@/types';
import { ELEMENT_TYPES } from '@/types';
import { ELEMENT_TYPE_LABELS, ELEMENT_TYPE_SHORTCUTS } from '@/lib/screenplay/slateConfig';

interface ElementTypeToolbarProps {
  currentType: ElementType | null;
  onSelect: (type: ElementType) => void;
}

const shortcutMap = Object.fromEntries(
  Object.entries(ELEMENT_TYPE_SHORTCUTS).map(([k, v]) => [v, k])
) as Record<ElementType, string>;

export function ElementTypeToolbar({ currentType, onSelect }: ElementTypeToolbarProps) {
  return (
    <div className="w-44 border-l border-gray-200 bg-gray-50 flex flex-col shrink-0">
      <div className="px-3 py-2 border-b border-gray-200">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Elements</span>
      </div>
      <div className="flex-1 overflow-y-auto py-1">
        {ELEMENT_TYPES.map((type) => (
          <button
            key={type}
            onMouseDown={(e) => {
              e.preventDefault(); // Prevent editor blur
              onSelect(type);
            }}
            className={`w-full text-left px-3 py-1.5 text-xs transition-colors flex items-center justify-between ${
              currentType === type
                ? 'bg-accent/10 text-accent'
                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
            }`}
          >
            <span>{ELEMENT_TYPE_LABELS[type]}</span>
            {shortcutMap[type] && (
              <kbd className="text-[10px] text-gray-400 font-mono">
                {'\u2318'}{shortcutMap[type]}
              </kbd>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
