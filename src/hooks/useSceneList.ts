import { useMemo } from 'react';
import { Node } from 'slate';
import type { Descendant } from 'slate';
import type { ScriptElement } from '@/types';

export interface SceneListItem {
  id: string;
  index: number;
  heading: string;
  sceneNumber: string;
}

export function useSceneList(document: Descendant[]): SceneListItem[] {
  return useMemo(() => {
    const scenes: SceneListItem[] = [];
    let autoNumber = 0;

    document.forEach((node, index) => {
      const el = node as ScriptElement;
      if (el.type === 'scene-heading') {
        autoNumber++;
        scenes.push({
          id: el.id,
          index,
          heading: Node.string(node),
          sceneNumber: el.sceneNumber || String(autoNumber),
        });
      }
    });

    return scenes;
  }, [document]);
}
