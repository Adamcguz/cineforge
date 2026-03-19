import { useState, useEffect, useCallback } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { generateId } from '@/lib/uuid';
import {
  saveSnapshot,
  getProjectSnapshots,
  deleteSnapshot as deleteSnapshotIDB,
} from '@/lib/idb';
import type { Descendant } from 'slate';

interface Snapshot {
  id: string;
  projectId: string;
  name: string;
  document: unknown;
  timestamp: string;
}

interface SnapshotManagerProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  currentDocument: Descendant[];
  draftColor: string;
}

export function SnapshotManager({
  open,
  onClose,
  projectId,
  currentDocument,
  draftColor,
}: SnapshotManagerProps) {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [newName, setNewName] = useState('');
  const [viewingId, setViewingId] = useState<string | null>(null);

  const loadSnapshots = useCallback(async () => {
    const snaps = await getProjectSnapshots(projectId);
    setSnapshots(snaps.sort((a, b) => b.timestamp.localeCompare(a.timestamp)));
  }, [projectId]);

  useEffect(() => {
    if (open) loadSnapshots();
  }, [open, loadSnapshots]);

  const handleSave = async () => {
    const name = newName.trim() || `${draftColor} Draft - ${new Date().toLocaleDateString()}`;
    const id = generateId();
    await saveSnapshot(id, projectId, name, currentDocument);
    setNewName('');
    loadSnapshots();
  };

  const handleDelete = async (id: string) => {
    await deleteSnapshotIDB(id);
    if (viewingId === id) setViewingId(null);
    loadSnapshots();
  };

  const viewingSnapshot = snapshots.find((s) => s.id === viewingId);

  return (
    <Modal open={open} onClose={onClose} title="Draft Snapshots">
      <div className="space-y-4">
        {/* Save new snapshot */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Snapshot name (optional)"
            className="flex-1 bg-gray-100 text-gray-800 text-sm rounded px-2.5 py-1.5 border border-gray-200 outline-none focus:border-blue-500"
          />
          <Button size="sm" onClick={handleSave}>
            Save Snapshot
          </Button>
        </div>

        {/* Snapshot list */}
        <div className="max-h-64 overflow-y-auto space-y-1">
          {snapshots.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">
              No snapshots saved yet.
            </p>
          ) : (
            snapshots.map((snap) => (
              <div
                key={snap.id}
                className={`flex items-center justify-between px-3 py-2 rounded ${
                  viewingId === snap.id ? 'bg-gray-200' : 'bg-gray-100 hover:bg-gray-150'
                }`}
              >
                <div>
                  <p className="text-sm text-gray-800">{snap.name}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(snap.timestamp).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewingId(viewingId === snap.id ? null : snap.id)}
                    className="text-xs text-blue-400 hover:text-blue-300"
                  >
                    {viewingId === snap.id ? 'Hide' : 'View'}
                  </button>
                  <button
                    onClick={() => handleDelete(snap.id)}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Read-only snapshot view */}
        {viewingSnapshot && (
          <div className="border border-gray-200 rounded p-3 max-h-64 overflow-y-auto bg-white">
            <h4 className="text-xs text-gray-500 mb-2 uppercase tracking-wider">
              Preview: {viewingSnapshot.name}
            </h4>
            <div className="font-mono text-xs text-gray-600 space-y-0.5">
              {(viewingSnapshot.document as Descendant[]).map((node, i) => {
                const el = node as { type: string; children: { text: string }[] };
                const text = el.children.map((c) => c.text).join('');
                return (
                  <p
                    key={i}
                    className={
                      el.type === 'scene-heading'
                        ? 'font-bold text-yellow-600 uppercase'
                        : el.type === 'character'
                        ? 'ml-16 uppercase'
                        : el.type === 'dialogue'
                        ? 'ml-8'
                        : el.type === 'parenthetical'
                        ? 'ml-12 italic'
                        : ''
                    }
                  >
                    {text || '\u00A0'}
                  </p>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
