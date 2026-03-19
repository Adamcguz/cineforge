import type { Character } from '@/types';

interface CharacterProfileProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

interface SectionConfig {
  title: string;
  fields: { key: keyof Character; label: string; multiline?: boolean }[];
}

const SECTIONS: SectionConfig[] = [
  {
    title: 'Identity',
    fields: [
      { key: 'aliases', label: 'Aliases' },
      { key: 'age', label: 'Age' },
      { key: 'gender', label: 'Gender' },
      { key: 'occupation', label: 'Occupation' },
    ],
  },
  {
    title: 'Physical',
    fields: [
      { key: 'height', label: 'Height' },
      { key: 'build', label: 'Build' },
      { key: 'hair', label: 'Hair' },
      { key: 'eyes', label: 'Eyes' },
      { key: 'distinguishingFeatures', label: 'Distinguishing Features', multiline: true },
    ],
  },
  {
    title: 'Background',
    fields: [
      { key: 'backstory', label: 'Backstory', multiline: true },
      { key: 'relationships', label: 'Key Relationships', multiline: true },
    ],
  },
  {
    title: 'Psychology',
    fields: [
      { key: 'wants', label: 'Wants (External Goal)' },
      { key: 'needs', label: 'Needs (Internal Goal)' },
      { key: 'fears', label: 'Fears' },
      { key: 'flaws', label: 'Flaws' },
      { key: 'internalConflict', label: 'Internal Conflict', multiline: true },
    ],
  },
  {
    title: 'Arc',
    fields: [
      { key: 'arcStart', label: 'Starting Point' },
      { key: 'arcChange', label: 'Key Change' },
      { key: 'arcEnd', label: 'Ending Point' },
    ],
  },
  {
    title: 'Costume',
    fields: [
      { key: 'costumeNotes', label: 'Costume Notes', multiline: true },
    ],
  },
  {
    title: 'Voice',
    fields: [
      { key: 'voiceMannerisms', label: 'Voice & Mannerisms', multiline: true },
    ],
  },
  {
    title: 'Notes',
    fields: [
      { key: 'notes', label: 'Additional Notes', multiline: true },
    ],
  },
];

export function CharacterProfile({ character, onUpdate }: CharacterProfileProps) {
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
                <label className="block text-xs text-gray-400 mb-0.5">
                  {field.label}
                </label>
                {field.multiline ? (
                  <textarea
                    value={(character[field.key] as string) || ''}
                    onChange={(e) => onUpdate({ [field.key]: e.target.value })}
                    rows={3}
                    className="w-full bg-gray-100 text-gray-800 text-sm rounded px-2.5 py-1.5 border border-gray-200 outline-none focus:border-blue-500 resize-y"
                  />
                ) : (
                  <input
                    type="text"
                    value={(character[field.key] as string) || ''}
                    onChange={(e) => onUpdate({ [field.key]: e.target.value })}
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
