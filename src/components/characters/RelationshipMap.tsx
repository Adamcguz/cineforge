import { useMemo, useState } from 'react';
import type { Character, CharacterRelationship } from '@/types';

interface RelationshipMapProps {
  characters: Character[];
  relationships: CharacterRelationship[];
  onAddRelationship: (fromId: string, toId: string, label: string) => void;
  onRemoveRelationship: (relId: string) => void;
}

export function RelationshipMap({
  characters,
  relationships,
  onAddRelationship,
  onRemoveRelationship,
}: RelationshipMapProps) {
  const [fromId, setFromId] = useState('');
  const [toId, setToId] = useState('');
  const [label, setLabel] = useState('');

  const positions = useMemo(() => {
    const cx = 300;
    const cy = 250;
    const radius = 180;
    return characters.map((char, i) => {
      const angle = (2 * Math.PI * i) / characters.length - Math.PI / 2;
      return {
        id: char.id,
        name: char.name,
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
      };
    });
  }, [characters]);

  const posMap = useMemo(() => {
    const m = new Map<string, { x: number; y: number; name: string }>();
    for (const p of positions) m.set(p.id, p);
    return m;
  }, [positions]);

  const handleAdd = () => {
    if (fromId && toId && fromId !== toId && label.trim()) {
      onAddRelationship(fromId, toId, label.trim());
      setLabel('');
    }
  };

  if (characters.length < 2) {
    return (
      <div className="text-center text-gray-500 text-sm py-8">
        Add at least 2 characters to build a relationship map.
      </div>
    );
  }

  return (
    <div>
      <svg viewBox="0 0 600 500" className="w-full max-w-2xl mx-auto">
        {relationships.map((rel) => {
          const from = posMap.get(rel.fromCharacterId);
          const to = posMap.get(rel.toCharacterId);
          if (!from || !to) return null;
          const mx = (from.x + to.x) / 2;
          const my = (from.y + to.y) / 2;
          return (
            <g key={rel.id}>
              <line
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke="#d1d5db"
                strokeWidth={2}
              />
              <text
                x={mx}
                y={my - 6}
                textAnchor="middle"
                className="fill-gray-500 text-[11px] cursor-pointer"
                onClick={() => onRemoveRelationship(rel.id)}
              >
                {rel.label}
              </text>
            </g>
          );
        })}

        {positions.map((pos) => (
          <g key={pos.id}>
            <circle cx={pos.x} cy={pos.y} r={28} fill="#f3f4f6" stroke="#9ca3af" strokeWidth={2} />
            <text
              x={pos.x}
              y={pos.y + 4}
              textAnchor="middle"
              className="fill-gray-800 text-[11px] font-medium"
            >
              {pos.name.length > 10 ? pos.name.slice(0, 9) + '...' : pos.name}
            </text>
          </g>
        ))}
      </svg>

      <div className="flex items-center gap-2 mt-3 flex-wrap">
        <select
          value={fromId}
          onChange={(e) => setFromId(e.target.value)}
          className="bg-gray-200 text-gray-800 text-sm rounded px-2 py-1 border border-gray-300"
        >
          <option value="">From...</option>
          {characters.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Relationship..."
          className="bg-gray-200 text-gray-800 text-sm rounded px-2 py-1 border border-gray-300 w-32"
        />
        <select
          value={toId}
          onChange={(e) => setToId(e.target.value)}
          className="bg-gray-200 text-gray-800 text-sm rounded px-2 py-1 border border-gray-300"
        >
          <option value="">To...</option>
          {characters.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <button
          onClick={handleAdd}
          disabled={!fromId || !toId || fromId === toId || !label.trim()}
          className="text-xs text-blue-600 hover:text-blue-600 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          Add Link
        </button>
      </div>
      <p className="text-xs text-gray-400 mt-1">Click a relationship label to remove it.</p>
    </div>
  );
}
