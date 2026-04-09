import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Beat } from '@/types';

interface BeatCardProps {
  beat: Beat;
  index: number;
  selected: boolean;
  onSelect: () => void;
  onRemove: () => void;
}

const ACT_COLORS: Record<string, string> = {
  I: 'bg-amber-50 border-amber-300',
  II: 'bg-sky-50 border-sky-300',
  III: 'bg-rose-50 border-rose-300',
  Other: 'bg-gray-50 border-gray-300',
};

export function BeatCard({ beat, index, selected, onSelect, onRemove }: BeatCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: beat.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const actClass = (beat.act && ACT_COLORS[beat.act]) || 'bg-white border-gray-200';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`w-56 flex-shrink-0 border-2 rounded-md shadow-sm ${actClass} ${
        selected ? 'ring-2 ring-blue-500' : ''
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="px-2 py-1 border-b border-black/10 cursor-grab active:cursor-grabbing flex items-center justify-between"
      >
        <span className="text-[10px] uppercase tracking-wider text-gray-500">
          #{index + 1}
          {beat.act ? ` · Act ${beat.act}` : ''}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="text-gray-400 hover:text-red-500 text-xs"
        >
          x
        </button>
      </div>
      <button
        onClick={onSelect}
        className="w-full text-left p-3 min-h-[120px] flex flex-col gap-1.5"
      >
        <div className="text-sm font-semibold text-gray-900 line-clamp-2">
          {beat.name || 'Untitled Beat'}
        </div>
        {beat.summary && (
          <div className="text-xs text-gray-600 line-clamp-4">{beat.summary}</div>
        )}
      </button>
    </div>
  );
}
