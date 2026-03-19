import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { formatEighths } from '@/lib/breakdownSync';
import type { BreakdownTag } from '@/types';

interface SceneCardProps {
  sceneId: string;
  sceneNumber: string;
  heading: string;
  pageEighths: number;
  castTags: BreakdownTag[];
  locationTags: BreakdownTag[];
  isDragging?: boolean;
}

export function SceneCard({
  sceneId,
  sceneNumber,
  heading,
  pageEighths,
  castTags,
  locationTags,
}: SceneCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: sceneId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const uniqueCast = [...new Set(castTags.map((t) => t.text))];
  const uniqueLocations = [...new Set(locationTags.map((t) => t.text))];

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-gray-200 border border-gray-300 rounded px-3 py-2 cursor-grab active:cursor-grabbing select-none"
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-bold text-yellow-600">
          {sceneNumber}
        </span>
        <span className="text-xs text-gray-500">
          {formatEighths(pageEighths)} pg
        </span>
      </div>
      <p className="text-sm text-gray-800 truncate mb-1">
        {heading || 'Untitled Scene'}
      </p>
      {uniqueLocations.length > 0 && (
        <p className="text-xs text-yellow-600 truncate mb-0.5">
          {uniqueLocations.join(', ')}
        </p>
      )}
      {uniqueCast.length > 0 && (
        <p className="text-xs text-gray-500 truncate">
          {uniqueCast.join(', ')}
        </p>
      )}
    </div>
  );
}

interface BankSceneCardProps {
  sceneId: string;
  sceneNumber: string;
  heading: string;
  pageEighths: number;
  castTags: BreakdownTag[];
  locationTags: BreakdownTag[];
}

export function BankSceneCard({
  sceneId,
  sceneNumber,
  heading,
  pageEighths,
  castTags,
  locationTags,
}: BankSceneCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: sceneId, data: { container: 'bank' } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const uniqueCast = [...new Set(castTags.map((t) => t.text))];
  const uniqueLocations = [...new Set(locationTags.map((t) => t.text))];

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-gray-100 border border-gray-200 rounded px-2 py-1.5 cursor-grab active:cursor-grabbing select-none"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-yellow-600">{sceneNumber}</span>
        <span className="text-xs text-gray-400">{formatEighths(pageEighths)} pg</span>
      </div>
      <p className="text-xs text-gray-600 truncate">{heading || 'Untitled'}</p>
      {uniqueLocations.length > 0 && (
        <p className="text-xs text-yellow-600 truncate">{uniqueLocations[0]}</p>
      )}
      {uniqueCast.length > 0 && (
        <p className="text-xs text-gray-400 truncate">{uniqueCast.length} cast</p>
      )}
    </div>
  );
}
