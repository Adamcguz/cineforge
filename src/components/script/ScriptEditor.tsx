import { useState, useCallback, useMemo } from 'react';
import { createEditor, Editor } from 'slate';
import type { Descendant } from 'slate';
import { Slate, Editable, withReact } from 'slate-react';
import { withHistory } from 'slate-history';
import { useParams } from 'react-router-dom';
import { useScriptStore } from '@/store/useScriptStore';
import { useProjectStore } from '@/store/useProjectStore';
import { createRenderElement, resetPageCounter, renderLeaf } from '@/lib/screenplay/slateRenderers';
import { handleScriptKeyDown, getCurrentElementType, setElementType, withUniqueIds } from '@/lib/screenplay/slatePlugins';
import { useSceneList } from '@/hooks/useSceneList';
import { usePageCount } from '@/hooks/usePageCount';
import { usePageBreaks } from '@/hooks/usePageBreaks';
import { useAutoSave } from '@/hooks/useAutoSave';
import { ScenePanel } from './ScenePanel';
import { ElementTypeToolbar } from './ElementTypeToolbar';
import { SnapshotManager } from './SnapshotManager';
import type { ElementType, ScriptElement } from '@/types';
import { generateId } from '@/lib/uuid';

/** Ensure every element in the document has a unique id */
function deduplicateIds(doc: Descendant[]): Descendant[] {
  const seen = new Set<string>();
  let changed = false;
  const result = doc.map((node) => {
    const el = node as ScriptElement;
    if (el.id && seen.has(el.id)) {
      changed = true;
      return { ...el, id: generateId() } as unknown as Descendant;
    }
    if (el.id) seen.add(el.id);
    return node;
  });
  return changed ? result : doc;
}

export function ScriptEditor() {
  const { projectId } = useParams<{ projectId: string }>();
  const getDocument = useScriptStore((s) => s.getDocument);
  const setDocument = useScriptStore((s) => s.setDocument);
  const updateProject = useProjectStore((s) => s.updateProject);

  const editor = useMemo(() => withUniqueIds(withHistory(withReact(createEditor()))), []);
  const [value, setValue] = useState<Descendant[]>(() => {
    const doc = projectId ? getDocument(projectId) : [{ type: 'action' as ElementType, id: '1', children: [{ text: '' }] }];
    return deduplicateIds(doc);
  });
  const [currentType, setCurrentType] = useState<ElementType | null>('action');
  const [scenePanelVisible, setScenePanelVisible] = useState(true);
  const [focusMode, setFocusMode] = useState(false);
  const [showSnapshots, setShowSnapshots] = useState(false);

  const project = useProjectStore((s) => projectId ? s.projects[projectId] : undefined);

  const scenes = useSceneList(value);
  const pageCount = usePageCount(value);
  const pageBreaks = usePageBreaks(value);

  const renderElement = useMemo(() => {
    resetPageCounter();
    return createRenderElement({ breakIds: pageBreaks, pageCount });
  }, [pageBreaks, pageCount]);

  const save = useCallback(() => {
    if (projectId) {
      setDocument(projectId, value);
      updateProject(projectId, {});
    }
  }, [projectId, value, setDocument, updateProject]);

  const triggerAutoSave = useAutoSave(save);

  const handleChange = useCallback(
    (newValue: Descendant[]) => {
      setValue(newValue);
      setCurrentType(getCurrentElementType(editor));
      triggerAutoSave();
    },
    [editor, triggerAutoSave]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      // Toggle focus mode with Cmd+Shift+F
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === 'f') {
        event.preventDefault();
        setFocusMode((f) => !f);
        return;
      }
      handleScriptKeyDown(event, editor);
      // Update current type after key handling
      setTimeout(() => setCurrentType(getCurrentElementType(editor)), 0);
    },
    [editor]
  );

  const handleElementSelect = useCallback(
    (type: ElementType) => {
      setElementType(editor, type);
      setCurrentType(type);
    },
    [editor]
  );

  return (
    <div className="h-full flex relative">
      {/* Scene Panel */}
      {!focusMode && (
        <ScenePanel
          scenes={scenes}
          editor={editor}
          visible={scenePanelVisible}
          onToggle={() => setScenePanelVisible(!scenePanelVisible)}
        />
      )}

      {/* Main Editor */}
      <div className="flex-1 overflow-y-auto">
        {/* Page count bar */}
        {!focusMode && (
          <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-gray-200 px-4 py-1.5 flex items-center justify-between text-xs text-gray-400">
            <span>{scenes.length} scene{scenes.length !== 1 ? 's' : ''}</span>
            <div className="flex items-center gap-3">
              <span>{pageCount} page{pageCount !== 1 ? 's' : ''}</span>
              <button
                onClick={() => setShowSnapshots(true)}
                className="text-gray-400 hover:text-gray-600 transition-colors text-xs"
                title="Draft Snapshots"
              >
                Snapshots
              </button>
              <button
                onClick={() => setFocusMode(true)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title="Focus Mode (Cmd+Shift+F)"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Focus mode exit button */}
        {focusMode && (
          <button
            onClick={() => setFocusMode(false)}
            className="fixed top-4 right-4 z-50 text-gray-400 hover:text-gray-600 transition-colors bg-white/80 shadow rounded-full p-2"
            title="Exit Focus Mode (Cmd+Shift+F)"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        <div className={`screenplay-editor mx-auto ${focusMode ? 'max-w-2xl py-24 px-8' : 'max-w-2xl py-8 px-8'}`}>
          <Slate editor={editor} initialValue={value} onChange={handleChange}>
            <Editable
              renderElement={renderElement}
              renderLeaf={renderLeaf}
              onKeyDown={handleKeyDown}
              placeholder="Start writing your screenplay..."
              className="outline-none min-h-[60vh] text-gray-800"
              spellCheck
              autoFocus
            />
          </Slate>
        </div>
      </div>

      {/* Element Type Toolbar */}
      {!focusMode && (
        <ElementTypeToolbar
          currentType={currentType}
          onSelect={handleElementSelect}
        />
      )}

      {projectId && project && (
        <SnapshotManager
          open={showSnapshots}
          onClose={() => setShowSnapshots(false)}
          projectId={projectId}
          currentDocument={value}
          draftColor={project.draftColor.charAt(0).toUpperCase() + project.draftColor.slice(1)}
        />
      )}
    </div>
  );
}
