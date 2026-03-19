import { ReactEditor } from 'slate-react';
import { Editor, Element as SlateElement } from 'slate';
import type { SceneListItem } from '@/hooks/useSceneList';
import type { ScriptElement } from '@/types';

interface ScenePanelProps {
  scenes: SceneListItem[];
  editor: Editor;
  visible: boolean;
  onToggle: () => void;
}

export function ScenePanel({ scenes, editor, visible, onToggle }: ScenePanelProps) {
  const handleSceneClick = (sceneId: string) => {
    // Find the node in the editor and scroll to it
    for (const [node, path] of Editor.nodes(editor, {
      at: [],
      match: (n) => SlateElement.isElement(n) && (n as ScriptElement).id === sceneId,
    })) {
      try {
        const domNode = ReactEditor.toDOMNode(editor, node);
        domNode.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Move cursor to the scene heading
        const point = Editor.start(editor, path);
        ReactEditor.focus(editor);
        editor.select(point);
      } catch {
        // DOM node might not be rendered
      }
      break;
    }
  };

  if (!visible) {
    return (
      <button
        onClick={onToggle}
        className="absolute left-2 top-2 z-10 p-1.5 rounded bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"
        title="Show scenes"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    );
  }

  return (
    <div className="w-56 border-r border-gray-200 bg-gray-50 flex flex-col shrink-0">
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Scenes</span>
        <button
          onClick={onToggle}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          title="Hide scenes"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {scenes.length === 0 ? (
          <p className="text-gray-400 text-xs px-3 py-4">
            No scenes yet. Add a Scene Heading to get started.
          </p>
        ) : (
          <ul className="py-1">
            {scenes.map((scene) => (
              <li key={scene.id}>
                <button
                  onClick={() => handleSceneClick(scene.id)}
                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 transition-colors group"
                >
                  <span className="text-gray-400 font-mono mr-1.5">{scene.sceneNumber}.</span>
                  <span className="text-gray-600 group-hover:text-gray-900 truncate">
                    {scene.heading || 'Untitled Scene'}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
