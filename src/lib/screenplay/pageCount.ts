import { Node } from 'slate';
import type { Descendant } from 'slate';
import type { ScriptElement } from '@/types';

const LINES_PER_PAGE = 56;

export function estimatePageCount(document: Descendant[]): number {
  let totalLines = 0;

  for (const node of document) {
    const el = node as ScriptElement;
    const text = Node.string(node);
    if (!text && el.type === 'action') {
      totalLines += 1;
      continue;
    }

    // Estimate line wrapping based on element type and margins
    let charsPerLine: number;
    switch (el.type) {
      case 'dialogue':
        charsPerLine = 35; // narrower column
        break;
      case 'parenthetical':
        charsPerLine = 25;
        break;
      case 'character':
        charsPerLine = 30;
        break;
      default:
        charsPerLine = 60; // full width
    }

    const wrappedLines = Math.max(1, Math.ceil(text.length / charsPerLine));

    // Add spacing before certain elements
    if (el.type === 'scene-heading') totalLines += 2; // blank line before
    if (el.type === 'character') totalLines += 1; // blank line before
    if (el.type === 'transition') totalLines += 1;

    totalLines += wrappedLines;
  }

  return Math.max(1, Math.ceil(totalLines / LINES_PER_PAGE));
}
