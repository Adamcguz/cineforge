import { useState, useRef } from 'react';
import { useProjectStore } from '@/store/useProjectStore';
import { useNavigate } from 'react-router-dom';
import { ProjectCard } from './ProjectCard';
import { NewProjectModal } from './NewProjectModal';
import { Button } from '@/components/ui/Button';
import { importProject } from '@/lib/exportImport';

export function DashboardPage() {
  const [showNewProject, setShowNewProject] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const projects = useProjectStore((s) => s.projects);
  const createProject = useProjectStore((s) => s.createProject);
  const deleteProject = useProjectStore((s) => s.deleteProject);
  const navigate = useNavigate();

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const newId = await importProject(file);
      navigate(`/project/${newId}/script`);
    } catch (err) {
      alert(`Import failed: ${(err as Error).message}`);
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const projectList = Object.values(projects).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  const handleCreate = (title: string, author: string, logline?: string) => {
    const id = createProject(title, author, logline);
    navigate(`/project/${id}/script`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-wider">CINEFORGE</h1>
            <p className="text-gray-500 text-sm mt-1">Pre-production, forged locally.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
            >
              {importing ? 'Importing…' : 'Import'}
            </Button>
            <Button variant="primary" onClick={() => setShowNewProject(true)}>
              + New Project
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleImport}
          />
        </div>

        {projectList.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-gray-400 text-5xl mb-4">&#127916;</div>
            <h2 className="text-gray-500 text-lg mb-2">No projects yet</h2>
            <p className="text-gray-400 text-sm mb-6">
              Create your first project to start writing.
            </p>
            <Button variant="primary" onClick={() => setShowNewProject(true)}>
              + New Project
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projectList.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onDelete={deleteProject}
              />
            ))}
          </div>
        )}
      </div>

      <NewProjectModal
        open={showNewProject}
        onClose={() => setShowNewProject(false)}
        onCreate={handleCreate}
      />
    </div>
  );
}
