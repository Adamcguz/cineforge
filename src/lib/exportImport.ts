import { useProjectStore } from '@/store/useProjectStore';
import { useScriptStore } from '@/store/useScriptStore';
import { useCharacterStore } from '@/store/useCharacterStore';
import { useMoodboardStore } from '@/store/useMoodboardStore';
import { useBreakdownStore } from '@/store/useBreakdownStore';
import { useBudgetStore } from '@/store/useBudgetStore';
import { useScheduleStore } from '@/store/useScheduleStore';
import { useShotListStore } from '@/store/useShotListStore';
import { getProjectSnapshots, saveSnapshot } from '@/lib/idb';
import { generateId } from '@/lib/uuid';

interface ProjectExport {
  version: 1;
  exportedAt: string;
  projectMeta: {
    title: string;
    author: string;
    logline?: string;
    draftColor: string;
    createdAt: string;
    updatedAt: string;
  };
  script: unknown[];
  characters: unknown[];
  relationships: unknown[];
  moodboard: Record<string, unknown[]>;
  breakdown: unknown[];
  budget: unknown[];
  schedule: unknown[];
  shotList: Record<string, unknown[]>;
  snapshots: { id: string; name: string; document: unknown; timestamp: string }[];
}

// ─── Export ────────────────────────────────────────────────────────

export async function exportProject(projectId: string): Promise<Blob> {
  const project = useProjectStore.getState().projects[projectId];
  if (!project) throw new Error('Project not found');

  const script = useScriptStore.getState().documents[projectId] || [];
  const characters = useCharacterStore.getState().characters[projectId] || [];
  const relationships = useCharacterStore.getState().relationships[projectId] || [];
  const breakdown = useBreakdownStore.getState().tags[projectId] || [];
  const budget = useBudgetStore.getState().lineItems[projectId] || [];
  const schedule = useScheduleStore.getState().schedules[projectId] || [];
  const shotList = useShotListStore.getState().shots[projectId] || {};

  // Collect moodboard items — keyed by projectId or projectId:sceneId
  const allMoodboard = useMoodboardStore.getState().items;
  const moodboard: Record<string, unknown[]> = {};
  for (const key of Object.keys(allMoodboard)) {
    if (key === projectId || key.startsWith(projectId + ':')) {
      // Store with relative key (strip projectId prefix for portability)
      const relativeKey = key === projectId ? '' : key.slice(projectId.length + 1);
      moodboard[relativeKey] = allMoodboard[key];
    }
  }

  // Snapshots from IndexedDB
  const rawSnapshots = await getProjectSnapshots(projectId);
  const snapshots = rawSnapshots.map((s) => ({
    id: s.id,
    name: s.name,
    document: s.document,
    timestamp: s.timestamp,
  }));

  const data: ProjectExport = {
    version: 1,
    exportedAt: new Date().toISOString(),
    projectMeta: {
      title: project.title,
      author: project.author,
      logline: project.logline,
      draftColor: project.draftColor,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    },
    script,
    characters,
    relationships,
    moodboard,
    breakdown,
    budget,
    schedule,
    shotList,
    snapshots,
  };

  return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
}

export function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Import ────────────────────────────────────────────────────────

export async function importProject(file: File): Promise<string> {
  const text = await file.text();
  let data: ProjectExport;

  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('Invalid JSON file');
  }

  if (!data.version || !data.projectMeta) {
    throw new Error('Not a valid CineForge project file');
  }

  const newId = generateId();
  const now = new Date().toISOString();

  // 1. Create project
  const { projectMeta } = data;
  useProjectStore.setState((state) => ({
    projects: {
      ...state.projects,
      [newId]: {
        id: newId,
        title: projectMeta.title,
        author: projectMeta.author,
        logline: projectMeta.logline,
        draftColor: projectMeta.draftColor as any,
        createdAt: projectMeta.createdAt,
        updatedAt: now,
      },
    },
  }));

  // 2. Script
  if (data.script && data.script.length > 0) {
    useScriptStore.setState((state) => ({
      documents: { ...state.documents, [newId]: data.script as any },
    }));
  }

  // 3. Characters & relationships
  if (data.characters && data.characters.length > 0) {
    useCharacterStore.setState((state) => ({
      characters: { ...state.characters, [newId]: data.characters as any },
    }));
  }
  if (data.relationships && data.relationships.length > 0) {
    useCharacterStore.setState((state) => ({
      relationships: { ...state.relationships, [newId]: data.relationships as any },
    }));
  }

  // 4. Moodboard — restore with new projectId prefix
  if (data.moodboard) {
    for (const [relativeKey, items] of Object.entries(data.moodboard)) {
      const fullKey = relativeKey === '' ? newId : `${newId}:${relativeKey}`;
      useMoodboardStore.setState((state) => ({
        items: { ...state.items, [fullKey]: items as any },
      }));
    }
  }

  // 5. Breakdown
  if (data.breakdown && data.breakdown.length > 0) {
    useBreakdownStore.setState((state) => ({
      tags: { ...state.tags, [newId]: data.breakdown as any },
    }));
  }

  // 6. Budget
  if (data.budget && data.budget.length > 0) {
    useBudgetStore.setState((state) => ({
      lineItems: { ...state.lineItems, [newId]: data.budget as any },
    }));
  }

  // 7. Schedule
  if (data.schedule && data.schedule.length > 0) {
    useScheduleStore.setState((state) => ({
      schedules: { ...state.schedules, [newId]: data.schedule as any },
    }));
  }

  // 8. Shot list
  if (data.shotList && Object.keys(data.shotList).length > 0) {
    useShotListStore.setState((state) => ({
      shots: { ...state.shots, [newId]: data.shotList as any },
    }));
  }

  // 9. Snapshots → IndexedDB
  if (data.snapshots) {
    for (const snap of data.snapshots) {
      const newSnapId = generateId();
      await saveSnapshot(newSnapId, newId, snap.name, snap.document);
    }
  }

  return newId;
}
