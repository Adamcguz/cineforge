import { useState, useMemo } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import type { Character, BreakdownTag } from '@/types';

interface ImportCharactersModalProps {
  open: boolean;
  onClose: () => void;
  castTags: BreakdownTag[];
  existingCharacters: Character[];
  onImport: (names: string[]) => void;
}

function fuzzyMatch(a: string, b: string): boolean {
  const na = a.toLowerCase().trim();
  const nb = b.toLowerCase().trim();
  if (na === nb) return true;
  if (na.includes(nb) || nb.includes(na)) return true;
  return false;
}

export function ImportCharactersModal({
  open,
  onClose,
  castTags,
  existingCharacters,
  onImport,
}: ImportCharactersModalProps) {
  const uniqueNames = useMemo(() => {
    const names = new Set<string>();
    for (const tag of castTags) {
      const trimmed = tag.text.trim();
      if (trimmed) names.add(trimmed);
    }
    return [...names].sort();
  }, [castTags]);

  const nameStatus = useMemo(() => {
    return uniqueNames.map((name) => {
      const exactMatch = existingCharacters.find(
        (c) => c.name.toLowerCase() === name.toLowerCase()
      );
      if (exactMatch) return { name, status: 'exists' as const, match: exactMatch.name };

      const fuzzy = existingCharacters.find((c) => fuzzyMatch(c.name, name));
      if (fuzzy) return { name, status: 'similar' as const, match: fuzzy.name };

      return { name, status: 'new' as const, match: null };
    });
  }, [uniqueNames, existingCharacters]);

  const [selected, setSelected] = useState<Set<string>>(() => {
    return new Set(nameStatus.filter((n) => n.status === 'new').map((n) => n.name));
  });

  const toggle = (name: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const handleImport = () => {
    onImport([...selected]);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Import Characters from Breakdown">
      {uniqueNames.length === 0 ? (
        <p className="text-gray-500 text-sm">
          No cast tags found. Tag characters in the Breakdown tab first.
        </p>
      ) : (
        <>
          <p className="text-gray-400 text-sm mb-3">
            Select characters to import from breakdown cast tags.
          </p>
          <div className="max-h-64 overflow-y-auto space-y-1 mb-4">
            {nameStatus.map(({ name, status, match }) => (
              <label
                key={name}
                className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-100 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selected.has(name)}
                  onChange={() => toggle(name)}
                  disabled={status === 'exists'}
                  className="accent-blue-500"
                />
                <span className="text-sm text-gray-800">{name}</span>
                {status === 'exists' && (
                  <span className="text-xs text-gray-400 ml-auto">Already exists</span>
                )}
                {status === 'similar' && (
                  <span className="text-xs text-yellow-500 ml-auto">
                    Similar to "{match}"
                  </span>
                )}
              </label>
            ))}
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button onClick={handleImport} disabled={selected.size === 0}>
              Import {selected.size} Character{selected.size !== 1 ? 's' : ''}
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
}
