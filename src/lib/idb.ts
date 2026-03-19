import { openDB } from 'idb';
import type { DBSchema } from 'idb';

interface CineforgeMediaDB extends DBSchema {
  images: {
    key: string;
    value: Blob;
  };
}

interface CineforgeSnapshotsDB extends DBSchema {
  snapshots: {
    key: string;
    value: {
      id: string;
      projectId: string;
      name: string;
      document: unknown;
      timestamp: string;
    };
  };
}

function getMediaDB() {
  return openDB<CineforgeMediaDB>('cineforge-media', 1, {
    upgrade(db) {
      db.createObjectStore('images');
    },
  });
}

function getSnapshotsDB() {
  return openDB<CineforgeSnapshotsDB>('cineforge-snapshots', 1, {
    upgrade(db) {
      db.createObjectStore('snapshots');
    },
  });
}

// Media (moodboard images)
export async function saveImage(key: string, blob: Blob): Promise<void> {
  const db = await getMediaDB();
  await db.put('images', blob, key);
}

export async function loadImage(key: string): Promise<Blob | undefined> {
  const db = await getMediaDB();
  return db.get('images', key);
}

export async function deleteImage(key: string): Promise<void> {
  const db = await getMediaDB();
  await db.delete('images', key);
}

export async function estimateStorageUsage(): Promise<number> {
  if (navigator.storage && navigator.storage.estimate) {
    const est = await navigator.storage.estimate();
    return est.usage || 0;
  }
  return 0;
}

// Snapshots
export async function saveSnapshot(
  id: string,
  projectId: string,
  name: string,
  document: unknown
): Promise<void> {
  const db = await getSnapshotsDB();
  await db.put('snapshots', {
    id,
    projectId,
    name,
    document,
    timestamp: new Date().toISOString(),
  }, id);
}

export async function getProjectSnapshots(projectId: string) {
  const db = await getSnapshotsDB();
  const all = await db.getAll('snapshots');
  return all.filter((s) => s.projectId === projectId);
}

export async function getSnapshot(id: string) {
  const db = await getSnapshotsDB();
  return db.get('snapshots', id);
}

export async function deleteSnapshot(id: string): Promise<void> {
  const db = await getSnapshotsDB();
  await db.delete('snapshots', id);
}
