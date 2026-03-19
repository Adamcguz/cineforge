import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useBudgetStore } from '@/store/useBudgetStore';
import { useBreakdownStore } from '@/store/useBreakdownStore';
import { ABOVE_THE_LINE_CATEGORIES, CATEGORY_LABELS } from '@/types';
import type { BudgetLineItem, BreakdownTag } from '@/types';
import { Button } from '@/components/ui/Button';

const EMPTY_ITEMS: BudgetLineItem[] = [];
const EMPTY_TAGS: BreakdownTag[] = [];

const BREAKDOWN_BUDGET_CATEGORIES = [
  'cast', 'extras', 'location', 'props', 'set-dressing',
  'costumes', 'vehicles', 'sound', 'sfx', 'music',
  'hair-makeup', 'animals',
] as const;

function formatCurrency(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });
}

export function BudgetTab() {
  const { projectId } = useParams<{ projectId: string }>();
  if (!projectId) return null;

  const lineItems = useBudgetStore((s) => s.lineItems[projectId]) || EMPTY_ITEMS;
  const addLineItem = useBudgetStore((s) => s.addLineItem);
  const updateLineItem = useBudgetStore((s) => s.updateLineItem);
  const removeLineItem = useBudgetStore((s) => s.removeLineItem);
  const syncFromBreakdown = useBudgetStore((s) => s.syncFromBreakdown);
  const initializeATL = useBudgetStore((s) => s.initializeAboveTheLine);

  const tags = useBreakdownStore((s) => s.tags[projectId]) || EMPTY_TAGS;

  // Grouped by category
  const grouped = useMemo(() => {
    const map = new Map<string, BudgetLineItem[]>();
    for (const item of lineItems) {
      const cat = item.category;
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(item);
    }
    return map;
  }, [lineItems]);

  const grandTotal = useMemo(
    () => lineItems.reduce((sum, i) => sum + i.quantity * i.unitCost, 0),
    [lineItems]
  );

  // Category totals for chart
  const categoryTotals = useMemo(() => {
    const totals: { label: string; total: number }[] = [];
    const allCats = [
      ...ABOVE_THE_LINE_CATEGORIES,
      ...BREAKDOWN_BUDGET_CATEGORIES.map(
        (c) => CATEGORY_LABELS[c as keyof typeof CATEGORY_LABELS] || c
      ),
    ];
    const seen = new Set<string>();
    for (const cat of allCats) {
      if (seen.has(cat)) continue;
      seen.add(cat);
      const items = grouped.get(cat) || [];
      const total = items.reduce((s, i) => s + i.quantity * i.unitCost, 0);
      if (total > 0) totals.push({ label: cat, total });
    }
    return totals;
  }, [grouped]);

  const maxCatTotal = Math.max(...categoryTotals.map((c) => c.total), 1);

  const handleSync = () => {
    const breakdownItems = tags.map((t) => ({
      name: t.text,
      category: CATEGORY_LABELS[t.category as keyof typeof CATEGORY_LABELS] || t.category,
      sourceTagId: t.id,
    }));
    syncFromBreakdown(projectId, breakdownItems);
  };

  const handleInitATL = () => {
    initializeATL(projectId);
  };

  const allCategories = useMemo(() => {
    const cats = new Set<string>();
    for (const item of lineItems) cats.add(item.category);
    for (const cat of ABOVE_THE_LINE_CATEGORIES) cats.add(cat);
    return [...cats];
  }, [lineItems]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-gray-600">Budget</h2>
          <span className="text-sm text-gray-500">
            Total: <strong className="text-gray-900">{formatCurrency(grandTotal)}</strong>
          </span>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={handleInitATL}>
            Init Above-the-Line
          </Button>
          <Button size="sm" variant="secondary" onClick={handleSync}>
            Sync from Breakdown
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* Bar chart */}
        {categoryTotals.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Budget Overview
            </h3>
            <svg viewBox={`0 0 600 ${categoryTotals.length * 28 + 10}`} className="w-full max-w-2xl">
              {categoryTotals.map((cat, i) => {
                const barWidth = (cat.total / maxCatTotal) * 400;
                return (
                  <g key={cat.label} transform={`translate(0, ${i * 28})`}>
                    <text x={0} y={16} className="fill-gray-500 text-[11px]">
                      {cat.label}
                    </text>
                    <rect x={150} y={4} width={barWidth} height={18} rx={3} fill="#3b82f6" />
                    <text x={155 + barWidth} y={16} className="fill-gray-600 text-[11px]">
                      {formatCurrency(cat.total)}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        )}

        {/* Category sections */}
        {allCategories.map((cat) => {
          const items = grouped.get(cat) || [];
          const catTotal = items.reduce((s, i) => s + i.quantity * i.unitCost, 0);

          return (
            <div key={cat} className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {cat}
                </h3>
                <span className="text-xs text-gray-400">{formatCurrency(catTotal)}</span>
              </div>
              <table className="w-full text-left mb-1">
                <thead>
                  <tr className="text-xs text-gray-400 border-b border-gray-200">
                    <th className="px-2 py-1">Name</th>
                    <th className="px-2 py-1 w-20">Qty</th>
                    <th className="px-2 py-1 w-28">Unit Cost</th>
                    <th className="px-2 py-1 w-28">Total</th>
                    <th className="px-2 py-1">Notes</th>
                    <th className="px-2 py-1 w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-100/50">
                      <td className="px-2 py-1">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) =>
                            updateLineItem(projectId, item.id, { name: e.target.value })
                          }
                          className="bg-transparent text-sm text-gray-800 border-none outline-none w-full"
                          placeholder="Item name"
                        />
                      </td>
                      <td className="px-2 py-1">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            updateLineItem(projectId, item.id, {
                              quantity: Number(e.target.value) || 0,
                            })
                          }
                          className="bg-transparent text-sm text-gray-800 border-none outline-none w-full"
                          min={0}
                        />
                      </td>
                      <td className="px-2 py-1">
                        <input
                          type="number"
                          value={item.unitCost}
                          onChange={(e) =>
                            updateLineItem(projectId, item.id, {
                              unitCost: Number(e.target.value) || 0,
                            })
                          }
                          className="bg-transparent text-sm text-gray-800 border-none outline-none w-full"
                          min={0}
                        />
                      </td>
                      <td className="px-2 py-1 text-sm text-gray-500">
                        {formatCurrency(item.quantity * item.unitCost)}
                      </td>
                      <td className="px-2 py-1">
                        <input
                          type="text"
                          value={item.notes || ''}
                          onChange={(e) =>
                            updateLineItem(projectId, item.id, { notes: e.target.value })
                          }
                          className="bg-transparent text-sm text-gray-500 border-none outline-none w-full"
                          placeholder="Notes..."
                        />
                      </td>
                      <td className="px-2 py-1">
                        <button
                          onClick={() => removeLineItem(projectId, item.id)}
                          className="text-gray-400 hover:text-red-500 text-xs"
                        >
                          Del
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button
                onClick={() => addLineItem(projectId, { name: '', category: cat })}
                className="text-xs text-blue-600 hover:text-blue-500 ml-2"
              >
                + Add Item
              </button>
            </div>
          );
        })}

        {lineItems.length === 0 && (
          <div className="text-center text-gray-400 py-12">
            <p className="text-sm mb-2">
              Click "Init Above-the-Line" to add standard budget categories,
            </p>
            <p className="text-sm">
              or "Sync from Breakdown" to import items from your breakdown tags.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
