import { useState, useRef, useEffect } from 'react';
import { DRAFT_COLORS } from '@/types';
import type { DraftColor } from '@/types';
import { DRAFT_COLOR_HEX, DRAFT_COLOR_LABELS } from '@/lib/constants';

interface DraftColorPickerProps {
  current: DraftColor;
  onChange: (color: DraftColor) => void;
}

export function DraftColorPicker({ current, onChange }: DraftColorPickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="text-xs px-2 py-0.5 rounded-full font-medium cursor-pointer hover:opacity-80"
        style={{
          backgroundColor: DRAFT_COLOR_HEX[current] + '20',
          color: DRAFT_COLOR_HEX[current],
        }}
      >
        {DRAFT_COLOR_LABELS[current]} Draft
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 min-w-[140px]">
          {DRAFT_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => {
                onChange(color);
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-1.5 text-sm flex items-center gap-2 hover:bg-gray-100 ${
                color === current ? 'bg-gray-100' : ''
              }`}
            >
              <span
                className="w-3 h-3 rounded-full inline-block"
                style={{ backgroundColor: DRAFT_COLOR_HEX[color] }}
              />
              <span className="text-gray-700">{DRAFT_COLOR_LABELS[color]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
