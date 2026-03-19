import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useScriptStore } from '@/store/useScriptStore';
import { estimateScenePages } from '@/lib/breakdownSync';
import { SceneShotList } from './SceneShotList';
import type { Descendant } from 'slate';

const EMPTY_DOC: Descendant[] = [];

export function ShotListTab() {
  const { projectId } = useParams<{ projectId: string }>();
  if (!projectId) return null;

  const doc = useScriptStore((s) => s.documents[projectId]) || EMPTY_DOC;
  const scenes = useMemo(() => estimateScenePages(doc), [doc]);

  if (scenes.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p className="text-lg mb-1">No scenes yet</p>
          <p className="text-sm text-gray-400">
            Write scene headings in the Script tab to build your shot list.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-2 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-600">Shot List</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {scenes.map((scene) => (
          <SceneShotList
            key={scene.sceneId}
            projectId={projectId}
            sceneId={scene.sceneId}
            sceneNumber={scene.sceneNumber}
            sceneHeading={scene.heading}
          />
        ))}
      </div>
    </div>
  );
}
