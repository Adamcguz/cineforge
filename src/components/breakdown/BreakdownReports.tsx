import { useState } from 'react';
import type { BreakdownTag } from '@/types';
import { CATEGORY_LABELS, CATEGORY_COLORS } from '@/types';
import type { SceneListItem } from '@/hooks/useSceneList';

interface BreakdownReportsProps {
  tags: BreakdownTag[];
  scenes: SceneListItem[];
}

type ReportType = 'by-category' | 'by-scene' | 'cast' | 'location';

export function BreakdownReports({ tags, scenes }: BreakdownReportsProps) {
  const [reportType, setReportType] = useState<ReportType>('by-category');

  const sceneMap = new Map(scenes.map((s) => [s.id, s]));

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-1 px-4 py-2 border-b border-gray-200">
        {(['by-category', 'by-scene', 'cast', 'location'] as ReportType[]).map((type) => (
          <button
            key={type}
            onClick={() => setReportType(type)}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              reportType === type
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {type === 'by-category' ? 'By Category' :
             type === 'by-scene' ? 'By Scene' :
             type === 'cast' ? 'Cast Report' : 'Location Report'}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3">
        {reportType === 'by-category' && (
          <ByCategoryReport tags={tags} sceneMap={sceneMap} />
        )}
        {reportType === 'by-scene' && (
          <BySceneReport tags={tags} scenes={scenes} />
        )}
        {reportType === 'cast' && (
          <CastReport tags={tags} sceneMap={sceneMap} />
        )}
        {reportType === 'location' && (
          <LocationReport tags={tags} sceneMap={sceneMap} />
        )}
      </div>
    </div>
  );
}

function ByCategoryReport({ tags, sceneMap }: { tags: BreakdownTag[]; sceneMap: Map<string, SceneListItem> }) {
  const categories = [...new Set(tags.map((t) => t.category))];

  return (
    <div className="space-y-4">
      {categories.map((cat) => {
        const catTags = tags.filter((t) => t.category === cat);
        const uniqueElements = [...new Set(catTags.map((t) => t.text))];

        return (
          <div key={cat}>
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: CATEGORY_COLORS[cat] }}>
              {CATEGORY_LABELS[cat]}
            </h4>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-400 border-b border-gray-200">
                  <th className="text-left py-1 font-medium">Element</th>
                  <th className="text-left py-1 font-medium">Scenes</th>
                </tr>
              </thead>
              <tbody>
                {uniqueElements.map((el) => {
                  const sceneIds = [...new Set(catTags.filter((t) => t.text === el).map((t) => t.sceneId))];
                  return (
                    <tr key={el} className="border-b border-gray-200">
                      <td className="py-1.5 text-gray-700">{el}</td>
                      <td className="py-1.5 text-gray-400">
                        {sceneIds.map((sid) => sceneMap.get(sid)?.sceneNumber || '?').join(', ')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      })}
      {categories.length === 0 && (
        <p className="text-gray-400 text-sm text-center py-8">No tagged elements yet.</p>
      )}
    </div>
  );
}

function BySceneReport({ tags, scenes }: { tags: BreakdownTag[]; scenes: SceneListItem[] }) {
  return (
    <div className="space-y-4">
      {scenes.map((scene) => {
        const sceneTags = tags.filter((t) => t.sceneId === scene.id);
        if (sceneTags.length === 0) return null;

        return (
          <div key={scene.id}>
            <h4 className="text-xs font-semibold text-gray-700 uppercase mb-2">
              {scene.sceneNumber}. {scene.heading}
            </h4>
            <div className="flex flex-wrap gap-1">
              {sceneTags.map((tag) => (
                <span
                  key={tag.id}
                  className="px-2 py-0.5 rounded text-xs"
                  style={{
                    backgroundColor: CATEGORY_COLORS[tag.category] + '20',
                    color: CATEGORY_COLORS[tag.category],
                  }}
                >
                  {tag.text}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CastReport({ tags, sceneMap }: { tags: BreakdownTag[]; sceneMap: Map<string, SceneListItem> }) {
  const castTags = tags.filter((t) => t.category === 'cast');
  const characters = [...new Set(castTags.map((t) => t.text))];

  return (
    <div className="space-y-2">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-gray-400 border-b border-gray-200">
            <th className="text-left py-1 font-medium">Character</th>
            <th className="text-left py-1 font-medium">Scenes</th>
            <th className="text-right py-1 font-medium">Count</th>
          </tr>
        </thead>
        <tbody>
          {characters.map((char) => {
            const sceneIds = [...new Set(castTags.filter((t) => t.text === char).map((t) => t.sceneId))];
            return (
              <tr key={char} className="border-b border-gray-200">
                <td className="py-1.5 text-gray-700">{char}</td>
                <td className="py-1.5 text-gray-400">
                  {sceneIds.map((sid) => sceneMap.get(sid)?.sceneNumber || '?').join(', ')}
                </td>
                <td className="py-1.5 text-gray-500 text-right">{sceneIds.length}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {characters.length === 0 && (
        <p className="text-gray-400 text-sm text-center py-8">No cast members tagged yet.</p>
      )}
    </div>
  );
}

function LocationReport({ tags, sceneMap }: { tags: BreakdownTag[]; sceneMap: Map<string, SceneListItem> }) {
  const locationTags = tags.filter((t) => t.category === 'location');
  const locations = [...new Set(locationTags.map((t) => t.text))];

  return (
    <div className="space-y-2">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-gray-400 border-b border-gray-200">
            <th className="text-left py-1 font-medium">Location</th>
            <th className="text-left py-1 font-medium">Scenes</th>
            <th className="text-right py-1 font-medium">Count</th>
          </tr>
        </thead>
        <tbody>
          {locations.map((loc) => {
            const sceneIds = [...new Set(locationTags.filter((t) => t.text === loc).map((t) => t.sceneId))];
            return (
              <tr key={loc} className="border-b border-gray-200">
                <td className="py-1.5 text-gray-700">{loc}</td>
                <td className="py-1.5 text-gray-400">
                  {sceneIds.map((sid) => sceneMap.get(sid)?.sceneNumber || '?').join(', ')}
                </td>
                <td className="py-1.5 text-gray-500 text-right">{sceneIds.length}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {locations.length === 0 && (
        <p className="text-gray-400 text-sm text-center py-8">No locations tagged yet.</p>
      )}
    </div>
  );
}
