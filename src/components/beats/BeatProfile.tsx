import type { Beat, BeatAct } from '@/types';

interface BeatProfileProps {
  beat: Beat;
  onUpdate: (updates: Partial<Beat>) => void;
}

interface SectionConfig {
  title: string;
  fields: {
    key: keyof Beat;
    label: string;
    multiline?: boolean;
    placeholder?: string;
    kind?: 'text' | 'act';
  }[];
}

const SECTIONS: SectionConfig[] = [
  {
    title: 'Placement',
    fields: [
      { key: 'act', label: 'Act', kind: 'act' },
    ],
  },
  {
    title: 'Core',
    fields: [
      {
        key: 'summary',
        label: 'One-line Summary',
        multiline: true,
        placeholder: 'What happens in this beat, in one sentence?',
      },
      {
        key: 'emotionalTurn',
        label: 'Emotional Turn (what changes?)',
        multiline: true,
        placeholder: 'How does the emotional temperature shift by the end of the beat?',
      },
    ],
  },
  {
    title: 'Tension',
    fields: [
      {
        key: 'conflictStakes',
        label: 'Conflict / Stakes',
        multiline: true,
        placeholder: 'What\u2019s being fought for? What happens if they lose?',
      },
      {
        key: 'whyItMatters',
        label: 'Why This Beat Matters',
        multiline: true,
        placeholder: 'Why does the story need this beat? What would break without it?',
      },
    ],
  },
  {
    title: 'Cast',
    fields: [
      {
        key: 'charactersPresent',
        label: 'Characters Present',
        multiline: true,
        placeholder: 'Who is in the scene (and whose absence matters)?',
      },
    ],
  },
  {
    title: 'Open Threads',
    fields: [
      {
        key: 'openQuestions',
        label: 'Open Questions',
        multiline: true,
        placeholder: 'What do you still need to figure out about this beat?',
      },
      { key: 'notes', label: 'Notes', multiline: true },
    ],
  },
];

const ACTS: BeatAct[] = ['I', 'II', 'III', 'Other'];

export function BeatProfile({ beat, onUpdate }: BeatProfileProps) {
  return (
    <div className="space-y-6">
      {SECTIONS.map((section) => (
        <div key={section.title}>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            {section.title}
          </h3>
          <div className="space-y-2">
            {section.fields.map((field) => (
              <div key={field.key}>
                <label className="block text-xs text-gray-400 mb-0.5">{field.label}</label>
                {field.kind === 'act' ? (
                  <select
                    value={(beat.act as string) || ''}
                    onChange={(e) =>
                      onUpdate({ act: (e.target.value || undefined) as BeatAct | undefined })
                    }
                    className="w-full bg-gray-100 text-gray-800 text-sm rounded px-2.5 py-1.5 border border-gray-200 outline-none focus:border-blue-500"
                  >
                    <option value="">—</option>
                    {ACTS.map((a) => (
                      <option key={a} value={a}>
                        Act {a}
                      </option>
                    ))}
                  </select>
                ) : field.multiline ? (
                  <textarea
                    value={(beat[field.key] as string) || ''}
                    onChange={(e) => onUpdate({ [field.key]: e.target.value })}
                    rows={3}
                    placeholder={field.placeholder}
                    className="w-full bg-gray-100 text-gray-800 text-sm rounded px-2.5 py-1.5 border border-gray-200 outline-none focus:border-blue-500 resize-y"
                  />
                ) : (
                  <input
                    type="text"
                    value={(beat[field.key] as string) || ''}
                    onChange={(e) => onUpdate({ [field.key]: e.target.value })}
                    placeholder={field.placeholder}
                    className="w-full bg-gray-100 text-gray-800 text-sm rounded px-2.5 py-1.5 border border-gray-200 outline-none focus:border-blue-500"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
