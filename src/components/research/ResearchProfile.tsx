import type { ResearchEntry } from '@/types';

interface ResearchProfileProps {
  entry: ResearchEntry;
  onUpdate: (updates: Partial<ResearchEntry>) => void;
}

interface SectionConfig {
  title: string;
  fields: { key: keyof ResearchEntry; label: string; multiline?: boolean; placeholder?: string }[];
}

const SECTIONS: SectionConfig[] = [
  {
    title: 'Context',
    fields: [
      { key: 'timePeriod', label: 'Time Period', placeholder: 'e.g. 1920s, Post-war, Near future' },
      { key: 'location', label: 'Location / Setting', placeholder: 'e.g. South Side Chicago' },
    ],
  },
  {
    title: 'Core Knowledge',
    fields: [
      {
        key: 'keyFacts',
        label: 'Key Facts to Remember',
        multiline: true,
        placeholder: 'The core historical/factual details the writer needs top-of-mind.',
      },
      {
        key: 'sensoryDetails',
        label: 'Sensory Details (sounds, smells, textures, light)',
        multiline: true,
        placeholder: 'What did this world sound/smell/feel like?',
      },
    ],
  },
  {
    title: 'Voice & Culture',
    fields: [
      {
        key: 'languageDialect',
        label: 'Language & Dialect Notes',
        multiline: true,
        placeholder: 'Slang, idioms, speech patterns, words that did/didn\u2019t exist yet.',
      },
      {
        key: 'culturalNotes',
        label: 'Cultural Taboos / Values',
        multiline: true,
        placeholder: 'What was sacred, forbidden, assumed, hidden?',
      },
    ],
  },
  {
    title: 'References',
    fields: [
      {
        key: 'sources',
        label: 'Sources',
        multiline: true,
        placeholder: 'Books, articles, interviews, URLs.',
      },
      {
        key: 'imageRefs',
        label: 'Images & Visual References',
        multiline: true,
        placeholder: 'Links or descriptions of photos, paintings, film stills.',
      },
    ],
  },
  {
    title: 'Guardrails',
    fields: [
      {
        key: 'mustNotGetWrong',
        label: 'Things I Must Not Get Wrong',
        multiline: true,
        placeholder: 'Facts, details, or sensitivities the story depends on being correct.',
      },
    ],
  },
  {
    title: 'Notes',
    fields: [
      { key: 'notes', label: 'Additional Notes', multiline: true },
    ],
  },
];

export function ResearchProfile({ entry, onUpdate }: ResearchProfileProps) {
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
                {field.multiline ? (
                  <textarea
                    value={(entry[field.key] as string) || ''}
                    onChange={(e) => onUpdate({ [field.key]: e.target.value })}
                    rows={3}
                    placeholder={field.placeholder}
                    className="w-full bg-gray-100 text-gray-800 text-sm rounded px-2.5 py-1.5 border border-gray-200 outline-none focus:border-blue-500 resize-y"
                  />
                ) : (
                  <input
                    type="text"
                    value={(entry[field.key] as string) || ''}
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
