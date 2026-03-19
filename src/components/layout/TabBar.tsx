import { NavLink, useParams } from 'react-router-dom';

const TABS = [
  { path: 'script', label: 'Script' },
  { path: 'breakdown', label: 'Breakdown' },
  { path: 'schedule', label: 'Schedule' },
  { path: 'shot-list', label: 'Shot List' },
  { path: 'characters', label: 'Characters' },
  { path: 'moodboard', label: 'Moodboard' },
  { path: 'budget', label: 'Budget' },
] as const;

export function TabBar() {
  const { projectId } = useParams<{ projectId: string }>();

  return (
    <nav className="h-10 border-b border-gray-200 bg-white/80 flex items-center px-4 gap-1 shrink-0 overflow-x-auto">
      {TABS.map((tab) => (
        <NavLink
          key={tab.path}
          to={`/project/${projectId}/${tab.path}`}
          className={({ isActive }) =>
            `px-3 py-1.5 text-sm rounded-md transition-colors whitespace-nowrap ${
              isActive
                ? 'bg-gray-100 text-gray-900 font-medium'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}
