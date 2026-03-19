import { useState, useCallback, useRef } from 'react';
import { Node } from 'slate';
import type { Descendant } from 'slate';
import type { ScriptElement, BreakdownTag, BreakdownCategory } from '@/types';
import { CATEGORY_COLORS } from '@/types';
import { TagPopover } from './TagPopover';

interface BreakdownScriptViewProps {
  document: Descendant[];
  tags: BreakdownTag[];
  selectedSceneId: string | null;
  onSelectScene: (sceneId: string) => void;
  onAddTag: (tag: Omit<BreakdownTag, 'id'>) => void;
}

export function BreakdownScriptView({
  document,
  tags,
  selectedSceneId,
  onSelectScene,
  onAddTag,
}: BreakdownScriptViewProps) {
  const [popover, setPopover] = useState<{ x: number; y: number; text: string; blockId: string; sceneId: string; startOffset: number; endOffset: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Build scene mapping: which blocks belong to which scene
  const sceneBlocks: { sceneId: string; heading: string; blocks: ScriptElement[] }[] = [];
  let currentScene: { sceneId: string; heading: string; blocks: ScriptElement[] } | null = null;

  for (const node of document) {
    const el = node as ScriptElement;
    if (el.type === 'scene-heading') {
      currentScene = {
        sceneId: el.id,
        heading: Node.string(node),
        blocks: [el],
      };
      sceneBlocks.push(currentScene);
    } else if (currentScene) {
      currentScene.blocks.push(el);
    }
  }

  const handleTextSelect = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !selection.toString().trim()) {
      return;
    }

    const selectedText = selection.toString().trim();
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    // Find which block and scene the selection is in
    const anchorNode = selection.anchorNode;
    let blockEl = anchorNode?.parentElement;
    while (blockEl && !blockEl.dataset.blockId) {
      blockEl = blockEl.parentElement;
    }

    if (!blockEl?.dataset.blockId || !blockEl?.dataset.sceneId) return;

    setPopover({
      x: rect.left + rect.width / 2 - 160,
      y: rect.bottom + 8,
      text: selectedText,
      blockId: blockEl.dataset.blockId,
      sceneId: blockEl.dataset.sceneId,
      startOffset: range.startOffset,
      endOffset: range.endOffset,
    });
  }, []);

  const handleCategorySelect = useCallback(
    (category: BreakdownCategory) => {
      if (!popover) return;
      onAddTag({
        sceneId: popover.sceneId,
        category,
        text: popover.text,
        blockId: popover.blockId,
        startOffset: popover.startOffset,
        endOffset: popover.endOffset,
      });
      setPopover(null);
      window.getSelection()?.removeAllRanges();
    },
    [popover, onAddTag]
  );

  const getBlockTags = (blockId: string) =>
    tags.filter((t) => t.blockId === blockId);

  return (
    <div ref={containerRef} className="h-full overflow-y-auto" onMouseUp={handleTextSelect}>
      <div className="screenplay-editor max-w-2xl mx-auto py-8 px-8">
        {sceneBlocks.length === 0 ? (
          <p className="text-gray-400 text-center py-12">
            No scenes in script yet. Write your script first.
          </p>
        ) : (
          sceneBlocks.map((scene) => (
            <div
              key={scene.sceneId}
              className={`mb-6 rounded-lg transition-colors cursor-pointer px-3 py-2 -mx-3 ${
                selectedSceneId === scene.sceneId
                  ? 'bg-gray-100/30 ring-1 ring-gray-200/50'
                  : 'hover:bg-gray-50/50'
              }`}
              onClick={() => onSelectScene(scene.sceneId)}
            >
              {scene.blocks.map((block, blockIdx) => {
                const text = block.children.map((c) => c.text).join('');
                const blockTags = getBlockTags(block.id);

                return (
                  <div
                    key={`${block.id}-${blockIdx}`}
                    data-block-id={block.id}
                    data-scene-id={scene.sceneId}
                    className={getBlockClassName(block.type)}
                    style={getBlockStyle(block.type)}
                  >
                    {renderTextWithTags(text, blockTags)}
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>

      {popover && (
        <TagPopover
          position={{ x: popover.x, y: popover.y }}
          onSelect={handleCategorySelect}
          onClose={() => setPopover(null)}
        />
      )}
    </div>
  );
}

function getBlockClassName(type: string): string {
  switch (type) {
    case 'act': return 'text-center uppercase font-bold py-2';
    case 'scene-heading': return 'uppercase font-bold mt-4 mb-1 text-gray-900 bg-gray-200/70 px-2 py-1 rounded';
    case 'action': return 'my-1';
    case 'character': return 'uppercase mt-3 mb-0';
    case 'dialogue': return 'my-0';
    case 'parenthetical': return 'my-0 text-gray-500';
    case 'transition': return 'text-right uppercase mt-3 mb-1';
    case 'shot': return 'uppercase mt-2 mb-1';
    default: return 'my-1';
  }
}

function getBlockStyle(type: string): React.CSSProperties {
  switch (type) {
    case 'character': return { marginLeft: '40%' };
    case 'dialogue': return { marginLeft: '25%', marginRight: '25%' };
    case 'parenthetical': return { marginLeft: '30%', marginRight: '30%' };
    default: return {};
  }
}

function renderTextWithTags(text: string, blockTags: BreakdownTag[]): React.ReactNode {
  if (blockTags.length === 0) return text || '\u00A0';
  if (!text) return '\u00A0';

  // Simple approach: highlight tagged text segments
  const highlights: { start: number; end: number; color: string }[] = [];
  for (const tag of blockTags) {
    const idx = text.toUpperCase().indexOf(tag.text.toUpperCase());
    if (idx !== -1) {
      highlights.push({
        start: idx,
        end: idx + tag.text.length,
        color: CATEGORY_COLORS[tag.category],
      });
    }
  }

  if (highlights.length === 0) return text;

  // Sort by position
  highlights.sort((a, b) => a.start - b.start);

  const parts: React.ReactNode[] = [];
  let lastEnd = 0;

  for (const hl of highlights) {
    if (hl.start > lastEnd) {
      parts.push(text.slice(lastEnd, hl.start));
    }
    parts.push(
      <span
        key={hl.start}
        className="rounded px-0.5"
        style={{ backgroundColor: hl.color + '30', borderBottom: `2px solid ${hl.color}` }}
      >
        {text.slice(hl.start, hl.end)}
      </span>
    );
    lastEnd = hl.end;
  }

  if (lastEnd < text.length) {
    parts.push(text.slice(lastEnd));
  }

  return parts;
}
