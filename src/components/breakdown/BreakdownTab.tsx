import { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useScriptStore } from '@/store/useScriptStore';
import { useBreakdownStore } from '@/store/useBreakdownStore';
import { useSceneList } from '@/hooks/useSceneList';
import { BreakdownScriptView } from './BreakdownScriptView';
import { BreakdownSheet } from './BreakdownSheet';
import { BreakdownReports } from './BreakdownReports';
import type { BreakdownTag } from '@/types';
import type { Descendant } from 'slate';

const EMPTY_DOC: Descendant[] = [];
const EMPTY_TAGS: BreakdownTag[] = [];

export function BreakdownTab() {
  const { projectId } = useParams<{ projectId: string }>();
  const document = useScriptStore((s) => projectId ? s.documents[projectId] : undefined) || EMPTY_DOC;
  const tags = useBreakdownStore((s) => projectId ? s.tags[projectId] : undefined) || EMPTY_TAGS;
  const addTag = useBreakdownStore((s) => s.addTag);
  const removeTag = useBreakdownStore((s) => s.removeTag);
  const scenes = useSceneList(document);

  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);
  const [showReports, setShowReports] = useState(false);

  const selectedScene = scenes.find((s) => s.id === selectedSceneId);
  const sceneTags = selectedSceneId
    ? tags.filter((t) => t.sceneId === selectedSceneId)
    : [];

  const handleAddTag = useCallback(
    (tag: Omit<BreakdownTag, 'id'>) => {
      if (projectId) addTag(projectId, tag);
    },
    [projectId, addTag]
  );

  const handleRemoveTag = useCallback(
    (tagId: string) => {
      if (projectId) removeTag(projectId, tagId);
    },
    [projectId, removeTag]
  );

  return (
    <div className="h-full flex">
      {/* Script view with tagging */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between px-4 py-1.5 border-b border-gray-200 text-xs text-gray-400">
          <span>{tags.length} tagged element{tags.length !== 1 ? 's' : ''}</span>
          <button
            onClick={() => setShowReports(!showReports)}
            className={`px-2 py-1 rounded transition-colors ${
              showReports ? 'bg-gray-100 text-gray-800' : 'hover:text-gray-600'
            }`}
          >
            {showReports ? 'Script View' : 'Reports'}
          </button>
        </div>

        {showReports ? (
          <BreakdownReports tags={tags} scenes={scenes} />
        ) : (
          <BreakdownScriptView
            document={document}
            tags={tags}
            selectedSceneId={selectedSceneId}
            onSelectScene={setSelectedSceneId}
            onAddTag={handleAddTag}
          />
        )}
      </div>

      {/* Breakdown sheet sidebar */}
      <div className="w-72 border-l border-gray-200 bg-gray-50 shrink-0">
        <BreakdownSheet
          tags={sceneTags}
          sceneHeading={selectedScene?.heading || ''}
          onRemoveTag={handleRemoveTag}
        />
      </div>
    </div>
  );
}
