import type { ElementType } from '@/types';
import { generateId } from '@/lib/uuid';
import type { Descendant } from 'slate';

export function createScriptElement(
  type: ElementType,
  text = ''
): Descendant {
  return {
    type,
    id: generateId(),
    children: [{ text }],
  } as Descendant;
}

export const ELEMENT_TYPE_LABELS: Record<ElementType, string> = {
  'act': 'Act',
  'scene-heading': 'Scene Heading',
  'action': 'Action',
  'character': 'Character',
  'dialogue': 'Dialogue',
  'parenthetical': 'Parenthetical',
  'transition': 'Transition',
  'shot': 'Shot',
  'text': 'Text',
};

export const ELEMENT_TYPE_SHORTCUTS: Record<number, ElementType> = {
  1: 'act',
  2: 'scene-heading',
  3: 'action',
  4: 'character',
  5: 'dialogue',
  6: 'parenthetical',
  7: 'transition',
  8: 'shot',
  9: 'text',
};

// Smart defaults: what element type follows after pressing Enter
export const ENTER_DEFAULTS: Record<ElementType, ElementType> = {
  'act': 'action',
  'scene-heading': 'action',
  'action': 'action',
  'character': 'dialogue',
  'dialogue': 'action',
  'parenthetical': 'dialogue',
  'transition': 'scene-heading',
  'shot': 'action',
  'text': 'action',
};

// Tab cycling order
const TAB_CYCLE: ElementType[] = ['action', 'character', 'dialogue', 'parenthetical'];

export function getNextTabType(current: ElementType): ElementType {
  const idx = TAB_CYCLE.indexOf(current);
  if (idx === -1) return TAB_CYCLE[0];
  return TAB_CYCLE[(idx + 1) % TAB_CYCLE.length];
}

export function getPrevTabType(current: ElementType): ElementType {
  const idx = TAB_CYCLE.indexOf(current);
  if (idx === -1) return TAB_CYCLE[TAB_CYCLE.length - 1];
  return TAB_CYCLE[(idx - 1 + TAB_CYCLE.length) % TAB_CYCLE.length];
}
