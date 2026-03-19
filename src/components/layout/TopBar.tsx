import { Link, useParams, useLocation } from 'react-router-dom';
import { useProjectStore } from '@/store/useProjectStore';
import { useScriptStore } from '@/store/useScriptStore';
import { useBreakdownStore } from '@/store/useBreakdownStore';
import { useScheduleStore } from '@/store/useScheduleStore';
import { useShotListStore } from '@/store/useShotListStore';
import { useCharacterStore } from '@/store/useCharacterStore';
import { useBudgetStore } from '@/store/useBudgetStore';
import { DraftColorPicker } from '@/components/script/DraftColorPicker';
import { estimateScenePages } from '@/lib/breakdownSync';
import { exportScriptPDF } from '@/lib/pdf/scriptPdf';
import {
  exportBreakdownPDF,
  exportSchedulePDF,
  exportShotListPDF,
  exportCharactersPDF,
  exportBudgetPDF,
} from '@/lib/pdf/tablePdfs';
import type { ScenePageInfo } from '@/lib/breakdownSync';
import type { Shot, DraftColor } from '@/types';

const EXPORTABLE_TABS = ['script', 'breakdown', 'schedule', 'shot-list', 'characters', 'budget'];

export function TopBar() {
  const { projectId } = useParams<{ projectId: string }>();
  const location = useLocation();
  const project = useProjectStore((s) =>
    projectId ? s.projects[projectId] : undefined
  );

  const updateProject = useProjectStore((s) => s.updateProject);

  if (!project || !projectId) return null;

  const currentTab = location.pathname.split('/').pop() || 'script';
  const canExport = EXPORTABLE_TABS.includes(currentTab);
  const draftLabel =
    project.draftColor.charAt(0).toUpperCase() + project.draftColor.slice(1);

  const handleExport = () => {
    const title = project.title;

    switch (currentTab) {
      case 'script': {
        const doc = useScriptStore.getState().getDocument(projectId);
        exportScriptPDF(doc, {
          title,
          author: project.author || '',
          draftColor: draftLabel,
        });
        break;
      }
      case 'breakdown': {
        const tags = useBreakdownStore.getState().getTags(projectId);
        const doc = useScriptStore.getState().getDocument(projectId);
        const scenes = estimateScenePages(doc);
        exportBreakdownPDF(title, tags, scenes);
        break;
      }
      case 'schedule': {
        const schedule = useScheduleStore.getState().getSchedule(projectId);
        const doc = useScriptStore.getState().getDocument(projectId);
        const scenes = estimateScenePages(doc);
        const sceneMap = new Map<string, ScenePageInfo>();
        for (const s of scenes) sceneMap.set(s.sceneId, s);
        exportSchedulePDF(title, schedule, sceneMap);
        break;
      }
      case 'shot-list': {
        const doc = useScriptStore.getState().getDocument(projectId);
        const scenes = estimateScenePages(doc);
        const allShots = useShotListStore.getState().shots[projectId] || {};
        const shotMap = new Map<string, Shot[]>();
        for (const [sceneId, shots] of Object.entries(allShots)) {
          shotMap.set(sceneId, shots);
        }
        exportShotListPDF(title, scenes, shotMap);
        break;
      }
      case 'characters': {
        const chars = useCharacterStore.getState().getCharacters(projectId);
        exportCharactersPDF(title, chars);
        break;
      }
      case 'budget': {
        const items = useBudgetStore.getState().getLineItems(projectId);
        exportBudgetPDF(title, items);
        break;
      }
    }
  };

  return (
    <header className="h-12 border-b border-gray-200 bg-white flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-3">
        <Link
          to="/"
          className="text-accent font-bold tracking-wider text-sm hover:text-accent-hover transition-colors"
        >
          CINEFORGE
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-800 font-medium text-sm">{project.title}</span>
        <DraftColorPicker
          current={project.draftColor}
          onChange={(color: DraftColor) => updateProject(projectId, { draftColor: color })}
        />
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-500">
        {canExport && (
          <button
            onClick={handleExport}
            className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 rounded transition-colors"
          >
            Export PDF
          </button>
        )}
      </div>
    </header>
  );
}
