import { createHashRouter, RouterProvider, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { DashboardPage } from '@/components/dashboard/DashboardPage';
import { ResearchTab } from '@/components/research/ResearchTab';
import { BeatsTab } from '@/components/beats/BeatsTab';
import { ScriptTab } from '@/components/script/ScriptTab';
import { BreakdownTab } from '@/components/breakdown/BreakdownTab';
import { ScheduleTab } from '@/components/schedule/ScheduleTab';
import { ShotListTab } from '@/components/shotlist/ShotListTab';
import { CharactersTab } from '@/components/characters/CharactersTab';
import { MoodboardTab } from '@/components/moodboard/MoodboardTab';
import { BudgetTab } from '@/components/budget/BudgetTab';

const router = createHashRouter([
  {
    path: '/',
    element: <DashboardPage />,
  },
  {
    path: '/project/:projectId',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="research" replace /> },
      { path: 'research', element: <ResearchTab /> },
      { path: 'beats', element: <BeatsTab /> },
      { path: 'script', element: <ScriptTab /> },
      { path: 'breakdown', element: <BreakdownTab /> },
      { path: 'schedule', element: <ScheduleTab /> },
      { path: 'shot-list', element: <ShotListTab /> },
      { path: 'characters', element: <CharactersTab /> },
      { path: 'moodboard', element: <MoodboardTab /> },
      { path: 'budget', element: <BudgetTab /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
