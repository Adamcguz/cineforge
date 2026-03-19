import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useMoodboardStore } from '@/store/useMoodboardStore';
import { useScriptStore } from '@/store/useScriptStore';
import { estimateScenePages } from '@/lib/breakdownSync';
import { saveImage, deleteImage, estimateStorageUsage } from '@/lib/idb';
import { generateId } from '@/lib/uuid';
import { MoodboardItemView } from './MoodboardItem';
import type { MoodboardItem } from '@/types';
import type { Descendant } from 'slate';
import { Button } from '@/components/ui/Button';

const EMPTY_ITEMS: MoodboardItem[] = [];
const EMPTY_DOC: Descendant[] = [];
const STORAGE_WARNING_MB = 50;

export function MoodboardTab() {
  const { projectId } = useParams<{ projectId: string }>();
  if (!projectId) return null;

  const doc = useScriptStore((s) => s.documents[projectId]) || EMPTY_DOC;
  const scenes = useMemo(() => estimateScenePages(doc), [doc]);

  const [sceneFilter, setSceneFilter] = useState<string>('project');
  const boardKey = sceneFilter === 'project' ? projectId : `${projectId}:${sceneFilter}`;

  const items = useMoodboardStore((s) => s.items[boardKey]) || EMPTY_ITEMS;
  const addItem = useMoodboardStore((s) => s.addItem);
  const updateItem = useMoodboardStore((s) => s.updateItem);
  const removeItem = useMoodboardStore((s) => s.removeItem);
  const bringToFront = useMoodboardStore((s) => s.bringToFront);
  const sendToBack = useMoodboardStore((s) => s.sendToBack);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    itemId: string;
  } | null>(null);
  const [storageUsageMB, setStorageUsageMB] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    estimateStorageUsage().then((bytes) =>
      setStorageUsageMB(Math.round(bytes / 1024 / 1024))
    );
  }, [items]);

  const handleFileUpload = useCallback(
    async (files: FileList) => {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) continue;
        const key = generateId();
        await saveImage(key, file);

        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
          const maxW = 300;
          const ratio = img.width / img.height;
          const w = Math.min(img.width, maxW);
          const h = w / ratio;
          addItem(boardKey, {
            type: 'image',
            x: 50 + Math.random() * 100,
            y: 50 + Math.random() * 100,
            width: w,
            height: h,
            content: `idb:${key}`,
          });
          URL.revokeObjectURL(url);
        };
        img.src = url;
      }
    },
    [boardKey, addItem]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer.files.length) {
        handleFileUpload(e.dataTransfer.files);
      }
    },
    [handleFileUpload]
  );

  const addTextCard = () => {
    addItem(boardKey, {
      type: 'text',
      x: 100 + Math.random() * 100,
      y: 100 + Math.random() * 100,
      width: 200,
      height: 120,
      content: 'New text card',
    });
  };

  const addColorSwatch = () => {
    addItem(boardKey, {
      type: 'color',
      x: 100 + Math.random() * 100,
      y: 100 + Math.random() * 100,
      width: 80,
      height: 80,
      content: '#3b82f6',
    });
  };

  const handleDeleteItem = async (itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    if (item?.type === 'image' && item.content.startsWith('idb:')) {
      await deleteImage(item.content.slice(4));
    }
    removeItem(boardKey, itemId);
    setContextMenu(null);
    setSelectedId(null);
  };

  const handleCanvasClick = () => {
    setSelectedId(null);
    setContextMenu(null);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-gray-600">Moodboard</h2>
          <select
            value={sceneFilter}
            onChange={(e) => setSceneFilter(e.target.value)}
            className="bg-gray-200 text-gray-600 text-xs rounded px-2 py-1 border border-gray-300"
          >
            <option value="project">Whole Project</option>
            {scenes.map((s) => (
              <option key={s.sceneId} value={s.sceneId}>
                Scene {s.sceneNumber}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          {storageUsageMB >= STORAGE_WARNING_MB && (
            <span className="text-xs text-yellow-600">
              Storage: ~{storageUsageMB}MB
            </span>
          )}
          <Button size="sm" variant="secondary" onClick={addTextCard}>
            + Text
          </Button>
          <Button size="sm" variant="secondary" onClick={addColorSwatch}>
            + Color
          </Button>
          <Button size="sm" onClick={() => fileInputRef.current?.click()}>
            + Image
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) handleFileUpload(e.target.files);
              e.target.value = '';
            }}
          />
        </div>
      </div>

      <div
        ref={canvasRef}
        className="flex-1 relative overflow-auto bg-gray-100"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={handleCanvasClick}
      >
        {items.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <p className="text-sm mb-1">Drop images here or use the toolbar above</p>
              <p className="text-xs">Add images, text cards, and color swatches</p>
            </div>
          </div>
        )}

        {items.map((item) => (
          <MoodboardItemView
            key={item.id}
            item={item}
            selected={selectedId === item.id}
            onSelect={() => setSelectedId(item.id)}
            onUpdate={(updates) => updateItem(boardKey, item.id, updates)}
            onContextMenu={(e) =>
              setContextMenu({ x: e.clientX, y: e.clientY, itemId: item.id })
            }
          />
        ))}

        {contextMenu && (
          <div
            className="fixed bg-white border border-gray-200 rounded shadow-lg py-1 z-50"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            {(() => {
              const item = items.find((i) => i.id === contextMenu.itemId);
              return (
                <>
                  {item?.type === 'text' && (
                    <button
                      className="w-full text-left px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-200"
                      onClick={() => {
                        const text = prompt('Edit text:', item.content);
                        if (text !== null)
                          updateItem(boardKey, contextMenu.itemId, { content: text });
                        setContextMenu(null);
                      }}
                    >
                      Edit Text
                    </button>
                  )}
                  {item?.type === 'color' && (
                    <button
                      className="w-full text-left px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-200"
                      onClick={() => {
                        const color = prompt('Enter color hex:', item.content);
                        if (color) updateItem(boardKey, contextMenu.itemId, { content: color });
                        setContextMenu(null);
                      }}
                    >
                      Change Color
                    </button>
                  )}
                  <button
                    className="w-full text-left px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-200"
                    onClick={() => {
                      const caption = prompt(
                        'Caption:',
                        item?.caption || ''
                      );
                      if (caption !== null)
                        updateItem(boardKey, contextMenu.itemId, { caption });
                      setContextMenu(null);
                    }}
                  >
                    Edit Caption
                  </button>
                  <button
                    className="w-full text-left px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-200"
                    onClick={() => {
                      bringToFront(boardKey, contextMenu.itemId);
                      setContextMenu(null);
                    }}
                  >
                    Bring to Front
                  </button>
                  <button
                    className="w-full text-left px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-200"
                    onClick={() => {
                      sendToBack(boardKey, contextMenu.itemId);
                      setContextMenu(null);
                    }}
                  >
                    Send to Back
                  </button>
                  <button
                    className="w-full text-left px-3 py-1.5 text-sm text-red-500 hover:bg-gray-200"
                    onClick={() => handleDeleteItem(contextMenu.itemId)}
                  >
                    Delete
                  </button>
                </>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
