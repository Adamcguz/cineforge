import { Editor, Transforms, Element as SlateElement } from 'slate';
import type { KeyboardEvent } from 'react';
import type { ElementType, ScriptElement } from '@/types';
import { generateId } from '@/lib/uuid';
import {
  ENTER_DEFAULTS,
  getNextTabType,
  getPrevTabType,
  ELEMENT_TYPE_SHORTCUTS,
  createScriptElement,
} from './slateConfig';

/**
 * Slate plugin that ensures every element has a unique `id`.
 * When Slate splits a node the two halves share the original id;
 * this normalizer assigns a fresh id to the second occurrence.
 */
export function withUniqueIds(editor: Editor): Editor {
  const { normalizeNode } = editor;

  editor.normalizeNode = (entry) => {
    const [node, path] = entry;

    if (path.length === 0 && 'children' in node) {
      const seen = new Set<string>();
      const children = (node as { children: ScriptElement[] }).children;
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (SlateElement.isElement(child) && 'id' in child) {
          const id = (child as ScriptElement).id;
          if (seen.has(id)) {
            Transforms.setNodes(editor, { id: generateId() } as Partial<ScriptElement>, { at: [i] });
            return;
          }
          seen.add(id);
        }
      }
    }

    normalizeNode(entry);
  };

  return editor;
}

export function handleScriptKeyDown(
  event: KeyboardEvent<HTMLDivElement>,
  editor: Editor
) {
  const { selection } = editor;
  if (!selection) return;

  const [match] = Editor.nodes(editor, {
    match: (n) => SlateElement.isElement(n) && 'type' in n,
  });

  if (!match) return;
  const [node] = match;
  if (!SlateElement.isElement(node)) return;
  const currentType = (node as ScriptElement).type;

  // Cmd/Ctrl + number: jump to element type
  if ((event.metaKey || event.ctrlKey) && !event.shiftKey) {
    const num = parseInt(event.key);
    if (num >= 1 && num <= 9 && ELEMENT_TYPE_SHORTCUTS[num]) {
      event.preventDefault();
      Transforms.setNodes(editor, { type: ELEMENT_TYPE_SHORTCUTS[num] } as Partial<ScriptElement>);
      return;
    }
  }

  // Tab: cycle forward through element types
  if (event.key === 'Tab' && !event.shiftKey && !event.metaKey && !event.ctrlKey) {
    event.preventDefault();
    const nextType = getNextTabType(currentType);
    Transforms.setNodes(editor, { type: nextType } as Partial<ScriptElement>);
    return;
  }

  // Shift+Tab: cycle backward through element types
  if (event.key === 'Tab' && event.shiftKey) {
    event.preventDefault();
    const prevType = getPrevTabType(currentType);
    Transforms.setNodes(editor, { type: prevType } as Partial<ScriptElement>);
    return;
  }

  // Enter: insert new block with smart default type
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    const newType: ElementType = ENTER_DEFAULTS[currentType];
    const newElement = createScriptElement(newType);
    Transforms.insertNodes(editor, newElement);
    return;
  }
}

export function getCurrentElementType(editor: Editor): ElementType | null {
  const { selection } = editor;
  if (!selection) return null;

  const [match] = Editor.nodes(editor, {
    match: (n) => SlateElement.isElement(n) && 'type' in n,
  });

  if (!match) return null;
  const [node] = match;
  if (!SlateElement.isElement(node)) return null;
  return (node as ScriptElement).type;
}

export function setElementType(editor: Editor, type: ElementType) {
  Transforms.setNodes(editor, { type } as Partial<ScriptElement>);
}

export function getSceneCount(editor: Editor): number {
  const scenes = Array.from(
    Editor.nodes(editor, {
      at: [],
      match: (n) => SlateElement.isElement(n) && (n as ScriptElement).type === 'scene-heading',
    })
  );
  return scenes.length;
}
