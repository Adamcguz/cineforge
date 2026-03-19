import { Node } from 'slate';
import type { Descendant } from 'slate';
import type { ScriptElement } from '@/types';

const LINES_PER_PAGE = 56;

export interface ScenePageInfo {
  sceneId: string;
  heading: string;
  sceneNumber: string;
  pageCount: number; // in eighths (1 = 1/8 page)
}

/**
 * Estimates page count per scene in eighths of a page.
 * Returns info for each scene heading found in the document.
 */
export function estimateScenePages(document: Descendant[]): ScenePageInfo[] {
  const scenes: ScenePageInfo[] = [];
  let currentScene: { id: string; heading: string; sceneNumber: string; lines: number } | null = null;
  let autoNumber = 0;

  function flushScene() {
    if (currentScene) {
      const pages = currentScene.lines / LINES_PER_PAGE;
      const eighths = Math.max(1, Math.round(pages * 8));
      scenes.push({
        sceneId: currentScene.id,
        heading: currentScene.heading,
        sceneNumber: currentScene.sceneNumber,
        pageCount: eighths,
      });
    }
  }

  for (const node of document) {
    const el = node as ScriptElement;
    const text = Node.string(node);

    if (el.type === 'scene-heading') {
      flushScene();
      autoNumber++;
      currentScene = {
        id: el.id,
        heading: text,
        sceneNumber: el.sceneNumber || String(autoNumber),
        lines: 0,
      };
      currentScene.lines += 3; // heading + blank line before + blank after
      continue;
    }

    if (!currentScene) continue;

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

    const wrappedLines = Math.max(1, Math.ceil((text.length || 1) / charsPerLine));
    if (el.type === 'character') currentScene.lines += 1;
    if (el.type === 'transition') currentScene.lines += 1;
    currentScene.lines += wrappedLines;
  }

  flushScene();
  return scenes;
}

/**
 * Formats eighths as page count string: "2 3/8" or "1" or "5/8"
 */
export function formatEighths(eighths: number): string {
  const whole = Math.floor(eighths / 8);
  const remainder = eighths % 8;
  if (remainder === 0) return String(whole || 0);
  const frac = `${remainder}/8`;
  return whole > 0 ? `${whole} ${frac}` : frac;
}
