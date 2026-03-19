import { useState, useRef, useEffect, useCallback } from 'react';
import type { MoodboardItem as MoodboardItemType } from '@/types';
import { loadImage } from '@/lib/idb';

interface MoodboardItemProps {
  item: MoodboardItemType;
  selected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<MoodboardItemType>) => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

export function MoodboardItemView({
  item,
  selected,
  onSelect,
  onUpdate,
  onContextMenu,
}: MoodboardItemProps) {
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const dragStart = useRef({ x: 0, y: 0, ix: 0, iy: 0 });
  const resizeStart = useRef({ x: 0, y: 0, iw: 0, ih: 0 });

  // Load image blob from IDB
  useEffect(() => {
    if (item.type === 'image' && item.content.startsWith('idb:')) {
      const key = item.content.slice(4);
      loadImage(key).then((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          setImageUrl(url);
          return () => URL.revokeObjectURL(url);
        }
      });
    } else if (item.type === 'image') {
      setImageUrl(item.content);
    }
  }, [item.type, item.content]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (resizing) return;
      e.stopPropagation();
      onSelect();
      setDragging(true);
      dragStart.current = { x: e.clientX, y: e.clientY, ix: item.x, iy: item.y };

      const handleMove = (ev: MouseEvent) => {
        const dx = ev.clientX - dragStart.current.x;
        const dy = ev.clientY - dragStart.current.y;
        onUpdate({ x: dragStart.current.ix + dx, y: dragStart.current.iy + dy });
      };

      const handleUp = () => {
        setDragging(false);
        window.removeEventListener('mousemove', handleMove);
        window.removeEventListener('mouseup', handleUp);
      };

      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleUp);
    },
    [item.x, item.y, onUpdate, onSelect, resizing]
  );

  const handleResizeDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setResizing(true);
      resizeStart.current = {
        x: e.clientX,
        y: e.clientY,
        iw: item.width,
        ih: item.height,
      };

      const handleMove = (ev: MouseEvent) => {
        const dx = ev.clientX - resizeStart.current.x;
        const dy = ev.clientY - resizeStart.current.y;
        onUpdate({
          width: Math.max(60, resizeStart.current.iw + dx),
          height: Math.max(40, resizeStart.current.ih + dy),
        });
      };

      const handleUp = () => {
        setResizing(false);
        window.removeEventListener('mousemove', handleMove);
        window.removeEventListener('mouseup', handleUp);
      };

      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleUp);
    },
    [item.width, item.height, onUpdate]
  );

  return (
    <div
      onMouseDown={handleMouseDown}
      onContextMenu={(e) => {
        e.preventDefault();
        onSelect();
        onContextMenu(e);
      }}
      className={`absolute select-none ${dragging ? 'cursor-grabbing' : 'cursor-grab'} ${
        selected ? 'ring-2 ring-blue-500' : ''
      }`}
      style={{
        left: item.x,
        top: item.y,
        width: item.width,
        height: item.height,
        zIndex: item.zIndex,
      }}
    >
      {item.type === 'image' && imageUrl && (
        <img
          src={imageUrl}
          alt={item.caption || ''}
          className="w-full h-full object-cover rounded"
          draggable={false}
        />
      )}

      {item.type === 'text' && (
        <div className="w-full h-full bg-gray-100 border border-gray-300 rounded p-2 overflow-hidden">
          <p className="text-sm text-gray-800 whitespace-pre-wrap">{item.content}</p>
        </div>
      )}

      {item.type === 'color' && (
        <div
          className="w-full h-full rounded border border-gray-300"
          style={{ backgroundColor: item.content }}
        />
      )}

      {item.caption && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-xs text-gray-100 px-1.5 py-0.5 rounded-b truncate">
          {item.caption}
        </div>
      )}

      {selected && (
        <div
          onMouseDown={handleResizeDown}
          className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 cursor-se-resize"
        />
      )}
    </div>
  );
}
