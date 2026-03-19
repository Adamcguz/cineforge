import type { BaseEditor, Descendant } from 'slate';
import type { ReactEditor } from 'slate-react';
import type { HistoryEditor } from 'slate-history';

export const ELEMENT_TYPES = [
  'act', 'scene-heading', 'action', 'character',
  'dialogue', 'parenthetical', 'transition', 'shot', 'text',
] as const;

export type ElementType = typeof ELEMENT_TYPES[number];

export interface ScriptElement {
  type: ElementType;
  id: string;
  sceneNumber?: string;
  revised?: boolean;
  children: CustomText[];
}

export interface CustomText {
  text: string;
  bold?: boolean;
  italic?: boolean;
}

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor & HistoryEditor;
    Element: ScriptElement;
    Text: CustomText;
  }
}

export type ScriptDocument = Descendant[];

export interface RevisionEntry {
  id: string;
  blockId: string;
  previousText: string;
  newText: string;
  draftColor: string;
  timestamp: string;
}
