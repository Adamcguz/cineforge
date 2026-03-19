import { useMemo } from 'react';
import { Node } from 'slate';
import type { Descendant } from 'slate';
import type { ScriptElement } from '@/types';

const LINES_PER_PAGE = 56;

/**
 * Returns a Set of element IDs where a page break falls immediately before that element.
 * Uses the same line-counting logic as the page count estimator.
 */
export function usePageBreaks(document: Descendant[]): Set<string> {
  return useMemo(() => {
    const breaks = new Set<string>();
    let totalLines = 0;
    let currentPage = 1;

    for (const node of document) {
      const el = node as ScriptElement;
      const text = Node.string(node);

      // Calculate spacing before element
      let spacingBefore = 0;
      if (el.type === 'scene-heading') spacingBefore = 2;
      if (el.type === 'character') spacingBefore = 1;
      if (el.type === 'transition') spacingBefore = 1;

      // Calculate wrapped lines
      let charsPerLine: number;
      switch (el.type) {
        case 'dialogue':
          charsPerLine = 35;
          break;
        case 'parenthetical':
          charsPerLine = 25;
          break;
        case 'character':
          charsPerLine = 30;
          break;
        default:
          charsPerLine = 60;
      }

      const wrappedLines = (!text && el.type === 'action')
        ? 1
        : Math.max(1, Math.ceil(text.length / charsPerLine));

      const elementLines = spacingBefore + wrappedLines;
      const lineAfter = totalLines + elementLines;
      const pageAfter = Math.ceil(lineAfter / LINES_PER_PAGE);

      // If this element pushes us past the current page boundary,
      // mark it as the start of a new page
      if (pageAfter > currentPage && el.id) {
        breaks.add(el.id);
        currentPage = pageAfter;
      }

      totalLines = lineAfter;
    }

    return breaks;
  }, [document]);
}
