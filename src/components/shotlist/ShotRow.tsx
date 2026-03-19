import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Shot } from '@/types';
import { SHOT_TYPES, SHOT_ANGLES, SHOT_MOVEMENTS } from '@/types';

interface ShotRowProps {
  shot: Shot;
  onUpdate: (updates: Partial<Shot>) => void;
  onRemove: () => void;
  onDuplicate: () => void;
}

export function ShotRow({ shot, onUpdate, onRemove, onDuplicate }: ShotRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: shot.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`border-b border-gray-200 hover:bg-gray-100 ${
        shot.completed ? 'opacity-60' : ''
      }`}
    >
      <td className="px-2 py-1.5 w-8">
        <button
          {...attributes}
          {...listeners}
          className="text-gray-400 hover:text-gray-500 cursor-grab active:cursor-grabbing"
          title="Drag to reorder"
        >
          &#x2630;
        </button>
      </td>
      <td className="px-2 py-1.5 w-10">
        <input
          type="checkbox"
          checked={shot.completed}
          onChange={(e) => onUpdate({ completed: e.target.checked })}
          className="accent-blue-500"
        />
      </td>
      <td className="px-2 py-1.5 w-16">
        <input
          type="text"
          value={shot.number}
          onChange={(e) => onUpdate({ number: e.target.value })}
          className="bg-transparent text-gray-800 text-sm w-full border-none outline-none"
        />
      </td>
      <td className="px-2 py-1.5">
        <select
          value={shot.type}
          onChange={(e) => onUpdate({ type: e.target.value as Shot['type'] })}
          className="bg-gray-200 text-gray-800 text-sm rounded px-1.5 py-0.5 border border-gray-300"
        >
          {SHOT_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </td>
      <td className="px-2 py-1.5">
        <select
          value={shot.angle}
          onChange={(e) => onUpdate({ angle: e.target.value as Shot['angle'] })}
          className="bg-gray-200 text-gray-800 text-sm rounded px-1.5 py-0.5 border border-gray-300"
        >
          {SHOT_ANGLES.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </td>
      <td className="px-2 py-1.5">
        <select
          value={shot.movement}
          onChange={(e) => onUpdate({ movement: e.target.value as Shot['movement'] })}
          className="bg-gray-200 text-gray-800 text-sm rounded px-1.5 py-0.5 border border-gray-300"
        >
          {SHOT_MOVEMENTS.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </td>
      <td className="px-2 py-1.5">
        <input
          type="text"
          value={shot.frame}
          onChange={(e) => onUpdate({ frame: e.target.value })}
          placeholder="Description..."
          className="bg-transparent text-gray-600 text-sm w-full border-none outline-none placeholder-gray-400"
        />
      </td>
      <td className="px-2 py-1.5">
        <input
          type="text"
          value={shot.notes || ''}
          onChange={(e) => onUpdate({ notes: e.target.value })}
          placeholder="Notes..."
          className="bg-transparent text-gray-500 text-sm w-full border-none outline-none placeholder-gray-400"
        />
      </td>
      <td className="px-2 py-1.5 w-20 text-right">
        <button
          onClick={onDuplicate}
          className="text-gray-400 hover:text-blue-600 text-xs mr-2"
          title="Duplicate"
        >
          Copy
        </button>
        <button
          onClick={onRemove}
          className="text-gray-400 hover:text-red-500 text-xs"
          title="Remove"
        >
          Del
        </button>
      </td>
    </tr>
  );
}
