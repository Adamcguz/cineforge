import { Outlet, useParams, Navigate } from 'react-router-dom';
import { TopBar } from './TopBar';
import { TabBar } from './TabBar';
import { useProjectStore } from '@/store/useProjectStore';

export function AppShell() {
  const { projectId } = useParams<{ projectId: string }>();
  const project = useProjectStore((s) =>
    projectId ? s.projects[projectId] : undefined
  );

  if (!project) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex flex-col h-screen">
      <TopBar />
      <TabBar />
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
