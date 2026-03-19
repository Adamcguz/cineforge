import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ProjectMeta } from '@/types';
import { DRAFT_COLOR_HEX, DRAFT_COLOR_LABELS } from '@/lib/constants';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { exportProject, triggerDownload } from '@/lib/exportImport';

interface ProjectCardProps {
  project: ProjectMeta;
  onDelete: (id: string) => void;
}

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const navigate = useNavigate();
  const [showDelete, setShowDelete] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleExport = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setExporting(true);
    try {
      const blob = await exportProject(project.id);
      const safeName = project.title.replace(/[^a-zA-Z0-9-_ ]/g, '').trim() || 'project';
      triggerDownload(blob, `${safeName}-cineforge.json`);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  const dateStr = new Date(project.updatedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <>
      <div
        className="bg-white border border-gray-200 shadow-sm rounded-lg p-5 cursor-pointer hover:border-gray-400 transition-colors group relative"
        onClick={() => navigate(`/project/${project.id}/script`)}
      >
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-gray-900 font-semibold text-base truncate pr-2">
            {project.title}
          </h3>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 shrink-0">
            <button
              onClick={handleExport}
              disabled={exporting}
              className="text-gray-400 hover:text-gray-700 transition-colors"
              title="Export project"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDelete(true);
              }}
              className="text-gray-400 hover:text-red-500 transition-colors"
              title="Delete project"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        {project.logline && (
          <p className="text-gray-500 text-sm mb-3 line-clamp-2">{project.logline}</p>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{project.author}</span>
          <span
            className="px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: DRAFT_COLOR_HEX[project.draftColor] + '20',
              color: DRAFT_COLOR_HEX[project.draftColor],
            }}
          >
            {DRAFT_COLOR_LABELS[project.draftColor]}
          </span>
        </div>

        <div className="text-xs text-gray-400 mt-2">
          Last modified {dateStr}
        </div>
      </div>

      <ConfirmDialog
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={() => {
          onDelete(project.id);
          setShowDelete(false);
        }}
        title="Delete Project"
        message={`Are you sure you want to delete "${project.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
      />
    </>
  );
}
